# SPEC: Image Splitter (Grid Slicer)

**File:** `docs/specs/tools/image/IMAGE_SPLITTER.md`
**Status:** Planned
**Slug:** `image-splitter`
**Category:** image

---

## SEO

- **Title:** `Image Splitter — Cut Image Into Grid for Instagram | ToolForge`
- **Description:** `Split an image into a grid online free. Make a seamless Instagram carousel (3×1) or a 3×3 profile grid takeover, then download the numbered pieces as a ZIP. Runs in your browser.`
- **Primary Keyword:** image splitter
- **Secondary Keywords:** Instagram carousel maker, split image into grid online, cut picture into 9 pieces, seamless swipe post generator

---

## Functional Requirements

- [ ] Upload one image (JPG, PNG, WebP)
- [ ] Columns input and Rows input (1–10 each)
- [ ] Quick presets: 3×1 (carousel), 1×3, 3×3 (grid takeover), 2×2
- [ ] Live preview of the source image with overlaid grid lines showing the cuts
- [ ] Slice on a `<canvas>`: each piece = `floor(width/cols) × floor(height/rows)`
- [ ] Output format toggle: JPG or PNG
- [ ] Download all pieces as a `.zip` with sequential names (`part_1.jpg`, `part_2.jpg`, …)
- [ ] Naming order is left-to-right, top-to-bottom (Instagram posting order)
- [ ] Note shown: for a seamless feed, post pieces in the numbered order
- [ ] 100% client-side

---

## Library

```bash
npm install jszip
```

Native HTML5 `<canvas>` for slicing.

---

## UI Layout

```
┌──────────────────────────────────────┐
│  [Upload image]                      │
├──────────────────────────────────────┤
│  Presets: [3×1][1×3][3×3][2×2]       │
│  Columns: [3]   Rows: [3]            │
├──────────────────────────────────────┤
│  Preview with grid overlay           │
│   ┌──┬──┬──┐                         │
│   ├──┼──┼──┤   9 pieces              │
│   ├──┼──┼──┤   each ≈ 360×360        │
│   └──┴──┴──┘                         │
├──────────────────────────────────────┤
│  Format: (•)JPG ( )PNG               │
│  [Download pieces (.zip)]            │
└──────────────────────────────────────┘
```

---

## Component State

```typescript
type OutFormat = 'image/jpeg' | 'image/png';
state: {
  file: File | null;
  imgEl: HTMLImageElement | null;
  cols: number;          // 1–10
  rows: number;          // 1–10
  format: OutFormat;
  isProcessing: boolean;
  error: string | null;
}
```

Slice: pieceW = floor(iw/cols), pieceH = floor(ih/rows). For r,c draw
`ctx.drawImage(img, c*pieceW, r*pieceH, pieceW, pieceH, 0,0, pieceW,pieceH)` on a
pieceW×pieceH canvas → toBlob → add to zip as `part_${r*cols+c+1}`.

---

## How to Use Content (for SEO section)

1. Upload the image you want to slice
2. Pick a preset (3×1 carousel, 3×3 grid) or set your own columns and rows
3. Check the grid overlay to confirm where the cuts land
4. Choose JPG or PNG and download the numbered pieces as a ZIP
5. Post the pieces in numbered order for a seamless feed

---

## About Content (for SEO section)

Split a single image into a neat grid of numbered tiles — the trick behind
seamless Instagram carousels and 3×3 profile "grid takeovers." Set the columns and
rows (or pick a preset), preview exactly where the cuts fall, then download every
piece as `part_1`, `part_2`, … in posting order. All slicing happens on a
`<canvas>` in your browser; nothing is uploaded.
