# SPEC: Word & Character Counter Tool
**File:** `docs/specs/tools/WORD_COUNTER.md`
**Status:** Completed
**Slug:** `word-counter`
**Category:** text

---

## SEO

- **Title:** `Word Counter — Count Words, Characters & Sentences Online | ToolForge`
- **Description:** `Count words, characters, sentences, and paragraphs in real time. Free online word counter for writers, students, and bloggers.`
- **Primary Keyword:** word counter online
- **Secondary Keywords:** character count, word count tool, letter counter, sentence counter

---

## Functional Requirements

- [ ] Large text input area
- [ ] Real-time counting (no button needed)
- [ ] Count: Words, Characters (with/without spaces), Sentences, Paragraphs, Lines
- [ ] Reading time estimate
- [ ] Speaking time estimate
- [ ] Keyword density analyzer
- [ ] Clear button
- [ ] Character limit warning (configurable)
- [ ] No library needed

---

## Library

No external library needed

---

## UI Layout

```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │ Paste or type your text   │  │
│  │ here...                    │  │
│  │                           │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Clear Text]                   │
├─────────────────────────────────┤
│  Stats:                         │
│  ┌──────────┬──────────┐       │
│  │ Words    │ 1,234    │       │
│  │ Chars    │ 6,789    │       │
│  │ No Space │ 5,432    │       │
│  │ Sentences│ 45       │       │
│  │ Paragraphs│ 12      │       │
│  │ Lines    │ 67       │       │
│  └──────────┴──────────┘       │
│                                 │
│  Reading Time: 5 min            │
│  Speaking Time: 8 min           │
│                                 │
│  Top Keywords:                  │
│  • the (45)                     │
│  • and (32)                     │
│  • is (28)                      │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: number;  // in minutes
  speakingTime: number; // in minutes
  keywords: Array<{ word: string; count: number }>;
}

state: {
  text: string;
  stats: TextStats;
  charLimit: number | null;
  isOverLimit: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste or type your text into the text area
2. View real-time statistics including words, characters, sentences, and paragraphs
3. Check reading and speaking time estimates
4. Review keyword density to see your most used words
5. Use the clear button to reset and start over

---

## About Content (for SEO section)

Our word counter provides real-time text analysis for writers, students, bloggers, and anyone who needs to count words or characters. Get instant statistics on word count, character count, sentences, paragraphs, and more. Includes reading time estimates for speeches and keyword density analysis. All processing happens locally in your browser — your text is never sent to any server.
