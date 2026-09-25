# orbit-site

The official Orbit site. Astro 7 + Tailwind 4 + TypeScript in strict mode.

The documentation itself is **not** here. It lives in
[orbit-lang](https://github.com/joacokhzyx/orbit-lang/blob/main/docs), next to the
code and the tests that back it, and every page here links to it. One copy of a
document is enough to keep in sync.

## Commands

| Command | Action |
| --- | --- |
| `pnpm dev` | Local dev at `localhost:4321` |
| `pnpm build` | Type-check, then build the static site to `dist/` |
| `pnpm preview` | Serve the production build |
| `pnpm check` | `astro check` diagnostics |
| `pnpm icons` | Re-render the favicon, app icons, and social card from `public/logo.svg` |

pnpm is the only package manager for this project. `package-lock.json` was removed
so installs are reproducible.

## How it's put together

| Path | What lives there |
| --- | --- |
| `src/styles/global.css` | Design tokens: palette (light and dark), fluid type scale, focus and motion rules |
| `src/data/site.ts` | Canonical URL, brand wording, navigation, and the pointers to the repository |
| `src/data/docs.ts` | The documentation map that `/docs` renders |
| `src/data/releases.ts` | The curated changelog, read from `docs/CHANGELOG.md` |
| `src/lib/orbit-grammar.mjs` | TextMate grammar for `.orb`, its keywords copied from the compiler's lexer |
| `src/components/` | Nav, Footer, Logo, ThemeToggle, CodeBlock, Callout, Prose, Section, LinkButton, PageHero |
| `scripts/generate-icons.mjs` | Renders the PNG icons and `og.png` from the SVG mark |

## Notes

- **No framework runtime.** The only JavaScript shipped is the theme toggle, the
  mobile menu is a `<details>` disclosure, and code highlighting happens at build
  time. There are no islands.
- **Fonts are self-hosted** through `@fontsource-variable`. The browser only pulls
  the latin subset, via `unicode-range`.
- **Dark mode** is a class on `<html>`, applied by an inline script before first
  paint so the saved or system theme never flashes the wrong palette.
- **TypeScript is pinned to 5.9.x** because `astro check` does not yet support the
  TS 7 native API. Astro 7 and Tailwind 4 stay latest.
- **Voice** follows `ORBIT_BRAND_LANGUAGE_SYSTEM.md` in the orbit-lang repository:
  calm, precise, no hype. Every number carries machine, method, and limits. The
  home page publishes no performance figure yet, and says why.
- Editing the mark means editing `public/logo.svg`, then running `pnpm icons`.
