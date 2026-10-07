import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import starlight from "@astrojs/starlight";
import { orbitLanguage } from "./src/lib/orbit-grammar.mjs";
import { CODE_THEMES, CODE_THEMES_BY_ROLE } from "./src/lib/code-theme.mjs";
import { starlightSidebar } from "./src/data/docs-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

// https://astro.build/config
export default defineConfig({
  site: "https://www.orbit-lang.dev",
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
    // MDX, and it has to be declared BEFORE Starlight.
    //
    // This is the fix for the reason /docs had no design system on it. A
    // documentation page was markdown, and markdown cannot reach a
    // component: eleven pages were rendering as a column of text with
    // seven identical code blocks and not one aside, card or step, while
    // src/styles/starlight.css carried finished styles for `.card`,
    // `.sl-badge` and `.pagination-links` that nothing in the build ever
    // matched. The components were reachable the whole time and the file
    // type was the thing that could not reach them.
    //
    // Order is load-bearing. Starlight takes the content collection over
    // itself, so an MDX integration registered after it is a no-op and
    // the build succeeds with .mdx files that then fail to resolve their
    // imports — the silent version of the same bug. Before it, the eleven
    // pages became .mdx and gained Aside, Card, CardGrid, LinkCard,
    // Steps, Tabs and Badge, all restyled to this site's tokens further
    // down this file.
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
        // One section at a time. The rail above carries the top level, so a
        // sidebar showing all four collapsible groups states the same
        // hierarchy twice in one column. Rendering it flat also drops the
        // twelve per-item rules Starlight draws down its nested lists, which
        // is the same rail-of-hairlines problem this stylesheet already
        // solved once for the right-hand contents table.
        Sidebar: "./src/components/DocsSidebar.astro",
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
        // Line numbers, because a language tour asks the reader to count.
        // tour.md says "at most 8 captures bind per request" and, without a
        // gutter, gave them no way to find line eight. The reference layout
        // this redesign is taken from numbers its code window, and the
        // numbers are the reason.
        //
        // This is a PLUGIN, not a `defaultProps` key, and the difference is
        // not academic: `showLineNumbers: true` in `defaultProps` is not a
        // key Expressive Code 0.44.2 knows, so it is dropped without an
        // error and every documentation page builds with no gutter and no
        // warning. `showLineNumbers` lives on
        // `@expressive-code/plugin-line-numbers`, which has to be installed
        // AND passed as an instance below. The `plugins: [lineNumbers()]`
        // entry is the part that does the work.
        plugins: [pluginLineNumbers()],
        defaultProps: {
          wrap: false,
        },
        // The Orbit grammar has to be registered here as well as in
        // markdown.shikiConfig below.
        shiki: { langs: [orbitLanguage] },
      },
      // The sections come from src/data/docs-sections.ts rather than being
      // written here, because the redesign needs this same hierarchy in a
      // second place: a horizontal rail of sections under the navbar, whose
      // active entry depends on which group the current path is in. A
      // component cannot import astro.config.mjs, so the list that both
      // consumers read had to move somewhere they can both reach. Adding a
      // page now means adding it in one place and getting it in the sidebar
      // and the rail together.
      sidebar: starlightSidebar(),
    }),
    // MDX, and it goes AFTER Starlight, which is the opposite of what the
    // Starlight docs read like and the reason is a positional check in a
    // transitive dependency.
    //
    // Starlight registers astro-expressive-code as one of its own
    // integrations, and astro-expressive-code refuses to start if
    // @astrojs/mdx appears earlier in this array than it does — it throws
    // with that exact instruction, and it throws at `astro:config:setup`
    // rather than at render, so the build dies before a page is written.
    // Starlight is the integration that brings expressive-code along, so
    // "expressive-code before mdx" and "starlight before mdx" are the same
    // constraint, and here it is.
    //
    // This is what gives the eleven documentation pages a design system
    // they could not reach before. A documentation page was markdown, and
    // markdown cannot reference a component, so every page was a column
    // of text with seven identical code blocks and not one aside, card or
    // step — while src/styles/starlight.css carried finished styles for
    // `.card`, `.sl-badge` and `.pagination-links` that nothing in the
    // build ever matched. The components were always reachable; the file
    // type was the thing that could not reach them. As .mdx they gained
    // Aside, Card, CardGrid, LinkCard, Steps, Tabs and Badge, all
    // restyled to this site's tokens in starlight.css.
    mdx(),
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
