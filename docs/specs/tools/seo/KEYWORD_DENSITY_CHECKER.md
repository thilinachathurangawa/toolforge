# SPEC: Keyword Density Checker Tool
**File:** `docs/specs/tools/seo/KEYWORD_DENSITY_CHECKER.md`
**Status:** Pending
**Slug:** `keyword-density-checker`
**Category:** seo

---

## SEO

- **Title:** `Keyword Density Checker — Analyze Keyword Usage Online Free | ToolForge`
- **Description:** `Check keyword density in your content for free. Analyze word frequency, keyword repetition, and optimize your content for SEO.`
- **Primary Keyword:** keyword density checker
- **Secondary Keywords:** keyword analyzer, word frequency counter, keyword density tool, SEO keyword analysis

---

## Functional Requirements

- [ ] Large text input area for content analysis
- [ ] Paste text or upload file option (.txt, .md)
- [ ] Exclude stop words toggle (common words like "the", "and", "is")
- [ ] Minimum word length filter (default 3 characters)
- [ ] Case sensitivity toggle
- [ ] Analyze button
- [ ] Results table showing:
  - [ ] Word/phrase
  - [ ] Count
  - [ ] Density percentage
  - [ ] Position in text
- [ ] Sort options: by count, by density, alphabetically
- [ ] Two-word and three-word phrase analysis
- [ ] Word cloud visualization (optional)
- [ ] Total word count display
- [ ] Unique word count display
- [ ] Export results to CSV
- [ ] Clear button

---

## Library

No external library needed — use string manipulation and frequency counting

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Input Content                           │
│  ┌─────────────────────────────────┐   │
│  │ [Paste or type your text here]   │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  [Upload .txt]                          │
│                                         │
│  Options:                               │
│  [✓] Exclude stop words                 │
│  Min word length: [3]                   │
│  [✓] Case sensitive                     │
│  Phrase length: [1 word ▼]              │
│                                         │
│  [Analyze] [Clear]                      │
├─────────────────────────────────────────┤
│  Results:                                │
│  Total words: 1,234  Unique: 456        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Word        Count  Density  %   │   │
│  │ seo         45     3.6%         │   │
│  │ keyword     32     2.6%         │   │
│  │ content     28     2.3%         │   │
│  │ ...                              │   │
│  └─────────────────────────────────┘   │
│  Sort by: [Count ▼]  [Export CSV]       │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
interface KeywordResult {
  word: string;
  count: number;
  density: number;
  positions: number[];
}

state: {
  inputText: string;
  excludeStopWords: boolean;
  minWordLength: number;
  caseSensitive: boolean;
  phraseLength: 1 | 2 | 3;
  results: KeywordResult[];
  sortBy: 'count' | 'density' | 'alphabetical';
  totalWords: number;
  uniqueWords: number;
  isAnalyzing: boolean;
}
```

---

## Stop Words List

```typescript
const stopWords = [
  'the', 'and', 'is', 'in', 'to', 'of', 'a', 'for', 'it', 'on',
  'with', 'as', 'this', 'that', 'are', 'was', 'at', 'by', 'be',
  'or', 'from', 'but', 'not', 'have', 'has', 'had', 'will', 'would',
  // ... more common stop words
];
```

---

## How to Use Content (for SEO section)

1. Paste your content into the text area or upload a text file
2. Configure options: exclude stop words, set minimum word length, choose case sensitivity
3. Select phrase length (1-word, 2-word, or 3-word phrases)
4. Click "Analyze" to calculate keyword density
5. Review the results table showing word frequency and density percentages
6. Sort results by count, density, or alphabetically
7. Export results to CSV for further analysis
8. Use insights to optimize your content for target keywords

---

## About Content (for SEO section)

Our free keyword density checker analyzes your content to reveal word frequency and keyword usage patterns. Identify overused or underused keywords, check for keyword stuffing, and optimize your content for search engines. Supports single words, two-word phrases, and three-word phrases with customizable filtering options. All analysis happens locally in your browser.
