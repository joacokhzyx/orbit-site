import { test, expect, type Page } from "@playwright/test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Nothing may be painted in a colour the contract does not name.
 *
 * The intent of this file has not changed since the one-bit direction it was
 * written for, and the direction itself is not what the check is about. The
 * claim is: every colour that reaches the page comes from the token set, so
 * the design can be changed by changing the tokens. It runs in a browser
 * because that is the only place the claim is checkable -- a third tone
 * arrives from outside the token blocks, in the cascade, from a library.
 * Expressive Code brings fourteen colour properties of its own, and it once
 * painted the code window blue-grey on cream while every source token block
 * looked perfect. Nothing in the source would have said so.
 *
 * The set is read from the page rather than written here. The twelve names
 * below are the contract's, and the contract fixes them; the values are
 * resolved out of the live cascade, so the test follows the tokens instead of
 * duplicating them, and a palette change cannot quietly turn this into a test
 * that passes against whatever the tokens happen to be.
 */

/** The twelve tokens of the contract, by name. Fixed by the contract. */
const CONTRACT_TOKENS = [
  "--paper",
  "--surface",
  "--surface-2",
  "--sunken",
  "--ink",
  "--ink-2",
  "--ink-3",
  "--line",
  "--line-2",
  "--focus",
  "--signal-bg",
  "--signal-ink",
] as const;

const DIST = "dist";

function htmlFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "_astro") continue;
    if (statSync(full).isDirectory()) found.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) {
      const route = `/${relative(DIST, full).replace(/index\.html$/, "").replace(/\.html$/, "")}`;
      found.push(route === "/" ? "/" : route);
    }
  }
  return found.sort();
}

const ROUTES = htmlFiles(DIST);

/**
 * The routes whose HTML carries a code window, read from the build rather
 * than listed. A code page added or removed is picked up either way, and the
 * assertion below keeps the set from being empty, which is the failure mode
 * of a discovery-based test: it would otherwise check nothing and pass.
 *
 * The two kinds are kept apart because they are two code paths. The
 * documentation goes through Expressive Code, whose tokens arrive as numbered
 * custom properties on each span; the marketing pages go through plain
 * Shiki, whose arrive as `--shiki-light` and `--shiki-dark` on the block. The
 * surface and the contrast gate cover both; the palette has to arrive covers
 * only the one that used not to.
 */
const CODE_ROUTES = builtRoutesWith("expressive-code", "code-surface");
const DOC_CODE_ROUTES = builtRoutesWith("expressive-code");

function builtRoutesWith(...needles: string[]): string[] {
  return ROUTES.filter((route) => {
    // Not every discovered route is an index: /404 is a single file, so this
    // has to be a probe rather than a concatenation.
    const file = join(DIST, route, "index.html");
    if (!existsSync(file)) return false;
    const html = readFileSync(file, "utf8");
    return needles.some((needle) => html.includes(needle));
  });
}

test.describe("the contract's palette is defined", () => {
  // One marketing page and one documentation page: the two halves load
  // different stylesheets, and a token defined in only one of them is a
  // token the other half paints with the wrong value.
  for (const route of ["/", "/docs/"]) {
    for (const theme of ["light", "dark"] as const) {
      test(`${route} in ${theme} defines all ${CONTRACT_TOKENS.length} tokens`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route, { waitUntil: "networkidle" });
        await expectAppliedTheme(page, route, theme);

        const { values, missing } = await resolveContractPalette(page);
        expect(
          missing,
          `${route} in ${theme}: ${missing.join(", ")} resolve to nothing, so every value on ` +
            `this page is painted on the wrong side of an undefined var()`,
        ).toEqual([]);
        expect(values).toHaveLength(CONTRACT_TOKENS.length);
      });
    }
  }
});

/**
 * Every colour the browser paints has to be one the contract names.
 *
 * The one exemption is the syntax palette, and it is scoped as narrowly as
 * the contract scopes it: the `color` of a span inside a code window, and
 * nothing else. Backgrounds and borders are still checked inside a code
 * window, because the window has to be a surface the contract names -- which
 * is how the blue-grey code window was caught the first time.
 *
 * Shadows are deliberately not walked. The contract names two shadow steps
 * and no shadow colour, so a shadow tinted off the ink is the design's
 * decision and not this test's to overrule.
 */
