---
name: Orbit
description: A warm neutral system where space and a background step separate things, and a border is the last resort.
colors:
  paper: "#faf9f7"
  surface: "#ffffff"
  surface-2: "#f2f1ee"
  sunken: "#f6f5f2"
  ink: "#1a1a18"
  ink-2: "#56554f"
  ink-3: "#6b6860"
  line: "#e4e2dd"
  line-2: "#8b8880"
  focus: "#1d4ed8"
  signal-bg: "#fbf3e2"
  signal-ink: "#6b4d09"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 3.75vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo Variable, Archivo, IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 1.25rem + 1.875vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "IBM Plex Sans Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  mono:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "1rem"
  pill: "999px"
spacing:
  base: "4px"
  hairline: "1px"
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px 32px"
  card-inset:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  chip:
    backgroundColor: "{colors.signal-bg}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.pill}"
  callout:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "20px"
  callout-measuring:
    backgroundColor: "{colors.signal-bg}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  code-window:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 18px"
---

# Orbit Design System

## Overview

**Creative North Star: "Space and a background step separate things. A border is the last resort."**

The interface is a warm neutral system. Twelve measured values, four surfaces,
three inks, two boundary weights, one focus hue, one state tint. Depth is a
shadow or a step in the surface scale, never an outline.

This replaced a two-value one-bit palette: a pixel, a ground, and a 2px stipple
standing in for every tone between them. Twelve named greys is not a regression.
It is the difference between a constraint and a design, and the two-value version
had turned its own rule into the answer:

- **Everything was a box.** Seven full-contrast borders and six outlined
  surfaces. When everything is framed, nothing is distinguished, and a page
  reads as a stack of containers rather than a composition.
- **The stipple was noise.** Twenty-one uses of a 2px dither, which at 1× reads
  as a texture artefact rather than a pattern.
- **Every corner was square,** so shape carried no information at all.
- **The inversions were deafening.** A solid black rectangle to say
  "Prerelease", and another for a measurement note. Loud typography for small
  information.
- **Rules touched the text they divided,** which is what made the page feel
  busy in a way nobody could name.

**Key Characteristics:**

- **Warm, not cold.** The page is `#faf9f7`, not white and not grey. A raised
  card is a step up from it, so it reads as a card and not as a hole.
- **Two boundary weights, and only two.** `--line` is a hairline you do not
  notice until you look for it, and it divides content. `--line-2` clears 3:1
  and is the only value a control may be outlined with. Nothing in the system
  is drawn at full contrast.
- **Three inks for three real levels of information,** not three decorative
  shades. Body copy is `--ink-2`, labels are `--ink-3`.
- **One focus hue.** A ring the same colour as the text it surrounds is a ring
  nobody finds.
- **A state is a tint, not a slab.** `--signal-bg` with dark text on it.
- **The code window is the one place colour is allowed,** because syntax
  colour is meaning rather than decoration.

## Colors

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--paper` | `#faf9f7` | `#131316` | The page. |
| `--surface` | `#ffffff` | `#1b1b1f` | A raised card. |
| `--surface-2` | `#f2f1ee` | `#232327` | A tinted or inset block. |
| `--sunken` | `#f6f5f2` | `#101013` | Code and inline code. |
| `--ink` | `#1a1a18` | `#f0efec` | Primary text, and the primary button's fill. |
| `--ink-2` | `#56554f` | `#b4b2ac` | Body copy. |
| `--ink-3` | `#6b6860` | `#8e8c84` | Labels, numbers, metadata. |
| `--line` | `#e4e2dd` | `#2b2b30` | A hairline divider. Divides, never encloses. |
| `--line-2` | `#8b8880` | `#6e6e79` | A control boundary. |
| `--focus` | `#1d4ed8` | `#8ab0ff` | The focus ring. |
| `--signal-bg` | `#fbf3e2` | `#2e2617` | The state tint. |
| `--signal-ink` | `#6b4d09` | `#e8c37a` | Text on the state tint. |

All 48 pairings are measured by `pnpm check:contrast`, which reads both blocks
and fails on any pair that misses AA. The gate also refuses to pass if a
`--sl-*` or `--ec-*` property resolves to a hex outside this table, which is
how Expressive Code's own fourteen-colour palette was caught painting the code
window blue-grey on cream.

The measured worst cases: `--ink-3` on `--surface-2` at 4.93:1 light and 4.65:1
dark; `--line-2` on `--paper` at 3.36:1 and 3.68:1; `--focus` on `--paper` at
6.37:1 and 8.60:1.

## Typography

Three faces, each with a job no other can do.

- **Archivo Variable** — display, headings, the wordmark, at 400 and 600. It
  replaced a bitmap face that was legible at 8 to 12 pixels and dissolved into
  disconnected dashes at the 64 pixel display size, which is the only reason
  this section has a history in it.
- **IBM Plex Sans Variable** — prose, at 400. A workhorse, because this is a
  documentation site and the reading matters more than the display.
