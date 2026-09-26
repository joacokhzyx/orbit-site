// Syntax-colour gate.
//
// The palette in src/lib/code-theme.mjs is chosen by measurement, not by
// taste, so it is measured here. Every token Shiki emits has to clear WCAG AA
// against the surface it is actually painted on, which is the site's warm
// sunken tone rather than the white the stock themes assume.
//
// Which token that is, is not decided here. Both stylesheets are read, the
// ones that paint a code surface are found, and whatever token name they name
// is resolved out of src/styles/global.css. If the two halves of the site
// disagree about which token paints code -- or name a token that is not
// defined -- the gate stops, because a measurement taken against the wrong
// surface is worse than no measurement: it would report the syntax palette as
// passing while the code sat on something else entirely.
//
// A theme swap that reads well in a Shiki playground can still fail here,
// because the playground paints white. This is the only check that knows
// the difference.
//
// Usage:
//   node scripts/check-code-contrast.mjs

import { codeToHtml } from "shiki";
import { orbitLanguage } from "../src/lib/orbit-grammar.mjs";
import { CODE_THEMES_BY_ROLE } from "../src/lib/code-theme.mjs";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIN_TEXT = 4.5;
const SITE_CSS = "src/styles/global.css";
const STARLIGHT_CSS = "src/styles/starlight.css";

/** Every token class the Orbit grammar can produce, so nothing escapes. */
const SAMPLE = `// a leading comment
import { serve } from "kynx"

type Route = {
  path: string
  method: string
}

route GET "/health" {
  val uptime = system.uptime()
  val total = system.http_requests_total()
  if uptime > 10 {
    return ok 200 "{\\"up\\":" + uptime + "}"
  }
  return err 503 "still starting"
}
`;

function toLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex.slice(0, 7);
  return (
    0.2126 * toLinear(parseInt(full.slice(1, 3), 16)) +
    0.7152 * toLinear(parseInt(full.slice(3, 5), 16)) +
    0.0722 * toLinear(parseInt(full.slice(5, 7), 16))
  );
}

