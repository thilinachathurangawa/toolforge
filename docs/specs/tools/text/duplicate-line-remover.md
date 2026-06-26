# Spec — Duplicate Line Remover

- **Slug:** `duplicate-line-remover`
- **Component:** `src/components/tools/DuplicateLineRemover/index.tsx`
- **Category:** `text`
- **Icon:** `ListX`

## What it does
Removes duplicate lines from a list using a `Set` over lines split by `\n`.

## Controls
- Input textarea and Output textarea (side-by-side on desktop, stacked on
  mobile).
- Toggles: "Case Sensitive Comparison", "Trim Whitespace Before Comparing",
  "Keep Empty Lines".
- "Remove Duplicates" button.
- Badge showing how many duplicate lines were removed.
- Copy output button.

## Behavior detail
- Comparison key respects the case-sensitive + trim toggles, but the output keeps
  the first occurrence's original text.
- When "Keep Empty Lines" is on, blank lines are preserved as-is (not deduped).

## Privacy / network
Fully client-side.

## SEO
- Keywords: "remove duplicate lines", "delete duplicate text online", "list
  cleaner tool", "deduplicate list".

## Related
`text-sorter`, `find-and-replace`, `word-frequency-counter`.