test.describe("only the contract's palette reaches the page", () => {
  for (const route of ROUTES) {
    for (const theme of ["light", "dark"] as const) {
      test(`${route} in ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route, { waitUntil: "networkidle" });
        await expectAppliedTheme(page, route, theme);

        const { strays, total } = await findStrays(page, CONTRACT_TOKENS);

        expect(
          strays.slice(0, 25).join("\n") + (total > 25 ? `\n    ...and ${total - 25} more` : ""),
          `${route} in ${theme} paints ${total} propert(ies) in a colour that is not one of the ` +
            `contract's ${CONTRACT_TOKENS.length} tokens`,
        ).toBe("");
      });
    }
  }
});

/**
 * Every piece of text has to be readable against what is behind it.
 *
 * This is not the same claim as "only the palette is used", and it is here
 * because the first version of that check proved the first while the pages
 * were broken in the second way. Starlight's `--sl-color-white` had been
 * remapped to the ground, which set every documentation heading's colour to
 * the same value as the page behind it: white on white in light mode, black
 * on black in dark mode, an invisible title on all sixteen pages. The
 * palette check passed, because a page painted entirely in allowed values is
 * exactly what it was looking for. axe did not report it either.
 *
 * So the claim is checked directly: for every run of text, walk up to the
 * first opaque background behind it and require the two to differ. With
 * twenty values in the palette rather than two, "differ" has to mean the
 * colour was pointed at the wrong token -- `--ink-2` on `--surface` is a
 * legitimate combination and passes, because the two are not the same value.
 */
