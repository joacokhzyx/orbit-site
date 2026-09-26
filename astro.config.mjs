import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { orbitLanguage } from "./src/lib/orbit-grammar.mjs";
import { CODE_THEMES, CODE_THEMES_BY_ROLE } from "./src/lib/code-theme.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://orbit-lang.dev",
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    // React, for one component: the Seek search control. It is a stateful
    // widget — a spring, a magnet, a width that IS the open/closed state —
    // and there is no honest way to express it without a component model.
    // The cost is a runtime on pages that mount it, which is why Search is
    // not in the nav or the footer: the docs header is the only place that
    // earns it, and Pagefind is loaded lazily with the widget rather than
    // on every marketing page.
    react(),
    // One sitemap, covering everything. This used to filter out every
    // /docs URL on the claim that a second sitemap was generated for the
    // documentation, and it was not: Starlight only adds its own sitemap
    // integration when one is absent, so declaring it here meant no
    // replacement was ever created. Eleven of fifteen indexable pages were
    // in no sitemap at all. pnpm check:seo now fails if a built page is
    // missing from this file.
    sitemap(),
    starlight({
      title: "Orbit",
      // Starlight joins a page title to the site title with a pipe. Every
      // marketing page has always used a backslash — Base.astro builds
      // "Orbit \\ Getting started" — so the whole documentation tree was
      // titling itself differently from the rest of the same site, and a
      // reader with two tabs open could see both conventions at once. The
      // option is `titleDelimiter`; `titleSeparator` is not a key in this
      // version and the config refuses to build with it.
      titleDelimiter: "\\",
      description:
        "A statically typed language for APIs and microservices, with a compiler written in itself, that compiles to C and ships as one native binary.",
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
        // Starlight's head knows nothing about Open Graph, so without
        // this every documentation page shared with no image.
        Head: "./src/components/DocsHead.astro",
      },
      // Starlight injects its own /404 route, which collides with
      // src/pages/404.astro and would win. The site's own error page is
      // the one that carries the navigation, the recovery links, and the
      // noindex that Starlight's default omits.
      disable404Route: true,
      editLink: {
        baseUrl: "https://github.com/joacokhzyx/orbit-lang/edit/main/docs/",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/joacokhzyx/orbit-lang" },
      ],
      lastUpdated: true,
      pagination: true,
      credits: false,
      // Both halves of the site read the syntax palette from
      // src/lib/code-theme.mjs, which owns the measured token colours and
      // the reason they are the high-contrast pair. Starlight defaults to
      // Night Owl, whose light variant is washed out on cream and which
      // knows nothing about Orbit.
      expressiveCode: {
        themes: CODE_THEMES,
        useStarlightDarkModeSwitch: true,
        useStarlightUiThemeColors: true,
        defaultProps: { wrap: false },
        // The Orbit grammar has to be registered here as well as in
        // markdown.shikiConfig below.
        shiki: { langs: [orbitLanguage] },
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
            { label: "Kynx", slug: "docs/services/kynx" },
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
    // and is derived from the compiler's own keyword table. The themes are
    // the same measured pair the documentation uses.
    shikiConfig: {
      langs: [orbitLanguage],
      themes: CODE_THEMES_BY_ROLE,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
