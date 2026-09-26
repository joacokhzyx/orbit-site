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
  /*
   * `title` above is also the <title> of the homepage. There is no second
   * string for it, which is the point: measured against 81,000 title tags,
   * a title that matches the page's h1 is one Google rewrites markedly
   * less often, and two fields holding the same words is a way of letting
   * them drift apart. What Google rewrites most often is the brand name,
   * in 63% of the cases it touches at all, so the name is not a thing to
   * drop for keywords later.
   *
   * The measured thing, since the usual advice is wrong in an interesting
   * way. Google states there is no character limit at all and truncates to
   * device width, around 580-600px on desktop, and character counts are
   * only a proxy for that: a capital W is about four times the width of an
   * i. Rendered at 16px this title is 243px, so it was never at risk of
   * being cut, and the 45-character version that a validator complained
   * about was 349px and equally safe. The complaint was a heuristic being
   * right about the wrong number.
   *
   * The case for the shorter form is the other evidence. Titles of 15-40
   * characters earn about 36% more clicks than titles outside that band,
   * and every language that ships a real site does the same thing: Rust is
   * "Rust Programming Language" at 24, Go is "The Go Programming Language"
   * at 26. None of them appends a differentiator. The description below
   * is where "compiles to C" earns its place, and that is the division of
   * labour: the title names the thing, the description says why to click.
   */
  // Section 27: what it is + what it needs + what it stays + proof hint.
  subheadline:
    "Orbit is a statically typed language for APIs and microservices. It compiles fast and needs little to run, so it stays fast even under load.",
  /**
   * 149 characters, ceiling 160. This is the one Google reads, and it
   * carries the three things a stranger is looking for: statically typed,
   * for APIs and microservices, and compiles to C.
   */
  description:
    "A statically typed language for APIs and microservices, with a compiler written in itself. It compiles to C, so a service ships as one native binary.",
  /**
   * 117 characters, ceiling 125, and it is a SEPARATE string from the
   * description above because the two are read by different things with
   * different appetites. A social card shows about 125 characters and cuts
   * the rest mid-word on a phone; Google takes 160. One string could only
   * be right for one of them, and the first version at 170 was right for
   * neither.
   */
  ogDescription:
    "A statically typed language for APIs and microservices. Orbit compiles to C, so a service ships as one native binary.",
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
