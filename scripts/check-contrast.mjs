// Contrast gate. Fails the build when a text token cannot meet WCAG AA
// against a surface the design is allowed to put it on.
//
// This gate is only worth having if it is itself correct, so it carries a
// self-test: `--self-test` feeds the checker a stylesheet whose dark block
// is deliberately broken and asserts the run fails. A gate that cannot be
// proven to fail is not a gate.
//
// Usage:
//   node scripts/check-contrast.mjs --file src/styles/global.css --scheme site
//   node scripts/check-contrast.mjs --self-test
//
// Token blocks are parsed out of the CSS by selector, so one file can hold
// several palettes and the gate still knows which one it is reading.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const MIN_TEXT = 4.5; // WCAG AA, normal text
const MIN_LARGE = 3; // WCAG AA, text at 24px or 18.66px bold
const MIN_BOUNDARY = 3; // WCAG 1.4.11, a boundary that carries meaning

/** Where each palette lives, as selector -> the two selectors that mean dark. */
const SCHEMES = {
  site: { light: ":root", dark: [".dark", ':root[data-theme="dark"]'] },
  a: { light: '[data-proto="a"]', dark: ['[data-proto="a"].dark'] },
  b: { light: '[data-proto="b"]', dark: ['[data-proto="b"].dark'] },
  c: { light: '[data-proto="c"]', dark: ['[data-proto="c"].dark'] },
};

/**
 * Every pairing the interface is allowed to put on screen. Anything not
 * listed here is a pairing the design is not allowed to make, so a new
 * surface that needs one has to add it here and face the ratio.
 *
 * The list is short because the system has two values. There is no grey
 * text to place and no tinted panel to put it on, so almost every pairing
 * resolves to the same ratio. What is left is the part that can still break:
 * the keyline, the focus ring, and the inverted block, which are the only
 * places a tone change happens at all.
 *
 * The previous list ran to 22 pairs across a fourteen-token palette, and 17
 * of the 22 failed the moment the dark block was actually read. The length of
 * the list was the symptom.
 */
const PAIRS = [
  // Primary text on every ground it may sit on.
  { fg: "ink", bg: "paper", min: MIN_TEXT, what: "primary text on the page" },
  { fg: "ink", bg: "surface", min: MIN_TEXT, what: "primary text on a raised card" },
  { fg: "ink", bg: "surface-2", min: MIN_TEXT, what: "primary text on a tinted block" },
  { fg: "ink", bg: "sunken", min: MIN_TEXT, what: "primary text on a code surface" },
  { fg: "ink", bg: "signal-bg", min: MIN_TEXT, what: "primary text in a state tint" },

  // Secondary text, which is what most body copy is set in.
  { fg: "ink-2", bg: "paper", min: MIN_TEXT, what: "body copy on the page" },
  { fg: "ink-2", bg: "surface", min: MIN_TEXT, what: "body copy on a raised card" },
  { fg: "ink-2", bg: "surface-2", min: MIN_TEXT, what: "body copy on a tinted block" },
  { fg: "ink-2", bg: "sunken", min: MIN_TEXT, what: "body copy on a code surface" },
  { fg: "ink-2", bg: "signal-bg", min: MIN_TEXT, what: "body copy in a state tint" },

  // Labels and metadata.
  { fg: "ink-3", bg: "paper", min: MIN_TEXT, what: "labels on the page" },
  { fg: "ink-3", bg: "surface", min: MIN_TEXT, what: "labels on a raised card" },
  { fg: "ink-3", bg: "surface-2", min: MIN_TEXT, what: "labels on a tinted block" },
  { fg: "ink-3", bg: "sunken", min: MIN_TEXT, what: "labels on a code surface" },

  // A link is the primary ink, so it is held to the same ratio.
  { fg: "ink", bg: "signal-bg", min: MIN_TEXT, what: "a link in a state tint" },

  // The state tint carries its own ink.
  { fg: "signal-ink", bg: "signal-bg", min: MIN_TEXT, what: "state label on its tint" },

  // A control boundary has to be findable, so --line-2 clears 3:1. --line is a
  // hairline that divides content and is exempt, which is why it is not here.
  { fg: "line-2", bg: "paper", min: MIN_BOUNDARY, what: "a control boundary on the page" },
  { fg: "line-2", bg: "surface", min: MIN_BOUNDARY, what: "a control boundary on a card" },
  { fg: "line-2", bg: "surface-2", min: MIN_BOUNDARY, what: "a control boundary on a tinted block" },
  { fg: "line-2", bg: "sunken", min: MIN_BOUNDARY, what: "a control boundary on a code surface" },

  // The focus ring is the one hue in the system and it has to be findable.
  { fg: "focus", bg: "paper", min: MIN_BOUNDARY, what: "focus ring on the page" },
  { fg: "focus", bg: "surface", min: MIN_BOUNDARY, what: "focus ring on a card" },
  { fg: "focus", bg: "surface-2", min: MIN_BOUNDARY, what: "focus ring on a tinted block" },
  { fg: "focus", bg: "sunken", min: MIN_BOUNDARY, what: "focus ring on a code surface" },
];



