import { useEffect, useRef, useState } from "react";

/* ══ Seek ═════════════════════════════════════════════════
   A search icon that becomes a search field.

   ONE OBJECT, NOT TWO. Everything here follows from that. The
   obvious build is an icon that fades out and an input that
   fades in, and it is obvious because it is easy — but two
   things swapping is never mistaken for one thing changing,
   however well the crossfade is tuned. So there is a single
   box whose WIDTH is the state, and the icon and the field
   are both inside it the whole time.

   Which turns the interesting problems into geometry rather
   than choreography:

   · The lens never moves relative to the box. It sits at a
     fixed inset from the left edge, and at the closed width
     that inset happens to centre it — (64 - 28) / 2 is 18,
     and 18 is also the padding the open field wants. So one
     number is both "centred in a circle" and "aligned in a
     field", and the lens travelling leftward across the page
     is not an animation anybody wrote. It is the box growing
     around a mark that stayed put.

   · The box grows from its middle, so the composition stays
     centred at every frame. Growing from the left would pin
     the lens and throw the field off-centre; growing from
     the right would slide the lens across the page. Neither is
     the object transforming, and both are what you get by
     accident.

   · Height never changes and the corner is fully round at
     every width, so the SHAPE is one rule rather than a tween
     with two ends. At 64 it is a circle and at 320 a pill,
     and those are the same statement. The radius used to
     interpolate 22 → 13, which was a second thing that had
     to agree with the first; a stadium corner needs no
     agreement at all.

   The press is a real beat. A click compresses the object for
   a moment before it expands, because a thing that yields
   before it moves reads as having been pushed, and a thing
   that only moves reads as having been triggered.

   ── WHAT IS ADDED HERE, AND WHY ──────────────────────────
   Upstream this component is a control with no search behind
   it: it holds `value` and never asks anything. On this site
   that would have replaced a working Pagefind index with a
   field that accepts text and returns nothing, so the querying,
   the results and the keyboard handling are ours. Everything
   about the transformation above is untouched.

   Pagefind is imported DYNAMICALLY, on the first keystroke
   rather than on mount. The index is a separate fetch of
   roughly 100KB, and a reader who never searches should not
   pay for it — which is also the whole argument against
   putting this component in the marketing nav. */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* The closed object: a circle, so the width IS the height.
   Upstream this is 64, sized for the object itself rather than
   for the header control it started as. It is also the
   documentation bar's own height, so the shut state and the
   bar it sits in are the same size. The stylesheet reads
   this through --shut rather than repeating it: the skin's
   height and the closed width are the same number by
   definition, and two places holding it are two places to get
   it wrong.

   ── AND IT IS A PROP, BECAUSE 64 IS NOT THE BAR ──────────
   This sat at a hard 64 and was mounted in the documentation
   bar, whose controls are all 44. Two things broke at once.
   The bar is a fixed-height box, so a 64px object inside it
   overflowed, and the bar's own background painted over the
   top of the page title — a slice straight through the word
   "Documentation". And a circle half again as tall as its
   neighbours is not one bar, it is a control that landed in
   it.

   So the size moves to a prop and the default stays 64, which
   is the size the object was drawn at. The numbers below are
   all DERIVED from it rather than restated, because the
   component's whole argument is that they are one fact: the
   width is the height, and the corner is half of it. */
const SHUT_DEFAULT = 64;

/* the lens, and its inset. See the note above — this number
   is doing two jobs and they agree by construction.

   28 against 64, measured against the rest of the bench
   rather than picked: every round icon button here sits
   between 0.44 and 0.50 of its button, and 28/64 is 0.4375,
   in with the others. 18 was 0.28 and read as a small mark in
   a large circle.

   So the ratio is the constant and the pixel count is not: at
   another size the lens is size * 0.4375, which puts a 44px
   bar's lens at 19 and keeps it in the same band. Fixing the
   lens at 28 and only shrinking the circle would have made it
   0.64 of the button, which is the opposite error.

   The STROKE is independent of all of this. The svg is an
   18-unit viewBox, so a stroke-width of u units always draws
   at u/18 of the glyph's own size, whatever that size is — and
   lucide's 2-on-24 is 0.0833. `stroke-width: 1.5` therefore
   matches the bench at any LENS, and resizing the icon does
   not disturb it. */
const LENS_RATIO = 28 / 64;

/* the field's corner is half the height, which is the circle it
   is when shut and the pill it is when open. */
const CORNER_RATIO = 0.5;

