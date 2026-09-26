import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import { orbitLanguage } from "./src/lib/orbit-grammar.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://orbit-lang.dev",
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    sitemap({
      // The documentation lives under its own path, so the two sitemaps
      // are generated separately and the root one cannot claim pages it
      // knows nothing about.
      filter: (page) => !page.includes("/docs"),
    }),
    starlight({
      title: "Orbit",
      description:
        "A statically typed language for APIs and microservices, with a compiler written in itself.",
      favicon: "/favicon.svg",
      // Order matters: the site's own tokens first, so the Starlight
      // overrides below have something to point at. Without global.css the
      // docs pages resolve var(--paper) and var(--ink) to nothing and fall
      // back to Starlight's defaults, which is where the blue came from.
      customCss: ["./src/styles/global.css", "./src/styles/starlight.css"],
      // Our own header carries the site navigation, so Starlight's is off
      // and the theme control moves into ours.
      components: {
        Header: "./src/components/DocsHeader.astro",
        ThemeSelect: "./src/components/ThemeToggle.astro",
        Footer: "./src/components/DocsFooter.astro",
      },
      editLink: {
        baseUrl: "https://github.com/joacokhzyx/orbit-lang/edit/main/docs/",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/joacokhzyx/orbit-lang" },
      ],
      lastUpdated: true,
      pagination: true,
      credits: false,
      // Starlight defaults to Night Owl, whose light variant is washed out
      // on cream and which knows nothing about Orbit. Pointing both themes
      // at the pair the rest of the site uses makes the two halves of the
      // site agree on what code should look like.
      expressiveCode: {
        themes: ["github-light", "github-dark"],
        useStarlightDarkModeSwitch: true,
        useStarlightUiThemeColors: true,
        defaultProps: { wrap: false },
      },
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Documentation", slug: "docs" },
            { label: "Getting started", slug: "docs/start/getting-started" },
            { label: "Language tour", slug: "docs/start/tour" },
          ],
        },
        {
          label: "The language",
          items: [
            { label: "Language reference", slug: "docs/language/reference" },
            { label: "Orbit on the web", slug: "docs/language/web" },
          ],
        },
        {
          label: "Services",
          items: [
            { label: "Models and SQLite", slug: "docs/services/models" },
            { label: "Auth and roles", slug: "docs/services/auth" },
            { label: "Kynx, the HTTP layer", slug: "docs/services/kynx" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Commands", slug: "docs/reference/commands" },
            { label: "Known limitations", slug: "docs/reference/limitations" },
            { label: "Frequently asked", slug: "docs/reference/faq" },
          ],
        },
      ],
    }),
  ],
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
