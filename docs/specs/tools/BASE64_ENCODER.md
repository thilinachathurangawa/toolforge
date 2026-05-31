# SPEC: Base64 Encoder & Decoder Tool
**File:** `docs/specs/tools/BASE64_ENCODER.md`  
**Status:** Completed  
**Slug:** `base64-encoder`  
**Category:** developer

---

## SEO

- **Title:** `Base64 Encoder & Decoder — Encode/Decode Online Free | ToolForge`
- **Description:** `Encode text or files to Base64 and decode Base64 strings online for free. Supports text, images, and files.`
- **Primary Keyword:** base64 encode online
- **Secondary Keywords:** base64 decoder, text to base64, base64 converter, decode base64

---

## Functional Requirements

- [ ] Tab: Text encode/decode
- [ ] Tab: File to Base64
- [ ] Tab: Image to Base64 (with preview)
- [ ] Auto-detect mode (encode if text, decode if base64)
- [ ] Copy output button
- [ ] Download output as file
- [ ] URL-safe Base64 option
- [ ] No library needed (btoa/atob + FileReader API)

---

## Library

No external library needed — uses browser built-in APIs

---

## UI Layout

```
┌─────────────────────────────────┐
│  [Text] [File] [Image]          │
├─────────────────────────────────┤
│  Input:                         │
│  ┌───────────────────────────┐  │
│  │ Hello, World!             │  │
│  └───────────────────────────┘  │
│                                 │
│  [Encode] [Decode] [Auto]       │
│  [ ] URL-safe                   │
├─────────────────────────────────┤
│  Output:                        │
│  ┌───────────────────────────┐  │
│  │ SGVsbG8sIFdvcmxkIQ==      │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy] [Download]              │
└─────────────────────────────────┘

[Image Tab]
┌─────────────────────────────────┐
│  Upload Image:                  │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  Preview:                       │
│  ┌───────────────────────────┐  │
│  │   [Image Preview]         │  │
│  └───────────────────────────┘  │
│                                 │
│  Base64 Output:                 │
│  ┌───────────────────────────┐  │
│  │ data:image/png;base64,... │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy] [Download]              │
└─────────────────────────────────┘
```

---

## Component State

```typescript
type Tab = 'text' | 'file' | 'image';

state: {
  activeTab: Tab;
  input: string;
  output: string;
  mode: 'encode' | 'decode' | 'auto';
  urlSafe: boolean;
  imageFile: File | null;
  imageUrl: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Select a tab: Text, File, or Image
2. For text: Paste your text or Base64 string
3. For files: Upload any file to convert to Base64
4. For images: Upload an image to see preview and get Base64
5. Choose Encode, Decode, or Auto-detect mode
6. Enable URL-safe option if needed for URLs
7. Copy the output or download as a file

---

## About Content (for SEO section)

Our Base64 encoder and decoder handles text, files, and images entirely in your browser. Convert plain text to Base64 for data transmission, decode Base64 strings back to readable text, or convert images to Base64 for embedding in HTML/CSS. All processing happens locally — your data is never sent to any server. Perfect for developers working with data encoding, API requests, or embedding assets.
