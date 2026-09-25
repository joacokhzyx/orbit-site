// TextMate grammar for Orbit (.orb), used by Shiki at build time.
//
// Keywords are not invented here: they are copied from the lexer's own
// table in `compiler/lexer.orb` (keywordFromText) so the highlighter
// can't drift away from the language. If Orbit gains a keyword, add it
// to the list below in the same change.
const keywords = [
  "fn",
  "model",
  "route",
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
  "err",
  "ok",
  "with",
  "val",
  "var",
  "const",
  "mut",
  "private",
  "extern",
  "every",
  "async",
  "if",
  "else",
  "for",
  "in",
  "while",
  "loop",
  "break",
  "continue",
  "return",
  "match",
  "type",
  "enum",
  "union",
  "use",
  "import",
  "trait",
  "impl",
  "try",
  "catch",
];

const controlKeywords = [
  "if",
  "else",
  "for",
  "in",
  "while",
  "loop",
  "break",
  "continue",
  "return",
  "match",
];

const declarationKeywords = ["fn", "model", "route", "type", "enum", "union", "trait", "impl"];

const resultKeywords = ["ok", "err"];

const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

/** @type {import("shiki").LanguageRegistration} */
export const orbitLanguage = {
  // Shiki registers and looks a grammar up by `name`, so it has to be the
  // same string callers pass as `lang`. Capitalised aliases are listed
  // separately for anyone asking for "Orbit".
  name: "orbit",
  aliases: ["Orbit", "orb", "orbs"],
  scopeName: "source.orb",
  patterns: [
    { include: "#comment" },
    { include: "#string" },
    { include: "#char" },
    { include: "#number" },
    { include: "#decorator" },
    { include: "#http-method" },
    { include: "#declaration" },
    { include: "#control" },
    { include: "#result-keyword" },
    { include: "#keyword" },
    { include: "#constant" },
    { include: "#type" },
    { include: "#call" },
    { include: "#operator" },
    { include: "#punctuation" },
  ],
  repository: {
    comment: {
      patterns: [
        { name: "comment.line.double-slash.orb", match: "//.*$" },
        { name: "comment.block.orb", begin: "/\\*", end: "\\*/" },
      ],
    },
    string: {
      patterns: [
        {
          name: "string.quoted.double.orb",
          begin: '"',
          end: '"',
          beginCaptures: { "0": { name: "punctuation.definition.string.begin.orb" } },
          endCaptures: { "0": { name: "punctuation.definition.string.end.orb" } },
          patterns: [{ name: "constant.character.escape.orb", match: "\\\\." }],
        },
      ],
    },
    char: {
      name: "string.quoted.single.orb",
      begin: "'",
      end: "'",
      beginCaptures: { "0": { name: "punctuation.definition.string.begin.orb" } },
      endCaptures: { "0": { name: "punctuation.definition.string.end.orb" } },
    },
    number: {
      patterns: [
        { name: "constant.numeric.float.orb", match: "\\b\\d[\\d_]*\\.\\d[\\d_]*\\b" },
        { name: "constant.numeric.integer.orb", match: "\\b\\d[\\d_]*\\b" },
      ],
    },
    decorator: {
      name: "entity.name.function.decorator.orb",
      match: "@\\s*[A-Za-z_][A-Za-z0-9_.]*",
    },
    "http-method": {
      patterns: [
        {
          // `route GET "/path"` — the verb gets its own scope so the
          // route table on the docs pages reads at a glance.
          match: `(?<=\\broute\\s)(${httpMethods.join("|")})\\b`,
          captures: { "1": { name: "support.constant.http-method.orb" } },
        },
        {
          match: `\\b(${httpMethods.join("|")})\\b`,
          captures: { "1": { name: "support.constant.http-method.orb" } },
        },
      ],
    },
    declaration: {
      patterns: [
        {
          match: `\\b(${declarationKeywords.join("|")})\\b(?=\\s+[A-Za-z_])`,
          captures: { "1": { name: "keyword.control.declaration.orb" } },
        },
        {
          match: "\\b(fn)\\b\\s*([A-Za-z_][A-Za-z0-9_]*)",
          captures: {
            "1": { name: "keyword.control.declaration.orb" },
            "2": { name: "entity.name.function.orb" },
          },
        },
      ],
    },
    control: {
      match: `\\b(${controlKeywords.join("|")})\\b`,
      name: "keyword.control.orb",
    },
    "result-keyword": {
      match: `\\b(${resultKeywords.join("|")})\\b`,
      name: "keyword.other.result.orb",
    },
    keyword: {
      match: `\\b(${keywords.join("|")})\\b`,
      name: "keyword.orb",
    },
    constant: {
      match: "\\b(true|false|null|nil)\\b",
      name: "constant.language.orb",
    },
    type: {
      match: "\\b([A-Z][A-Za-z0-9_]*)\\b",
      name: "entity.name.type.orb",
    },
    call: {
      match: "\\b([A-Za-z_][A-Za-z0-9_]*)\\s*(?=\\()",
      captures: { "1": { name: "entity.name.function.call.orb" } },
    },
    operator: {
      match: "(\\+|-|\\*|/|%|==|!=|>=|<=|>|<|&&|\\|\\||->|=>|=|!|&|\\||@)",
      name: "keyword.operator.orb",
    },
    punctuation: {
      match: "[{}()\\[\\],;.:]",
      name: "punctuation.orb",
    },
  },
};
