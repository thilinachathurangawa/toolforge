# SPEC: Regex Tester Tool
**File:** `docs/specs/tools/developer/REGEX_TESTER.md`
**Status:** Completed
**Slug:** `regex-tester`
**Category:** developer

---

## SEO

- **Title:** `Regex Tester — Test Regular Expressions Online | ToolForge`
- **Description:** `Test regular expressions against text in real time. Highlight matches, capture groups, and replace patterns. No sign-up required.`
- **Primary Keyword:** regex tester
- **Secondary Keywords:** regular expression tester, test regex online, regex pattern tester

---

## Functional Requirements

- [ ] Regex pattern input
- [ ] Flags input (g, i, m, s, u, y)
- [ ] Test text textarea
- [ ] Quick flag toggles
- [ ] Test button
- [ ] Highlighted matches in text
- [ ] Show match details (index, length, groups)
- [ ] Copy regex button
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  /pattern/flags                  │
│  ┌───────────────────────────┐  │
│  │ [a-z]+                    │  │
│  └───────────────────────────┘  │
│  [g] [i] [m] [s] [u] [y]        │
│                                 │
│  Test Text:                     │
│  ┌───────────────────────────┐  │
│  │ Hello World 123           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Test]                         │
├─────────────────────────────────┤
│  Matches (3):                   │
│  ┌───────────────────────────┐  │
│  │ Match 1: "Hello"          │  │
│  │   Index: 0, Length: 5     │  │
│  │ Match 2: "World"          │  │
│  │   Index: 6, Length: 5     │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy Regex]                   │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  pattern: string;
  flags: string;
  text: string;
  matches: RegExpMatchArray[];
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Enter your regular expression pattern
2. Set the desired flags (g, i, m, etc.)
3. Paste test text into the textarea
4. Click "Test" to find matches
5. Review highlighted matches and capture groups
6. Copy the regex for use in your code

---

## About Content (for SEO section)

Our regex tester validates regular expressions against text entirely in your browser. See matches highlighted in context, view capture groups, and test different flag combinations. Perfect for debugging regex patterns, learning regex syntax, or testing input validation. No data is sent to any server — all processing happens locally on your device.
