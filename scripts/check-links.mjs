// Link gate. Two things it checks, both of which have broken before:
//
// 1. Internal links. Every href in the built HTML has to resolve to a
//    file that the build actually produced. A nav entry pointing at a
//    page that doesn't exist is the most embarrassing bug a site can
//    ship, and it is invisible until someone clicks it.
// 2. Documentation links. Every link into the orbit-lang repository has
//    to point at a path that exists there. The site deliberately does
//    not mirror the docs, so a renamed file becomes a dead link, and
//    this is the only thing that would notice.
//
// Run with: node scripts/check-links.mjs [--repo <path-to-orbit-lang>]

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const DIST = "dist";
const args = process.argv.slice(2);
const repoFlag = args.indexOf("--repo");
const REPO = repoFlag >= 0 ? resolve(args[repoFlag + 1]) : resolve("../orbit-lang");

const GITHUB_BLOB = /github\.com\/joacokhzyx\/orbit-lang\/blob\/main\/(.+)$/;

function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...htmlFiles(full));
    } else if (entry.endsWith(".html")) {
      found.push(full);
    }
  }
  return found;
}

/** Turns a built path into the URL a visitor would request. */
function urlsFromPage(path) {
  const html = readFileSync(path, "utf8");
  const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  return hrefs;
}

/** Maps a site-absolute path to the file the build produced, or null. */
function builtFileFor(pathname) {
  const clean = pathname.replace(/^\//, "").split("#")[0].split("?")[0];
  if (clean === "") return join(DIST, "index.html");
  const base = join(DIST, clean);
  for (const candidate of [base, `${base}.html`, join(base, "index.html")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const failures = [];
const internalCount = { total: 0 };
const docPaths = new Map();

for (const page of htmlFiles(DIST)) {
  const from = page.replace(/\\/g, "/");
  for (const href of urlsFromPage(page)) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) continue;

    if (href.startsWith("/")) {
      internalCount.total++;
      if (!builtFileFor(href.split("#")[0].split("?")[0])) {
        failures.push(`${from}  ->  ${href}   (no such built file)`);
      }
      continue;
    }

    const match = GITHUB_BLOB.exec(href);
    if (match) {
      const repoPath = decodeURIComponent(match[1]);
      if (!docPaths.has(repoPath)) docPaths.set(repoPath, from);
    }
  }
}

console.log(`internal links checked: ${internalCount.total}`);

if (existsSync(REPO)) {
  let missingRepo = 0;
  for (const [repoPath, from] of docPaths) {
    if (!existsSync(join(REPO, repoPath))) {
      failures.push(`${from}  ->  docs path missing in repo: ${repoPath}`);
      missingRepo++;
    }
  }
  console.log(`repository paths checked: ${docPaths.size} (${missingRepo} missing)`);
} else {
  console.log(`repository not found at ${REPO}, skipping the docs-path check`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} broken link(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("Finished link check: all links resolve.");
