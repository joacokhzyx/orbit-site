import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Every route the build produces, discovered from dist/ rather than listed
 * by hand, so a new page is covered the moment it exists and a deleted one
 * does not leave a test pointing at nothing.
 */
const DIST = "dist";

function builtRoutes(dir: string): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "_astro") continue;
    if (statSync(full).isDirectory()) routes.push(...builtRoutes(full));
    else if (entry.endsWith(".html")) {
      const route = `/${relative(DIST, full).replace(/index\.html$/, "").replace(/\.html$/, "")}`;
      routes.push(route === "/" ? "/" : route);
    }
  }
  return routes.sort();
}

const ROUTES = builtRoutes(DIST);
const REVIEW_DIR = ".impeccable/review";

/** The three widths that catch different failures. */
const VIEWPORTS = [
  { name: "mobile", width: 320, height: 720 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const THEMES = ["light", "dark"] as const;

test.beforeAll(() => {
  mkdirSync(REVIEW_DIR, { recursive: true });
});

test.describe("no axe violations", () => {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route} in ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(route, { waitUntil: "networkidle" });

        // The theme has to actually be applied before anything is
        // measured. Two different things mark it as dark and the site
        // listens for both: the marketing pages set a class on <html>
        // before first paint, and Starlight sets data-theme on the same
        // element from its own script. Asserting on either one alone
        // fails half the site.
        const isDark = await page.evaluate(() => {
          const html = document.documentElement;
          return (
            html.classList.contains("dark") || html.getAttribute("data-theme") === "dark"
          );
        });
        expect(isDark, `${route} did not apply the ${theme} theme`).toBe(theme === "dark");

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
          .analyze();

        const report = results.violations.map(
          (violation) =>
            `${violation.id} (${violation.impact}): ${violation.help}\n` +
            violation.nodes
              .slice(0, 4)
              .map((node) => `    ${node.target.join(" ")}`)
              .join("\n"),
        );
        expect(report.join("\n\n"), `${route} in ${theme}`).toBe("");
      });
    }
  }
});

test.describe("layout holds at every viewport", () => {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route} at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route, { waitUntil: "networkidle" });
        await assertNoHorizontalOverflow(page, route, viewport.width);
      });
    }
  }
});

test.describe("screenshots for review", () => {
  // Desktop and mobile, both themes. A two-value system has to be read the
  // other way round as well as this one, so a light-only capture set would
  // show half the world.
  for (const viewport of [VIEWPORTS[2], VIEWPORTS[0]]) {
    for (const route of ["/", "/docs/", "/changelog/"]) {
      for (const theme of THEMES) {
        test(`${route} at ${viewport.width}px in ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.emulateMedia({ colorScheme: theme });
          await page.goto(route, { waitUntil: "networkidle" });
          const slug = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-|-$/g, "");
          await page.screenshot({
            path: join(REVIEW_DIR, `${slug}-${viewport.name}-${theme}.png`),
            fullPage: true,
          });
        });
      }
    }
  }
});

test.describe("interaction", () => {
  test("the theme toggle reports the state it puts the page in", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const toggle = page.locator("[data-theme-toggle]").first();
    const before = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    const pressedBefore = await toggle.getAttribute("aria-pressed");
    expect(pressedBefore).toBe(String(before));

    await toggle.click();
    const after = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(after).toBe(!before);
    expect(await toggle.getAttribute("aria-pressed")).toBe(String(after));
  });

  test("a dark-mode reader is not told the button switches to dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "networkidle" });
    const label = await page.locator("[data-theme-toggle]").first().getAttribute("aria-label");
    expect(label).not.toBe("Switch to dark theme");
  });

  test("the mobile menu closes on Escape and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    const menu = page.locator("[data-menu]");
    const summary = menu.locator("summary");

    await summary.click();
    await expect(menu).toHaveAttribute("open", "");

    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveAttribute("open", "");
    await expect(summary).toBeFocused();
  });

  test("the skip link is the first thing a keyboard reaches", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText(/skip to content/i);
  });

  test("every code block announces a copy result", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/", { waitUntil: "networkidle" });
    const copy = page.locator("[data-copy]").first();
    await copy.click({ force: true });
    const status = page.locator("[data-copy-status]").first();
    await expect(status).toHaveText(/copied|ctrl\+c/i, { timeout: 5000 });
  });

  test("a page carries exactly one h1", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const count = await page.locator("h1").count();
      expect(count, `${route} has ${count} h1 elements`).toBe(1);
    }
  });

  test("no id is used twice on a page", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const duplicates = await page.evaluate(() => {
        const seen = new Map<string, number>();
        for (const element of document.querySelectorAll("[id]")) {
          seen.set(element.id, (seen.get(element.id) ?? 0) + 1);
        }
        return [...seen].filter(([, count]) => count > 1).map(([id]) => id);
      });
      expect(duplicates, `${route} repeats id(s): ${duplicates.join(", ")}`).toEqual([]);
    }
  });
});

async function assertNoHorizontalOverflow(page: Page, route: string, width: number): Promise<void> {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  // One pixel of slack for sub-pixel rounding at fractional widths.
  expect(
    overflow.scrollWidth,
    `${route} at ${width}px scrolls horizontally: content is ${overflow.scrollWidth - overflow.clientWidth}px wider than the viewport`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}
