---
name: Orbit
description: A warm neutral system, dark-first, where space and a background step separate things, and a border is the last resort.
colors:
  paper: "#0a0a0b"
  surface: "#131316"
  surface-2: "#1e1e21"
  sunken: "#0e0e10"
  ink: "#f2f1ee"
  ink-2: "#b8b6b0"
  ink-3: "#918f88"
  line: "#26262a"
  line-2: "#6e6e79"
  focus: "#8ab0ff"
  signal-bg: "#2e2617"
  signal-ink: "#e8c37a"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 3.75vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo Variable, Archivo, IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.25rem + 1.875vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  mono:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "1rem"
  pill: "999px"
spacing:
  base: "4px"
  hairline: "1px"
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px 32px"
  card-inset:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  chip:
    backgroundColor: "{colors.signal-bg}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.pill}"
  callout:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "20px"
  callout-measuring:
    backgroundColor: "{colors.signal-bg}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  code-window:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 18px"
---

# Orbit Design System

## Overview

**Creative North Star: "Space and a background step separate things. A border is the last resort."**

The interface is a warm neutral system, **dark-first**. Twelve measured values,
four surfaces, three inks, two boundary weights, one focus hue, one state tint.
Depth is a shadow or a step in the surface scale, never an outline.

**Dark is the ground the site is drawn on.** The default appearance of every
page is the dark scheme; light is the alternate, not the origin. What that
changed is not the hue — the ink was always warm off-white, and it still is —
but which side of it is the page. The ground is `#0a0a0b` rather than `#000`,
because pure black is a value no display can render and it turns every step
above it into a hole. One step of warm off-black reads as deep and still lets
`--surface` be a surface rather than a border.

The order of authority for the theme is deliberate and is not "dark always":
a reader who has chosen follows their choice, a reader who has not follows
their system, and the site's own default sits underneath both as the answer
for a browser that reports neither. Forcing dark ahead of the system would
override an explicit preference, and the test that asserts the page honours one
would fail.

This replaced a two-value one-bit palette: a pixel, a ground, and a 2px stipple
standing in for every tone between them. Twelve named greys is not a regression.
It is the difference between a constraint and a design, and the two-value version
had turned its own rule into the answer:

- **Everything was a box.** Seven full-contrast borders and six outlined
  surfaces. When everything is framed, nothing is distinguished, and a page
  reads as a stack of containers rather than a composition.
- **The stipple was noise.** Twenty-one uses of a 2px dither, which at 1× reads
  as a texture artefact rather than a pattern.
- **Every corner was square,** so shape carried no information at all.
- **The inversions were deafening.** A solid black rectangle to say
  "Prerelease", and another for a measurement note. Loud typography for small
  information.
- **Rules touched the text they divided,** which is what made the page feel
  busy in a way nobody could name.

**Key Characteristics:**

- **Warm, not cold, and dark by default.** The page is `#0a0a0b`, not black
  and not the usual `#121212` slate. A raised card is a step up from it, so it
  reads as a card and not as a hole.
- **Two boundary weights, and only two.** `--line` is a hairline you do not
  notice until you look for it, and it divides content. `--line-2` clears 3:1
  and is the only value a control may be outlined with. Nothing in the system
  is drawn at full contrast.
- **Three inks for three real levels of information,** not three decorative
  shades. Body copy is `--ink-2`, labels are `--ink-3`.
- **One focus hue.** A ring the same colour as the text it surrounds is a ring
  nobody finds.
- **A state is a tint, not a slab.** `--signal-bg` with dark text on it.
- **The code window is the one place colour is allowed,** because syntax
  colour is meaning rather than decoration.

## Colors

The **Light** column is the alternate scheme. The **Dark** column is the site's
default appearance and the one every screenshot in review was taken in first.

| Token | Dark (default) | Light | Role |
| --- | --- | --- | --- |
| `--paper` | `#0a0a0b` | `#faf9f7` | The page. |
| `--surface` | `#131316` | `#ffffff` | A raised card. |
| `--surface-2` | `#1e1e21` | `#f2f1ee` | A tinted or inset block. |
| `--sunken` | `#0e0e10` | `#f6f5f2` | Code and inline code. |
| `--ink` | `#f2f1ee` | `#1a1a18` | Primary text, and the primary button's fill. |
| `--ink-2` | `#b8b6b0` | `#56554f` | Body copy. |
| `--ink-3` | `#918f88` | `#6b6860` | Labels, numbers, metadata. |
| `--line` | `#26262a` | `#e4e2dd` | A hairline divider. Divides, never encloses. |
| `--line-2` | `#6e6e79` | `#8b8880` | A control boundary. |
| `--focus` | `#8ab0ff` | `#1d4ed8` | The focus ring. |
| `--signal-bg` | `#2e2617` | `#fbf3e2` | The state tint. |
| `--signal-ink` | `#e8c37a` | `#6b4d09` | Text on the state tint. |

