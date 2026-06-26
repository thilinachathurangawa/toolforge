# Spec — Find & Replace Tool

- **Slug:** `find-and-replace`
- **Component:** `src/components/tools/FindAndReplace/index.tsx`
- **Category:** `text`
- **Icon:** `Replace`

## What it does
Finds and replaces text across a block, with optional case sensitivity and full
regex support. Pure JS using `RegExp` + `String.prototype.replace`.

## Controls
- Main input textarea.
- "Find" input and "Replace" input.
- Checkboxes: "Match Case", "Use Regular Expressions (Regex)".
- Output textarea (read-only) with the replaced result.
- Counter showing the number of replacements made.

## Behavior detail
- Non-regex mode: the Find string is escaped and matched literally; replace is
  global.
- Regex mode: Find is compiled as a RegExp with flags `g` (+ `i` when Match Case
  is off). Invalid regex shows an error state instead of throwing.
- Regex replace supports `$1` capture-group backreferences (native behavior).

## Privacy / network
Fully client-side.

## SEO
- Keywords: "find and replace text online", "regex text replacer", "bulk text
  editor", "search and replace string".

## Related
`regex-tester`, `duplicate-line-remover`, `case-converter`.
