# SPEC: Image to Text (OCR) Tool
**File:** `docs/specs/tools/text/IMAGE_TO_TEXT.md`
**Status:** Completed
**Slug:** `image-to-text`
**Category:** text

---

## SEO

- **Title:** `Image to Text Converter — Free Online OCR Tool | ToolForge`
- **Description:** `Extract text from images with OCR, right in your browser. Upload a photo, screenshot, or scan and download the recognized text as a .txt file. Nothing is uploaded.`
- **Primary Keyword:** image to text converter
- **Secondary Keywords:** OCR online, extract text from image, photo to text, picture to text converter

---

## Scope Decision (read first)

The original request asked to extract text "with all the styles." That is **out of
scope by design**:

- A `.txt` file cannot represent styles (bold, fonts, colors, sizes) at all.
- Client-side OCR (Tesseract) does not reliably detect styling — font family,
  color, and size are not recognized; bold/italic detection is inaccurate.
  Shipping it would mean describing a feature that doesn't really work, which
  violates the content accuracy rules in `CLAUDE.md`.

What **is** preserved: line breaks, paragraph grouping, and reading order, using
Tesseract's block/line structure. The content entry must be honest about this —
say "preserves line breaks and paragraph layout," never "preserves formatting/styles."

Possible v2 (separate spec if pursued): `.html` export approximating relative
text sizes from bounding-box heights.

---

## Functional Requirements

- [ ] Image input via file picker, drag-and-drop, and paste from clipboard (Ctrl+V)
- [ ] Accepted formats: PNG, JPG/JPEG, WebP, BMP (validate MIME type; reject others with a clear message)
- [ ] Preview of the selected image before/while recognizing
- [ ] "Extract Text" runs Tesseract.js **entirely in the browser** — the image never leaves the device
- [ ] Progress indicator during recognition (Tesseract reports progress 0–1; first run also downloads the ~10–15 MB engine + language data, so show a "loading OCR engine" stage)
- [ ] Language selector — English default; include a small curated set (e.g. English, Spanish, French, German, Portuguese, Italian, Hindi, Chinese Simplified); each language downloads its own traineddata on first use
- [ ] Output shown in an editable textarea, preserving line breaks and paragraph spacing from Tesseract's block structure
- [ ] Overall confidence score displayed (e.g. "Confidence: 87%") with a hint to try a sharper image when low
- [ ] Copy to clipboard button
- [ ] Download as `.txt` (Blob + object URL, filename derived from image name, e.g. `receipt.png` → `receipt.txt`)
- [ ] Clear/reset button (also terminates the Tesseract worker)
- [ ] Graceful error states: unreadable image, recognition failure, empty result ("No text found")
- [ ] Terminate the worker on component unmount (no leaked WASM workers)

---

## Library

`tesseract.js` (Apache-2.0) — WASM OCR engine, runs fully client-side.

- Load the tool component with the existing dynamic-import pattern so the
  library isn't in the shared bundle.
- Create the worker lazily on first "Extract Text" click, not on page load.
- Engine core + language data (~10–15 MB total) is fetched on first use and
  cached by the browser thereafter.

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │   Drop an image here, paste,      │  │
│  │   or click to browse              │  │
│  │   PNG · JPG · WebP · BMP          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Language: [English ▾]                  │
│                                         │
│  [Extract Text]          [Clear]        │
│                                         │
│  ▓▓▓▓▓▓▓▓░░░░░░  Recognizing… 54%       │
├─────────────────────────────────────────┤
│  ┌────────────────┐ ┌────────────────┐  │
│  │                │ │ Extracted text │  │
│  │  image         │ │ (editable)     │  │
│  │  preview       │ │                │  │
│  │                │ │                │  │
│  └────────────────┘ └────────────────┘  │
│                                         │
│  Confidence: 87%                        │
│                                         │
│  [Copy Text]   [Download .txt]          │
└─────────────────────────────────────────┘
```

Two-column preview/output on desktop, stacked on mobile.

---

## Component State

```typescript
type OcrStatus =
  | 'idle'          // no image selected
  | 'ready'         // image selected, not yet recognized
  | 'loading'       // downloading engine / language data
  | 'recognizing'   // OCR in progress
  | 'done'
  | 'error';

state: {
  file: File | null;
  previewUrl: string | null;   // object URL, revoked on change/unmount
  language: string;            // Tesseract lang code, default 'eng'
  status: OcrStatus;
  progress: number;            // 0–100, from Tesseract logger
  text: string;                // editable output
  confidence: number | null;   // 0–100 overall confidence
  error: string | null;
}
```

Recognition detail: build the output string from Tesseract's result blocks/
paragraphs/lines (double newline between paragraphs, single between lines)
rather than relying only on the flat `data.text`, so paragraph layout survives.

---

## How to Use Content (for SEO section)

1. Drop an image onto the upload area, paste a screenshot with Ctrl+V, or click to browse for a PNG, JPG, WebP, or BMP file
2. Pick the language of the text in the image (English is preselected)
3. Click Extract Text and watch the progress bar — the first run downloads the OCR engine, later runs start immediately
4. Review and edit the recognized text in the output box; the confidence score hints at how accurate the result is
5. Copy the text to your clipboard or download it as a .txt file

---

## About Content (for SEO section)

Turn screenshots, scanned documents, receipts, and photos of printed text into
editable text without installing anything. This converter runs the Tesseract
OCR engine directly in your browser through WebAssembly, so the image is
processed on your own device and never uploaded to a server. It keeps line
breaks and paragraph layout intact, shows a confidence score for the
recognition, and lets you fix any misread words before copying the result or
saving it as a plain text file. Works best on sharp, well-lit images of printed
text; handwriting and heavily stylized fonts reduce accuracy. Note: output is
plain text — visual styling like bold, fonts, and colors is not carried over,
because a .txt file cannot represent it and OCR cannot reliably detect it.

---

## Definition of Done (per CLAUDE.md)

1. Component → `src/components/tools/ImageToText/index.tsx`
2. Register in `TOOLS` → `src/lib/constants/tools.ts` (category `text`, slug `image-to-text`)
3. Dynamic import keyed by slug → `src/app/tools/[slug]/page.tsx`
4. `TOOL_CONTENT['image-to-text']` entry (intro, steps, why, faqs, related) → `src/lib/content/tool-content.ts`
5. `npm install tesseract.js`
6. `npm run validate:content` + `npm run type-check` + `npm run build`
