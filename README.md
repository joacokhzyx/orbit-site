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
| `pnpm build` | Type-check, build, then run the contrast and link gates |
| `pnpm preview` | Serve the production build |
| `pnpm check` | `astro check` diagnostics |
| `pnpm check:contrast` | Measure every colour pair against WCAG AA |
| `pnpm check:links` | Resolve every internal link and every repository path |
| `pnpm icons` | Re-render the favicon, app icons, and social card from `public/logo.svg` |

pnpm is the only package manager for this project. `package-lock.json` was removed
so installs are reproducible.

## The design

Direction A from the prototype review, applied to every page.

| Path | What lives there |
| --- | --- |
| `src/styles/global.css` | The token block, the seven step type scale, the one radius, the focus and motion rules |
| `src/components/` | Nav, Footer, Logo, ThemeToggle, Section, Prose, Callout, CodeBlock, LinkButton, PageHero |
| `src/data/site.ts` | Canonical URL, brand wording, navigation, pointers into the repository |
| `src/data/docs.ts` | The documentation map that `/docs` renders |
| `src/data/releases.ts` | The curated changelog, read from `docs/CHANGELOG.md` |
| `src/lib/orbit-grammar.mjs` | TextMate grammar for `.orb`, keywords copied from the compiler's lexer |
| `src/lib/highlighter.mjs` | One memoised Shiki instance for the whole build |
| `scripts/check-contrast.mjs` | Fails the build when a colour pair misses AA |
| `scripts/check-links.mjs` | Fails the build on a dead internal link or a renamed document |
| `scripts/generate-icons.mjs` | Renders the PNG icons and `og.png` from the SVG mark |

### The rules the design holds to

1. **Seven type sizes.** Nothing outside the scale. Three weights: 400, 500, 600.
2. **One radius** (`--radius`), one larger (`--radius-lg`), and a pill for chips.
3. **A hairline divides a section. It never encloses a box.** The header has no
   border at all; it separates itself with space and a blurred background.
4. **Nine greys and no accent.** The only colour on the page is the amber that
   marks a state. A link is ink with an underline, and the underline is the
   affordance.
5. **Every text pair clears 4.5:1**, checked by `pnpm check:contrast`, which is
   part of `pnpm build`. The previous palette shipped seven failing pairs and
   nothing was measuring.
6. **Focus is 2px with a 2px offset**, and clears 3:1 against whatever it sits on.
7. **Touch targets are at least 44px.**
8. **No em dash in the copy**, anywhere, including titles.
9. **Headlines run 3 to 6 words** and never use a template construction.
10. **JavaScript is the theme, the menu, and the copy button.** No islands.

## Notes

- **No framework runtime.** Code highlighting happens at build time.
- **Fonts are self-hosted**: Space Grotesk for the display, IBM Plex Sans for the
  body, JetBrains Mono for labels and code, Outfit for the wordmark. The browser
  pulls only the latin subset, via `unicode-range`.
- **Dark mode** is a class on `<html>`, applied by an inline script before first
  paint so the saved or system theme never flashes the wrong palette. The dark
  palette is designed, not inverted.
- **TypeScript is pinned to 5.9.x** because `astro check` does not yet support the
  TS 7 native API. Astro 7 and Tailwind 4 stay latest.
- **Voice** follows `ORBIT_BRAND_LANGUAGE_SYSTEM.md` in the orbit-lang repository:
  calm, precise, no hype. Every number carries machine, method, and limits. The
  home page publishes no performance figure yet, and says why.
- Editing the mark means editing `public/logo.svg`, then running `pnpm icons`.
