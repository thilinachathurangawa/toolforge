# SPEC: PDF to Image Converter

**File:** `docs/specs/tools/image/PDF_TO_IMAGE.md`
**Status:** Planned
**Slug:** `pdf-to-image`
**Category:** image

---

## SEO

- **Title:** `PDF to Image Converter — Convert PDF to JPG & PNG Free | ToolForge`
- **Description:** `Convert PDF pages to high-resolution JPG or PNG images free. Preview every page, pick the ones you want, and download all as a ZIP. Runs in your browser — no upload.`
- **Primary Keyword:** PDF to image converter
- **Secondary Keywords:** convert PDF to JPG online, PDF to PNG high resolution, extract images from PDF, PDF page to image

---

## Functional Requirements

- [ ] Single PDF upload via drag & drop or picker
- [ ] Render every page to a `<canvas>` with `pdfjs-dist` and show a thumbnail grid
- [ ] Output format toggle: JPG or PNG
- [ ] Quality / scale control (render scale e.g. 1×, 2×, 3× for higher resolution)
- [ ] Per-page selection checkboxes (select/deselect all)
- [ ] Download a single page image, or "Download Selected (.zip)" via jszip
- [ ] Show page count and a progress indicator while rendering
- [ ] 100% client-side; pdf.js worker bundled locally (no external CDN)

---

## Library

```bash
npm install pdfjs-dist jszip
```

Set the worker from the installed package (no external CDN), e.g.
`GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url'))…`
or use the bundled `legacy` build. Dynamically import on the client only.

---

## UI Layout

```
┌──────────────────────────────────────┐
│  [Drop a PDF here or click]          │
├──────────────────────────────────────┤
│  Format: (•)JPG ( )PNG  Scale:[2x ▼] │
│  Rendering page 4 / 12 …             │
├──────────────────────────────────────┤
│  [✓]Pg1  [✓]Pg2  [ ]Pg3  [✓]Pg4 …   │  ← thumbnail grid
│  (Select all) (Clear)                │
├──────────────────────────────────────┤
│  [Download Selected (.zip)]          │
└──────────────────────────────────────┘
```

---

## Component State

```typescript
type OutFormat = 'image/jpeg' | 'image/png';
interface PageImg { page: number; url: string; blob: Blob; selected: boolean; }
state: {
  file: File | null;
  format: OutFormat;
  scale: number;          // 1 | 2 | 3
  pages: PageImg[];
  isRendering: boolean;
  progress: { current: number; total: number };
  error: string | null;
}
```

Render: `getDocument({data})` → for each page `page.getViewport({scale})`, size a
canvas, `page.render({canvasContext, viewport})`, then `canvas.toBlob(format, 0.92)`.

---

## How to Use Content (for SEO section)

1. Upload the PDF you want to turn into images
2. Choose JPG or PNG and a render scale (higher = sharper, larger files)
3. Wait while each page renders into the preview grid
4. Tick the pages you want, then download one page or all selected as a ZIP

---

## About Content (for SEO section)

Extract every page of a PDF as a high-resolution JPG or PNG — useful for pulling a
figure out of a report, posting a page as an image, or archiving a document
visually. Each page is rendered with Mozilla's PDF.js (`pdfjs-dist`) onto a canvas
right in your browser, and the worker is bundled locally, so your PDF is never
uploaded anywhere.
