# SPEC: Text Diff Checker Tool
**File:** `docs/specs/tools/developer/TEXT_DIFF.md`
**Status:** Completed
**Slug:** `text-diff`
**Category:** developer

---

## SEO

- **Title:** `Text Diff Checker — Compare Text Online | ToolForge`
- **Description:** `Compare two text blocks and highlight differences. View added, removed, and modified lines side by side. No sign-up required.`
- **Primary Keyword:** text diff
- **Secondary Keywords:** compare text, text difference checker, text compare tool

---

## Functional Requirements

- [ ] Two input textareas for comparison
- [ ] Compare button
- [ ] Visual diff highlighting (added/removed/unchanged)
- [ ] Copy diff output button
- [ ] Show line numbers
- [ ] Color-coded changes
- [ ] Side-by-side or unified view
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  Original Text:                 │
│  ┌───────────────────────────┐  │
│  │ Hello World               │  │
│  │ This is text             │  │
│  └───────────────────────────┘  │
│                                 │
│  Modified Text:                 │
│  ┌───────────────────────────┐  │
│  │ Hello World               │  │
│  │ This is new text          │  │
│  └───────────────────────────┘  │
│                                 │
│  [Compare]                      │
├─────────────────────────────────┤
│  Differences:                   │
│  ┌───────────────────────────┐  │
│  │ 1 Hello World             │  │
│  │ - This is text            │  │
│  │ + This is new text        │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  text1: string;
  text2: string;
  diffs: DiffLine[];
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste the original text into the first textarea
2. Paste the modified text into the second textarea
3. Click "Compare" to find differences
4. Review the highlighted changes (added, removed, unchanged)
5. Copy the diff output for documentation

---

## About Content (for SEO section)

Our text diff checker compares two text blocks and visualizes differences entirely in your browser. Identify added lines, removed lines, and unchanged content with color coding. Perfect for tracking document changes, comparing code versions, or reviewing edits. No data is sent to any server — all processing happens locally on your device.
