# SPEC: URL Encoder / Decoder Tool (SEO Version)
**File:** `docs/specs/tools/seo/URL_ENCODER_DECODER.md`
**Status:** Pending
**Slug:** `url-encoder-decoder`
**Category:** seo

---

## SEO

- **Title:** `URL Encoder / Decoder — SEO URL Tool Online Free | ToolForge`
- **Description:** `Encode and decode URLs for SEO. Clean up URL parameters, fix special characters, and ensure your URLs are search engine friendly.`
- **Primary Keyword:** URL encoder decoder SEO
- **Secondary Keywords:** URL cleaner, SEO URL tool, encode decode URL, URL parameter tool

---

## Functional Requirements

- [ ] Large text input area for URL
- [ ] Tab 1: Encode URL
- [ ] Tab 2: Decode URL
- [ ] Auto-detect mode (encode if plain, decode if encoded)
- [ ] Encode/Decode button (or auto-process on input)
- [ ] Copy output to clipboard button
- [ ] Clear button
- [ ] Show character count for input and output
- [ ] URL validation (check if valid URL format)
- [ ] SEO-friendly URL suggestions:
  - [ ] Convert to lowercase
  - [ ] Replace spaces with hyphens
  - [ ] Remove special characters
  - [ ] Remove stop words
- [ ] URL parameter extraction display
- [ ] Compare original vs processed URL

---

## Library

No external library needed — use built-in encodeURIComponent/decodeURIComponent

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  [Encode] [Decode] [Auto]               │
├─────────────────────────────────────────┤
│  Input URL:                             │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/page?id=123  │   │
│  └─────────────────────────────────┘   │
│  Characters: 42  Valid: ✓               │
│                                         │
│  [Process]                              │
├─────────────────────────────────────────┤
│  Output:                                │
│  ┌─────────────────────────────────┐   │
│  │ https%3A%2F%2Fexample.com%2F... │   │
│  └─────────────────────────────────┘   │
│  Characters: 56                        │
│  [Copy] [Clear]                        │
├─────────────────────────────────────────┤
│  SEO URL Suggestions [▼]                │
│  ┌─────────────────────────────────┐   │
│  │ [✓] Convert to lowercase        │   │
│  │ [✓] Replace spaces with hyphens │   │
│  │ [✓] Remove special characters   │   │
│  │ [✓] Remove stop words            │   │
│  │ [Apply Suggestions]             │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  URL Parameters:                         │
│  • id: 123                              │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: 'encode' | 'decode' | 'auto';
  inputUrl: string;
  outputUrl: string;
  inputCharCount: number;
  outputCharCount: number;
  isValidUrl: boolean;
  
  // SEO options
  toLowerCase: boolean;
  replaceSpaces: boolean;
  removeSpecialChars: boolean;
  removeStopWords: boolean;
  
  extractedParams: Record<string, string>;
  error: string | null;
}
```

---

## SEO URL Processing

```typescript
function makeSeoFriendly(url: string, options: SeoOptions): string {
  let processed = url;
  
  if (options.toLowerCase) {
    processed = processed.toLowerCase();
  }
  
  if (options.replaceSpaces) {
    processed = processed.replace(/\s+/g, '-');
  }
  
  if (options.removeSpecialChars) {
    processed = processed.replace(/[^a-z0-9\-]/gi, '');
  }
  
  if (options.removeStopWords) {
    processed = removeStopWords(processed);
  }
  
  return processed;
}
```

---

## How to Use Content (for SEO section)

1. Select mode: Encode, Decode, or Auto-detect
2. Paste your URL in the input field
3. Click "Process" to encode or decode the URL
4. Use SEO suggestions to create search engine friendly URLs
5. Apply suggestions like lowercase conversion and hyphen replacement
6. Review extracted URL parameters
7. Copy the processed URL to your clipboard

---

## About Content (for SEO section)

Our free URL encoder and decoder is optimized for SEO professionals. Encode and decode URLs while ensuring they remain search engine friendly. Includes SEO URL suggestions to create clean, readable URLs that perform better in search results. All processing happens locally in your browser with no data sent to any server.
