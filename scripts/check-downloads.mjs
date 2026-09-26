// Download gate.
//
// A download button that 404s is worse than no button, and this site
// cannot find out about one by looking at itself: the URLs point at
// github.com. So the gate resolves the release the same way the build
// does, then actually asks GitHub whether each asset is there.
//
// It also holds the site to what it claims. If the marketing pages say the
// project ships Linux and Windows, and the newest release stops shipping
// one of them, the build fails instead of quietly offering a dead path.
//
// Usage:
//   node scripts/check-downloads.mjs [--offline]

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { LATEST, DOWNLOADS, RELEASES_RESOLVED } from "../src/lib/releases.mjs";

const DIST = "dist";
const offline = process.argv.includes("--offline");

/** What the site tells a reader it supports. Keep this and the copy in step. */
const PROMISED_PLATFORMS = ["Linux", "Windows"];

const failures = [];
const notes = [];

// 1. The newest release has to ship everything the site promises.
const shipped = DOWNLOADS.map((download) => download.platform);
for (const platform of PROMISED_PLATFORMS) {
  if (!shipped.includes(platform)) {
    failures.push(
      `${LATEST.tag} ships no ${platform} build, but the site offers ${PROMISED_PLATFORMS.join(" and ")}. ` +
        `Either publish one or change the promise.`,
    );
  }
}

// 2. Every rendered download link has to be a real, reachable asset.
function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

if (!existsSync(DIST)) {
  console.error(`no build output at ${DIST}. Run astro build first.`);
  process.exit(2);
}

const ASSET_URL = /https:\/\/github\.com\/joacokhzyx\/orbit-lang\/releases\/download\/[^"'\s)]+/g;
const rendered = new Map();
for (const page of htmlFiles(DIST)) {
  const html = readFileSync(page, "utf8");
  for (const match of html.matchAll(ASSET_URL)) {
    rendered.set(match[0], page);
  }
}

if (rendered.size === 0) {
  failures.push(
    "no page links a release asset. The download matrix is either missing or not rendered.",
  );
}

if (offline) {
  notes.push(
    "--offline was passed: the ${count} rendered download link(s) were not requested from GitHub.".replace(
      "${count}",
      String(rendered.size),
    ),
  );
} else {
  for (const [url, page] of rendered) {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!response.ok) {
      failures.push(`${page.replace(/\\/g, "/")}  ->  ${url}   (HTTP ${response.status})`);
    }
  }
}

// 3. A platform with no asset must not be rendered as a button.
for (const release of RELEASES_RESOLVED) {
  for (const platform of ["macOS", "arm64", "aarch64"]) {
    const mentioned = [...rendered.keys()].some((url) => new RegExp(platform, "i").test(url));
    if (mentioned && !release.downloads.some((d) => new RegExp(platform, "i").test(d.fileName))) {
      failures.push(`a link mentions ${platform} but ${release.tag} ships no ${platform} asset`);
    }
  }
}

console.log(`newest release: ${LATEST.tag}${LATEST.prerelease ? " (prerelease)" : ""}, published ${LATEST.date}`);
console.log(`platforms shipped: ${shipped.length ? shipped.join(", ") : "none"}`);
console.log(`rendered download links checked: ${rendered.size}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} download problem(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

for (const note of notes) console.warn(`\nnote: ${note}`);
console.log("Finished download check: every link resolves to a real asset.");
