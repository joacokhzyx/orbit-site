// Link gate.
//
// Five invariants, each of which has been violated at some point on this
// site and each of which is invisible in a browser until a reader clicks
// it:
//
//   1. Internal links resolve to a file the build actually produced.
//   2. Anchor fragments exist in the page they point at.
//   3. Internal links use the canonical trailing-slash form the sitemap
//      publishes, so one page has one address.
//   4. No page links into the repository for a document this site hosts.
//      Eight documents live under /docs and the marketing pages were
//      still sending readers to a raw markdown view on github.com.
//   5. Every link into the orbit-lang repository points at a path that
//      exists there.
//
// Invariant 5 is verified against a local checkout when there is one and
// over the network otherwise. The previous version printed "skipping the
// docs-path check" and exited 0 when no checkout was present, which meant
// the guarantee only held on the machine of whoever wrote it. That is now
// a failure unless --offline is passed, and --offline says so loudly.
//
// Usage:
//   node scripts/check-links.mjs [--repo <path>] [--offline]

import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const DIST = "dist";
const CACHE = ".cache/link-check.json";

const args = process.argv.slice(2);
const repoFlag = args.indexOf("--repo");
const offline = args.includes("--offline");
const REPO = repoFlag >= 0 ? resolve(args[repoFlag + 1]) : resolve("../orbit-lang");

const GITHUB_BLOB = /github\.com\/joacokhzyx\/orbit-lang\/blob\/main\/(.+)$/;

/** Documents the site hosts, so invariant 4 knows where they belong. */
const HOSTED_DOCS = {
  "README.md": "/docs",
  "GETTING_STARTED.md": "/docs/start/getting-started",
  "TOUR.md": "/docs/start/tour",
  "LANGUAGE_REFERENCE.md": "/docs/language/reference",
  "KYNX.md": "/docs/services/kynx",
  "COMMANDS.md": "/docs/reference/commands",
  "KNOWN_LIMITATIONS.md": "/docs/reference/limitations",
  "FAQ.md": "/docs/reference/faq",
};

const failures = [];
const notes = [];

function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

/** Every href and src in a built page, with the fragments left intact. */
function referencesIn(path) {
  const html = readFileSync(path, "utf8");
  return {
    html,
    refs: [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]),
    ids: new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])),
  };
}

/** The file the build produced for a site-absolute path, or null. */
function builtFileFor(pathname) {
  const clean = pathname.replace(/^\//, "").split("#")[0].split("?")[0];
  if (clean === "") return join(DIST, "index.html");
  const base = join(DIST, clean);
  for (const candidate of [base, `${base}.html`, join(base, "index.html")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/**
 * The address the sitemap publishes, which is the one links should use.
 * Only page routes have a canonical trailing slash: a stylesheet or an
 * image keeps the slash off, and appending one to /favicon.svg is not a
 * duplicate-content problem, it is a 404.
 */
function canonicalForm(pathname, target) {
  const clean = pathname.split("#")[0].split("?")[0];
  if (clean === "" || clean === "/") return "/";
  const isPage = target?.endsWith(".html") ?? false;
  if (!isPage) return clean;
  return clean.endsWith("/") ? clean : `${clean}/`;
}

const pages = htmlFiles(DIST);
const idCache = new Map();
function idsFor(builtPath) {
  if (!idCache.has(builtPath)) idCache.set(builtPath, referencesIn(builtPath).ids);
  return idCache.get(builtPath);
}

let internalCount = 0;
const repoPaths = new Map();

for (const page of pages) {
  const from = page.replace(/\\/g, "/");
  const { refs } = referencesIn(page);

  for (const href of refs) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) continue;

    // Invariant 4: a hosted document must be linked as a route, not as a
    // repository file. Checked before the internal branch because these
    // hrefs are absolute URLs.
    const blob = GITHUB_BLOB.exec(href);
    if (blob) {
      const repoPath = decodeURIComponent(blob[1]);
      if (!repoPaths.has(repoPath)) repoPaths.set(repoPath, from);
      const hosted = HOSTED_DOCS[repoPath];
      if (hosted) {
        failures.push(
          `${from}  ->  ${href}\n      the site hosts this document at ${hosted}, so link there instead`,
        );
      }
    }

    if (!href.startsWith("/")) continue;
    internalCount++;

    const [pathname, fragment] = href.split("#");

    if (!builtFileFor(pathname)) {
      failures.push(`${from}  ->  ${href}   (no such built file)`);
      continue;
    }
    const target = builtFileFor(pathname);

    // Invariant 3
    if (canonicalForm(pathname, target) !== pathname) {
      failures.push(
        `${from}  ->  ${href}   (the canonical address is ${canonicalForm(pathname, target)})`,
      );
    }

    // Invariant 2
    if (fragment && target && !idsFor(target).has(fragment)) {
      failures.push(`${from}  ->  ${href}   (no element with id="${fragment}" in the target)`);
    }
  }
}

console.log(`pages walked: ${pages.length}`);
console.log(`internal links checked: ${internalCount}`);

// Invariant 5
async function repoPathExists(repoPath) {
  if (existsSync(REPO)) return { ok: existsSync(join(REPO, repoPath)), via: "checkout" };
  if (offline) return { ok: null, via: "offline" };

  const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
  const key = repoPath;
  if (key in cache) return { ok: cache[key], via: "cache" };

  const url = `https://github.com/joacokhzyx/orbit-lang/blob/main/${repoPath}`;
  const response = await fetch(url, { method: "HEAD", redirect: "follow" });
  const ok = response.ok;
  cache[key] = ok;
  mkdirSync(dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  return { ok, via: "network" };
}

const byVia = {};
for (const [repoPath, from] of repoPaths) {
  const { ok, via } = await repoPathExists(repoPath);
  byVia[via] = (byVia[via] ?? 0) + 1;
  if (ok === false) {
    failures.push(`${from}  ->  docs path missing in repo: ${repoPath}`);
  }
}
console.log(
  `repository paths checked: ${repoPaths.size} (${Object.entries(byVia)
    .map(([via, count]) => `${count} via ${via}`)
    .join(", ")})`,
);

if (offline) {
  notes.push(
    "--offline was passed: repository paths that needed the network were not verified. " +
      "The docs-path guarantee did not run.",
  );
}

if (failures.length > 0) {
  console.error(`\n${failures.length} broken link(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

for (const note of notes) console.warn(`\nnote: ${note}`);
console.log("\nFinished link check: all links resolve.");
