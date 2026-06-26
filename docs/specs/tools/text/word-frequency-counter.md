# Spec — Word Frequency Counter

- **Slug:** `word-frequency-counter`
- **Component:** `src/components/tools/WordFrequencyCounter/index.tsx`
- **Category:** `text`
- **Icon:** `BarChart3`

## What it does
Counts how often each word appears in a text. Extract words with a regex
(`/[\w']+/g`), lowercase them, tally into a frequency map, sort by count.

## Controls
- Text input area.
- Toggle: "Ignore common stop words" (hardcoded list: the, and, a, to, of, in,
  is, it, that, for, on, with, as, are, was, etc.).
- Table columns: Word, Count, and % of total. Sortable by clicking the header
  (by count or alphabetically).
- Summary: total words, unique words.

## Difference from `keyword-density-checker`
The SEO `keyword-density-checker` is framed for on-page SEO density analysis.
This is a general text-analysis frequency table (writers, editors, students)
with stop-word filtering and sortable columns.

## Privacy / network
Fully client-side.

## SEO
- Keywords: "word frequency counter", "count repeated words", "text analyzer",
  "most common words in text".

## Related
`word-counter`, `keyword-density-checker`, `text-sorter`.
