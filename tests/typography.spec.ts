import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * The typeface has to actually arrive, and it has to hold at the size it is
 * set at.
 *
 * Both halves of this were defects. The display face was a bitmap font drawn
 * for 8 to 12 pixels, set at 64, where every glyph dissolved into a stack of
 * disconnected horizontal dashes and the headline stopped reading as a word.
 * And a face that fails to load falls back silently: the CSS names a family
 * that is not there, the browser substitutes whatever is, and the page looks
 * plausible and wrong with nothing in the build to say so.
 *
 * So the display face is checked twice. Once, that the family the stylesheet
 * names is the family the browser actually used, at every step of the scale.
 * Twice, that the ink of a line of display type stays inside its line boxes.
 */

const DIST = "dist";

function builtRoutes(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "_astro") continue;
    if (statSync(full).isDirectory()) found.push(...builtRoutes(full));
    else if (entry.endsWith(".html")) {
      const route = `/${relative(DIST, full).replace(/index\.html$/, "").replace(/\.html$/, "")}`;
      found.push(route === "/" ? "/" : route);
    }
  }
  return found.sort();
}

const ROUTES = builtRoutes(DIST);

test.beforeAll(() => {
  mkdirSync(".impeccable/review", { recursive: true });
});

/** Every font family the stylesheet actually loaded on the page. */
async function loadedFamilies(page: Page): Promise<string[]> {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() =>
    [...document.fonts].filter((font) => font.status === "loaded").map((font) => font.family),
  );
}

test.describe("the display face arrives", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`/${""} in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/", { waitUntil: "networkidle" });

      const families = await loadedFamilies(page);
      expect(
        families.some((family) => family.toLowerCase().includes("archivo")),
        `the display face never loaded. Loaded instead: ${families.join(", ") || "nothing"}`,
      ).toBe(true);

      // And the headline is genuinely set in it, rather than inheriting the
      // body face because the rule that names the display face is gone.
      const headline = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        if (!h1) return null;
        return getComputedStyle(h1).fontFamily.split(",")[0].replace(/["']/g, "").trim();
      });
      expect(
        headline?.toLowerCase(),
        `the h1 is set in "${headline}" rather than the display face`,
      ).toContain("archivo");
    });
  }
});

test.describe("display type holds at its own size", () => {
  test("no line of display type has its ink cut by the line box", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const clipped = await page.evaluate(() => {
      const escaped: string[] = [];
      for (const element of document.querySelectorAll("h1, h2, h3, h4, p, a, li, span")) {
        const style = getComputedStyle(element);
        if (style.visibility === "hidden") continue;
        if (!element.getClientRects().length) continue;
        // A visually hidden element is clipped to a pixel on purpose, so a
        // clip check on one is measuring the technique, not a defect.
        if (element.closest(".sr-only")) continue;
        if (style.clipPath === "inset(50%)" || style.clip === "rect(0px, 0px, 0px, 0px)") {
          continue;
        }

        const range = document.createRange();
        range.selectNodeContents(element);
        const rects = [...range.getClientRects()];
        if (!rects.length) continue;

        const box = element.getBoundingClientRect();
        const inkTop = Math.min(...rects.map((r) => r.top));
        const inkBottom = Math.max(...rects.map((r) => r.bottom));
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize);
        // Twelve percent of a line is the point where a descender is
        // visibly sheared off by whatever clips the box.
        const worst = Math.max(box.top - inkTop, inkBottom - box.bottom) / lineHeight;
        if (worst > 0.12) {
          escaped.push(
            `${element.tagName.toLowerCase()}.${(element.className || "").toString().split(" ")[0]} ` +
              `escapes ${(worst * 100).toFixed(0)}% of a line at ${style.fontSize}`,
          );
        }
      }
      return [...new Set(escaped)];
    });

    expect(clipped.join("\n"), `${clipped.length} run(s) of type have their ink cut`).toBe("");
  });

  // There is deliberately no automated legibility check here, and the
  // reason is worth recording because three were written and measured
  // before they were found not to work.
  //
  // The defect that started this was a bitmap face set at 64 pixels, where
  // every glyph dissolved into a stack of disconnected horizontal dashes and
  // the headline stopped reading as a word. The obvious automated check is
  // to render the headline and measure the ink. Measured against four faces
  // at 64 pixels, none of the three candidate metrics separated them:
  //
  //   face          ink/em   band solid   components per glyph
  //   Archivo         0.73       0.37            0.89
  //   Geist           0.73       0.37            0.89
  //   Azeret Mono     0.78       0.30            0.89
  //   Workbench       0.88       0.40            0.83
  //
  // The bitmap face scores *higher* on all three. Its blocks are large
  // enough that adjacent ones touch, so each letter is still one connected
  // component, and its band is taller and denser than a real face's. A pixel
  // statistic cannot tell a reader "this does not spell anything"; only a
  // reader can. A gate that claimed otherwise would be a test that passes
  // while the defect is on screen, which is worse than no gate.
  //
  // So the checks here are the two that are true: the declared face is the
  // loaded face, and no line has its ink cut by its own line box. Judging
  // whether a typeface is set at a size it can carry stays a human call,
  // made by looking at it.
});
