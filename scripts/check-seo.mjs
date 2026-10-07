// SEO and metadata gate.
//
// Everything here was missing or wrong on this site at some point, and
// none of it is visible by looking at a page:
//
//   1. Every page that should be indexed is in the sitemap, and no page
//      that shouldn't be. The sitemap used to carry four of fifteen URLs
//      because the integration filtered /docs on the belief that a second
//      sitemap existed for it. It did not.
//   2. Every page has a title, a description, a canonical, and an Open
//      Graph image. The eleven documentation pages shipped with no
//      og:image at all, so any share of a docs link rendered bare.
//   3. The 404 page is noindex and does not claim a canonical address.
//   4. Titles and descriptions are distinct across pages. Three brand
//      sentences had drifted into three components.
//   5. No page names a version the repository has never published.
//   6. Numeric claims in the copy match the documents they describe.
//
// Usage:
//   node scripts/check-seo.mjs

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { LATEST, RELEASES_RESOLVED } from "../src/lib/releases.mjs";

const DIST = "dist";
const failures = [];

if (!existsSync(DIST)) {
  console.error(`no build output at ${DIST}. Run astro build first.`);
  process.exit(2);
}

function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

const pages = htmlFiles(DIST).map((file) => ({
  file,
  route: `/${file.slice(DIST.length + 1).replace(/index\.html$/, "").replace(/\.html$/, ".html")}`,
  html: readFileSync(file, "utf8"),
}));

function meta(html, property) {
  return new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]*content="([^"]*)"`).exec(html);
}
function linkRel(html, rel) {
  return new RegExp(`<link[^>]+rel="${rel}"[^>]*href="([^"]*)"`).exec(html);
}
function title(html) {
  return /<title>([^<]*)<\/title>/.exec(html)?.[1];
}

// 1. Sitemap coverage
const sitemap = readFileSync(join(DIST, "sitemap-0.xml"), "utf8");
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));

/*
 * Which host is canonical, asserted rather than assumed.
 *
 * Production serves www.orbit-lang.dev. Astro derives every canonical link,
 * every og:url and the whole sitemap from one value — `site:` in
 * astro.config.mjs — and src/data/site.ts carries a second copy used as the
 * fallback for the two components that build an absolute URL outside a page
 * context. Two copies of the address is exactly the arrangement this file
 * exists to catch drift in, so this compares them and pins the host.
 *
 * Without it, changing one and not the other produces a build where every
 * page's canonical disagrees with the sitemap and the gate above reports it
 * as a coverage failure — which points at the sitemap, which is not where the
 * mistake was made. Failing here names the actual cause.
 *
 * The apex form is checked too, and rejected, because a canonical on the
 * apex is not a stylistic difference: vercel.json redirects it, and a host
 * that redirects is not the address that should be in the markup.
 */
const CANONICAL_HOST = "www.orbit-lang.dev";

for (const url of listed) {
  let host;
  try {
    host = new URL(url).host;
  } catch {
    failures.push(`sitemap entry is not a URL: ${url}`);
    continue;
  }
  if (host !== CANONICAL_HOST) {
    failures.push(
      `sitemap lists ${url}, whose host is ${host}. Production serves ${CANONICAL_HOST}; ` +
        `astro.config.mjs \`site:\` is what writes every canonical and this sitemap`,
    );
  }
}

for (const page of pages) {
  const canonical = linkRel(page.html, "canonical")?.[1];
  if (!canonical) continue;
  let host;
  try {
    host = new URL(canonical).host;
  } catch {
    failures.push(`${page.route}  ->  canonical is not an absolute URL: ${canonical}`);
    continue;
  }
  if (host !== CANONICAL_HOST) {
    failures.push(
      `${page.route}  ->  ${canonical}   (canonical host is ${host}, not ${CANONICAL_HOST})`,
    );
  }
}

for (const page of pages) {
  const isError = page.route === "/404.html";
  const canonical = linkRel(page.html, "canonical")?.[1];
  if (!canonical) continue;
  const shouldBeIndexed = !isError && !/noindex/.test(page.html);

  if (shouldBeIndexed && !listed.has(canonical)) {
    failures.push(`${page.route}  ->  ${canonical}   (indexable but absent from sitemap-0.xml)`);
  }
  if (!shouldBeIndexed && listed.has(canonical)) {
    failures.push(`${page.route}  ->  ${canonical}   (noindex but present in sitemap-0.xml)`);
  }
}

// 2. Per-page metadata
const titles = new Map();
const descriptions = new Map();