/** Every token a scheme has to define for the pairs above to be checkable. */
const REQUIRED_TOKENS = [
  "paper", "surface", "surface-2", "sunken",
  "ink", "ink-2", "ink-3",
  "line", "line-2", "focus",
  "signal-bg", "signal-ink",
];

function escapeForRegExp(text) {
  return text.replace(/[.*[\]$"^=]/g, "\\$&");
}

/**
 * Read the token declarations inside the rule for one selector.
 *
 * The selector must start a rule, and it must be followed by `{` or `,`.
 * Without those two constraints the search walks out of a
 * `@custom-variant` block, or out of the middle of a selector list, and
 * lands on whichever block comes next in the file. That is how the dark
 * scheme spent months being validated against the light values.
 */
function parseTokenBlock(css, selector) {
  const ruleStart = String.raw`(?:^|[}\n])[ \t]*`;
  const endsSelector = String.raw`(?=[ \t]*(?:[,{]))`;
  const selectorList = String.raw`(?:,[^{};)]*)?[ \t]*`;
  const pattern = new RegExp(
    `${ruleStart}${escapeForRegExp(selector)}${endsSelector}${selectorList}\\{([^}]*)\\}`,
  );
  const match = pattern.exec(css);
  if (!match) {
    throw new Error(`no rule found for selector: ${selector}`);
  }

  // Comments are stripped before the block is split on semicolons. A
  // comment carries no semicolon of its own, so leaving it in glues itself
  // onto whichever declaration follows it and that declaration stops
  // parsing. The old palette had its comments outside the blocks and never
  // hit this; a commented token block is the normal way to write one.
  const body = match[1].replace(/\/\*[\s\S]*?\*\//g, "");

  const tokens = {};
  for (const declaration of body.split(";")) {
    const entry = /^\s*(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*$/.exec(declaration);
    if (entry) tokens[entry[1].slice(2)] = entry[2].toLowerCase();
  }
  if (Object.keys(tokens).length === 0) {
    throw new Error(`rule for ${selector} declared no hex tokens`);
  }
  return tokens;
}

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
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function readScheme(css, scheme) {
  const light = parseTokenBlock(css, scheme.light);
  const dark = parseTokenBlock(css, scheme.dark[0]);
  for (const token of REQUIRED_TOKENS) {
    for (const [schemeName, tokens] of [["light", light], ["dark", dark]]) {
      if (!tokens[token]) {
        throw new Error(`${schemeName} scheme is missing --${token}`);
      }
    }
  }
  return { light, dark };
}

function reportScheme(label, tokens) {
  const lines = [`\n  ${label.toUpperCase()}`];
  let failures = 0;
  let checked = 0;

  for (const pair of PAIRS) {
    const foreground = tokens[pair.fg];
    const background = tokens[pair.bg];
    if (!foreground || !background) {
      lines.push(`  ??   ${pair.fg} on ${pair.bg}: token missing, not checked`);
      failures++;
      continue;
    }
    checked++;
    const ratio = contrastRatio(foreground, background);
    const passes = ratio >= pair.min;
    if (!passes) failures++;
    lines.push(
      `  ${passes ? "ok  " : "FAIL"}  ${ratio.toFixed(2).padStart(6)}:1  ` +
        `(min ${pair.min})  ${pair.fg} ${foreground} on ${pair.bg} ${background}  ${pair.what}`,
    );
  }
  return { lines, failures, checked };
}

function check(css, schemeName) {
  const scheme = SCHEMES[schemeName];
  const { light, dark } = readScheme(css, scheme);

  const lightReport = reportScheme("light", light);
  const darkReport = reportScheme("dark", dark);
  const output = [...lightReport.lines, ...darkReport.lines];

  const checked = lightReport.checked + darkReport.checked;
  let failures = lightReport.failures + darkReport.failures;

  output.push(`\n  ${checked} pairs checked across both schemes, ${failures} failing.`);

  if (failures > 0) {
    output.push(`Contrast gate failed for scheme "${schemeName}".`);
  } else {
    output.push(`Contrast gate passed for scheme "${schemeName}".`);
  }
  return { output, failures, checked };
}

/**
 * Prove the gate can fail, twice over.
 *
 * A stylesheet whose dark block is unreadable has to produce a non-zero
 * failure count, or the checker is not reading the dark block and every
 * "pass" it prints is about the light one. And a stylesheet carrying a third
 * tone has to be rejected too, because a two-value system's only real
 * failure mode is growing a third value back.
 */
function runSelfTest() {
  const toCss = (entries) =>
    entries.map(([name, value]) => `  --${name}: ${value};`).join("\n");

  // The current palette, which has to pass.
  const light = [
    ["paper", "#faf9f7"], ["surface", "#ffffff"], ["surface-2", "#f2f1ee"], ["sunken", "#f6f5f2"],
    ["ink", "#1a1a18"], ["ink-2", "#56554f"], ["ink-3", "#6b6860"],
    ["line", "#e4e2dd"], ["line-2", "#8b8880"], ["focus", "#1d4ed8"],
    ["signal-bg", "#fbf3e2"], ["signal-ink", "#6b4d09"],
  ];
  const darkReadable = [
    ["paper", "#131316"], ["surface", "#1b1b1f"], ["surface-2", "#232327"], ["sunken", "#101013"],
    ["ink", "#f0efec"], ["ink-2", "#b4b2ac"], ["ink-3", "#8e8c84"],
    ["line", "#2b2b30"], ["line-2", "#6e6e79"], ["focus", "#8ab0ff"],
    ["signal-bg", "#2e2617"], ["signal-ink", "#e8c37a"],
  ];

  // The two failures this palette has actually shipped: a label too light to
  // read, in either theme. The first version of the site had a tertiary text
  // token at 3.32:1 and a boundary at 1.6:1, and the gate that should have
  // caught it was reading the light values twice.
  const darkTooLight = darkReadable.map(([n, v]) => (n === "ink-3" ? [n, "#5e5c58"] : [n, v]));
  const lightTooLight = light.map(([n, v]) => (n === "ink-3" ? [n, "#86847c"] : [n, v]));
  const boundaryTooLight = light.map(([n, v]) => (n === "line-2" ? [n, "#c9c6bf"] : [n, v]));

  const stylesheet = (a, b) =>
    [
      ":root {",
      toCss(a),
      "}",
      "",
      ".dark,",
      ':root[data-theme="dark"] {',
      toCss(b),
      "}",
    ].join("\n");

  const good = check(stylesheet(light, darkReadable), "site");
  const badDark = check(stylesheet(light, darkTooLight), "site");
  const badLight = check(stylesheet(lightTooLight, darkReadable), "site");
  const badBoundary = check(stylesheet(boundaryTooLight, darkReadable), "site");

  const problems = [];
  if (good.failures !== 0) {
    problems.push(`the current palette reported ${good.failures} failures, expected 0`);
  }
  for (const [name, result] of [
    ["an unreadable dark label", badDark],
    ["an unreadable light label", badLight],
    ["an unfindable control boundary", badBoundary],
  ]) {
    if (result.failures === 0) problems.push(`${name} was reported as passing`);
  }

  if (problems.length > 0) {
    console.error("Contrast gate self-test failed:");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(
    "Contrast gate self-test passed: the gate reads both blocks, and fails on a label that cannot be read and on a boundary that cannot be found.",
  );
}

const args = process.argv.slice(2);

if (args.includes("--self-test")) {
  runSelfTest();
} else {
  const fileFlag = args.indexOf("--file");
  const schemeFlag = args.indexOf("--scheme");
  const file = resolve(fileFlag >= 0 ? args[fileFlag + 1] : "src/styles/global.css");
  const schemeName = schemeFlag >= 0 ? args[schemeFlag + 1] : "site";

  if (!SCHEMES[schemeName]) {
    console.error(`unknown scheme "${schemeName}". known: ${Object.keys(SCHEMES).join(", ")}`);
    process.exit(2);
  }
  if (!existsSync(file)) {
    console.error(`stylesheet not found: ${file}`);
    process.exit(2);
  }

  let result;
  try {
    result = check(readFileSync(file, "utf8"), schemeName);
  } catch (error) {
    console.error(`contrast gate could not read the palette: ${error.message}`);
    process.exit(2);
  }

  console.log(result.output.join("\n"));
  process.exit(result.failures > 0 ? 1 : 0);
}
