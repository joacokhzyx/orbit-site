// The changelog, and the one place a version number is written down.
//
// What lives here is editorial: the period each release belongs to and the
// handful of changes worth showing someone who has never read the full
// changelog. What does not live here is the date. Those come from
// src/lib/releases.mjs, which reads the release the repository actually
// published, because the two had drifted: this file claimed 0.1.0-rc.2 was
// released on 1 September 2026 and 0.1.0-rc.1 on 1 August, while GitHub says
// 22 July and 9 July. A site whose whole claim is that it does not publish
// numbers it has not measured cannot also publish dates it has not checked.
//
// Two entries below have no matching release in the repository. They are
// kept, because the work happened, and marked so, because a reader who goes
// looking for a download of them will not find one.

import { RELEASES_RESOLVED } from "../lib/releases.mjs";

export type ChangelogEntry = {
  /** The tag, without the leading v. Matches the repository. */
  version: string;
  /** Human label for the period, matching the changelog headings. */
  period: string;
  /**
   * Used only when the repository has no release with this tag, for
   * ordering. A published entry always takes its date from the release.
   */
  fallbackDate?: string;
  /** True while the version isn't cut yet. */
  unreleased?: boolean;
  highlights: string[];
};

const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: "0.1.0",
    period: "Unreleased, toward 0.1.0",
    fallbackDate: "2026-09-19",
    unreleased: true,
    highlights: [
      "Tutorials for a blog API, a file server, single-binary deploy, and troubleshooting, each with expected output.",
      "Guides for schema migrations and for benchmark methodology, which forbids converting CPU time into joules with a universal factor.",
      "A known-limitations page kept next to the docs that use each feature.",
      "Removed 7 unimportable std stubs and shadows: duplicates of builtins, hardcoded fakes, or files that didn't parse as written.",
    ],
  },
  {
    version: "0.1.0-rc.2",
    period: "Developer commands and runtime hardening",
    highlights: [
      "`orbit run`, `orbit check`, and per-command help. `orbit --version` prints the version a service reports in `/health`.",
      "Token-based `orbit fmt` with a check mode, and `orbit doctor`: read-only project checks with optional whitespace fixes.",
      "Single-host `orbit cluster`: up, status, drain, rolling restart, down, logs.",
      "Real `system.*` telemetry builtins, and an automatic per-route cost ledger at `/_ledger`.",
      "Graceful shutdown that drains in-flight requests, with startup errors that say what to change.",
    ],
  },
  {
    version: "0.1.0-rc.1",
    period: "Stabilization",
    highlights: [
      "Kynx 0.1: real identity admission and an honest Bloom filter, which caches negatives and is never treated as authority.",
      "Runtime fixes for slowloris timeouts, opt-in exec, a removed seed credential, chunked-encoding 501, and a SQL identifier whitelist.",
      "A parser nesting limit and a guarantee of forward progress, so a bad file can't hang the compiler.",
      "Zig-free bootstrap became the primary path and the Zig seed tree was removed.",
      "A 25-probe parity battery, a self-host stability gate, fixed-point verification, and a release workflow for Windows and Linux.",
    ],
  },
  {
    version: "0.1.0-pre",
    period: "Bootstrap",
    fallbackDate: "2026-07-01",
    highlights: [
      "The compiler pipeline reached fixed-point convergence: lexer, parser, semantic analysis, IR, and a C backend.",
      "A committed C trust root and seed verification, so the build doesn't need Zig.",
      "HTTP runtime, arena allocation, and SQLite integration.",
      "`orbit fmt`, `orbit doctor`, and `orbit init` first implementations, plus a VS Code extension.",
      "Native x86-64 backend experiments. Still experimental, and the C backend is the supported path.",
    ],
  },
];

const RELEASES_BY_VERSION = new Map(
  RELEASES_RESOLVED.map((release) => [release.version, release]),
);

export type ChangelogRelease = ChangelogEntry & {
  /** ISO date. From the repository when the release exists. */
  date: string;
  /** True when the repository has a release with this version. */
  published: boolean;
  prerelease: boolean;
  /** Where the release assets are, when there are any. */
  downloadCount: number;
  htmlUrl: string | null;
};

export const CHANGELOG_RELEASES: readonly ChangelogRelease[] = CHANGELOG.map((entry) => {
  const release = RELEASES_BY_VERSION.get(entry.version);
  return {
    ...entry,
    date: release?.date ?? entry.fallbackDate ?? "",
    published: release != null,
    prerelease: release?.prerelease ?? false,
    downloadCount: release?.downloads.length ?? 0,
    htmlUrl: release?.htmlUrl ?? null,
  };
});
