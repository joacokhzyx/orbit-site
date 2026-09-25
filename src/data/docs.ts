// The documentation map for /docs. Every entry points into the repository,
// which is authoritative: the site never copies a document, so a page here
// can't quietly disagree with the thing it links to.

import { docLink } from "./site";

export type DocEntry = {
  question: string;
  doc: string;
  /** One line saying what the reader will get. */
  blurb: string;
};

export type DocGroup = {
  title: string;
  note?: string;
  entries: DocEntry[];
};

export const DOC_GROUPS: readonly DocGroup[] = [
  {
    title: "Starting out",
    note: "If you've never written Orbit, this order works.",
    entries: [
      {
        question: "How do I install it and run my first program?",
        doc: "GETTING_STARTED.md",
        blurb: "Builds the compiler and runs a service, without giant dependencies.",
      },
      {
        question: "What does the language look like?",
        doc: "TOUR.md",
        blurb: "Functions, models, routes, SQLite, telemetry. Every snippet runnable, every output verified.",
      },
      {
        question: "Which syntax rules will trip me up?",
        doc: "SYNTAX_GUIDE.md",
        blurb: "A short pointer to the maintained reference.",
      },
      {
        question: "How do I write Orbit programs?",
        doc: "LANGUAGE_REFERENCE.md",
        blurb: "The user-visible contract: bindings, control flow, routes, models, modules, limits.",
      },
    ],
  },
  {
    title: "Building a service",
    entries: [
      {
        question: "How do I build a blog API with auth?",
        doc: "tutorials/blog-api.md",
        blurb: "Runnable example plus the expected outputs at each step.",
      },
      {
        question: "How do I serve files and accept uploads?",
        doc: "tutorials/file-server.md",
        blurb: "The same tutorial style, with the upload limitation stated up front.",
      },
      {
        question: "How do I ship one binary?",
        doc: "tutorials/deploy-single-binary.md",
        blurb: "Windows and Linux, plus one-box clustering.",
      },
      {
        question: "What are the HTTP protections?",
        doc: "KYNX.md",
        blurb: "Rate limiting, identity admission, and why the Bloom filter is never authority.",
      },
      {
        question: "How does memory work?",
        doc: "ARENA.md",
        blurb: "Arena allocation, the pool fast path, and what telemetry the runtime keeps.",
      },
    ],
  },
  {
    title: "When it doesn't work",
    note: "Written to be found before midnight, not after.",
    entries: [
      {
        question: "What can't Orbit do yet?",
        doc: "KNOWN_LIMITATIONS.md",
        blurb: "The honest list: what happens today, how to work around it, what would change it.",
      },
      {
        question: "Something broke. What now?",
        doc: "tutorials/troubleshooting.md",
        blurb: "Silent exits, ports already in use, slow first boots.",
      },
      {
        question: "What do people ask?",
        doc: "FAQ.md",
        blurb: "Twenty questions answered plainly, including the uncomfortable ones.",
      },
      {
        question: "Which platforms are supported?",
        doc: "SUPPORT.md",
        blurb: "What's verified where, and which paths are marked untested.",
      },
      {
        question: "Will this change break my code?",
        doc: "VERSIONING.md",
        blurb: "What counts as a breaking change before 0.1.0.",
      },
    ],
  },
  {
    title: "Commands and tooling",
    entries: [
      {
        question: "Which commands are available?",
        doc: "COMMANDS.md",
        blurb: "Every command, its flags, and where output goes.",
      },
      {
        question: "How do I format code?",
        doc: "FMT.md",
        blurb: "Token-based formatting, and the check mode the CI gate runs.",
      },
      {
        question: "What does orbit doctor check?",
        doc: "DOCTOR.md",
        blurb: "Read-only project checks, their codes, and the optional whitespace fixes.",
      },
    ],
  },
  {
    title: "Understanding the system",
    entries: [
      {
        question: "How does the compiler work?",
        doc: "ARCHITECTURE.md",
        blurb: "The pipeline from source to C, and where the boundaries are.",
      },
      {
        question: "How does the compiler compile itself?",
        doc: "architecture/SELF_HOSTING.md",
        blurb: "Fixed-point convergence, the trust root, and how a build is verified.",
      },
      {
        question: "What is the trust model?",
        doc: "architecture/SOVEREIGNTY.md",
        blurb: "Reproducibility, and what the committed C file does and doesn't guarantee.",
      },
      {
        question: "What is implemented today?",
        doc: "STATUS.md",
        blurb: "A dated snapshot of capabilities, risks, and active workstreams.",
      },
      {
        question: "What is planned next?",
        doc: "ROADMAP.md",
        blurb: "Sequencing and priorities. It does not replace the engineering contract.",
      },
    ],
  },
  {
    title: "Measuring honestly",
    entries: [
      {
        question: "How should energy be measured?",
        doc: "ENERGY.md",
        blurb: "The definitions, and why CPU time is never converted to joules.",
      },
      {
        question: "What did the performance work find?",
        doc: "PERF.md",
        blurb: "Numbers with machine and method, including what was tried and left alone.",
      },
      {
        question: "How do I benchmark it?",
        doc: "guides/benchmark-methodology.md",
        blurb: "Run counts, medians, discarded runs, and the proxy rules.",
      },
      {
        question: "What is the Superluminal research?",
        doc: "SUPERLUMINAL.md",
        blurb: "What was measured, what was falsified, and what stays aspiration.",
      },
    ],
  },
  {
    title: "The project itself",
    entries: [
      {
        question: "What changed?",
        doc: "CHANGELOG.md",
        blurb: "Every entry, condensed from the git history.",
      },
      {
        question: "What is in this release?",
        doc: "RELEASE_NOTES_0_1_0.md",
        blurb: "The 0.1.0 release notes.",
      },
      {
        question: "How are releases packaged?",
        doc: "RELEASES.md",
        blurb: "Artifacts and how they're verified.",
      },
      {
        question: "What are the quality gates?",
        doc: "../ENGINEERING.md",
        blurb: "The implementation contract and its executable gates.",
      },
    ],
  },
];

/** Resolves a docs-relative path, including the one entry outside docs/. */
export const hrefFor = (doc: string): string => {
  if (doc.startsWith("../")) {
    return `https://github.com/joacokhzyx/orbit-lang/blob/main/${doc.slice(3)}`;
  }
  return docLink(doc);
};

/** Last path segment, used as the label on each row. */
export const labelFor = (doc: string): string => doc.split("/").pop() ?? doc;