All 48 pairings are measured by `pnpm check:contrast`, which reads both blocks
and fails on any pair that misses AA. The gate also refuses to pass if a
`--sl-*` or `--ec-*` property resolves to a hex outside this table, which is
how Expressive Code's own fourteen-colour palette was caught painting the code
window blue-grey on cream.

The measured worst cases, in the scheme each is worst in:

- `--ink-3` on `--surface-2` at 5.14:1 dark, the hardest ground a label is ever
  set on, and 4.93:1 light. It was `#8e8c84` in the old dark block, which gave
  4.65:1 there and under a tenth of a ratio of headroom.
- `--line-2` on `--surface-2` at 3.30:1 dark and 3.13:1 light.
- `--focus` on `--paper` at 9.17:1 dark and 6.37:1 light.
- A selection is the focus hue as a ground, so its ink is `--paper` rather
  than a fixed white. White on the dark focus hue is 1.9:1 and was unreadable
  before this scheme existed; `--paper` gives 9.3:1 dark and 6.9:1 light, from
  the same two tokens in either direction.

The syntax palette is measured separately, against whichever surface actually
paints code: 14 colours, worst case 9.09:1 in dark and 4.90:1 in light, by
`pnpm check:code-contrast`.

## Typography

Three faces, each with a job no other can do.

- **Archivo Variable** — display, headings, the wordmark, at 400 and 600. It
  replaced a bitmap face that was legible at 8 to 12 pixels and dissolved into
  disconnected dashes at the 64 pixel display size, which is the only reason
  this section has a history in it.
- **IBM Plex Sans Variable** — prose, at 400. A workhorse, because this is a
  documentation site and the reading matters more than the display.
- **JetBrains Mono Variable** — anything a machine would print: labels, section
  numbers, file names, the table of contents, and code.

The scale is seven steps in `@theme` in `src/styles/global.css` and is not
repeated here, because a second copy is a second thing to keep in step. The
line heights are set so that no run of display type has its ink cut by its own
line box, which `pnpm test:a11y` measures.

## Layout

One spacing rhythm on a 4px base. Two measures: 66ch for prose, 44rem for
documentation content, and `max-w-6xl` for the page itself. Breakpoints are `sm`
at 640px and `lg` at 1024px; the type scale's `clamp()` carries the continuity
between them.

A section boundary is **air**, not a rule. There is no border above a section
and none above a footer, and the two halves of the rhythm are written as a
pair so the space above belongs to the section that came before it. The rule
was removed everywhere rather than kept in some places: a page that draws a
line above most of its sections is a page of ruled boxes, and the ones left
behind are the ones that no longer look deliberate. `--line` divides inside a
section — a table row, a quote — and no longer divides between them.

The canonical host is **`www.orbit-lang.dev`**, because that is the address
production serves. Astro derives every canonical link, every `og:url` and the
whole sitemap from its one `site:` value, and `src/data/site.ts` carries a
second copy used as the fallback for the two components that build an
absolute URL outside a page context. `check:seo` compares them and pins the
host, because without that check the two drifting apart produces a build
whose every canonical disagrees with its sitemap — and the gate that reports
it points at the sitemap, which is not where the mistake was. `vercel.json`
redirects the apex, since a host that 200s and serves the same content is a
duplicate-content surface.

## Elevation & Depth

Two shadows, `--shadow-sm` for a resting card and `--shadow-md` for something
lifted. That is the whole vocabulary.

Depth in this system is a background step first, a shadow second, and a border
only when the element has no background of its own. A border is the last
resort, not the first, which is the single rule the previous direction broke.

## Shapes

Four radii, used consistently: `--radius-sm` for inputs and chips, `--radius`
for buttons and cards, `--radius-lg` for large panels, and `--radius-pill` only
for things that are genuinely pill-shaped, which means buttons, chips and
scrollbar thumbs.

The previous direction set all three radii to zero, which meant every element
was the same shape and the shape said nothing.

## Components

- **Card** — `--surface`, `--radius-lg`, `--shadow-sm`. A raised block is a
  background step and a shadow, in that order.
- **Inset block** — `--surface-2`, `--radius`, no border. Used for a platform
  row, a note, a callout.
- **Button, primary** — `--ink` on `--paper` text, `--radius-pill`. The one
  legitimate inversion on the site. Hover is a 10% opacity step, not a colour,
  so it cannot fail contrast.
- **Button, secondary** — no rule around it, `--radius`. It reads as a button
  from its padding and its `--surface-2` step on hover, and a link that goes
  deeper into the site carries a chevron. An external one carries the exit
  arrow instead, never both.
