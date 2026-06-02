# SPEC: JSON Escape / Unescape Tool
**File:** `docs/specs/tools/developer/JSON_ESCAPE.md`
**Status:** Completed
**Slug:** `json-escape`
**Category:** developer

---

## SEO

- **Title:** `JSON Escape / Unescape — Escape JSON Strings Online | ToolForge`
- **Description:** `Escape special characters in JSON strings and unescape escaped JSON. Handle quotes, backslashes, and Unicode. No sign-up required.`
- **Primary Keyword:** json escape
- **Secondary Keywords:** json unescape, escape json string, json string escape

---

## Functional Requirements

- [ ] Mode toggle (Escape/Unescape)
- [ ] Input textarea
- [ ] Escape button
- [ ] Unescape button
- [ ] Copy output button
- [ ] Handle quotes, backslashes, newlines, tabs
- [ ] Handle Unicode characters
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  [Escape] [Unescape]            │
│                                 │
│  Input String:                  │
│  ┌───────────────────────────┐  │
│  │ Hello "World"             │  │
│  └───────────────────────────┘  │
│                                 │
│  [Process]                      │
├─────────────────────────────────┤
│  Output:                        │
│  ┌───────────────────────────┐  │
│  │ Hello \"World\"           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  input: string;
  output: string;
  mode: 'escape' | 'unescape';
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Select "Escape" or "Unescape" mode
2. Paste your string into the input textarea
3. Click the process button to transform the string
4. View the escaped or unescaped output
5. Copy the result for use in your JSON

---

## About Content (for SEO section)

Our JSON escape/unescape tool handles special characters in JSON strings entirely in your browser. Escape quotes, backslashes, newlines, and Unicode characters for valid JSON. Unescape escaped JSON strings back to readable text. Perfect for preparing data for JSON APIs or parsing JSON strings. No data is sent to any server — all processing happens locally on your device.
