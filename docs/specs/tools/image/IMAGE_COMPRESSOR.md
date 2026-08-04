# SPEC: Image Compressor Tool
**File:** `docs/specs/tools/image/IMAGE_COMPRESSOR.md`  
**Status:** Completed — Phase 1 + Phase 2 enhancements shipped  
**Slug:** `image-compressor`  
**Category:** image

---

## SEO

- **Title:** `Image Compressor — Compress JPG, PNG, WebP Online Free | ToolForge`
- **Description:** `Compress images online for free. Set a quality level or a target size in KB, convert PNG to WebP, resize oversized photos, and strip EXIF — all in your browser, nothing uploaded.`
- **Primary Keyword:** compress image online free
- **Secondary Keywords:** reduce image size, image optimizer, compress jpg online, compress png free, compress image to 100kb, convert png to webp

---

## Functional Requirements

### Core Features (Implemented)
- [x] Accept JPG, PNG, WebP, GIF, AVIF files via drag & drop, file picker, or paste
- [x] Support multiple files (batch compression)
- [x] Compression quality slider (5%–100%, default 80%, 1% steps) + named presets
- [x] Show original size vs compressed size, per file and as a batch total
- [x] Show compression percentage saved
- [x] Before/after comparison slider with an actual-pixels mode (per-file toggle)
- [x] Download individual compressed files
- [x] Download all as ZIP (shown when 2+ results)
- [x] Remove individual files / clear all
- [x] No file size limit (client-side only)
- [x] No data sent to server — including the compression worker script, which is
      self-hosted at `public/browser-image-compression.js` rather than loaded from
      jsdelivr (the library's default `libURL`)

### Known Gaps — all resolved by the enhancement

These were the behaviours of the pre-enhancement build. Each is listed with how it
was fixed, and they are kept on record so the public tool content stays honest.

1. **Silent downscaling.** `maxWidthOrHeight` was hardcoded to `1920`, so any larger
   image was resized without the user being told, and much of the reported "savings"
   on big photos was resizing rather than compression.
   → *Fixed:* a visible "Resize longest edge" select including `Don't resize`; every
   result prints `W×H → W×H` and labels rows that were resized.
2. **Quality slider was a no-op for PNG.** The library re-encodes through
   `canvas.toBlob(type, quality)` and keeps the input MIME type; browsers ignore
   `quality` for `image/png`, so PNG in → PNG out only shrank via the 1920px downscale.
   → *Fixed:* an inline hint whenever a queued PNG would stay a PNG, a one-click
   "Convert to WebP instead" action, and a warning under the slider itself.
3. **Animated GIFs were flattened silently.**
   → *Fixed:* multi-frame GIFs are detected on add, badged "animated", and a banner
   states that only the first frame survives.
4. **Per-file failures were swallowed** — logged to the console and dropped.
   → *Fixed:* failed files keep their row with the error message and a Retry button.
5. **Object URLs leaked.** `previewUrl` was never revoked and
   `URL.createObjectURL(result.file)` ran inline in the render body.
   → *Fixed:* every URL goes through a tracked `makeUrl`/`dropUrl` pair, revoked on
   remove, re-compress, reset, and unmount.
6. **No drag feedback** — the drag handlers set no state.
   → *Fixed:* depth-counted enter/leave with an accent highlight and changed label.
7. **Extension could mismatch content** — the download name reused the source
   extension.
   → *Fixed:* `buildOutputName()` derives the extension from the output `Blob.type`.
8. **Sequential processing, no progress, no cancel.**
   → *Fixed:* a bounded concurrency pool, per-file and overall progress bars, an
   "n of N" counter, and a Cancel button that keeps finished results.
9. **Output could be larger than input** and was still what downloaded.
   → *Fixed:* the "keep the original if compression makes it bigger" safeguard
   (default on) passes the original bytes through and labels the row.

---

## Enhancement Options

### Phase 1 Enhancements (High Priority)

- [x] **Output format control** — `Keep original / JPEG / PNG / WebP / AVIF*` via the
  library's `fileType` option. This is the single biggest win: PNG → WebP typically
  cuts a screenshot or UI capture by 60–90% where the quality slider does nothing.
  Detect AVIF/WebP encode support with `canvas.toBlob` feature detection and hide
  unsupported entries rather than failing at compress time.
- [x] **PNG advice banner** — when a PNG is queued and output format is "Keep
  original", surface an inline hint that quality has no effect on PNG and offer a
  one-click "Convert to WebP" switch. Fixes gap #2 without silently changing intent.
- [x] **Resize control (replaces the hidden 1920 cap)** — an explicit "Resize longest
  edge" field with `Don't resize` as an available choice plus presets
  (4K 3840 / 1920 / 1280 / 800). Default stays 1920 for continuity but is now visible.
- [x] **Target file size mode** — "Compress to under ___ KB/MB", mapped to
  `maxSizeMB`, with the quality slider acting as the starting point. Covers the
  high-intent "compress image to 100kb / 200kb / 1mb" keyword cluster.
- [x] **Finer quality slider** — step `0.01` with a numeric input, plus quality
  presets (Maximum 95 / Balanced 80 / Small 60 / Tiny 40).
- [x] **Per-file progress + overall progress bar** — wire the library's `onProgress`
  callback per file and show a batch counter ("3 of 12"). Fixes gap #8.
- [x] **Cancel / abort** — an `AbortController` passed as `signal`, with a Cancel
  button that keeps already-finished results.
- [x] **Per-file error rows** — failed files stay in the results list with the reason
  and a Retry action instead of vanishing. Fixes gap #4.
- [x] **Never-larger guarantee** — a "Keep original if compression makes it bigger"
  toggle (default on); when it triggers, the row is labelled "Already optimised" and
  the original bytes are what downloads. Fixes gap #9.
- [x] **Batch summary bar** — total original → total compressed, total bytes saved,
  and average reduction across the batch.
- [x] **Dimension readout** — original W×H → output W×H per file, so a resize is
  visible rather than inferred. Fixes gap #1.
- [x] **Object URL lifecycle** — create original previews once (memoised per file),
  revoke every URL on removal / reset / unmount. Fixes gap #5.
- [x] **Animated GIF warning** — detect multi-frame GIFs (scan for more than one
  `0x21 0xF9` graphic-control extension) and warn that only the first frame is kept.
  Fixes gap #3.

\* AVIF encoding via canvas is Chromium-only at time of writing — treat as
progressive enhancement, never as the default.

### Phase 2 Enhancements (Medium Priority)

- [x] **Before/after comparison slider** — a draggable divider over the two previews
  instead of the current side-by-side pair, with a 1:1 pixel zoom mode so users can
  actually judge artifacts at the chosen quality.
- [ ] **Live estimate before committing** — compress a downscaled sample on slider
  change (debounced) to show an approximate output size without running the batch.
  *Deferred:* a sample-based estimate is only loosely predictive of the full-size
  result, and re-compressing the real batch is already cheap and cancellable.
- [ ] **Per-file setting overrides** — expand a row to give one file a different
  quality/format/resize while the rest use the batch defaults. *Deferred:* the
  `QueueItem.overrides` field is in the type, but no UI is wired to it yet.
- [x] **Use-case presets** — Web (WebP, 1920, q80) / Email attachment (JPEG, 1280,
  target 2 MB) / Social (JPEG, 1080, q85) / Archive (keep format, no resize, q95).
  One click sets format + resize + quality together.
- [x] **EXIF handling toggle** — expose `preserveExif`; default to stripping metadata
  (smaller + privacy-friendly) with a clear "Keep EXIF (camera info, GPS)" opt-in,
  and honour `exifOrientation` so rotated phone photos don't come out sideways.
- [x] **Parallel processing** — process files with a bounded concurrency pool
  (`navigator.hardwareConcurrency`, capped ~4) instead of a strict sequential loop.
- [x] **Paste from clipboard** — `Ctrl/⌘+V` a screenshot straight into the queue.
- [~] **Custom output naming** — the extension is now always derived from the *actual*
  output MIME type, and ZIP entries de-duplicate colliding names with a ` (2)` suffix
  (fixes gap #7). The user-configurable suffix and ZIP filename are still deferred.
- [x] **Drop-zone active state** — highlight border/background while dragging, and
  reject non-image drops with a visible message. Fixes gap #6.
- [x] **Duplicate detection** — flag files already in the queue by name + size.

### Phase 3 Enhancements (Nice to Have)

- [ ] **True lossy PNG quantisation** — a WASM quantiser (e.g. imagequant-style
  palette reduction) so "PNG in → PNG out" can genuinely shrink without changing
  format. Bundle-size-sensitive; load it dynamically only when a PNG is queued.
- [ ] **Strip-only mode** — remove metadata without re-encoding pixels, for users who
  want byte savings at literally zero quality cost.
- [ ] **Compression profile memory** — persist last-used settings in `localStorage`.
- [ ] **Queue reordering / sorting** — by name or size, with drag-to-reorder.
- [ ] **Folder drop support** — `webkitGetAsEntry` traversal to accept a dropped
  directory, preserving relative paths inside the ZIP.
- [ ] **Side-by-side histogram / SSIM readout** — a rough quality-loss indicator
  beyond raw byte count.
- [ ] **Cross-tool handoff** — "Send to Image Resizer / Converter / Metadata Remover"
  links that carry the current file over.
- [ ] **Accessibility pass** — labelled slider and file controls, keyboard-operable
  drop zone, `aria-live` announcements for batch progress and completion.

---

## Library

```bash
npm install browser-image-compression jszip
```

Options used from `browser-image-compression`: `maxSizeMB`, `maxWidthOrHeight`,
`useWebWorker`, `libURL`, `initialQuality`, `maxIteration`, `fileType`, `onProgress`,
`signal`, `preserveExif`, `alwaysKeepResolution`. EXIF orientation is left to the
library's default, which reads it from the file.

**Vendored asset:** `public/browser-image-compression.js` is a copy of
`node_modules/browser-image-compression/dist/browser-image-compression.js`. Refresh it
whenever the dependency is upgraded, or the worker will run an older build than the
main thread.

### Component files

```
src/components/tools/ImageCompressor/
  index.tsx          — queue, settings panel, batch runner, results
  CompareSlider.tsx  — draggable before/after divider + actual-pixels mode
  types.ts           — CompressSettings / QueueItem / CompressionResult
  utils.ts           — size formatting, encode-support probe, naming, presets
```

---

## UI Layout

### Current

```
┌─────────────────────────────────┐
│  Drop images here or click      │
│  [Drag & Drop Zone]             │
│  1 file(s) selected  [Clear all]│
├─────────────────────────────────┤
│  Quality: [──●──────] 80%       │
│  [Compress Images] button       │
├─────────────────────────────────┤
│  Results:                       │
│  filename.jpg  2.3MB → 450KB    │
│  (-80%) [Preview] [Download]    │
│  [Download All as ZIP]          │
└─────────────────────────────────┘
```

### Target (post-enhancement)

```
┌───────────────────────────────────────────────────────┐
│  Drop images here or click  ·  or paste (Ctrl+V)      │
│  [Drag & Drop Zone — highlights on drag-over]         │
│  3 file(s) · 12.4 MB total            [Clear all]     │
│   • P1.png   4.55 MB  2400×1600   [⚙] [×]            │
│   ⚠ PNG quality is ignored — convert to WebP?  [Do it]│
├───────────────────────────────────────────────────────┤
│  Preset: [ Web ][ Email ][ Social ][ Archive ][Custom]│
│  Output format:  ( Keep ) ( JPEG ) ( PNG ) (•WebP )   │
│  Mode:  (•) Quality   ( ) Target size                 │
│    Quality [────●──] 80   |   Target [ 200 ] KB       │
│  Resize longest edge: [ 1920 ▾ ]  ( Don't resize )    │
│  [x] Strip metadata (EXIF/GPS)                        │
│  [x] Keep original if compression makes it bigger     │
│              [ Compress 3 Images ]                    │
├───────────────────────────────────────────────────────┤
│  Compressing 2 of 3 ▓▓▓▓▓▓░░░░ 64%        [ Cancel ]  │
├───────────────────────────────────────────────────────┤
│  Saved 9.8 MB of 12.4 MB (−79%)     [Download ZIP]    │
│  P1.png → P1.webp                                     │
│    4.55 MB → 512 KB (−89%)  2400×1600 → 1920×1280     │
│    [Compare ▾] [Download]                             │
│    ┌──────────── before | after ───────────┐          │
│    │        draggable comparison           │          │
│    └───────────────────────────────────────┘          │
│  P2.jpg  ✕ Failed — unsupported colour profile [Retry]│
└───────────────────────────────────────────────────────┘
```

---

## Component State

### Current

```typescript
interface CompressionResult {
  file: File;
  originalSize: number;
  compressedBlob: Blob;
  compressedSize: number;
  compressionRatio: number;
  previewUrl: string;
}

state: {
  files: File[];
  quality: number;       // 0.1 to 1.0
  results: CompressionResult[];
  isProcessing: boolean;
  error: string | null;
  showPreviews: Record<number, boolean>;
}
```

### Target (post-enhancement)

```typescript
type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
type CompressMode = 'quality' | 'targetSize';
type ItemStatus = 'queued' | 'processing' | 'done' | 'failed' | 'skipped';

interface CompressSettings {
  mode: CompressMode;
  quality: number;              // 0.01–1.00
  targetSizeKB: number;         // used when mode === 'targetSize'
  format: OutputFormat;
  maxDimension: number | null;  // null === don't resize
  stripMetadata: boolean;       // inverse of preserveExif
  neverLarger: boolean;         // fall back to the original file
}

interface QueueItem {
  id: string;                   // stable key; replaces array-index keys
  file: File;
  originalUrl: string;          // created once, revoked on remove/unmount
  width?: number;
  height?: number;
  isAnimatedGif?: boolean;
  overrides?: Partial<CompressSettings>;  // Phase 2 per-file settings
}

interface CompressionResult {
  id: string;                   // matches QueueItem.id
  status: ItemStatus;
  outputName: string;           // extension derived from the real output MIME
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  outputWidth?: number;
  outputHeight?: number;
  compressedBlob?: Blob;
  compressedUrl?: string;       // revoked with the item
  progress: number;             // 0–100, from onProgress
  error?: string;
}

state: {
  items: QueueItem[];
  settings: CompressSettings;
  activePreset: string | null;
  results: Record<string, CompressionResult>;
  isProcessing: boolean;
  isDragging: boolean;
  abortRef: AbortController | null;
  expanded: Record<string, boolean>;   // comparison view open
  error: string | null;
}
```

---

## Implementation Notes

- **Format support detection:** probe once on mount with a 1×1 canvas —
  `canvas.toDataURL('image/webp').startsWith('data:image/webp')` (same for AVIF).
  Only offer formats that actually encode; otherwise the browser silently falls back
  to PNG and the output balloons.
- **Extension correctness:** always rename from the resulting `Blob.type`, never from
  the source filename, or a converted file downloads as `photo.png` containing WebP.
- **Target-size mode:** `maxSizeMB` makes the library iterate internally; keep
  `initialQuality` as the starting guess and show the achieved size, since the target
  is best-effort and not guaranteed for very small targets on large images.
- **`alwaysKeepResolution: true`** should accompany "Don't resize" so the library
  doesn't reduce dimensions on its own while chasing a size target.
- **Cancellation:** the library accepts an abort `signal`; on cancel, keep completed
  results and mark the rest `queued` rather than discarding the batch.
- **Memory:** with large batches, revoke each compressed URL as soon as its row is
  collapsed and the ZIP has been generated; hold `Blob`s, not data URLs.
- Everything stays **client-side** — no network calls are introduced by any
  enhancement above (the optional PNG quantiser is a bundled WASM asset, not a
  service).

---

## How to Use Content (for SEO section)

1. Drop your images onto the upload area, or click to browse (you can also paste a
   screenshot directly)
2. Pick an output format — converting PNG screenshots to WebP gives the biggest
   savings
3. Choose a quality level, or switch to target-size mode and type the size you need
4. Set whether to resize large images, then click "Compress Images"
5. Compare before and after, then download files individually or all as a ZIP

---

## About Content (for SEO section)

Our free image compressor reduces JPG, PNG, and WebP file sizes directly in your
browser. No files are uploaded to any server — compression happens locally on your
device. Choose a quality level or a target file size, optionally convert to a more
efficient format like WebP, resize oversized photos, and strip camera metadata before
you share. Perfect for optimizing images for websites, email attachments, or social
media.

---

## Definition of Done for the Enhancement

1. Component updated → `src/components/tools/ImageCompressor/index.tsx`
2. Registry entry unchanged (slug and category stay the same) →
   `src/lib/constants/tools.ts`
3. **`TOOL_CONTENT['image-compressor']` rewritten** to describe the new controls
   accurately → `src/lib/content/tool-content.ts`. The existing entry describes only
   a quality slider; leaving it stale would reintroduce the thin/inaccurate content
   problem. In particular, do not claim PNG quality control unless PNG quantisation
   actually ships.
4. `npm run validate:content` and `npm run type-check` pass; `npm run build` before
   merging.
