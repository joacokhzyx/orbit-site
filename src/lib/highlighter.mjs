import { createHighlighter } from "shiki";
import { orbitLanguage } from "./orbit-grammar.mjs";
import { CODE_THEMES } from "./code-theme.mjs";

// One highlighter for the whole build. `codeToHtml` resolves languages
// against a singleton that only knows the bundled set, so a custom grammar
// has to be registered by constructing the highlighter ourselves. The
// promise is memoised at module level, which ESM evaluates once.
//
// The themes come from ./code-theme.mjs, which owns the measured palette
// and the reason for it. This file used to name github-light and
// github-dark directly, so the marketing pages kept rendering the stock
// palette while the documentation had moved on.
let highlighterPromise;

const LANGS = [orbitLanguage, "bash", "json", "text", "plaintext", "diff"];

export function getHighlighter() {
  highlighterPromise ??= createHighlighter({ themes: CODE_THEMES, langs: LANGS });
  return highlighterPromise;
}

