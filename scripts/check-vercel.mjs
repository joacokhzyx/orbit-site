#!/usr/bin/env node
// node scripts/check-vercel.mjs
//
// vercel.json against the schema Vercel actually validates it with.
//
// Why this exists: the last deployment of this site failed on Vercel while
// every gate in this repository passed. A redirect object carried a `$schema`
// key, and the redirect item in https://openapi.vercel.sh/vercel.json is
// `"additionalProperties": false` — so one stray key made the whole config
// invalid and Vercel rejected the deployment before running a single build
// step. Nothing here could see it: `astro build` does not read vercel.json,
// the contrast gate does not read it, and the accessibility tests run
// against a local `dist` that had already been built successfully.
//
// That is the shape of failure this repository's other gates exist to
// prevent, and it was the one gap left. The config is only ~40 lines and it
// is the one file that decides whether any of this ships.
//
// The schema is fetched rather than vendored so it cannot drift out of date
// against Vercel, and the whole check is skipped with a warning when the
// network is unavailable — a gate that cannot run offline must not become a
// gate that blocks an offline build. What it always checks, network or not,
// is the two invariants below, which are the ones that actually bit.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SCHEMA_URL = "https://openapi.vercel.sh/vercel.json";
const CONFIG = "vercel.json";

/**
 * The invariants that are cheap, offline, and load-bearing.
 *
 * `engines.node` is here because astro 7 declares `node: ">=22.12.0"` and
 * the Vercel preset's default has moved between 18, 20 and 22 over the last
 * few years. Relying on the preset default means the build breaks on a
 * platform-side change that nothing in this repository can see.
 *
 * The canonical host is checked against the one `src/data/site.ts` and
 * `astro.config.mjs` both use, so the redirect and the markup cannot end up
 * redirecting to a host the site does not call itself.
 */
const errors = [];

const raw = readFileSync(resolve(process.cwd(), CONFIG), "utf8");
const config = JSON.parse(raw);

const nodeMajor = Number.parseInt(String(config.engines?.node ?? "").replace(/\D/g, ""), 10);
if (!nodeMajor) {
  errors.push(
    `${CONFIG}: engines.node is not declared. astro 7 requires node >=22.12.0, and the ` +
      `Vercel preset's default has changed across major versions. Pin it rather than ` +
      `inheriting it.`,
  );
} else if (nodeMajor < 22) {
  errors.push(
    `${CONFIG}: engines.node is ${config.engines.node}; astro 7 requires >=22.12.0.`,
  );
}

const canonical = "www.orbit-lang.dev";
const apex = "orbit-lang.dev";

for (const [index, redirect] of (config.redirects ?? []).entries()) {
  if (redirect.destination?.includes(`://${canonical}`)) continue;
  errors.push(
    `${CONFIG}: redirects[${index}] sends to ${redirect.destination}, which is not the ` +
      `canonical host (${canonical}). A redirect to any other host discards the ` +
      `canonical the markup declares.`,
  );
}

const apexRedirect = (config.redirects ?? []).some(
  (redirect) =>
    redirect.has?.some((condition) => condition.type === "host" && condition.value === apex),
);
if (!apexRedirect) {
  errors.push(
    `${CONFIG}: no redirect sends ${apex} to ${canonical}. Both hosts would serve the same ` +
      `content, which is a duplicate-content surface, and the canonical would name only one ` +
      `of them.`,
  );
}

if (errors.length === 0) {
  console.log("vercel.json: engines pinned, apex redirected to the canonical host.");
}

// Schema validation, skipped rather than failed when there is no network.
let schema = null;
try {
  const response = await fetch(SCHEMA_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  schema = await response.json();
} catch (error) {
  console.log(`??   could not fetch ${SCHEMA_URL} (${error.message}); structural check skipped`);
}

if (schema) {
  const properties = schema.properties ?? {};
  for (const key of ["redirects", "headers", "rewrites"]) {
    const entry = properties[key];
    const value = config[key];
    if (!entry || value == null) continue;

    const item = entry.items ?? {};
    const allowed = new Set(Object.keys(item.properties ?? {}));
    const required = item.required ?? [];

    for (const [index, definition] of value.entries()) {
      const extra = Object.keys(definition).filter((k) => !allowed.has(k));
      const missing = required.filter((k) => !(k in definition));
      if (extra.length === 0 && missing.length === 0) continue;
      errors.push(
        `${CONFIG}: ${key}[${index}] is not valid against Vercel's schema` +
          `${extra.length ? ` — unknown key(s): ${extra.join(", ")}` : ""}` +
          `${missing.length ? ` — missing: ${missing.join(", ")}` : ""}.` +
          `${entry.additionalProperties === false ? " The schema sets additionalProperties:false, so this rejects the whole file." : ""}`,
      );
    }
  }
  if (errors.length === 0) {
    console.log("vercel.json: redirects and headers match Vercel's schema.");
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`FAIL  ${error}`);
  console.error(`\n${errors.length} problem(s) in ${CONFIG}.`);
  process.exit(1);
}