/* the resting field, wide screen and narrow. See the note on
   the `width` prop for why there are two. */
const WIDE = 320;
const SNUG = 280;

/* ── inlined from ./spring ──────────────────────── */
/* ── one spring, for everything that settles ───────────────
   The maths accumulates velocity toward a target, damps it,
   and snaps when both the delta and the velocity fall under
   0.02.

   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced. Multiplying is the
   version that makes a spring behave differently on a busy
   page, which is the hardest kind of bug to see.

   The loop parks itself the moment the value has settled, so a
   settled control costs no frames at all. */

/* 0..100 into the two numbers a spring actually has.

   The pair is chosen by DAMPING RATIO and then written back
   as stiffness and decay, because the ratio is the thing a
   person is actually setting and the two numbers on their own
   do not say what they add up to.

     zeta = -ln(d) / (2 * sqrt(k))

     0   → zeta ~0.85, heavy, arrives without a ring
     50  → zeta ~0.41, lively but settled
     100 → zeta ~0.20, two visible rebounds

   Both ends have to be usable, which is what fixed the
   numbers rather than taste. */
const springOf = (tune: number) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
});

/* Units matter. The snap threshold is absolute, so a caller
   works in pixels or in 0..100 — a spring driven over 0..1
   would be "settled" before it had visibly moved. */
function useSpring(target: number, tune = 50, instant = false) {
  const [at, setAt] = useState(target);
  const cur = useRef(target);
  const vel = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (instant) {
      cur.current = target;
      vel.current = 0;
      setAt(target);
      return;
    }
    const { k, d } = springOf(tune);
    let prev = 0;
    const tick = (t: number) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      vel.current += (target - cur.current) * k * dt;
      vel.current *= Math.pow(d, dt);
      cur.current += vel.current * dt;
      if (Math.abs(target - cur.current) < 0.02 && Math.abs(vel.current) < 0.02) {
        cur.current = target;
        vel.current = 0;
        setAt(target);
        raf.current = 0;
        return;
      }
      setAt(cur.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
    /* `tune` sits here beside `target` because the loop closes
       over it, so without it a knob turned mid-flight would do
       nothing until something else restarted the effect.
       Restarting picks up from the refs, so it continues
       rather than snapping. */
  }, [target, tune, instant]);

  return at;
}

/* Read once, the way the theme control does. A preference, not
   a live input. */
const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      /* One shape for a Pagefind hit: a title, the url it lives at,
         and the fragment of text that matched.

         The title is at `meta.title`, not `title`. Pagefind puts the
         page's own <title> under `meta` and returns the anchors
         separately; reading `data.title` gives undefined on every
         result, which rendered as a list of blank rows with excerpts
         and no way to tell them apart. The fallback is the last
         segment of the path, so a page with no <title> is still
         identifiable rather than another blank. */
type Hit = {
  id: string;
  url: string;
  title: string;
  excerpt: string;
};

