// A curated view of docs/CHANGELOG.md. The changelog in the repository is
// authoritative and written from the git history; this file only picks
// the entries worth showing to someone who has never read it, and says so
// on the page itself. Nothing here is reconstructed from memory: each line
// below exists in that file.

export type Release = {
  version: string;
  /** Human label for the period, matching the changelog headings. */
  period: string;
  /** ISO date, used for ordering and for the page's machine-readable output. */
  date: string;
  /** True while the version isn't cut yet. */
  unreleased?: boolean;
  highlights: string[];
};

export const RELEASES: readonly Release[] = [
  {
    version: "0.1.0",
    period: "Unreleased, toward 0.1.0",
    date: "2026-09-19",
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
    date: "2026-09-01",
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
    date: "2026-08-01",
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
    date: "2026-07-01",
    highlights: [
      "The compiler pipeline reached fixed-point convergence: lexer, parser, semantic analysis, IR, and a C backend.",
      "A committed C trust root and seed verification, so the build doesn't need Zig.",
      "HTTP runtime, arena allocation, and SQLite integration.",
      "`orbit fmt`, `orbit doctor`, and `orbit init` first implementations, plus a VS Code extension.",
      "Native x86-64 backend experiments. Still experimental, and the C backend is the supported path.",
    ],
  },
];
