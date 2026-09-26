// Repairs the Expressive Code stylesheet reference after the build.
//
// astro-expressive-code 0.44.2 emits its stylesheet as an asset through
// `this.emitFile({ fileName: "ec.<hash>.css" })` and links that same route
// from a rehype plugin. Astro 7 re-hashes emitted assets by content, so the
// file lands on disk under a different name than the one the plugin linked.
// The result is that every documentation page with a code block asks for a
// stylesheet that was never written, while the file that was written is
// referenced by nothing. Those code blocks then render with no surface, no
// padding and no radius.
//
// There is no fixed release to upgrade to: 0.44.2 is the latest and it
// declares Astro 7 support. So the build repairs the reference itself, and
// scripts/check-links.mjs then fails the build if any page is still asking
// for a file that is not there. That gate is what makes this safe to keep:
// the workaround cannot silently stop working.

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const ASSETS = join(DIST, "_astro");

if (!existsSync(ASSETS)) {
  console.error(`no build output at ${ASSETS}. Run astro build first.`);
  process.exit(2);
}

const emittedStylesheets = readdirSync(ASSETS).filter(
  (name) => name.startsWith("ec.") && name.endsWith(".css"),
);

if (emittedStylesheets.length === 0) {
  console.log("no Expressive Code stylesheet was emitted, nothing to repair");
  process.exit(0);
}
if (emittedStylesheets.length > 1) {
  console.error(
    `expected one Expressive Code stylesheet, found ${emittedStylesheets.length}: ${emittedStylesheets.join(", ")}`,
  );
  process.exit(1);
}

const correctName = emittedStylesheets[0];

/** Every built page, skipping the asset folder. */
function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "_astro") continue;
    if (statSync(full).isDirectory()) found.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

const STALE = /\/_astro\/ec\.[A-Za-z0-9_-]+\.css/g;

let repairedPages = 0;
let rewrites = 0;

for (const page of htmlFiles(DIST)) {
  const html = readFileSync(page, "utf8");
  const fixed = html.replace(STALE, `/_astro/${correctName}`);
  if (fixed === html) continue;
  writeFileSync(page, fixed);
  repairedPages++;
  rewrites += html.match(STALE)?.length ?? 0;
}

if (rewrites === 0) {
  console.log(`Expressive Code stylesheet reference already correct: ${correctName}`);
} else {
  console.log(
    `repaired ${rewrites} reference(s) across ${repairedPages} page(s) -> _astro/${correctName}`,
  );
}
