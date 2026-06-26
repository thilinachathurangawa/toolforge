# SPEC: Sprite Sheet Generator

**File:** `docs/specs/tools/image/SPRITE_SHEET_GENERATOR.md`
**Status:** Planned
**Slug:** `sprite-sheet-generator`
**Category:** image

---

## SEO

- **Title:** `Sprite Sheet Generator — CSS & Game Texture Atlas Maker | ToolForge`
- **Description:** `Combine many images into one sprite sheet (texture atlas) online free. Set max width, padding and scale, then export a PNG plus a JSON frame map. Runs in your browser.`
- **Primary Keyword:** sprite sheet generator
- **Secondary Keywords:** CSS sprite sheet generator, texture atlas maker online, combine images for game dev, sprite packer

---

## Functional Requirements

- [ ] Multi-file drag & drop upload (PNG recommended; JPG/WebP allowed)
- [ ] Max sheet width input (px) — frames wrap to a new row when the row exceeds it
- [ ] Padding input (px) between frames
- [ ] Scale factor (0.25×–2×) applied to each frame
- [ ] Pack frames left-to-right, wrapping into rows (shelf packing by row height)
- [ ] Live `<canvas>` preview of the packed sheet (transparent background for PNG)
- [ ] Export the composed sheet as PNG
- [ ] Export a JSON frame map: `{ frames: { name: { x, y, w, h } }, meta: { w, h } }`
- [ ] Both downloads triggered together (or two buttons)
- [ ] 100% client-side

---

## Library

Native HTML5 `<canvas>`. No external libs required (Blob + object URLs for the two
downloads).

---

## UI Layout

```
┌──────────────────────────────────────┐
│  [Drop sprite images here]           │
├──────────────────────────────────────┤
│  Max width: [512] px                 │
│  Padding:   [2] px                   │
│  Scale:     [1x ▼]                   │
├──────────────────────────────────────┤
│  Preview (packed atlas)              │
│   ▣ ▣ ▣ ▣                            │
│   ▣ ▣ ▣                              │
│   sheet 512 × 384 · 7 frames         │
├──────────────────────────────────────┤
│  [Download PNG]   [Download JSON]    │
└──────────────────────────────────────┘
```

---

## Component State

```typescript
interface Frame { name: string; img: HTMLImageElement; x: number; y: number; w: number; h: number; }
state: {
  files: File[];
  maxWidth: number;       // px
  padding: number;        // px
  scale: number;          // 0.25–2
  frames: Frame[];        // computed packing
  sheetSize: { w: number; h: number };
  sheetUrl: string | null;
  jsonUrl: string | null;
}
```

Packing: for each image compute `w=round(natW*scale)`, `h=round(natH*scale)`.
Walk frames placing at current x; if `x + w + padding > maxWidth` wrap to next row
(`y += rowHeight + padding`, x=0). Sheet width = max row extent, height = total.
Draw each frame at its x,y; build JSON `{frames:{[name]:{x,y,w,h}}, meta:{w,h}}`.

---

## How to Use Content (for SEO section)

1. Drop in the individual sprite images you want to pack
2. Set the maximum sheet width, padding between frames and a scale factor
3. Review the packed atlas in the live preview
4. Download the composed PNG and the matching JSON frame map

---

## About Content (for SEO section)

Game engines and CSS perform far better when many small images are packed into one
sprite sheet (texture atlas) instead of loaded separately. This generator packs
your images into rows under a maximum width with adjustable padding and scale,
then exports both the composed PNG and a JSON map giving the exact x/y/width/height
of every frame. Packing happens on a `<canvas>` in your browser — your assets are
never uploaded.
