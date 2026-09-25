import { createHighlighter } from "shiki";
import { orbitLanguage } from "./orbit-grammar.mjs";

// One highlighter for the whole build. `codeToHtml` resolves languages
// against a singleton that only knows the bundled set, so a custom grammar
// has to be registered by constructing the highlighter ourselves. The
// promise is memoised at module level, which ESM evaluates once.
let highlighterPromise;

const THEMES = ["github-light", "github-dark"];

const LANGS = [orbitLanguage, "bash", "json", "text", "plaintext", "diff"];

export function getHighlighter() {
  highlighterPromise ??= createHighlighter({ themes: THEMES, langs: LANGS });
  return highlighterPromise;
}
