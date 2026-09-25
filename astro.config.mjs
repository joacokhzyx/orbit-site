import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { orbitLanguage } from "./src/lib/orbit-grammar.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://orbit-lang.dev",
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [sitemap()],
  markdown: {
    // Orbit code is highlighted at build time by Shiki, which already
    // ships with Astro. The grammar lives in src/lib/orbit-grammar.mjs
    // and is derived from the compiler's own keyword table.
    shikiConfig: {
      langs: [orbitLanguage],
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
