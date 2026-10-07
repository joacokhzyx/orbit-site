// The sections of the documentation, and the one list both the sidebar and
// the section rail are built from.
//
// The reason this file exists is that the redesign needs the same hierarchy
// in two places at once. The reference layout this site is moving toward
// carries its structure twice: a horizontal rail of top-level sections, and
// a sidebar listing only the pages of the section you are in. Starlight's
// `sidebar` config already describes exactly that hierarchy — four groups,
// eleven pages — but it lived inline in astro.config.mjs, which a
// component cannot import.
//
// So the list moved here and astro.config.mjs imports it back. One
// declaration, two consumers, and the two cannot drift: add a page to a
// section here and it appears in the sidebar and in the rail's section
// switcher on the same build. The previous arrangement could not be shared,
// which is why the rail was going to be a hand-maintained copy of the
// sidebar — a second list to keep in step, and the exact class of bug this
// repository's gates exist to catch.
//
// `firstSlug` is derived rather than written, because the rail needs a
// destination per section and the obvious one is always the first page in
// it. Deriving it means a section can never point somewhere that stopped
// existing.

export interface DocItem {
  readonly label: string;
  /**
   * The route on this site, WITH a trailing slash.
   *
   * Not a style preference: `check:links` treats the trailing-slash form as
   * canonical for a page and fails the build on the other one, so a link
   * written from this file has to carry it or the gate goes red. Anything
   * comparing a slug against an incoming path normalises both sides first —
   * see `sectionForPath`.
   */
  readonly slug: string;
}

export interface DocSection {
  readonly label: string;
  readonly items: readonly DocItem[];
}

export const DOC_SECTIONS: readonly DocSection[] = [
  {
    label: "Start here",
    items: [
      { label: "Documentation", slug: "/docs/" },
      { label: "Getting started", slug: "/docs/start/getting-started/" },
      { label: "Language tour", slug: "/docs/start/tour/" },
    ],
  },
  {
    label: "The language",
    items: [
      { label: "Language reference", slug: "/docs/language/reference/" },
      { label: "Orbit on the web", slug: "/docs/language/web/" },
    ],
  },
  {
    label: "Services",
    items: [
      { label: "Models and SQLite", slug: "/docs/services/models/" },
      { label: "Auth and roles", slug: "/docs/services/auth/" },
      { label: "Kynx", slug: "/docs/services/kynx/" },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "Commands", slug: "/docs/reference/commands/" },
      { label: "Known limitations", slug: "/docs/reference/limitations/" },
      { label: "Frequently asked", slug: "/docs/reference/faq/" },
    ],
  },
] as const;

/**
 * The shape Starlight's `sidebar` config expects: labels, and `slug`
 * without a leading or trailing slash.
 *
 * Returned from a function rather than exported as a constant so the two
 * representations cannot be edited independently — there is one literal in
 * this file and it is DOC_SECTIONS. The two forms genuinely differ, which is
 * the reason the conversion lives somewhere visible: Starlight's schema
 * rejects a slug that starts or ends with a slash, while `check:links`
 * requires the opposite of a trailing slash in the rendered HTML. Stripping
 * here is what lets both hold at once.
 */
export function starlightSidebar(): {
  label: string;
  items: { label: string; slug: string }[];
}[] {
  return DOC_SECTIONS.map((section) => ({
    label: section.label,
    items: section.items.map((item) => ({
      label: item.label,
      slug: item.slug.replace(/^\/+|\/+$/g, ""),
    })),
  }));
}

/** Every documentation route, flattened. Used by the rail's own tests. */
export const DOC_SLUGS: readonly string[] = DOC_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.slug),
);

/**
 * Which section a path belongs to, or null when it is not a documentation
 * route.
 *
 * Longest-match rather than prefix, so `/docs/reference/commands` resolves
 * to Reference and cannot be captured by a shorter section. Both sides are
 * normalised to no trailing slash first: the slugs here carry one because
 * that is the canonical address a link has to use — `check:links` fails the
 * build on `/docs/…` without it — while an incoming request may or may not
 * have one, since `trailingSlash: "ignore"` makes the two the same page. A
 * reader who arrives on one form must not fall out of the rail on the other.
 */
export function sectionForPath(pathname: string): DocSection | null {
  const path = normalise(pathname);

  let best: { section: DocSection; slug: string } | null = null;
  for (const section of DOC_SECTIONS) {
    for (const item of section.items) {
      const slug = normalise(item.slug);
      if (path === slug || path.startsWith(`${slug}/`)) {
        if (!best || slug.length > best.slug.length) {
          best = { section, slug };
        }
      }
    }
  }
  return best?.section ?? null;
}

/** A path or slug with any trailing slash removed. */
function normalise(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}