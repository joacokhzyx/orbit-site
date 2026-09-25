// Single source of truth for anything that appears in more than one place:
// the canonical URL, the wording of the brand, and the two places the site
// points outward to. The documentation repository is authoritative for
// content; this file only records where it lives.

export const SITE = {
  name: "Orbit",
  url: "https://orbit-lang.dev",
  tagline: "Do more with less.",
  // Section 27 of the brand system: what it is + what it needs + what it stays.
  subheadline:
    "Orbit is a statically typed language for APIs and microservices. It compiles fast and needs little to run, so it stays fast even under load.",
  description:
    "Orbit is a statically typed language for APIs and microservices, with a compiler written in itself. It compiles to C, so a service ships as one native binary.",
  locale: "en",
  author: "Joaquín",
  founderLine: "Built by Joaquín — Argentina. Early research.",
} as const;

export const REPO = {
  url: "https://github.com/joacokhzyx/orbit-lang",
  // GitHub is the authoritative home of the documentation. The site links
  // there instead of mirroring it, so a page can never drift out of date
  // while two copies exist.
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
  { label: "Learn", href: "/learn" },
  { label: "Docs", href: "/docs" },
  { label: "Foundation", href: "/foundation" },
  { label: "Changelog", href: "/changelog" },
  { label: "GitHub", href: REPO.url, external: true },
];

/** Canonical link to a document in the repository, used by the docs hub. */
export const docLink = (file: string): string => `${REPO.docsBase}/${file}`;
export const sourceLink = (file: string): string => `${REPO.sourceBase}/${file}`;
