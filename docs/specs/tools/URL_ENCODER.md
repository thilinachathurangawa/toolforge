# SPEC: URL Encoder / Decoder Tool
**File:** `docs/specs/tools/URL_ENCODER.md`
**Status:** Completed
**Slug:** `url-encoder`
**Category:** developer

---

## SEO

- **Title:** `URL Encoder / Decoder — Encode & Decode URLs Online Free | ToolForge`
- **Description:** `Encode and decode URL strings and query parameters online for free. Convert special characters to percent-encoded format instantly.`
- **Primary Keyword:** URL encoder online
- **Secondary Keywords:** URL decoder, percent encode, URL encode decode, encode URL

---

## Functional Requirements

- [ ] Large text input area for URL string
- [ ] Tab 1: Encode URL
- [ ] Tab 2: Decode URL
- [ ] Auto-detect mode (encode if plain text, decode if encoded)
- [ ] Encode/Decode button (or auto-process on input)
- [ ] Copy output to clipboard button
- [ ] Clear button
- [ ] Show character count for input and output
- [ ] Support full URL encoding (including query parameters)
- [ ] No library needed (encodeURIComponent/decodeURIComponent)

---

## Library

No external library needed — use built-in encodeURIComponent/decodeURIComponent

---

## UI Layout

```
┌─────────────────────────────────┐
│  [Encode] [Decode] [Auto]       │
├─────────────────────────────────┤
│  Input:                         │
│  [_________________________]    │
│  Characters: 42                 │
│                                 │
│  [Encode/Decode] button         │
├─────────────────────────────────┤
│  Output:                        │
│  [_________________________]    │
│  Characters: 56                 │
│                                 │
│  [Copy] [Clear]                 │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: 'encode' | 'decode' | 'auto';
  inputText: string;
  outputText: string;
  inputCharCount: number;
  outputCharCount: number;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Select mode: Encode, Decode, or Auto-detect
2. Paste your URL or string in the input field
3. Click the button to process (or auto-process if enabled)
4. Copy the encoded/decoded result to your clipboard
5. Use the clear button to start over

---

## About Content (for SEO section)

Our free URL encoder and decoder converts URLs between plain text and percent-encoded format directly in your browser. No data is sent to any server — all processing happens locally. Perfect for handling special characters in URLs, query parameters, and API requests.