test.describe("text is readable against what is behind it", () => {
  for (const route of ROUTES) {
    for (const theme of ["light", "dark"] as const) {
      test(`${route} in ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route, { waitUntil: "networkidle" });
        await expectAppliedTheme(page, route, theme);

        const unreadable = await page.evaluate(() => {
          const parse = (value: string) => {
            const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
            return { r: parts[0] ?? -1, g: parts[1] ?? -1, b: parts[2] ?? -1, a: parts[3] ?? 1 };
          };
          const paper = (() => {
            const probe = document.createElement("div");
            probe.style.backgroundColor = "var(--paper)";
            document.body.appendChild(probe);
            const value = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return value;
          })();

          /**
           * The first opaque background at or above an element.
           *
           * Opaque means alpha of exactly one, not merely non-zero. A
           * translucent tint -- Starlight's backdrop, a shadow-derived wash --
           * is not the colour the text is read against; the page behind it
           * is. Falling through to the first non-transparent one instead is
           * what the earlier version did, and it is what a translucent
           * background would have slipped through.
           */
          const backgroundBehind = (start: Element): string => {
            let node: Element | null = start;
            let translucent: string | null = null;
            while (node) {
              const colour = getComputedStyle(node).backgroundColor;
              if (colour && parse(colour).a > 0) {
                if (parse(colour).a === 1) return colour;
                translucent ??= colour;
              }
              node = node.parentElement;
            }
            return translucent ?? paper;
          };

          const found: string[] = [];
          for (const element of document.querySelectorAll<HTMLElement>("body *")) {
            // Only elements that actually render text of their own.
            const text = [...element.childNodes]
              .filter((node) => node.nodeType === Node.TEXT_NODE)
              .map((node) => node.textContent?.trim() ?? "")
              .join("")
              .trim();
            if (!text) continue;

            const style = getComputedStyle(element);
            // A hidden element is not a defect, and neither is anything
            // inside a hidden ancestor: Starlight's mobile contents control
            // is display:none at desktop width, and it is not on screen to
            // be read. checkVisibility walks the ancestors, which a
            // getComputedStyle on the element alone does not.
            if (!element.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true })) {
              if (!element.getClientRects().length) continue;
            }
            // A syntax token is the one place colour is allowed, and it is
            // the token's own colour that matters, not the window's.
            if (element.closest(".expressive-code .code, .code-surface")) continue;

            const behind = backgroundBehind(element);
            const foreground = parse(style.color);
            const background = parse(behind);
            const same =
              foreground.r === background.r &&
              foreground.g === background.g &&
              foreground.b === background.b;
            if (same) {
              found.push(
                `"${text.slice(0, 40)}" is ${style.color} on ${behind} (${element.tagName.toLowerCase()})`,
              );
            }
          }
          return [...new Set(found)];
        });

        expect(
          unreadable.slice(0, 25).join("\n"),
          `${route} in ${theme} has ${unreadable.length} run(s) of text painted in the same value ` +
            `as the surface behind it`,
        ).toBe("");
      });
    }
  }
});

/**
 * A code window is a window: its own surface, and a syntax palette measured
 * against it.
 *
 * Both halves of that are checked against what the browser painted, not
 * against what the source says, because the failure this exists to catch is a
 * surface token that resolves to nothing. An undefined `--sunken` leaves the
 * window transparent, and a transparent background measured against a
 * hardcoded white reports a comfortable ratio for a block that is in fact
 * sitting on the page. So the surface is required to be opaque and to be one
 * of the contract's tokens first, and only then are the tokens measured.
 */
test.describe("code windows sit on a contract surface and are legible on it", () => {
  test("the build has code windows to check", () => {
    expect(
      CODE_ROUTES.length,
      "no built page carries a code window, so every check in this block would pass vacuously",
    ).toBeGreaterThan(0);
    expect(
      DOC_CODE_ROUTES.length,
      "no built page carries an Expressive Code window, so the palette check below would never run",
    ).toBeGreaterThan(0);
  });

  for (const route of CODE_ROUTES) {
    for (const theme of ["light", "dark"] as const) {
      test(`${route} in ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route, { waitUntil: "networkidle" });
        await expectAppliedTheme(page, route, theme);

        const { palette, windows } = await page.evaluate((tokens: string[]) => {
          const probe = document.createElement("div");
          document.body.appendChild(probe);
          const palette = new Set<string>();
          for (const name of tokens) {
            probe.style.backgroundColor = `var(${name})`;
            const value = getComputedStyle(probe).backgroundColor;
            if (value !== "rgba(0, 0, 0, 0)") palette.add(value);
          }
          probe.remove();

          const windows = [...document.querySelectorAll<HTMLElement>(".expressive-code pre, .code-surface")].map(
            (pre) => {
              const style = getComputedStyle(pre);
              // The spans that carry the palette, in either code path: the
              // documentation's Expressive Code window and the marketing
              // pages' own Shiki block. Everything painted as text inside a
              // window is read, so a gutter or an inline marker cannot be
              // left out of the measurement.
              const spans = new Set<string>();
              for (const span of pre.querySelectorAll("span")) {
                if (!span.textContent?.trim()) continue;
                spans.add(getComputedStyle(span).color);
              }
              return { background: style.backgroundColor, colours: [...spans] };
            },
          );
          return { palette: [...palette], windows };
        }, [...CONTRACT_TOKENS]);

        expect(
          windows.length,
          `${route} in ${theme} was found by the build as carrying code but renders no code window`,
        ).toBeGreaterThan(0);

        for (const [index, window] of windows.entries()) {
          const where = `${route} in ${theme}, code window ${index + 1}`;

          expect(
            window.background,
            `${where} is painted on ${window.background}, which is not opaque. The surface token it ` +
              `names is undefined, so the block is sitting on the page behind it and the syntax ` +
              `palette is being measured against nothing.`,
          ).not.toBe("rgba(0, 0, 0, 0)");
          expect(
            palette,
            `${where} is painted on ${window.background}, which is not one of the contract's tokens`,
          ).toContain(window.background);
          expect(
            window.colours.length,
            `${where} paints no text at all, so there is no syntax palette to measure`,
          ).toBeGreaterThan(0);

          for (const colour of window.colours) {
            const ratio = contrastRatio(colour, window.background);
            expect(
              ratio,
              `${where}: token ${colour} on ${window.background} is ${ratio.toFixed(2)}:1`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      });
    }
  }

  /**
   * The syntax palette has to survive the trip from the theme to the screen.
   *
   * This was a `test.fixme`, recorded rather than hidden, because
   * ExpressiveCodeTheme.fromJSONString -- the only route a token colour takes
   * into a documentation page -- read a Shiki 4 theme object and returned one
   * whose `tokenColors` is `undefined`, discarding all 45 entries without an
   * error. Every token then fell back to Expressive Code's "unknown token"
   * grey and each documentation code block rendered as one flat run of text.
   * The marketing pages were never affected, because they go through plain
   * Shiki, which does not normalise.
   *
   * src/lib/code-theme.mjs now re-attaches the colours after normalising, and
   * the measurement that established it is here rather than in a comment.
   * Measured in Chromium against the current build: 4 to 7 distinct token
   * colours per documentation page per theme, matching the `--0` and `--1`
   * pairs in the built HTML, and identical with the `WORKAROUND` block in
   * src/styles/starlight.css removed -- Expressive Code's own stylesheet
   * already carries both `var(--0, inherit)` and `var(--1, inherit)`, so
   * that block is dead. See the review notes.
   */
  for (const route of DOC_CODE_ROUTES) {
    test(`${route} code is highlighted in both themes`, async ({ page }) => {
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route, { waitUntil: "networkidle" });
        await expectAppliedTheme(page, route, theme);

        const colours = await codeColours(page);
        expect(
          colours.length,
          `every documentation code token on ${route} resolved to one colour in ${theme} ` +
            `(${colours.join(", ") || "none at all"}); the theme's tokenColors were dropped before ` +
            `rendering, so the block is unhighlighted`,
        ).toBeGreaterThan(2);
      }
    });
  }
});

