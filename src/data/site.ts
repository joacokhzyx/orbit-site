// Single source of truth for anything that appears in more than one place:
// the canonical URL, the wording of the brand, and the two places the site
// points outward to. The documentation repository is authoritative for
// content; this file only records where it lives.

export const SITE = {
  name: "Orbit",
  url: "https://orbit-lang.dev",
  /**
   * What the thing IS, and the h1 on the homepage. This is separate from
   * `headline` on purpose: the two used to be the same string, which meant
   * the biggest type on the page was a slogan. A reader arriving from a
   * search result is looking for what Orbit is, and "Do more with less."
   * does not answer that — it answers what the author believes about it.
   * The slogan is still the brand, and it still has the places that are
   * about belief rather than identity: the footer, and the Open Graph alt.
   */
  title: "The Orbit Programming Language",
  /** Section 26: the primary headline is the philosophy, the subhead is concrete. */
  headline: "Do more with less.",
  eyebrow: "A language for APIs and microservices",
  /**
   * The <title> of the homepage, and the only one of these strings written
   * for a search result rather than for a reader. 68 characters, which is
   * where Google stops truncating on a desktop and the point past which it
   * stops helping on a phone. It leads with what Orbit is and then spends
   * the rest on the two facts that make someone click: it is statically
   * typed, and it compiles to C.
   */
  seoTitle: "The Orbit Programming Language — statically typed, compiles to C",
  // Section 27: what it is + what it needs + what it stays + proof hint.
  subheadline:
    "Orbit is a statically typed language for APIs and microservices. It compiles fast and needs little to run, so it stays fast even under load.",
  description:
    "Orbit is a statically typed programming language for APIs and microservices, with a compiler written in itself. It compiles to C, so a service ships as one native binary.",
  locale: "en",
} as const;

export const REPO = {
  url: "https://github.com/joacokhzyx/orbit-lang",
  /** Where the repository keeps the documents the site does not host. */
  docsBase: "https://github.com/joacokhzyx/orbit-lang/blob/main/docs",
  sourceBase: "https://github.com/joacokhzyx/orbit-lang/blob/main",
  changelog: "https://github.com/joacokhzyx/orbit-lang/blob/main/docs/CHANGELOG.md",
  releases: "https://github.com/joacokhzyx/orbit-lang/releases",
  issues: "https://github.com/joacokhzyx/orbit-lang/issues",
} as const;

export type NavLink = {
  label: string;
  href: string;
  /** Renders with an external marker and opens in a new tab. */
  external?: boolean;
};

export const NAV: readonly NavLink[] = [
  { label: "Learn", href: "/learn/" },
  { label: "Docs", href: "/docs/" },
  { label: "Foundation", href: "/foundation/" },
  { label: "Changelog", href: "/changelog/" },
  { label: "GitHub", href: REPO.url, external: true },
];

/** Where a reader should be sent for a document lives in ./docs. */