for (const page of pages) {
  if (page.route === "/404.html") {
    if (!/noindex/.test(page.html)) {
      failures.push("404 page is not noindex, so it can be indexed as a real document");
    }
    if (linkRel(page.html, "canonical")?.[1]?.endsWith("/404/")) {
      failures.push("404 page declares a self-referencing canonical, which asks to be indexed");
    }
    continue;
  }

  for (const [label, value] of [
    ["title", title(page.html)],
    ["description", meta(page.html, "description")?.[1]],
    ["canonical", linkRel(page.html, "canonical")?.[1]],
    ["og:image", meta(page.html, "og:image")?.[1]],
    ["og:title", meta(page.html, "og:title")?.[1]],
  ]) {
    if (!value) failures.push(`${page.route}  ->  no ${label}`);
  }

  const pageTitle = title(page.html);
  if (pageTitle) {
    if (pageTitle.length > 60) {
      failures.push(`${page.route}  ->  title is ${pageTitle.length} characters, over 60`);
    }
    if (titles.has(pageTitle)) {
      failures.push(`${page.route}  ->  title duplicates ${titles.get(pageTitle)}: "${pageTitle}"`);
    }
    titles.set(pageTitle, page.route);
  }

  const description = meta(page.html, "description")?.[1];
  if (description) {
    if (description.length < 50) {
      failures.push(`${page.route}  ->  description is ${description.length} characters, under 50`);
    }
    if (description.length > 165) {
      failures.push(`${page.route}  ->  description is ${description.length} characters, over 165`);
    }
    if (descriptions.has(description)) {
      failures.push(
        `${page.route}  ->  description duplicates ${descriptions.get(description)}`,
      );
    }
    descriptions.set(description, page.route);
  }
}

// 3. og:image:alt must describe the page it is on.
//    It used to be the homepage headline on every marketing page, so
//    /learn, /foundation and /changelog all shipped a social image
//    labelled "Orbit \\ Do more with less." The alt should be the page's
//    own social title, which is what a reader sees in the card.
for (const page of pages) {
  const alt = meta(page.html, "og:image:alt")?.[1];
  const ogTitle = meta(page.html, "og:title")?.[1];
  if (alt && ogTitle && alt !== ogTitle) {
    failures.push(
      `${page.route}  ->  og:image:alt is "${alt}" but og:title is "${ogTitle}"`,
    );
  }
}
// 5. Version drift: no page may name a version the repository never published.
const knownVersions = new Set([
  ...RELEASES_RESOLVED.map((release) => release.version),
  // The compiler reports an internal version that is not a release tag, and
  // the commands reference documents it as such.
  "0.1.0",
]);
for (const page of pages) {
  for (const match of page.html.matchAll(/\b0\.1\.0-(?:rc|pre)\.\d+\b|\b0\.1\.0\b/g)) {
    if (!knownVersions.has(match[0])) {
      failures.push(
        `${page.route}  ->  names version ${match[0]}, which the repository has never published`,
      );
    }
  }
}

// 6. Numeric claims in the copy must match the content they describe.
//    The pages said "twelve known limits" when the page listed eight, and
//    "twenty questions" when it listed eleven. Both were unverifiable
//    claims about documents this site hosts, which is the one thing this
//    site does not get to be wrong about.
const claimChecks = [
  {
    file: "src/content/docs/reference/limitations.md",
    count: (text) => (text.match(/^## /gm) ?? []).length,
    pattern: /(\w+) known limits/gi,
    noun: "limits",
  },
  {
    file: "src/content/docs/reference/faq.md",
    count: (text) => (text.match(/^## /gm) ?? []).length,
    pattern: /(\w+) questions answered/gi,
    noun: "questions",
  },
];

const WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

for (const check of claimChecks) {
  if (!existsSync(check.file)) continue;
  const actual = check.count(readFileSync(check.file, "utf8"));
  for (const page of pages) {
    for (const match of page.html.matchAll(check.pattern)) {
      const claimed = WORDS[match[1].toLowerCase()] ?? Number(match[1]);
      if (Number.isFinite(claimed) && claimed !== actual) {
        failures.push(
          `${page.route}  ->  claims "${match[0]}" but ${check.file} has ${actual}`,
        );
      }
    }
  }
}

console.log(`pages checked: ${pages.length}`);
console.log(`sitemap URLs: ${listed.size}`);
console.log(`newest release: ${LATEST.version}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} SEO problem(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("Finished SEO check: titles, descriptions, canonicals, social images and the sitemap agree.");
