# SPEC: Image to PDF Converter

**File:** `docs/specs/tools/image/IMAGE_TO_PDF.md`
**Status:** Planned
**Slug:** `image-to-pdf`
**Category:** image

---

## SEO

- **Title:** `Image to PDF Converter — Convert JPG & PNG to PDF Free | ToolForge`
- **Description:** `Convert JPG, PNG and WebP images into a single PDF free. Reorder pages, choose A4/Letter/Fit-to-image and margins, then download — no upload, runs in your browser.`
- **Primary Keyword:** image to PDF converter
- **Secondary Keywords:** convert JPG to PDF online, combine images into PDF, free image to PDF without upload, PNG to PDF

---

## Functional Requirements

- [ ] Multi-file upload (JPG, PNG, WebP) via drag & drop or picker
- [ ] Reorderable list of selected images (move up / move down, remove)
- [ ] Page size select: A4, Letter, Fit to Image
- [ ] Margin select: None, Small (24pt), Large (48pt)
- [ ] Orientation handled automatically per image (portrait/landscape) for A4/Letter
- [ ] Each image scaled to fit within the page content box, preserving aspect ratio, centered
- [ ] One image per PDF page, in list order
- [ ] "Generate PDF" → client-side download of a single `.pdf`
- [ ] 100% client-side using `jspdf` — nothing uploaded

---

## Library

```bash
npm install jspdf
```

---

## UI Layout

```
┌──────────────────────────────────────┐
│  [Drop images here or click]         │
├──────────────────────────────────────┤
│  Page size: [A4 ▼]  Margins: [Small ▼]│
├──────────────────────────────────────┤
│  Pages (drag-order via ▲▼):          │
│   1. photo-a.jpg     [▲][▼][✕]       │
│   2. photo-b.png     [▲][▼][✕]       │
│   3. scan-3.jpg      [▲][▼][✕]       │
├──────────────────────────────────────┤
│  [Generate PDF]                      │
└──────────────────────────────────────┘
```

---

## Component State

```typescript
type PageSize = 'a4' | 'letter' | 'fit';
type Margin = 'none' | 'small' | 'large';
interface Item { id: string; file: File; url: string; w: number; h: number; }
state: {
  items: Item[];
  pageSize: PageSize;
  margin: Margin;
  isGenerating: boolean;
  error: string | null;
}
```

Generation: read each image's natural size. For `fit`, create a page sized to the
image (pt = px). For A4/Letter, pick orientation from the image ratio, compute the
content box (page minus margins), scale by `min(boxW/iw, boxH/ih)`, center, and
`doc.addImage(dataURL, fmt, x, y, w, h)`; `doc.addPage()` between images.

---

## How to Use Content (for SEO section)

1. Upload one or more images — JPG, PNG or WebP
2. Drag the pages into the order you want using the up/down controls
3. Choose a page size (A4, Letter, or Fit to Image) and margin width
4. Click Generate PDF to build and download a single multi-page document

---

## About Content (for SEO section)

Turn a stack of photos or scans into one tidy PDF — handy for receipts, ID copies,
or sharing a set of images as a single document. Reorder the pages, pick A4,
Letter, or a page that hugs each image, and set margins. The PDF is assembled with
the `jspdf` library directly in your browser, so your images are never uploaded.
