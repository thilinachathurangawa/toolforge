# Spec — Case Converter

- **Slug:** `case-converter`
- **Component:** `src/components/tools/CaseConverter/index.tsx`
- **Category:** `text`
- **Icon:** `CaseSensitive`

## What it does
Transforms the text in a single textarea into a chosen case with one click. Pure
JS string manipulation, no libraries.

## Controls / outputs
- Large primary textarea (the text is transformed in place).
- Quick-action buttons: UPPERCASE, lowercase, Title Case, Sentence case,
  camelCase, PascalCase, snake_case, kebab-case.
- Footer: live character count + word count.
- "Copy to Clipboard" button.

## Difference from `string-converter`
`string-converter` converts between two explicitly chosen naming formats (needs a
From/To). This tool is the simpler "transform my prose/text to X case" workflow
with one-click buttons and live counts — geared at writers and quick edits, not
round-tripping identifiers.

## Privacy / network
Fully client-side.

## SEO
- Keywords: "case converter online", "change text to uppercase", "title case
  capitalization tool", "convert string to camelCase".
- Content: when to use each programming case.

## Related
`word-counter`, `string-converter`, `find-and-replace`.
