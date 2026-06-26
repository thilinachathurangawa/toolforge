# SPEC: HEIC to JPG Converter

**File:** `docs/specs/tools/image/HEIC_TO_JPG.md`
**Status:** Planned
**Slug:** `heic-to-jpg`
**Category:** image

---

## SEO

- **Title:** `HEIC to JPG Converter — Convert iPhone Photos to JPG Free | ToolForge`
- **Description:** `Convert HEIC/HEIF iPhone photos to JPG or PNG free, right in your browser. Batch convert and download all as a ZIP. 100% private — files never leave your device.`
- **Primary Keyword:** HEIC to JPG converter
- **Secondary Keywords:** convert HEIC to JPG free, iPhone photo converter online, open HEIC on Windows, HEIC to PNG

---

## Functional Requirements

- [ ] Accept `.heic` / `.heif` files via a large dropzone or file picker
- [ ] Batch conversion of multiple files (process sequentially; show per-file status)
- [ ] Output format toggle: JPG (default) or PNG
- [ ] Quality slider for JPG (0.5–1.0)
- [ ] Progress indicator (file N of M + spinner) — HEIC decode is CPU-intensive
- [ ] Per-file result row with thumbnail preview, output size, and individual Download
- [ ] "Download All (.zip)" via jszip when more than one file converted
- [ ] Graceful per-file error handling (a corrupt file must not abort the batch)
- [ ] 100% client-side using `heic2any` — nothing uploaded

---

## Library

```bash
npm install heic2any jszip
```

`heic2any` is dynamically imported on the client only (it references `window`),
e.g. `const heic2any = (await import('heic2any')).default`.

---

## UI Layout

```
┌──────────────────────────────────────┐
│   ⬆  Drop HEIC files here            │
│      or click to browse (.heic)      │
├──────────────────────────────────────┤
│  Output: (•) JPG ( ) PNG             │
│  Quality: [======|---] 0.9           │
│  [Convert N files]                   │
├──────────────────────────────────────┤
│  Converting 2 / 5 …  ▣▣▣▢▢           │
├──────────────────────────────────────┤
│  IMG_0421.heic → .jpg  1.2MB [⬇]     │
│  IMG_0422.heic → .jpg  0.9MB [⬇]     │
│  [Download All (.zip)]               │
└──────────────────────────────────────┘
```

---

## Component State

```typescript
type OutFormat = 'image/jpeg' | 'image/png';
interface ConvResult {
  name: string;          // output filename
  blob: Blob;
  url: string;           // object URL for preview/download
  status: 'done' | 'error';
  error?: string;
}
state: {
  files: File[];
  format: OutFormat;
  quality: number;       // 0.5–1.0, JPG only
  results: ConvResult[];
  isProcessing: boolean;
  progress: { current: number; total: number };
  error: string | null;
}
```

Conversion: `await heic2any({ blob: file, toType: format, quality })`. heic2any
may return a Blob or Blob[] (multi-image HEIC) — normalize to the first blob.

---

## How to Use Content (for SEO section)

1. Drop your HEIC/HEIF photos into the upload box (one or many)
2. Choose JPG or PNG output and, for JPG, a quality level
3. Click Convert and watch the progress as each photo is decoded
4. Download converted photos individually, or grab them all as a ZIP

---

## About Content (for SEO section)

HEIC is the format iPhones save photos in, and Windows and many websites can't
open it. This converter decodes HEIC/HEIF to standard JPG or PNG entirely in your
browser using the `heic2any` library — your photos are never uploaded to a
server, so even private images stay on your device.
