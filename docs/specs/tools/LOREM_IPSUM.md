# SPEC: Lorem Ipsum Generator Tool
**File:** `docs/specs/tools/LOREM_IPSUM.md`  
**Status:** Pending  
**Slug:** `lorem-ipsum`  
**Category:** generator

---

## SEO

- **Title:** `Lorem Ipsum Generator — Generate Placeholder Text Online Free | ToolForge`
- **Description:** `Generate Lorem Ipsum placeholder text instantly. Choose words, sentences, or paragraphs. Perfect for designs and mockups.`
- **Primary Keyword:** lorem ipsum generator
- **Secondary Keywords:** placeholder text, dummy text generator, lorem ipsum text, filler text

---

## Functional Requirements

- [ ] Output type selector: Words, Sentences, Paragraphs
- [ ] Amount input (number of words/sentences/paragraphs)
- [ ] Generate button
- [ ] Large output area with generated text
- [ ] Copy to clipboard button
- [ ] Regenerate button (keep same settings)
- [ ] Start with "Lorem ipsum" toggle
- [ ] Paragraph count slider (1–20)
- [ ] Sentence length variation (short/medium/long)
- [ ] No library needed (built-in word bank)

---

## Library

No external library needed — use built-in word bank

---

## UI Layout

```
┌─────────────────────────────────┐
│  Type: [Paragraphs ▼]          │
│  Amount: [3]                    │
│                                 │
│  Options:                       │
│  [✓] Start with "Lorem ipsum"  │
│  Length: [Medium ▼]           │
│                                 │
│  [Generate] [Regenerate]       │
├─────────────────────────────────┤
│  Output:                        │
│  [_________________________]    │
│  [_________________________]    │
│  [_________________________]    │
│                                 │
│  [Copy] [Clear]                 │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  outputType: 'words' | 'sentences' | 'paragraphs';
  amount: number;
  startWithLorem: boolean;
  sentenceLength: 'short' | 'medium' | 'long';
  generatedText: string;
}
```

---

## Word Bank

```typescript
const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
  'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
  'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna',
  'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis',
  // ... more words
];
```

---

## How to Use Content (for SEO section)

1. Select output type: Words, Sentences, or Paragraphs
2. Enter the amount you want to generate
3. Choose options like starting with "Lorem ipsum" and sentence length
4. Click "Generate" to create placeholder text
5. Copy the text to your clipboard or regenerate with same settings

---

## About Content (for SEO section)

Our free Lorem Ipsum generator creates placeholder text for designs, mockups, and wireframes. Choose between words, sentences, or paragraphs with customizable length and style. All generation happens in your browser with no data sent to any server. Perfect for web designers, developers, and content creators.