- **JetBrains Mono Variable** — anything a machine would print: labels, section
  numbers, file names, the table of contents, and code.

The scale is seven steps in `@theme` in `src/styles/global.css` and is not
repeated here, because a second copy is a second thing to keep in step. The
line heights are set so that no run of display type has its ink cut by its own
line box, which `pnpm test:a11y` measures.

## Layout

One spacing rhythm on a 4px base. Two measures: 66ch for prose, 44rem for
documentation content, and `max-w-6xl` for the page itself. Breakpoints are `sm`
at 640px and `lg` at 1024px; the type scale's `clamp()` carries the continuity
between them.

A section boundary is **air**, not a rule. There is no border above a section
and none above a footer, and the two halves of the rhythm are written as a
pair so the space above belongs to the section that came before it. The rule
was removed everywhere rather than kept in some places: a page that draws a
line above most of its sections is a page of ruled boxes, and the ones left
behind are the ones that no longer look deliberate. `--line` divides inside a
section — a table row, a quote — and no longer divides between them.

## Elevation & Depth

Two shadows, `--shadow-sm` for a resting card and `--shadow-md` for something
lifted. That is the whole vocabulary.

Depth in this system is a background step first, a shadow second, and a border
only when the element has no background of its own. A border is the last
resort, not the first, which is the single rule the previous direction broke.

## Shapes

Four radii, used consistently: `--radius-sm` for inputs and chips, `--radius`
for buttons and cards, `--radius-lg` for large panels, and `--radius-pill` only
for things that are genuinely pill-shaped, which means buttons, chips and
scrollbar thumbs.

The previous direction set all three radii to zero, which meant every element
was the same shape and the shape said nothing.

## Components

- **Card** — `--surface`, `--radius-lg`, `--shadow-sm`. A raised block is a
  background step and a shadow, in that order.
- **Inset block** — `--surface-2`, `--radius`, no border. Used for a platform
  row, a note, a callout.
- **Button, primary** — `--ink` on `--paper` text, `--radius-pill`. The one
  legitimate inversion on the site. Hover is a 10% opacity step, not a colour,
  so it cannot fail contrast.
- **Button, secondary** — no rule around it, `--radius`. It reads as a button
  from its padding and its `--surface-2` step on hover, and a link that goes
  deeper into the site carries a chevron. An external one carries the exit
  arrow instead, never both.
- **Card, inverting** — `--ink` ground with `--paper` text; hover and focus
  swap both, along with the rule and the figure, in one transition. Four
  roles and no second stylesheet: `--ink`/`--paper` for the ground and the
  title, `--surface-2`/`--ink-2` for the body, `--ink-3`/`--line` for the
  rule. Every part moves together or it reads as two cards, not one printed
  twice. The focus state is the hover state: a card that answers the mouse
  and ignores the keyboard is broken for half the people who can reach it.
  There is no dark-mode block, because a card on `--ink` is dark on a light
  page and light on a dark one, and in both cases it is the inverse of what
  it sits on.
- **Search, Seek** — a circle that is a field, width being the state. Sized
  to its container rather than to itself: 44 in the documentation bar, which
  is the height of every other control in it, and its lens at 0.44 of the
  circle, the band the bar's round buttons already sit in. It is mounted
  only where a Pagefind index exists, and the index loads on the first
  keystroke, not with the component.
- **Chip** — `--signal-bg` with `--signal-ink`. A tint, never an inversion.
- **Callout** — four variants, all cards. Note, limit and tip are `--surface-2`;
  the measuring aside is `--signal-bg`. All four carry their label as text, so
  nothing is signalled by colour alone.
- **Link** — `--ink` with a 1px `--line-2` underline that goes `--ink` on
  hover. The underline is the affordance.
- **Code window** — `--sunken`, `--radius-lg`, a 1px `--line` frame, a title
  bar split by a hairline, and the measured syntax palette inside.

## Rules

**Do**

- Separate with space or a surface step first. Reach for a border last.
- Give every rule air on both sides, and write the space above it as the
  previous section's bottom rather than as this one's top.
- Repoint a third-party colour at one of the twelve tokens the moment it
  appears.
- Mark a state with a label as well as a tint.
- Keep the code window's syntax palette measured rather than chosen by eye.

**Do not**

- Draw anything at full contrast. A 100% black or white border is a bug.
- Use a solid fill for small information. A chip is a tint; the primary button
  is the only inversion.
- Bring back the stipple, the dither, or a square corner.
- Set a typeface at a size it cannot carry. There is no automated check for
  this and there cannot be: three pixel metrics were written and measured
  against four faces, and the failing face scored higher on all three. Judging
  it is a human act, done by looking.
- Remap `--sl-color-white` to a surface. Starlight sets every heading's colour
  from it, and pointing it at the ground made all eleven documentation titles
  invisible. That defect passed both the two-value check and axe.
- Trust that a palette implies legible text. `pnpm test:a11y` compares every
  run of text against the first opaque background behind it, which is the check
  that would have caught it.
