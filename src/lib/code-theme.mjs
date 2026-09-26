// One owner for the syntax palette.
//
// The site and the documentation were each pointing Shiki at its own theme
// pair and each stylesheet was then forcing the result with `!important`,
// so the two halves could disagree about what a keyword looks like and
// neither could be changed without touching both. Both now import the
// themes from here.
//
// Two measured problems are fixed here, and neither was visible by looking
// at the source.
//
// 1. The pair is the high-contrast github themes, not the plain ones,
//    because this site paints code on a warm cream (#f1efe9) rather than
//    on white, which costs a few tenths of a ratio on every token. The
//    plain light theme ships two tokens under 4.5:1 there. The
//    high-contrast light theme still leaves its comment colour at 4.38:1,
//    so that one is darkened below. `pnpm check:code-contrast` measures the
//    result and fails the build if a future theme swap regresses it.
//
// 2. Expressive Code drops every token colour. Its theme normaliser,
//    ExpressiveCodeTheme.fromJSONString, reads a Shiki 4 theme object and
//    returns one whose `tokenColors` is `undefined`: all 45 entries
//    silently discarded, no error. Every token then fell back to
//    Expressive Code's "unknown token" grey, #BBBBBB, which is 1.9:1 on
//    the code surface, and every documentation code block rendered as one
//    flat run of unhighlighted text. The marketing pages were fine
//    because they go through plain Shiki, which does not normalise.
//
//    The normaliser is still the right thing to go through, because it
//    computes `fg`, `bg` and the style overrides the renderer needs, so
//    the token colours are re-attached to its output rather than skipped.

import { ExpressiveCodeTheme } from "@expressive-code/core";
import githubLightHighContrast from "@shikijs/themes/github-light-high-contrast";
import githubDarkHighContrast from "@shikijs/themes/github-dark-high-contrast";

/** The token colours that were under 4.5:1 on the site's code surface. */
const REPLACEMENTS = {
  // github-light-high-contrast's comment colour, measured at 4.38:1 on
  // #f1efe9. Darkened one step to 4.65:1.
  "#66707b": "#626c77",
};

function replaceColour(colour) {
  if (typeof colour !== "string") return colour;
  return REPLACEMENTS[colour.toLowerCase()] ?? colour;
}

/** Applies the replacements in both places a Shiki theme keeps colours. */
function remapThemeColours(theme) {
  return {
    ...theme,
    colors: Object.fromEntries(
      Object.entries(theme.colors).map(([slot, colour]) => [slot, replaceColour(colour)]),
    ),
    tokenColors: theme.tokenColors.map((entry) => ({
      ...entry,
      settings: Object.fromEntries(
        Object.entries(entry.settings).map(([key, value]) => [
          key,
          key === "foreground" ? replaceColour(value) : value,
        ]),
      ),
    })),
  };
}

/**
 * Normalise for Expressive Code without losing the token colours.
 *
 * The normaliser discards them, so they are put back afterwards. If a
 * future version of Expressive Code keeps them, the reassignment is a
 * no-op and this function can go back to being a bare call.
 */
function forExpressiveCode(theme) {
  const remapped = remapThemeColours(theme);
  const normalised = ExpressiveCodeTheme.fromJSONString(JSON.stringify(remapped));
  if (!normalised.tokenColors?.length) {
    normalised.tokenColors = remapped.tokenColors;
  }
  return normalised;
}

export const CODE_THEME_LIGHT = remapThemeColours(githubLightHighContrast);
export const CODE_THEME_DARK = remapThemeColours(githubDarkHighContrast);

/**
 * The pair as an array, which is the shape Expressive Code and Starlight
 * read. A `{ light, dark }` object is not the same thing: Starlight wraps
 * a non-array in a one-element list, warns that it has a single theme, and
 * Expressive Code then treats the pair as one theme object. Each theme
 * carries its own `type`, which is how the dark switch finds the second
 * one.
 */
export const CODE_THEMES = [forExpressiveCode(CODE_THEME_LIGHT), forExpressiveCode(CODE_THEME_DARK)];

/** The same pair keyed by role, for Astro's markdown highlighter. */
export const CODE_THEMES_BY_ROLE = { light: CODE_THEME_LIGHT, dark: CODE_THEME_DARK };
