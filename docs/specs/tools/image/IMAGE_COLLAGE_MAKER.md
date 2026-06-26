# SPEC: Image Collage Maker

**File:** `docs/specs/tools/image/IMAGE_COLLAGE_MAKER.md`
**Status:** Planned
**Slug:** `image-collage-maker`
**Category:** image

---

## SEO

- **Title:** `Collage Maker — Free Photo Collage Maker Without Watermark | ToolForge`
- **Description:** `Make a photo collage free with no watermark. Pick a grid layout, drop your photos into the slots, adjust border thickness and color, and export to PNG or JPG. Runs in your browser.`
- **Primary Keyword:** photo collage maker
- **Secondary Keywords:** free collage maker without watermark, combine photos side by side, picture grid generator, photo grid maker

---

## Functional Requirements

- [ ] Layout picker with predefined grids, e.g. 1×2, 2×1, 2×2, 1×3, 3×1, 3×3,
      and an uneven "1 large + 2 small" split
- [ ] Each layout slot accepts an image via click-to-upload or drag & drop
- [ ] Each cell renders with `cover` scaling (fills the cell, center-cropped)
- [ ] Output canvas size control (e.g. square 1080, landscape 1350×1080, portrait 1080×1350)
- [ ] Border thickness slider (0–60 px) applied as gaps + outer margin
- [ ] Border color picker (default white)
- [ ] Live `<canvas>` preview
- [ ] Export to PNG and JPG (no watermark)
- [ ] 100% client-side

---

## Library

Native HTML5 `<canvas>`. No external libs required.

---

## UI Layout

```
┌──────────────────────────────────────┐
│ Layout: [▦2x2][▤1x3][▥3x3][⬓uneven]  │
│ Canvas: [Square ▼]                   │
│ Border: [===|----] 12px  Color [■]   │
├──────────────────────────────────────┤
│   Preview (canvas)                   │
│   ┌────┬────┐   click a cell to      │
│   │ A  │ B  │   add / replace photo  │
│   ├────┼────┤                        │
│   │ C  │ D  │                        │
│   └────┴────┘                        │
├──────────────────────────────────────┤
│  [Download PNG]   [Download JPG]     │
└──────────────────────────────────────┘
```

---

## Component State

```typescript
interface Cell { x: number; y: number; w: number; h: number; } // fractions 0..1
interface Layout { id: string; label: string; cells: Cell[]; }
state: {
  layout: Layout;
  canvasSize: { w: number; h: number };
  slots: (HTMLImageElement | null)[]; // index-aligned with layout.cells
  border: number;        // px
  borderColor: string;
  activeSlot: number | null;
}
```

Render: fill canvas with `borderColor`; for each cell compute inset rect by
`border/2` gap; draw that slot's image with cover-fit (scale `max`, center,
clipped to the cell rect).

---

## How to Use Content (for SEO section)

1. Choose a grid layout — 2×2, 1×3, 3×3 or an uneven split
2. Click each cell (or drag a photo onto it) to fill the collage
3. Pick the output shape — square, landscape or portrait
4. Adjust border thickness and color to frame the photos
5. Download the finished collage as PNG or JPG, watermark-free

---

## About Content (for SEO section)

A free collage maker that combines several photos into one image without slapping
a watermark across your work. Pick a grid, drop photos into each slot, and tune
the border thickness and color, then export a clean PNG or JPG. The whole collage
is composited on a `<canvas>` in your browser, so your photos are never uploaded.