function contrastRatio(foreground, background) {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Every `{ ... }` block in a stylesheet, paired with the text in front of it.
 *
 * The selector is whatever precedes the brace, which for a block inside
 * `@media` or `@layer` includes the at-rule. That is harmless here: nothing
 * in either file puts a code surface behind a conditional, and reading a
 * little more than strictly necessary is better than the brace-counting that
 * a stricter parser would need to get right.
 */
/**
 * Every rule block in a stylesheet, as selector plus body.
 *
 * Comments and at-rule preludes are removed first, and that is not tidiness.
 * The old version read a block as "everything up to the next `{`" and "up to
 * the next `}`", so the `:root` block's selector came back as the whole
 * preamble: the @import lines, the @custom-variant declaration, and two long
 * comments. One of those comments contains the text `.dark,` and
 * `:root[data-theme="dark"]` while explaining the dark markers, so the light
 * block was classified as a dark block and skipped entirely. The gate then
 * reported that the code surface was painted on a token it could not find,
 * because the light half of the palette was never loaded.
 */
function blocks(css) {
  const source = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@(?:import|theme|custom-variant|apply|tailwind)\b[^;{]*(?:;|\([^)]*\)\s*;?)/g, "");

  const found = [];
  const opener = /([^{}]+)\{/g;
  let match;
  while ((match = opener.exec(source))) {
    const open = match.index + match[0].length - 1;
    const close = source.indexOf("}", open);
    if (close === -1) break;
    found.push({ selector: match[1].trim(), body: source.slice(open + 1, close) });
    opener.lastIndex = close + 1;
  }
  return found;
}

/**
 * The custom properties that resolve to a literal colour, per scheme.
 *
 * Only literal hexes are kept. `var()` values and Tailwind's `--color-*`
 * aliases are references, not values, and a reference that resolves to
 * nothing is the failure this gate has to be able to see, so it is left out
 * rather than flattened.
 */
function declaredColours(css, scheme) {
  const map = new Map();
  for (const { selector, body } of blocks(css)) {
    // A block applies in dark when it is keyed on either dark marker, and in
    // light when it is keyed on :root alone. Later declarations win, which is
    // the same order the cascade uses.
    const darkBlock = /(^|[\s,])(\.dark\b|:root\s*\[\s*data-theme\s*=\s*["']?dark)/.test(selector);
    const rootBlock = /:root\b/.test(selector);
    if (scheme === "dark" ? !darkBlock : darkBlock || !rootBlock) continue;
    for (const [, name, value] of body.matchAll(
      /(--[A-Za-z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g,
    )) {
      map.set(name, value.toLowerCase());
    }
  }
  return map;
}

/**
 * The token names the site actually paints a code surface with.
 *
 * Two places paint one, and both are read: the marketing pages' own
 * `.code-surface`, and the documentation's `--ec-codeBg`, which is the one
 * Expressive Code reads. A name that appears in neither is not a surface, and
 * a token that exists but is not painted on is not measured either.
 */
function codeSurfaceTokens(siteCss, starlightCss) {
  const names = new Set();
  for (const { selector, body } of blocks(siteCss)) {
    if (!/^\.code-surface\b/.test(selector)) continue;
    for (const [, token] of body.matchAll(/background-color\s*:\s*var\((--[A-Za-z0-9_-]+)\)/g)) {
      names.add(token);
    }
  }
  for (const [, token] of starlightCss.matchAll(/--ec-codeBg\s*:\s*var\((--[A-Za-z0-9_-]+)\)/g)) {
    names.add(token);
  }
  return [...names];
}

const siteCss = readFileSync(resolve(SITE_CSS), "utf8");
const starlightCss = existsSync(resolve(STARLIGHT_CSS))
  ? readFileSync(resolve(STARLIGHT_CSS), "utf8")
  : "";

const declared = {
  light: declaredColours(siteCss, "light"),
  dark: declaredColours(siteCss, "dark"),
};

const surfaceTokens = codeSurfaceTokens(siteCss, starlightCss);
if (surfaceTokens.length === 0) {
  console.error(
    `could not find a code surface in ${SITE_CSS} or ${STARLIGHT_CSS}. ` +
      "The syntax palette has to be measured against something, and refusing to " +
      "guess is the point of this gate.",
  );
  process.exit(1);
}

/** Every code surface, per scheme, resolved to a hex. */
const surfaces = {};
for (const scheme of ["light", "dark"]) {
  surfaces[scheme] = surfaceTokens.map((token) => {
    const value = declared[scheme].get(token);
    if (!value) {
      console.error(
        `${token} paints the ${scheme} code surface but is not defined as a colour ` +
          `in ${SITE_CSS}. The code is painted on whatever is behind it instead, ` +
          "which is not a surface anyone measured against.",
      );
      process.exit(1);
    }
    return { token, value };
  });
}

const html = await codeToHtml(SAMPLE, {
  lang: orbitLanguage,
  themes: CODE_THEMES_BY_ROLE,
  defaultColor: false,
});

/** Shiki writes the light token as --shiki-light and the dark as --shiki-dark. */
function collect(variableName) {
  const found = new Map();
  for (const match of html.matchAll(new RegExp(`${variableName}:(#[0-9a-fA-F]{3,8})`, "g"))) {
    const colour = match[1].toLowerCase();
    found.set(colour, (found.get(colour) ?? 0) + 1);
  }
  return found;
}

let failures = 0;
let checked = 0;
let worst = { light: Infinity, dark: Infinity };

for (const [scheme, variableName] of [
  ["light", "--shiki-light"],
  ["dark", "--shiki-dark"],
]) {
  const schemeSurfaces = surfaces[scheme];
  const tokens = collect(variableName);
  const where = schemeSurfaces.map((s) => `${s.token} ${s.value}`).join(", ");
  console.log(`\n  ${scheme.toUpperCase()}  on ${where}`);

  if (tokens.size === 0) {
    console.log(`  ??   no ${variableName} tokens found, nothing checked`);
    failures++;
    continue;
  }

  // Sorted by the hardest surface each token has to survive, so the top of
  // the list is the worst case on the site rather than on one of its
  // surfaces.
  const rows = [...tokens]
    .map(([colour, uses]) => {
      const perSurface = schemeSurfaces.map((surface) => ({
        surface,
        ratio: contrastRatio(colour, surface.value),
      }));
      return { colour, uses, worst: Math.min(...perSurface.map((r) => r.ratio)), perSurface };
    })
    .sort((a, b) => a.worst - b.worst);

  for (const row of rows) {
    checked++;
    const passes = row.worst >= MIN_TEXT;
    if (!passes) failures++;
    if (row.worst < worst[scheme]) worst[scheme] = row.worst;
    const detail = row.perSurface
      .map(({ surface, ratio }) => `${ratio.toFixed(2)} on ${surface.token}`)
      .join(", ");
    console.log(
      `  ${passes ? "ok  " : "FAIL"}  ${row.worst.toFixed(2).padStart(6)}:1  (min ${MIN_TEXT})  ` +
        `${row.colour}  used ${row.uses}x  [${detail}]`,
    );
  }
}

console.log(
  `\n  ${checked} syntax colours checked against ` +
    `${surfaceTokens.length} code surface(s), ${failures} failing.`,
);
console.log(
  `  worst case: light ${worst.light.toFixed(2)}:1, dark ${worst.dark.toFixed(2)}:1.`,
);
if (failures > 0) {
  console.error("\nSyntax colour gate failed.");
  process.exit(1);
}
console.log("Syntax colour gate passed.");
