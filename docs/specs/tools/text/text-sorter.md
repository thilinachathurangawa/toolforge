# Spec — Text Sorter

- **Slug:** `text-sorter`
- **Component:** `src/components/tools/TextSorter/index.tsx`
- **Category:** `text`
- **Icon:** `ArrowDownAZ`

## What it does
Reorders the lines of a text block. Pure JS array operations on lines split by
`\n`.

## Actions (buttons)
- Sort A–Z (alphabetical, locale-aware `localeCompare`).
- Sort Z–A (reverse alphabetical).
- By length: Short → Long.
- By length: Long → Short.
- Reverse Order (flip current order, no sorting).
- Shuffle (Fisher–Yates).

## Options
- "Case-insensitive sort" toggle.
- "Remove blank lines" toggle (applied before sorting).

## Outputs
- Result textarea + copy button. Line count shown.

## Privacy / network
Fully client-side.

## SEO
- Keywords: "alphabetize list online", "sort text lines", "list shuffler tool",
  "order text alphabetically".

## Related
`duplicate-line-remover`, `word-frequency-counter`, `find-and-replace`.
