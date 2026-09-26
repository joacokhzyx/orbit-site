# orbit-site

The official Orbit site. Astro 7 + Tailwind 4 + TypeScript in strict mode, with
[Starlight](https://starlight.astro.build) running the documentation at `/docs`.

The documentation is written here, not mirrored from the repository. The
repository stays the authority on the code and the tests; where a page here and
a file there disagree, the file is right, and every page says so.

## Commands

| Command | Action |
| --- | --- |
| `pnpm dev` | Local dev at `localhost:4321` |
| `pnpm build` | Build, repair one known upstream asset bug, then run every gate |
| `pnpm preview` | Serve the production build |
| `pnpm gates` | Type-check and run all five gates against the last build |
| `pnpm typecheck` | `astro check` diagnostics |
| `pnpm check:contrast` | Measure every colour pair against WCAG AA, both schemes, and prove the gate can fail |
| `pnpm check:code-contrast` | Measure every syntax colour against the surface code is painted on |
| `pnpm check:links` | Resolve every internal link, every anchor, every repository path, and the hosted-document rule |
| `pnpm check:downloads` | Ask GitHub whether each rendered download URL is a real asset |
| `pnpm check:seo` | Titles, descriptions, canonicals, social images, the sitemap, and the numeric claims in the copy |
| `pnpm test:a11y` | axe over every page, light and dark, at three viewports |
| `pnpm icons` | Re-render the favicon, app icons, and social card from `public/logo.svg` |

pnpm is the only package manager for this project. `package-lock.json` is not
tracked, so installs are reproducible.

## How it's put together

| Path | What lives there |
| --- | --- |
| `DESIGN.md` | The design system, written from the built world. `PRODUCT.md` holds the product truth |
| `src/styles/global.css` | The twelve tokens, the seven-step type scale, the radius and shadow scales, the focus and motion rules |
| `src/styles/starlight.css` | Starlight's tokens remapped onto ours, so `/docs` and the pages are the same site |
| `src/content/docs/` | The documentation, as Markdown with the Orbit grammar on every fence |
| `src/content.config.ts` | The `docs` collection, and the prefix that puts it at `/docs` |
| `src/components/` | Nav, Footer, Logo, ThemeToggle, Section, Prose, Callout, CodeBlock, LinkButton, PageHero, plus `DocsHeader` and `DocsFooter` for Starlight |
| `src/data/site.ts` | Canonical URL, brand wording, navigation, pointers into the repository |
| `src/data/docs.ts` | Which document a reader is sent to: this site when it is hosted here, the repository when it is not |
| `src/data/releases.ts` | The editorial half of the changelog. The dates come from the resolver, not from this file |
| `src/lib/releases.mjs` | Reads the releases the repository actually published, and a committed snapshot for offline builds |
| `src/lib/code-theme.mjs` | The one measured syntax palette, shared by the pages and the documentation |
| `src/lib/orbit-grammar.mjs` | TextMate grammar for `.orb`, keywords copied from the compiler's lexer |
| `src/lib/highlighter.mjs` | One memoised Shiki instance for the build-time blocks |
| `scripts/check-contrast.mjs` | Fails the build when a colour pair misses AA, and carries its own self-test |
| `scripts/check-code-contrast.mjs` | The same, for syntax colours, against the site's code surface |
| `scripts/check-links.mjs` | Internal links, anchors, canonical form, hosted documents, and repository paths |
| `scripts/check-downloads.mjs` | Asks GitHub whether each rendered download URL resolves |
| `scripts/check-seo.mjs` | Per-page metadata, sitemap coverage, and the numbers the copy claims |
| `scripts/fix-expressive-code-asset.mjs` | Repairs a stylesheet reference that Astro 7 re-hashes out from under Expressive Code |
| `scripts/generate-icons.mjs` | Renders the PNG icons and `og.png` from the SVG mark |
| `tests/a11y.spec.ts` | axe over every built page in both themes at three viewports |

### Two decisions worth knowing

**The docs live at `/docs`, and Starlight puts them at the root.** Starlight
injects its route at `/[...slug]`, so `start/tour` would land next to the home
page. `src/content.config.ts` prefixes every entry id with `docs/`, which moves
the whole tree under `/docs` without a second Astro instance and without
duplicating the content directory.

**The theme has two markers.** The site sets a `dark` class on `<html>` before
first paint. Starlight sets `data-theme` on the same element from its own
inline script. The tokens listen for both, because listening for only one left
`/docs` permanently in light mode.


### The rules the design holds to

1. **Space and a background step separate things. A border is the last
   resort.** A raised block is a surface step and a shadow; only a control with
   no background of its own gets an outline.
2. **Two boundary weights, and only two.** `--line` is a hairline that divides
   content and that you should not notice. `--line-2` clears 3:1 and is the only
   value a control may be outlined with. **Nothing is drawn at full contrast** —
   a 100% black or white border is a bug.
3. **Every rule gets air.** A section boundary is a hairline with a full
   rhythm above and below it, written as a pair, because the rule is the
   section's own top border.
4. **Three inks for three real levels of information,** not three decorative
   shades. Body copy is `--ink-2`, labels and metadata `--ink-3`.
5. **A state is a tint, not a slab.** `--signal-bg` with dark text on it, and
   always labelled in words. The one legitimate inversion on the site is the
   primary button.
6. **Four radii, used consistently**, and `--radius-pill` only for things that
   are genuinely pill-shaped.
7. **Two shadows.** Depth is a surface step first, a shadow second, a border
   last.
8. **One focus hue.** A ring the same colour as the text it surrounds is a ring
   nobody finds.
9. **The code window is the one place colour is allowed**, because syntax
   colour is meaning rather than decoration. `pnpm check:code-contrast`
   measures it against `--sunken`, the surface code is actually painted on, and
   it reads that surface out of the stylesheet rather than assuming it.
10. **Every pairing is measured, in both themes.** 48 of them, by
    `pnpm check:contrast`, which refuses to pass if a third-party `--sl-*` or
    `--ec-*` property resolves to a hex outside the twelve tokens.
11. **Touch targets are 44px**, except the copy button inside a code header at
    36px, which is recorded rather than rounded up.
12. **No em dash in the copy**, anywhere, including titles.
13. **Headlines run 3 to 6 words** and never use a template construction.
14. **JavaScript is the theme, the menu, and the copy button.** No islands.

Two things the gates deliberately do **not** claim:

A note on what is *not* enforced: a two-value palette does not imply legible
text. `--sl-color-white` was once remapped to the ground, which set every
documentation heading to the same value as the page behind it, and both the
two-value check and axe passed the whole time. `pnpm test:a11y` now compares
each run of text against the first opaque background behind it, which is the
check that would have caught it.

## Notes

- **No framework runtime.** Code highlighting happens at build time.
- **Fonts are self-hosted**: Space Grotesk for the display, IBM Plex Sans for the
  body, JetBrains Mono for labels and code, Outfit for the wordmark. The browser
  pulls only the subsets it needs, via `unicode-range`. IBM Plex Sans and
  JetBrains Mono ship cyrillic, greek, latin-ext and vietnamese ranges that a
  latin-only claim would have been wrong about.
- **Dark mode** is a class on `<html>`, applied by an inline script before first
  paint so the saved or system theme never flashes the wrong palette. The dark
  palette is designed, not inverted.
- **TypeScript is pinned to 5.9.x** because `astro check` does not yet support the
  TS 7 native API. Astro 7 and Tailwind 4 stay latest.
- **Voice** follows `ORBIT_BRAND_LANGUAGE_SYSTEM.md` in the orbit-lang repository:
  calm, precise, no hype. Every number carries machine, method, and limits. The
  home page publishes no performance figure yet, and says why.
- Editing the mark means editing `public/logo.svg`, then running `pnpm icons`.