/**
 * Two things have to be true before any of the above means anything, and both
 * are cheap to assert and expensive to get wrong.
 *
 * The theme has to actually be applied, or a test that reads the tokens in
 * "dark" is reading the light ones and reporting them as a pass. And the
 * theme has to be marked the same way on a marketing page as on a
 * documentation page: the marketing pages set a class on <html> before first
 * paint, and Starlight sets data-theme on the same element from its own
 * inline script. Asserting either marker alone fails half the site.
 */
async function expectAppliedTheme(page: Page, route: string, theme: "light" | "dark") {
  const applied = await page.evaluate(() => {
    const html = document.documentElement;
    return (
      html.classList.contains("dark") || html.getAttribute("data-theme") === "dark"
    );
  });
  expect(applied, `${route} did not apply the ${theme} theme`).toBe(theme === "dark");
}

type Palette = { values: string[]; missing: string[] };

/** The contract's tokens, resolved through the live cascade. */
async function resolveContractPalette(page: Page): Promise<Palette> {
  return page.evaluate((tokens: string[]) => {
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const values: string[] = [];
    const missing: string[] = [];
    for (const name of tokens) {
      // Assigning the token to a real colour property is what resolves it:
      // reading the custom property back gives the text as written, which
      // may be another var() rather than the value a reader actually gets.
      probe.style.backgroundColor = `var(${name})`;
      const value = getComputedStyle(probe).backgroundColor;
      if (value === "rgba(0, 0, 0, 0)") missing.push(name);
      else values.push(value);
    }
    probe.remove();
    return { values, missing };
  }, [...CONTRACT_TOKENS]);
}

type Strays = { strays: string[]; total: number };

/** Every painted colour that is not one of the contract's tokens. */
async function findStrays(page: Page, tokens: readonly string[]): Promise<Strays> {
  return page.evaluate((names: string[]) => {
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const allowed = new Set<string>();
    for (const name of names) {
      probe.style.backgroundColor = `var(${name})`;
      const value = getComputedStyle(probe).backgroundColor;
      if (value !== "rgba(0, 0, 0, 0)") allowed.add(value);
    }
    probe.remove();

    const TRANSPARENT = new Set(["rgba(0, 0, 0, 0)", "transparent"]);
    const describe = (element: Element) => {
      const first = (element.getAttribute("class") ?? "").trim().split(/\s+/)[0];
      return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${first ? `.${first}` : ""}`;
    };

    const strays = new Set<string>();
    let total = 0;
    // <html> and <body> are not in `body *`, and a page that paints its own
    // ground from somewhere other than the tokens would otherwise be missed.
    const elements: Element[] = [
      document.documentElement,
      document.body,
      ...document.querySelectorAll("body *"),
    ];
    for (const element of elements) {
      const style = getComputedStyle(element);
      const painted: [string, string][] = [
        ["background-color", style.backgroundColor],
        ["color", style.color],
      ];
      for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
        if (parseFloat(style[`border${side}Width`]) > 0) {
          painted.push([`border-${side.toLowerCase()}-color`, style[`border${side}Color`]]);
        }
      }
      // Only when an outline is actually drawn: `outline-color`'s initial
      // value is `currentcolor`, which is the text colour rather than a
      // boundary the reader ever sees.
      if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) {
        painted.push(["outline-color", style.outlineColor]);
      }

      // The one exemption the contract makes. Syntax colour is meaning, and
      // the measured palette in src/lib/code-theme.mjs is the only colour
      // outside the token set. It is scoped to the text of a span inside a
      // code window: the window's own surface and rules are still checked,
      // which is what catches a code window painted off-palette.
      const inCodeWindow = element.closest(".expressive-code, .code-surface") !== null;

      for (const [property, value] of painted) {
        if (TRANSPARENT.has(value)) continue;
        if (allowed.has(value)) continue;
        if (property === "color" && inCodeWindow) continue;
        total++;
        strays.add(`${describe(element)} ${property}: ${value}`);
      }
    }
    return { strays: [...strays], total };
  }, [...tokens]);
}

/** The colours actually painted on the documentation's code token spans. */
async function codeColours(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const colours = new Set<string>();
    for (const span of document.querySelectorAll(".expressive-code .code span")) {
      colours.add(getComputedStyle(span).color);
    }
    return [...colours];
  });
}

function contrastRatio(foreground: string, background: string): number {
  const [a, b] = [foreground, background].map(parseRgb).map(relativeLuminance);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(value: string): [number, number, number] {
  const parts = value.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