const nameOf = (url: string): string => {
  const last = url.replace(/[/#?].*$/, "").split("/").filter(Boolean).pop();
  return last ? last.replace(/[-_]+/g, " ") : url;
};

export function Seek({
  /* how far it leans toward the cursor, 0..100 */
  give = 50,
  /* how the width settles, 0..100 */
  spring = 50,
  /* The field's resting width, px.
     ── AND THE DEFAULT IS NARROWER ON A PHONE ─────────────
     Undefined rather than 320, because a narrow column and a
     phone keyboard want different things. Still well inside the
     knob's own 280..400 range, so this is a setting the
     component was drawn for rather than a number invented for
     one screen. */
  width,
  /* The field's own corner, 0..32. Given as a fraction of the
     shut size unless given absolutely, so a caller that changes
     the size does not also have to remember the corner. */
  corner,
  /* The shut size, px: the height of the object and the width it
     is closed at, which are the same number. Defaults to the 64
     it was drawn at; the documentation bar passes 44, because
     that is the height of every other control in it. */
  size = SHUT_DEFAULT,
  /* Slack reserved AROUND the object, px. Bencho's wall sizes a card by
     its bounding box, so it needs room to grow into or the object is
     scaled down to fit its own frame. A bar has no such arithmetic: the
     bar is already sized by its own layout, and the 40px only made the
     bar 40px taller than the control inside it — which is how a 44px
     search ended up inside a 108px bar. */
  framePad = 40,
}: {
  give?: number;
  spring?: number;
  width?: number;
  corner?: number;
  size?: number;
  framePad?: number;
} = {}) {
  /* One size, and everything else read off it. */
  const SHUT = size;
  const LENS = Math.round(SHUT * LENS_RATIO);
  const INSET = (SHUT - LENS) / 2;
  const CORNER = Math.min(SHUT / 2, Math.max(0, corner ?? SHUT * CORNER_RATIO));
  /* The field's own type. 18 on the 64 it was drawn at; 14 in a
     44 bar, which is the navigation size the rest of the bar
     already uses. Anything between would be a size that belongs
     to neither. */
  const SAY = SHUT >= 56 ? 18 : 14;
  /* ── narrow, and it can change under you ────────────────
     A phone rotates and a desktop window gets dragged narrow;
     read once at mount and the frame would be wrong for the
     rest of the session. State rather than a ref because the
     width below is rendered, so it has to re-render. */
  const [snug, setSnug] = useState(
    () => typeof window !== "undefined"
      && window.matchMedia("(max-width: 760px)").matches,
  );
  /* ── and whether the screen has a keyboard of its own ────
     A different question from `snug` and it needs its own
     query: `snug` is about how much ROOM there is, and this is
     about what opening the field costs. A narrow desktop
     window is snug and types fine; a tablet is roomy and still
     throws half its screen away to a keyboard. */
  const [touch, setTouch] = useState(
    () => typeof window !== "undefined"
      && window.matchMedia("(pointer: coarse)").matches,
  );
  useEffect(() => {
    const room = window.matchMedia("(max-width: 760px)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const read = () => { setSnug(room.matches); setTouch(coarse.matches); };
    room.addEventListener("change", read);
    coarse.addEventListener("change", read);
    return () => {
      room.removeEventListener("change", read);
      coarse.removeEventListener("change", read);
    };
  }, []);
  const span = width ?? (snug ? SNUG : WIDE);

  const frame = useRef<HTMLDivElement | null>(null);
  const field = useRef<HTMLInputElement | null>(null);
  const results = useRef<HTMLUListElement | null>(null);
  const beat = useRef(0);
  const rest = useRef(0);
  const typing = useRef(0);

  const [open, setOpen] = useState(false);
  const [press, setPress] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [lean, setLean] = useState({ x: 0, y: 0 });
  const [hits, setHits] = useState<Hit[]>([]);
  const [found, setFound] = useState(false);
  const [cursor, setCursor] = useState(0);
  const still = stillness();

  useEffect(() => () => {
    window.clearTimeout(beat.current);
    window.clearTimeout(rest.current);
    window.clearTimeout(typing.current);
  }, []);

  /* ── the width is the state ──────────────────────────────
     Tuned toward the top of the range by default: this is a
     control, and a control that wobbles reads as decoration.
     What the spring is for here is the tiny overshoot at the
     end — enough that the object arrives rather than stops,
     and not enough to notice as a bounce. */
  const target = open ? Math.max(SHUT, span) : SHUT;
  const w = useSpring(target, clamp(spring, 0, 100), still);

  /* how far through the transformation, 0 shut and 1 open */
  const p = clamp((w - SHUT) / Math.max(1, Math.max(SHUT, span) - SHUT), 0, 1);

  /* ── the magnet ──────────────────────────────────────────
     Measured from the FRAME, which never moves, and not from
     the object, which does. A vector read off a thing the
     vector is currently displacing is a feedback loop: it
     converges, but it converges by ringing, and the ring is
     visible as a shiver on an object this small.

     Off entirely once open. A field that drifts toward the
     pointer while you are trying to click into it is a field
     fighting you. */
  useEffect(() => {
    const el = frame.current;
    if (!el || open || still) return;
    let raf = 0;
    let at = { x: 0, y: 0 };
    const publish = () => { raf = 0; setLean(at); };
    const read = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const k = b.width / (el.offsetWidth || b.width) || 1;
      const dx = (e.clientX - (b.left + b.width / 2)) / k;
      const dy = (e.clientY - (b.top + b.height / 2)) / k;
      const d = Math.hypot(dx, dy);
      const R = 110;
      if (d > R) {
        if (at.x || at.y) { at = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(publish); }
        return;
      }
      /* A FEW PIXELS. The brief for this is "responsive, not
         following" and the difference is entirely in the
         ceiling: past about seven the object stops being a
         thing that acknowledges you and starts being a thing
         you are dragging around. */
      const pull = (1 - d / R) ** 1.4 * (2 + (give / 100) * 5);
      at = { x: (dx / (d || 1)) * pull, y: (dy / (d || 1)) * pull };
      if (!raf) raf = requestAnimationFrame(publish);
    };
    const gone = () => { at = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(publish); };
    document.addEventListener("pointermove", read, { passive: true });
    document.addEventListener("pointerleave", gone);
    return () => {
      document.removeEventListener("pointermove", read);
      document.removeEventListener("pointerleave", gone);
      cancelAnimationFrame(raf);
    };
  }, [open, give, still]);

  /* ── Pagefind, loaded on the first keystroke ────────────
     Not at module scope and not on mount. `/pagefind/pagefind.js`
     is a real download and the reader who opens the docs to
     read about routes should not pay for an index they never
     query. One promise is shared across keystrokes, so a fast
     typist does not queue five of these.

     The path is held in a variable on purpose. Written as a
     literal, the bundler and the type checker both try to
     resolve it at build time — and it is not a module, it is a
     file Starlight writes into dist/ after the build. There was
     no bundle for it to find and the build failed on it. */
  const index = useRef<Promise<any> | null>(null);
  const load = () => {
    if (!index.current) {
      const url = "/pagefind/pagefind.js";
      index.current = import(/* @vite-ignore */ url).then((m) => m.default ?? m);
    }
    return index.current;
  };

  /* Every query is given a number, and a slower one that
     started earlier cannot overwrite a faster one that started
     later. Without it, typing "or" quickly enough to trigger
     two searches can land the older, broader answer last. */
  const ask = async (q: string) => {
    const mine = ++typing.current;
    if (!q.trim()) { setHits([]); setFound(false); return; }
    try {
      const pagefind = await load();
      const res = await pagefind.search(q);
      if (mine !== typing.current) return;
      const got = (await Promise.all(res.results.slice(0, 8).map((r: any) => r.data())))
        .filter(Boolean)
        .map((d: any, i: number) => ({
          id: d.url ?? String(i),
          url: d.url,
          title: d.meta?.title || nameOf(d.url ?? ""),
          excerpt: d.excerpt ?? "",
        })) as Hit[];
      if (mine !== typing.current) return;
      setHits(got);
      setFound(true);
      setCursor(0);
    } catch {
      /* An index that will not load is a field that keeps
         working as a field. Saying so beats an exception in the
         console of a page that looks fine. */
      if (mine === typing.current) { setHits([]); setFound(false); }
    }
  };

  /* ── opening ─────────────────────────────────────────────
     Compress, then expand, then focus. The order matters and
     the gap is short: 90ms is long enough to be felt as the
     object yielding and short enough that nobody waits for
     it. Focus lands with the expansion rather than at the end
     of it, so the caret is already there when the field
     arrives — waiting for the width to settle puts a visible
     pause between the box being ready and the box being
     usable. */
  const start = () => {
    if (open) return;
    setPress(true);
    window.clearTimeout(beat.current);
    beat.current = window.setTimeout(() => {
      setPress(false);
      setOpen(true);
      field.current?.focus();
    }, still ? 0 : 90);
  };

  /* Away with nothing typed and it goes back. Away with
     something typed and it stays: the value IS the reason the
     field exists, and closing over it would either hide it or
     throw it away. */
  const away = () => {
    if (value.trim()) return;
    setOpen(false);
    setHits([]);
    setFound(false);
  };

  /* the lens acknowledges typing without performing it — one
     short beat per burst, not one per character */
  const tapped = () => {
    if (!busy) setBusy(true);
    window.clearTimeout(rest.current);
    rest.current = window.setTimeout(() => setBusy(false), 340);
  };

  /* the highlighted row, moved by the keyboard. Arrow keys and
     Enter are handled here rather than by the input, because a
     field that is a listbox has to own its own arrow keys.
     `to` is absolute — the call sites pass cursor +/- 1 — so
     there is nothing for a functional update to compute. */
  const move = (to: number) => {
    if (!hits.length) return;
    const next = (to + hits.length) % hits.length;
    const row = results.current?.children[next] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
    setCursor(next);
  };

  return (
    <div
      className="sek"
      ref={frame}
      data-open={open}
      data-press={press}
      data-busy={busy}
      data-flat={still || undefined}
      style={{
        "--sek-r": `${clamp(CORNER, 0, SHUT / 2)}px`,
        "--w": `${w.toFixed(2)}px`,
        "--p": p.toFixed(3),
        /* the placeholder and the caret arrive in the last
           third, once there is somewhere for them to be */
        "--say": clamp((p - 0.55) / 0.45, 0, 1).toFixed(3),
        "--lx": `${lean.x.toFixed(2)}px`,
        "--ly": `${lean.y.toFixed(2)}px`,
        "--inset": `${INSET}px`,
        "--lens": `${LENS}px`,
        "--shut": `${SHUT}px`,
        /* ── THE FRAME FOLLOWS THE FIELD ──────────────────
           Tight to what is actually set, so the reserved room
           is not paid for in the one part of the object the
           reader is looking at. It never moves during an
           interaction: this changes with a knob, not with the
           open/shut state, which is what the magnet needs. */
        "--frame": `${Math.max(SHUT, span) + 26}px`,
        "--frameh": `${SHUT + framePad}px`,
        /* the field's own type, derived from the size rather than
           fixed in the stylesheet: see SAY above */
        "--say-fs": `${SAY}px`,
      } as React.CSSProperties}
    >
      <div className="sek-skin">
        {/* Drawn rather than imported. The lens has to take a
            state — it thickens a hair while you type — and an
            icon you cannot address is an icon that can only
            be swapped for another one. */}
        <svg className="sek-lens" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="7.6" cy="7.6" r="5.4" />
          <path d="M11.6 11.6 L15.4 15.4" />
        </svg>

        <input
          ref={field}
          className="sek-field"
          type="text"
          value={value}
          placeholder="Search the docs"
          aria-label="Search the documentation"
          /* ── NO SOFTWARE KEYBOARD ON A TOUCH SCREEN ──────
             `inputMode` and not `readOnly`, and not skipping
             the focus() in start(). Both of those would fix the
             keyboard and break something: readOnly kills typing
             for a tablet with a real keyboard attached, and not
             focusing kills the only way this closes — `away` is
             a blur handler, so a field that never takes focus
             never gives it back and would stay open for good.

             none means "I am focusable, I have a caret, do not
             raise the on-screen one". */
          inputMode={touch ? "none" : undefined}
          tabIndex={open ? 0 : -1}
          /* the field is a combobox once results exist: it owns
             a list, and the list is announced rather than being
             a set of loose links under a text box */
          role={found ? "combobox" : undefined}
          aria-expanded={found ? true : undefined}
          aria-controls={found ? "sek-list" : undefined}
          aria-activedescendant={
            found && hits.length ? `sek-hit-${cursor}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setValue(e.target.value);
            tapped();
            void ask(e.target.value);
          }}
          onBlur={away}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              /* Escape steps back out of the results before it
                 closes the field, so one press is never both. */
              if (found && hits.length) { setHits([]); setFound(false); return; }
              setValue("");
              setOpen(false);
              setHits([]);
              setFound(false);
              field.current?.blur();
              return;
            }
            if (e.key === "ArrowDown") { e.preventDefault(); move(cursor + 1); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); move(cursor - 1); return; }
            if (e.key === "Enter" && found && hits[cursor]) {
              e.preventDefault();
              window.location.href = hits[cursor].url;
            }
          }}
        />

        {/* The way in, and only while there is a way in. When
            the field is open this is the field's own job, and
            a second target sitting over it would swallow the
            click that places the caret. */}
        {!open && (
          <button className="sek-hit" aria-label="Search" onClick={start} />
        )}
      </div>

      {/* The results sit BELOW the object rather than inside it, and
          that placement is load-bearing rather than cosmetic. Inside
          the skin they were clipped by the very overflow:hidden that
          keeps the field from spilling out of the shut circle, so the
          list rendered and was invisible — the skin's height is
          --shut by definition, so there is no room inside it for a
          list no matter what the width is doing. As a sibling the
          panel is positioned against the frame, and the box's width
          stays free to be nothing but the state. */}
      {open && found && (
        <ul className="sek-results" id="sek-list" ref={results} role="listbox"
            aria-label="Search results">
          {hits.length === 0 && (
            <li className="sek-empty">No page matches that.</li>
          )}
          {hits.map((h, i) => (
            <li
              key={h.id}
              id={`sek-hit-${i}`}
              role="option"
              aria-selected={i === cursor}
              className="sek-result"
              data-cursor={i === cursor || undefined}
            >
              <a href={h.url} onMouseEnter={() => setCursor(i)}>
                <span className="sek-result-title">{h.title}</span>
                <span className="sek-result-excerpt"
                  /* Pagefind's excerpt is its own HTML with the
                     matched terms already wrapped in <mark>.
                     It is the only markup this component ever
                     renders, and it comes from a build step over
                     this repository's own markdown. */
                  dangerouslySetInnerHTML={{ __html: h.excerpt }}
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Seek;
