// The copy the three prototypes share. If the directions disagree on
// wording, the design is not what is being compared, so this is the
// single source for every prototype.
//
// Rules this file follows, from the brand system:
//   headlines 3 to 6 words, no template constructions
//   one idea per sentence, contractions, verbs over adjectives
//   no em dash anywhere; periods, commas, colons or parentheses instead
//   "I" for intention, "Orbit" for fact, never "we"

export const HERO = {
  eyebrow: "A language for APIs and microservices",
  headline: "Do more with less.",
  lead:
    "Orbit is a statically typed language for APIs and microservices. It compiles fast and needs little to run, so it stays fast even under load.",
  primary: "Read the docs",
  secondary: "Try Orbit",
} as const;

export const SECTIONS = [
  {
    number: "01",
    heading: "Three decisions",
    lead: "Orbit is a small project on one machine. These are the choices that shape it.",
    items: [
      {
        title: "The compiler is written in Orbit",
        body: "It builds itself and reaches a fixed point you can verify. A committed C file is the trust root, so you need a C compiler and Python.",
        link: { label: "How the bootstrap works", href: "/p" },
      },
      {
        title: "Orbit compiles to C",
        body: "Your platform's C compiler produces the executable. A service ships as one file, with no runtime to install beside it.",
        link: { label: "The pipeline", href: "/p" },
      },
      {
        title: "Dependencies stay small",
        body: "Starting a server should not pull a framework tree in. Comfort that needs giant dependencies is not elegance.",
        link: { label: "Read the source", href: "/p" },
      },
    ],
  },
  {
    number: "02",
    heading: "What I can tell you, and what I can't",
    lead: "The measurement exists. The clean number does not yet.",
    paragraphs: [
      "The numbers I have come from a machine shared with other people's work. Component gains are real and isolated. The end to end difference sits inside the run to run noise, so a figure on this page would be decoration.",
      "That is the honest state, not a stall. The method is written down and the gates run on every change. I will publish the numbers when they are clean, including the bad runs.",
    ],
    chip: "Still measuring",
    aside:
      "Energy is reported in joules only where the hardware exposes sensors, which today means Linux. Everywhere else the honest proxies are CPU time and resident memory, never converted with a universal factor.",
    asideLabel: "What a proxy is",
    actions: [
      { label: "How I measure energy", href: "/p" },
      { label: "Benchmark methodology", href: "/p" },
    ],
  },
  {
    number: "03",
    heading: "What 0.1 can't do",
    lead: "This list sits next to the documentation, not inside it. Each entry says what happens and how to work around it.",
    items: [
      { title: "No multipart uploads", body: "The file helper compiles and saves nothing." },
      { title: "No database migrations", body: "Tables are created on startup, never altered." },
      { title: "No p50 or p99", body: "The runtime reports a mean, not a distribution." },
      { title: "One host per cluster", body: "The cluster command starts copies on this machine." },
    ],
    footnote: "The full list, with workarounds, is in the known limitations page.",
  },
  {
    number: "04",
    heading: "Run it in five minutes",
    lead: "You need a C compiler, Python 3.10 or newer, and git. That is the whole toolchain.",
    paragraphs: [
      "Clone, build the compiler, and run one of the examples. On Windows the same commands produce `.\\orbit.exe`.",
    ],
    code: `git clone https://github.com/joacokhzyx/orbit-lang.git
cd orbit-lang
python scripts/build_selfhost.py --out orbit
./orbit build examples/health_service.orb -o health_service
./health_service 8080
curl http://127.0.0.1:8080/health`,
    actions: [
      { label: "Getting started", href: "/p" },
      { label: "Language tour", href: "/p" },
    ],
  },
  {
    number: "05",
    heading: "Why I built it",
    paragraphs: [
      "I did not have an exceptional machine. I needed a language that needs little to be fast, and a toolchain I could read end to end.",
      "One person, a modest PC, and a compiler that compiles itself. I measure what I can and say what I can't.",
    ],
    link: { label: "The longer version", href: "/p" },
  },
] as const;

export const FOUNDER = "Built by Joaquín, in Argentina. Early research.";

export const NAV = [
  { label: "Learn", href: "/p" },
  { label: "Docs", href: "/p" },
  { label: "Foundation", href: "/p" },
  { label: "Changelog", href: "/p" },
  { label: "GitHub", href: "/p" },
] as const;
