---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/learn.astro","src/pages/foundation.astro","src/pages/changelog.astro","src/pages/404.astro"]
---

# Surface brief: the site (all routes)

## Scope and mode

Every route on orbit-lang.dev: the four marketing pages, the eleven documentation
pages, and the error page. Mode is Persuade for the marketing pages and Read for
the documentation, and one world has to hold both without the seam showing.

## Audience, job, action

Primary audience is developers who are tired of large dependency trees, arriving
sceptical. Their job is to decide whether Orbit is worth an afternoon. The action
is downloading a binary or opening the getting-started page. Secondary audiences
are people with headroom to spare, and enthusiasts who want to try a new
language or support the mission.

Proof is on the site already: the self-hosted bootstrap, the fixed point, the
known-limitations page, and the release data read from GitHub at build time.
Constraints are the voice and the honesty, which PRODUCT.md makes binding. The
palette, the type scale, and the layout language are explicitly not commitments.

## Chosen direction

**REPLACED 2026-09-26 by a user-pinned direction.** The one-bit desktop was
abandoned. In the user's words: *"más limpio, más rounded sin tantos border
marcados... quitar border y separadores que están prácticamente pegados."*

The one-bit version turned its own constraint into the design, and the six ways
that went wrong are recorded in `.impeccable/review/DESIGN-CONTRACT.md` so
nobody puts them back. The current world is a warm neutral system: twelve
measured tokens, four surfaces, three inks, two boundary weights, one focus hue,
one state tint. Depth is a surface step first, a shadow second, a border last.
Four radii, two shadows, and a section boundary that is a hairline with a full
rhythm on both sides.

What survives from the one-bit direction, and why:

- **The code window keeps colour.** Syntax colour is meaning rather than
  decoration, so the phosphor terminal keeps the measured palette while
  everything around it stays quiet. It is the single place colour is permitted.
- **The honesty discipline is not a visual decision.** Every number carries its
  machine, method and limits, and every state is labelled in words as well as
  tinted. That was never decoration and it does not change.
- **The one focus hue survives,** and is now the only hue in the system.
- **One legitimate inversion.** The primary button. Nothing else gets a fill.

The display face changed too: Archivo Variable at 400 and 600, because the
bitmap face it replaced was drawn for 8 to 12 pixels and dissolved at 64.


## Direction contract

**THESIS:** A tool's interface should be quieter than the tool. Refuses both
halves of the category default: the dark terminal hero with a Get started
button, and the boxed-everything editorial page where every element carries a
border. A reader should find the mechanism, not the styling.

**OWN-WORLD:** A warm neutral system where a background step separates and a
border does not. Four surfaces, three inks, two boundary weights, four radii,
two shadows, one state tint, one focus hue. A raised card is `--surface` with
`--shadow-sm`; a tinted block is `--surface-2` with no border; a control that has
no background of its own is outlined in `--line-2`. Display is Archivo Variable
at 400 and 600, prose is IBM Plex Sans at 400, and anything a machine would
print is JetBrains Mono. Nothing is drawn at full contrast.

**STORY:** The visitor learns that Orbit compiles to C through a compiler written
in itself, that a service ships as one native binary, and that the project states
what it cannot do. They believe the numbers because the method is published next
to them. They download a binary or open the getting-started page.

**FIRST VIEWPORT:** A sticky header with one hairline underneath. The headline
"Do more with less." in Archivo at 600, clamp(2.25rem, 4rem). One lead paragraph
at 66ch. Two buttons, the primary one filled and pill-shaped. Then the download
matrix as a raised card with one inset row per platform showing the true file
size the resolver read from GitHub, and a soft amber chip for the prerelease. Then
the health service code block as a rounded window. The primary action is the
first platform download row, above the fold.

**FORM:** Early one-bit desktop, drawn as a single tiled screen rather than
overlapping windows. Roll seed key 1e471402, challenger
medium-native-one-bit-desktop, chosen by the user over the assigned grounded
direction.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance

## Unresolved decisions

- Whether the documentation's own prose should be set in IBM Plex Sans at the
  same measure as the marketing pages, or whether the docs read better at 44rem
  against the marketing 66ch. The two are different measures today and the
  difference is deliberate, not an oversight.
- Whether the mobile download rows need a visible affordance beyond the inset
  step, given that a background step is the only thing separating them from the
  card they sit on.
