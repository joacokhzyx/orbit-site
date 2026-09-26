import { defineConfig, devices } from "@playwright/test";

/**
 * The accessibility and rendering check.
 *
 * Everything else in this repository verifies a claim about the source.
 * This one verifies what a reader actually gets: a real browser, real
 * layout, both themes, and three viewports. It is the only check that can
 * see a contrast failure, a focus ring that is not there, or a control
 * that overflows at 320px.
 *
 * Screenshots land in .impeccable/review/, which is where the design
 * review looks for them.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"]],
  timeout: 45_000,
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node scripts/serve-dist.mjs",
    url: "http://127.0.0.1:4321/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
