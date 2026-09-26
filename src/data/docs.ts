// Where a reader should be sent for each document.
//
// The site started with every documentation link pointing into the
// repository, on the reasoning that a mirror can drift. That stopped being
// true when the documentation moved onto this site: eleven pages under
// /docs are hosted here now, and the marketing pages were still sending
// readers to a raw markdown view on github.com for eight of them. The
// repository stayed the place for anything the site does not host, which
// is the policy this file records.
//
// One map, one resolver, and a gate that fails the build if a page links
// to the repository for a document listed here. Adding a page under
// /docs means adding a line here, which is what keeps the two in step.

import { REPO } from "./site";

export type DocRoute = {
  /** The path inside the orbit-lang repository, without the docs/ prefix. */
  repo: string;
  /** The route on this site, or null when the site does not host it. */
  site: string | null;
  /** One line saying what the reader gets, for the places that show it. */
  blurb?: string;
};

/**
 * The documents the site hosts, keyed by the repository path. Anything not
 * listed here is repository-only and is linked there on purpose.
 */
export const DOC_ROUTES: readonly DocRoute[] = [
  { repo: "README.md", site: "/docs/", blurb: "Start with the question you are trying to answer." },
  { repo: "GETTING_STARTED.md", site: "/docs/start/getting-started/", blurb: "Install it and run a first service." },
  { repo: "TOUR.md", site: "/docs/start/tour/", blurb: "What the language looks like, end to end." },
  { repo: "LANGUAGE_REFERENCE.md", site: "/docs/language/reference/", blurb: "The user-visible contract." },
  { repo: "KYNX.md", site: "/docs/services/kynx/", blurb: "Rate limiting, identity admission, and the Bloom filter." },
  { repo: "COMMANDS.md", site: "/docs/reference/commands/", blurb: "Every command, its flags, and where output goes." },
  { repo: "KNOWN_LIMITATIONS.md", site: "/docs/reference/limitations/", blurb: "What happens today, and how to work around it." },
  { repo: "FAQ.md", site: "/docs/reference/faq/", blurb: "The uncomfortable questions, answered plainly." },

  // Repository-only. The site does not carry these, so the link is honest
  // and the repository is authoritative for them.
  { repo: "ARCHITECTURE.md", site: null },
  { repo: "ARENA.md", site: null },
  { repo: "CHANGELOG.md", site: null },
  { repo: "CLUSTER.md", site: null },
  { repo: "DOCTOR.md", site: null },
  { repo: "ENERGY.md", site: null },
  { repo: "FMT.md", site: null },
  { repo: "PERF.md", site: null },
  { repo: "RELEASES.md", site: null },
  { repo: "RELEASE_NOTES_0_1_0.md", site: null },
  { repo: "ROADMAP.md", site: null },
  { repo: "STATUS.md", site: null },
  { repo: "SUPERLUMINAL.md", site: null },
  { repo: "SUPPORT.md", site: null },
  { repo: "SYNTAX_GUIDE.md", site: null },
  { repo: "VERSIONING.md", site: null },
  { repo: "architecture/BOOTSTRAP_STAGES.md", site: null },
  { repo: "architecture/ORBIT_ARENA.md", site: null },
  { repo: "architecture/SELF_HOSTING.md", site: null },
  { repo: "architecture/SOVEREIGNTY.md", site: null },
  { repo: "architecture/TYPED_IR.md", site: null },
  { repo: "guides/migrations.md", site: null },
  { repo: "tutorials/blog-api.md", site: null },
  { repo: "tutorials/deploy-single-binary.md", site: null },
  { repo: "tutorials/file-server.md", site: null },
  { repo: "tutorials/troubleshooting.md", site: null },
];

const BY_REPO_PATH = new Map(DOC_ROUTES.map((route) => [route.repo, route]));

/** The repository path for a document, for pages that must send readers there. */
export function repoHref(file: string): string {
  return `${REPO.docsBase}/${file}`;
}

/**
 * Where to send a reader for a document: this site when the site hosts it,
 * the repository when it does not.
 */
export function docHref(file: string): string {
  const route = BY_REPO_PATH.get(file);
  if (!route) {
    throw new Error(
      `unknown document "${file}". Add it to DOC_ROUTES so the site and the repository cannot disagree.`,
    );
  }
  return route.site ?? repoHref(file);
}

/** True when a document the site hosts was linked into the repository. */
export function isHostedOnSite(file: string): boolean {
  return BY_REPO_PATH.get(file)?.site != null;
}

/** A link into the source tree, for the files that are not documentation. */
export const sourceLink = (file: string): string => `${REPO.sourceBase}/${file}`;
