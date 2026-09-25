// Contrast gate. Fails the build when a text token cannot meet WCAG AA
// against the surface it is allowed to sit on.
//
// The previous palette shipped 7 failing pairs, including the most-used
// tertiary text at 3.54:1. Nothing caught it because nothing measured
// it. This file is the thing that would have.
//
// Usage:
//   node scripts/check-contrast.mjs                       # the site's own tokens
//   node scripts/check-contrast.mjs --file <path> --scheme a
//
// Token blocks are parsed out of the CSS by selector, so the same file
// can hold the three prototype palettes and the gate still knows which
// one it is reading.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const MIN_TEXT = 4.5; // WCAG AA, normal text
const MIN_LARGE = 3; // WCAG AA, text at 24px or 18.66px bold
const MIN_BOUNDARY = 3; // WCAG 1.4.11, a boundary that carries meaning

/** Where each palette lives, as selector -> "is this the dark scheme". */
const SCHEMES = {
  site: { light: ":root", dark: ".dark" },
  a: { light: '[data-proto="a"]', dark: '[data-proto="a"].dark' },
  b: { light: '[data-proto="b"]', dark: '[data-proto="b"].dark' },
  c: { light: '[data-proto="c"]', dark: '[data-proto="c"].dark' },
};

/**
 * Every pair the interface is allowed to put on screen. Anything not
 * listed here is not a pairing the design is allowed to make.
 */
const PAIRS = [
  { fg: "ink", bg: "paper", min: MIN_TEXT, what: "primary text on the page" },
  { fg: "ink", bg: "surface", min: MIN_TEXT, what: "primary text on a raised block" },
  { fg: "ink", bg: "sunken", min: MIN_TEXT, what: "primary text on a sunken block" },
  { fg: "ink-2", bg: "paper", min: MIN_TEXT, what: "secondary text on the page" },
  { fg: "ink-2", bg: "surface", min: MIN_TEXT, what: "secondary text on a raised block" },
  { fg: "ink-3", bg: "paper", min: MIN_TEXT, what: "labels and metadata on the page" },
  { fg: "ink-3", bg: "surface", min: MIN_TEXT, what: "labels and metadata on a raised block" },
  { fg: "ink-3", bg: "sunken", min: MIN_TEXT, what: "labels and metadata on a sunken block" },
  { fg: "link", bg: "paper", min: MIN_TEXT, what: "a link on the page" },
  { fg: "link", bg: "surface", min: MIN_TEXT, what: "a link on a raised block" },
  { fg: "link", bg: "sunken", min: MIN_TEXT, what: "a link on a sunken block" },
  { fg: "link", bg: "surface-2", min: MIN_TEXT, what: "a link on a hover block" },
  { fg: "focus", bg: "paper", min: MIN_BOUNDARY, what: "focus ring against the page" },
  { fg: "focus", bg: "surface", min: MIN_BOUNDARY, what: "focus ring on a raised block" },
  { fg: "focus", bg: "sunken", min: MIN_BOUNDARY, what: "focus ring on a sunken block" },
  { fg: "paper", bg: "ink", min: MIN_TEXT, what: "the primary button" },
  { fg: "paper", bg: "focus", min: MIN_TEXT, what: "a button filled with the accent" },
  { fg: "ink", bg: "surface-2", min: MIN_TEXT, what: "primary text on a hover block" },
  { fg: "line-2", bg: "paper", min: MIN_BOUNDARY, what: "a boundary that carries meaning" },
  { fg: "signal-ink", bg: "signal-bg", min: MIN_TEXT, what: "state label on its own tint" },
  { fg: "ink-2", bg: "signal-bg", min: MIN_TEXT, what: "state body on its own tint" },
  { fg: "ink", bg: "code-bg", min: MIN_TEXT, what: "code text on the code surface" },
];

/** Tokens whose whole job is to be quiet. Not held to a ratio. */
const DECORATIVE = new Set(["line"]);

function parseBlocks(css, selectors) {
  const out = {};
  for (const selector of selectors) {
    const escaped = selector.replace(/[.*[\]$"^=]/g, "\\$&");
    const match = new RegExp(`${escaped}\\s*(?:,[^{]*)?\\{([^}]*)\\}`).exec(css);
    if (!match) {
      throw new Error(`selector not found in the stylesheet: ${selector}`);
    }
    const tokens = {};
    for (const line of match[1].split(";")) {
      const entry = /^\s*(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*$/.exec(line);
      if (entry) tokens[entry[1].slice(2)] = entry[2];
    }
    out[selector] = tokens;
  }
  return out;
}

function toLinear(channel) {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex.slice(0, 7);
  const r = parseInt(full.slice(1, 3), 16);
  const g = parseInt(full.slice(3, 5), 16);
  const b = parseInt(full.slice(5, 7), 16);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrast(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const args = process.argv.slice(2);
const fileFlag = args.indexOf("--file");
const schemeFlag = args.indexOf("--scheme");
const file = resolve(fileFlag >= 0 ? args[fileFlag + 1] : "src/design/tokens.css");
const schemeName = schemeFlag >= 0 ? args[schemeFlag + 1] : "site";

if (!SCHEMES[schemeName]) {
  console.error(`unknown scheme "${schemeName}". known: ${Object.keys(SCHEMES).join(", ")}`);
  process.exit(2);
}
if (!existsSync(file)) {
  console.error(`stylesheet not found: ${file}`);
  process.exit(2);
}

const scheme = SCHEMES[schemeName];
const css = readFileSync(file, "utf8");
const blocks = parseBlocks(css, Object.values(scheme));

let failures = 0;
let checked = 0;

for (const [label, selector] of [
  ["light", scheme.light],
  ["dark", scheme.dark],
]) {
  const tokens = blocks[selector];
  console.log(`\n  ${label.toUpperCase()}  (${selector})`);

  for (const pair of PAIRS) {
    const fg = tokens[pair.fg];
    const bg = tokens[pair.bg];
    if (!fg || !bg) {
      if (DECORATIVE.has(pair.fg)) continue;
      console.log(`  ??   ${pair.fg} on ${pair.bg}: token missing, not checked`);
      failures++;
      continue;
    }
    checked++;
    const ratio = contrast(fg, bg);
    const ok = ratio >= pair.min;
    if (!ok) failures++;
    console.log(
      `  ${ok ? "ok  " : "FAIL"}  ${ratio.toFixed(2).padStart(6)}:1  ` +
        `(min ${pair.min})  ${pair.fg} ${fg} on ${pair.bg} ${bg}  ${pair.what}`,
    );
  }
}

console.log(`\n  ${checked} pairs checked, ${failures} failing.`);
if (failures > 0) {
  console.error(`\nContrast gate failed for scheme "${schemeName}".`);
  process.exit(1);
}
console.log(`Contrast gate passed for scheme "${schemeName}".`);