- **Card, inverting** — `--ink` ground with `--paper` text; hover and focus
  swap both, along with the rule and the figure, in one transition. Four
  roles and no second stylesheet: `--ink`/`--paper` for the ground and the
  title, `--surface-2`/`--ink-2` for the body, `--ink-3`/`--line` for the
  rule. Every part moves together or it reads as two cards, not one printed
  twice. The focus state is the hover state: a card that answers the mouse
  and ignores the keyboard is broken for half the people who can reach it.
  There is no dark-mode block, because a card on `--ink` is dark on a light
  page and light on a dark one, and in both cases it is the inverse of what
  it sits on.
- **Search, Seek** — a circle that is a field, width being the state. Sized
  to its container rather than to itself: 44 in the documentation bar, which
  is the height of every other control in it, and its lens at 0.44 of the
  circle, the band the bar's round buttons already sit in. It is mounted
  only where a Pagefind index exists, and the index loads on the first
  keystroke, not with the component.
- **Chip** — `--signal-bg` with `--signal-ink`. A tint, never an inversion.
- **Callout** — four variants, all cards. Note, limit and tip are `--surface-2`;
  the measuring aside is `--signal-bg`. All four carry their label as text, so
  nothing is signalled by colour alone.
- **Link** — `--ink` with a 1px `--line-2` underline that goes `--ink` on
  hover. The underline is the affordance.
- **Code window** — `--sunken`, `--radius-lg`, a 1px `--line` frame, a title
  bar split by a hairline, and the measured syntax palette inside. The title
  bar is `--surface-2`, which on the dark ground is the only way it separates
  from the code below it: a #101013 title bar on a #0e0e10 surface is a
  difference of two in one channel, and the hairline then had to do a job
  the surfaces could have done. **Line numbers** are on, in `--ink-3`, with
  no rule between the gutter and the code, because a language tour asks the
  reader to count.
- **Documentation sections** — four groups, and the hierarchy is stated
  twice on purpose. A horizontal **rail** under the navbar carries the top
  level, marked with a 2px underline at the edge that meets the content,
  because a rail is tabs and a tab is marked the way a tab is marked. The
  **sidebar** underneath it lists only the pages of the section you are in,
  flat, with the section's pages marked by a `--surface-2` step the way every
  other list on this site marks where you are. The rule is drawn here
  deliberately and is the one exception to "a border is the last resort": the
  rail and the page behind it are the same colour, and air cannot separate
  two things that are touching. The source of truth for the four groups is
  `src/data/docs-sections.ts`, which both the rail and Starlight's sidebar
  config read, so a page added there appears in both on the same build.
- **Quickstart card** — the first thing on `/docs`, under the title: the claim
  and two buttons above, a real code window below. One raised block with a
  two-column interior rather than two cards, because a seam down the middle
  reads as two things that happen to be adjacent. It is carried in
  `.not-content`, which is Starlight's escape hatch for content that is not
  prose and is load-bearing here: the prose link rule is unlayered at
  specificity 0,1,1 and beats Tailwind's `text-paper` at 0,1,0, which
  renders a button's label in the button's own fill.
- **Card grid** — a layout, not a list. Starlight renders one as a list, and
  its items carry no list marker here: a bullet beside a raised panel says
  "item in a series" when the meaning is "a place you can go to".

## Rules

**Do**

- Separate with space or a surface step first. Reach for a border last.
- Give every rule air on both sides, and write the space above it as the
  previous section's bottom rather than as this one's top.
- Repoint a third-party colour at one of the twelve tokens the moment it
  appears.
- Mark a state with a label as well as a tint.
- Keep the code window's syntax palette measured rather than chosen by eye.

**Do not**

- Draw anything at full contrast. A 100% black or white border is a bug.
- Use a solid fill for small information. A chip is a tint; the primary button
  is the only inversion.
- Bring back the stipple, the dither, or a square corner.
- Set a typeface at a size it cannot carry. There is no automated check for
  this and there cannot be: three pixel metrics were written and measured
  against four faces, and the failing face scored higher on all three. Judging
  it is a human act, done by looking.
- Remap `--sl-color-white` to a surface. Starlight sets every heading's colour
  from it, and pointing it at the ground made all eleven documentation titles
  invisible. That defect passed both the two-value check and axe.
- Trust that a palette implies legible text. `pnpm test:a11y` compares every
  run of text against the first opaque background behind it, which is the check
  that would have caught it.
- Render a site component inside Starlight's markdown without `not-content`.
  The prose rules are unlayered and specific enough to win against Tailwind's
  utilities, and until MDX landed nothing could be in there, so the collision
  had never happened.
