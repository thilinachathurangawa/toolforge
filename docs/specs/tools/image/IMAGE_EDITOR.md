# SPEC: Image Editor (Pro)

**File:** `docs/specs/tools/image/IMAGE_EDITOR.md`
**Status:** Phase 1 (MVP) shipped — see Scope & Phasing for P2/P3
**Slug:** `image-editor`
**Category:** image
**Icon:** `Layers`

---

## SEO

- **Title:** `Free Online Image Editor — Edit Photos in Your Browser | ToolForge`
- **Description:** `Edit photos online free — layers, crop, text, shapes, brushes, filters and adjustments in a full-featured, Photoshop-style editor. 100% client-side, nothing is ever uploaded.`
- **Primary Keyword:** free online image editor
- **Secondary Keywords:** photo editor online, edit image in browser, online photoshop alternative, layer based image editor, free canva alternative

---

## Scope & Phasing

The requested feature set (full layer stack with masks, WebGL filter pipeline,
AI background removal, PDF/TIFF/ICO export, perspective transform, project
files, etc.) is the scope of a professional desktop editor, not a single PR.
This spec is written as **one tool, delivered in three phases**, so Phase 1
ships a genuinely useful, fully-working editor rather than a pile of partial
stubs. Later phases extend the same component/store — nothing in Phase 1 is
thrown away.

| Phase | Theme | Ships |
|---|---|---|
| **P1 — MVP editor** | Core raster editing | Import, canvas/zoom/pan, single flat layer stack (add/reorder/opacity/blend/lock/hide/delete/duplicate/merge/flatten — no masks yet), selection (rect/ellipse/lasso/magic wand), crop (free + ratio + social presets), transform (move/scale/rotate/skew/flip), brush/eraser/bucket/gradient/eyedropper, text tool, basic shapes, adjustments (brightness/contrast/exposure/saturation/hue/temperature/sharpen), filters (grayscale/sepia/blur/pixelate/invert/vignette/noise + more, CSS/Canvas-filter based), undo/redo history, export (PNG/JPG/WEBP + quality & resize), autosave to `IndexedDB`, keyboard shortcuts, responsive layout, dark/light mode. |
| **P2 — Advanced editing** | Pro-level control | Layer masks & clipping masks, layer groups, guides/rulers/grid/snap, polygon lasso & quick selection refinement, feather/expand/contract selection, perspective crop & perspective/distort transform, curved/vertical text, custom SVG shape import, gradient/pattern fill layers, additional filters (oil paint, edge detect, emboss, HDR, cartoon/sketch/watercolor via convolution kernels), clarity/dehaze/vibrance/highlights-shadows curves, project save/open as JSON (`.tfimg`), recent files list, paste-from-clipboard, open-by-URL, TIFF/ICO/PDF export, Web Worker off-loading for heavy filters. |
| **P3 — AI & GPU** | Differentiators | Client-side AI background removal (on-demand ONNX/TFJS segmentation model, lazy-loaded, never uploads the image), WebGL-accelerated filter pipeline for large images, brush pressure via Pointer Events, object snapping/alignment/distribution guides, SVG export of vector layers. |

This document specs **P1 in full implementation detail** (this is what gets
built first and is the `Definition of Done` for the initial release) and
specs **P2/P3 at requirements level** so the architecture below doesn't need
to be reworked when they land. Every checkbox below is tagged `[P1]`, `[P2]`
or `[P3]`.

**Explicitly deferred, not silently dropped:** true AI-model background
removal (`[P3]`) — Phase 1 ships manual cutout tools (magic wand + color-range
select + eraser + transparent/solid/gradient background swap), which covers
the common "remove a flat-color background" case without shipping a
10–80&nbsp;MB model on a tool that must stay lightweight.

---

## Functional Requirements

### File I/O
- [P1] Drag & drop image upload onto the canvas/empty state
- [P1] Click-to-browse file picker
- [P1] Decode PNG, JPG/JPEG, WEBP, GIF (first frame), BMP, SVG, ICO, AVIF via native `<img>`/`createImageBitmap` (all decode natively in current Chrome/Edge/Firefox)
- [P1] Decode HEIC/HEIF via the existing `heic2any` dependency (already used by `heic-to-jpg-png`)
- [P2] Decode TIFF via `utif` (no native browser support)
- [P1] Paste image from clipboard (`ClipboardEvent`/`navigator.clipboard.read`)
- [P2] Open image by URL (fetches the URL client-side into an `<img>`; CORS-restricted images show a clear error — this is a browser limitation, not a bug)
- [P1] Autosave current session (canvas JSON + thumbnail) to `IndexedDB`, restored on reload with a "Restore session?" prompt
- [P2] Recent files list (thumbnails from `IndexedDB`, last 10 sessions)

### Canvas & Navigation
- [P1] Zoom: fit-to-screen, 100%, 200%, 400%, custom (`Ctrl+scroll` / toolbar input, 10–1600%)
- [P1] Pan (space+drag, middle-mouse-drag, trackpad two-finger)
- [P1] Checkerboard transparency background
- [P2] Rulers (px, toggleable)
- [P2] Grid overlay + snap-to-grid
- [P2] Snap-to-object alignment guides (edges/centers, magenta guide lines like Figma/Canva)
- [P1] Canvas resize / new document size dialog

### Layers
- [P1] Layer panel: add, duplicate, delete, rename (double-click), reorder via drag-and-drop
- [P1] Opacity slider per layer
- [P1] Blend modes: Normal, Multiply, Screen, Overlay, Darken, Lighten, Difference, Color-burn, Color-dodge (Fabric.js `globalCompositeOperation` per object)
- [P1] Lock / hide / show per layer
- [P1] Merge down, flatten all
- [P2] Group / ungroup layers
- [P2] Layer masks (grayscale mask on any layer)
- [P2] Clipping mask (clip layer to the layer below's alpha)

### Selection Tools
- [P1] Rectangle select, ellipse select
- [P1] Freehand lasso
- [P1] Magic wand (flood-fill by color tolerance on the active raster layer)
- [P1] Select all / deselect / invert selection
- [P2] Polygon lasso (click-to-place vertices)
- [P2] Quick selection (edge-aware flood fill, tolerance + brush-refine)
- [P2] Feather, expand, contract selection (canvas blur/morphology on the selection mask)

### Crop
- [P1] Free crop
- [P1] Fixed ratios: 1:1, 4:3, 16:9, 9:16
- [P1] Social presets: Instagram Post (1080×1080), Instagram Story (1080×1920), Facebook Cover (820×312), LinkedIn Banner (1584×396), YouTube Thumbnail (1280×720), Twitter/X Post (1600×900) — reuses the ratio/size table already defined for `social-media-image-resizer`
- [P1] Rotate-while-cropping (crop overlay rotates with the image)
- [P2] Perspective crop (4-corner warp, `Fabric.js` custom controls + matrix transform)

### Transform
- [P1] Move, scale (uniform + free), rotate, flip horizontal/flip vertical
- [P1] Free Transform (single gesture: drag corners to scale, edges to skew, handle to rotate — Fabric.js object controls)
- [P2] Skew, distort, perspective (corner-independent warp)

### Drawing Tools
- [P1] Brush, pencil, eraser, paint bucket, gradient fill, eyedropper/color picker
- [P1] Brush size, hardness (edge feather), opacity
- [P2] Airbrush, marker, calligraphy (angle-sensitive), highlighter (multiply blend) — all implemented as brush *presets* (stamp shape + spacing + blend mode) over the same brush engine, not separate tools
- [P3] Pressure sensitivity via `PointerEvent.pressure` where the input device reports it (falls back to size-by-speed when it doesn't)

### Text Tool
- [P1] Add text, rich text editing (Fabric.js `Textbox`), font family (curated web-safe + Google Fonts subset already used elsewhere on ToolForge), size, bold/italic/underline, alignment, letter spacing, line height, fill color, stroke, drop shadow, rotation
- [P2] Curved text (text-on-path via per-glyph placement along a bezier), vertical text (CJK-style column writing mode)

### Shapes
- [P1] Rectangle, rounded rectangle (corner-radius control), ellipse/circle, triangle, line, arrow, polygon, star — fill, stroke color/width
- [P2] Heart, custom SVG import as an editable vector shape

### Image Adjustments
- [P1] Brightness, contrast, exposure, saturation, hue rotate, temperature/tint, sharpen — implemented as a non-destructive per-layer adjustment stack (Canvas 2D `filter` + custom convolution for sharpen), live-previewed, baked in on export/flatten
- [P2] Gamma, highlights, shadows, whites, blacks (tone-curve style adjustments via per-channel LUTs), vibrance, clarity, dehaze

### Filters
- [P1] Grayscale, sepia, invert, blur (box), pixelate/mosaic, vignette, noise/grain
- [P2] Gaussian blur, motion blur, radial blur, posterize, emboss, edge detect, glow/bloom, oil paint, cartoon, sketch, watercolor — convolution-kernel / multi-pass canvas filters, run in a Web Worker so the UI thread doesn't block on large images
- [P3] Re-implementation of the above as WebGL fragment shaders for images above a size threshold (e.g. >4 MP), where Canvas 2D convolution becomes visibly slow

### Background Tools
- [P1] Transparent background (erase to alpha), solid color fill, gradient fill, magic-wand-based color cutout
- [P2] Pattern fill background, "replace background" (cutout mask + new background layer underneath)
- [P3] AI background removal — see [Scope & Phasing](#scope--phasing)

### Object Tools
- [P1] Duplicate, bring forward/send backward/bring to front/send to back, lock/unlock
- [P2] Align (left/center/right/top/middle/bottom) and distribute (horizontal/vertical spacing), group/ungroup arbitrary objects (distinct from layer groups above — this is "select 3 shapes, group them")

### History
- [P1] Unlimited undo/redo (bounded by an in-memory ring buffer, default 100 steps, oldest steps evicted after that to cap memory)
- [P1] History panel listing each step with a label ("Add Text", "Crop", "Brightness +12"), click a step to jump to it

### Export
- [P1] PNG (with/without transparency), JPG (quality slider 1–100), WEBP (quality slider); resize-before-export (custom W×H or scale %); filename input
- [P2] PDF (via existing `jspdf` dependency, single page sized to the canvas), BMP, ICO (multi-resolution 16/32/48/256), TIFF (via `utif`)
- [P3] SVG export — **only** for documents composed entirely of vector objects (text/shapes, no raster layers); the export button is disabled with an explanatory tooltip when a raster layer is present, since a raster layer cannot become real SVG without embedding it as a data-URI bitmap (which we do as a documented fallback, not a silent lie)
- [P2] Save Project / Open Project as a JSON scene graph (`.tfimg`) — Fabric.js `canvas.toJSON()`/`loadFromJSON()` plus our layer metadata (blend mode, lock state, opacity), restoring full editability

### Responsive UI
- [P1] Desktop layout (left tool rail + canvas + right panel tabs); tablet layout (collapsible panels); mobile layout (bottom sheet tool drawer, canvas full-width) — reuses ToolForge's existing responsive breakpoints and shadcn-ui `Sheet`/`Tabs`/`Tooltip` components
- [P1] Dark mode / light mode (inherits the site theme via existing `next-themes` provider — no separate editor theme system)
- [P1] Resizable side panels (drag handle, min/max width clamps, persisted to `localStorage`)

---

## Tech Stack & Libraries

| Concern | Choice | Notes |
|---|---|---|
| Canvas engine | **Fabric.js v6** | Object model, free-transform controls, built-in filters, JSON scene serialization, SVG export for vector objects — covers the majority of the object/layer/shape/text requirements without hand-rolling a scene graph. |
| Framework | React + Next.js (existing app), client component (`'use client'`), `ssr: false` dynamic import per the project standard | Heavy canvas/DOM APIs cannot SSR. |
| Language | TypeScript | Matches project convention. |
| Styling | Tailwind + shadcn-ui (`Tabs`, `Slider`, `Dialog`, `Sheet`, `Tooltip`, `DropdownMenu`, `ScrollArea`, `Popover`, `Button`) | Reuse, don't rebuild. |
| Editor state | Zustand store (new, local to this tool) | React context re-renders too much for a 60fps canvas UI; the store also serializes cleanly for autosave/project files. |
| Persistence | `IndexedDB` (via `idb`, new dependency) for autosave + recent files + project files | `localStorage` is too small for image bitmaps/blobs. |
| Heavy filters | Web Worker (`OffscreenCanvas` where supported, fallback to main-thread with a progress toast) | Keeps the UI thread responsive on convolution-kernel filters (P2). |
| HEIC decode | `heic2any` (already a dependency) | Already used by `heic-to-jpg-png`. |
| TIFF decode/encode | `utif` (new dependency, P2) | Pure JS, no server round-trip. |
| PDF export | `jspdf` (already a dependency) | Already used by `image-to-pdf`. |
| ICO encode | Hand-written multi-size encoder (new, small, no dependency needed — ICO is a simple documented format) | Avoids a Node-oriented package that assumes a filesystem. |
| ZIP (multi-export, if ever needed) | `jszip` (already a dependency) | Not required for P1 (single-file export only). |

```bash
npm install fabric idb utif
```

`fabric`, `idb`, and `utif` have no server-side component and add no network
calls — consistent with the "100% client-side" requirement.

---

## Architecture

```
src/components/tools/ImageEditor/
├── index.tsx                    # Mounts the editor shell, owns document lifecycle
├── EditorShell.tsx               # Layout: toolbar + tool rail + canvas + right panel
├── canvas/
│   ├── EditorCanvas.tsx          # Fabric.js canvas mount + zoom/pan/resize wiring
│   ├── useFabricCanvas.ts        # Canvas lifecycle hook
│   └── selection.ts              # Rect/ellipse/lasso/magic-wand selection math
├── toolbar/
│   ├── ToolRail.tsx              # Left icon rail: select/crop/transform/brush/text/shape tools
│   └── TopToolbar.tsx            # File menu, zoom control, undo/redo, export button
├── panels/
│   ├── LayersPanel.tsx
│   ├── PropertiesPanel.tsx       # Context-sensitive: active tool/object options
│   ├── AdjustmentsPanel.tsx
│   ├── FiltersPanel.tsx
│   ├── HistoryPanel.tsx
│   └── ExportDialog.tsx
├── tools/
│   ├── brush.ts, eraser.ts, bucket.ts, gradient.ts, eyedropper.ts
│   ├── text.ts, shapes.ts, crop.ts, transform.ts
├── filters/
│   ├── adjustments.ts            # brightness/contrast/exposure/etc. (Canvas 2D filter + LUTs)
│   ├── effects.ts                # grayscale/sepia/blur/pixelate/vignette/noise
│   └── worker/filters.worker.ts  # P2: convolution-kernel filters off the main thread
├── io/
│   ├── import.ts                 # File → decoded bitmap (incl. HEIC/TIFF branches)
│   ├── export.ts                 # Canvas → Blob (PNG/JPG/WEBP; P2: PDF/BMP/ICO/TIFF)
│   ├── project.ts                 # P2: save/open .tfimg JSON
│   └── autosave.ts               # IndexedDB session persistence
├── store/
│   └── editorStore.ts            # Zustand store: document, layers, tool, selection, history
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useHistory.ts
└── types.ts
```

---

## State (Zustand store sketch)

```typescript
interface EditorLayer {
  id: string;
  name: string;
  fabricObjectId: string;   // links to the underlying Fabric.js object/group
  opacity: number;          // 0-1
  blendMode: BlendMode;
  visible: boolean;
  locked: boolean;
  thumbnailUrl: string;
}

interface HistoryStep {
  id: string;
  label: string;            // "Add Text", "Crop", "Brightness +12"
  canvasJSON: object;        // Fabric.js canvas.toJSON() snapshot
}

interface EditorState {
  documentSize: { width: number; height: number };
  layers: EditorLayer[];
  activeLayerId: string | null;
  activeTool: ToolId;
  selection: SelectionMask | null;
  zoom: number;
  history: HistoryStep[];
  historyIndex: number;
  isDirty: boolean;

  addLayer(): void;
  duplicateLayer(id: string): void;
  removeLayer(id: string): void;
  reorderLayer(id: string, toIndex: number): void;
  setLayerOpacity(id: string, opacity: number): void;
  setLayerBlendMode(id: string, mode: BlendMode): void;
  toggleLayerVisibility(id: string): void;
  toggleLayerLock(id: string): void;
  mergeDown(id: string): void;
  flatten(): void;

  setTool(tool: ToolId): void;
  pushHistory(label: string): void;
  undo(): void;
  redo(): void;
}
```

History strategy: snapshot-based (`canvasJSON` per step), not operation
replay — simpler to implement correctly for a v1, at the cost of higher
memory per step. The 100-step ring buffer bounds this; large documents may
lower that cap at runtime (measured against `performance.memory` where
available).

---

## UI Layout (desktop)

```
┌───────────────────────────────────────────────────────────────────────┐
│ File  Edit  ⟲ ⟳   Zoom [Fit ▾] 100%        Image Editor      [Export] │
├────┬──────────────────────────────────────────────────────┬───────────┤
│ ▣  │                                                      │ Layers ▾  │
│ ⬭  │                                                      │ ┌───────┐ │
│ ✂  │                                                      │ │Layer 3│ │
│ ⇲  │                 CANVAS (checkerboard bg)             │ │Layer 2│ │
│ ✎  │                                                      │ │Layer 1│ │
│ T  │                                                      │ └───────┘ │
│ ▭  │                                                      ├───────────┤
│ 🪣  │                                                      │ Properties│
│ ⬈  │                                                      │ (context) │
├────┴──────────────────────────────────────────────────────┴───────────┤
│ 100%  1200×800px  RGBA          [Adjustments] [Filters] [History]     │
└───────────────────────────────────────────────────────────────────────┘
```

Mobile: tool rail collapses into a bottom `Sheet` drawer; the right panel
becomes a swipe-up sheet with `Tabs` for Layers/Properties/Adjustments/
Filters/History; the top bar keeps only zoom, undo/redo, and Export.

---

## Keyboard Shortcuts (P1)

| Action | Shortcut |
|---|---|
| Undo / Redo | `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` |
| Duplicate | `Ctrl/Cmd+D` |
| Delete | `Delete`/`Backspace` |
| Select All / Deselect | `Ctrl/Cmd+A` / `Ctrl/Cmd+D` (Escape also deselects) |
| Zoom in/out/fit/100% | `Ctrl/Cmd + +/-`, `Shift+1`, `Ctrl/Cmd+1` |
| Pan | `Space` + drag |
| Move tool / Select / Crop / Brush / Text / Eyedropper | `V` / `M` / `C` / `B` / `T` / `I` |
| Save session | `Ctrl/Cmd+S` (writes autosave; P2 opens Save Project dialog) |
| Export | `Ctrl/Cmd+E` |

All shortcuts are also exposed in a `?`-triggered shortcuts dialog, and
every tool/button carries an `aria-label` for screen readers per the
accessibility requirement.

---

## Performance Notes

- Fabric.js canvas is capped to a reasonable working resolution (long edge
  ≤ 4096px) for interactive editing; on export, transforms/filters are
  re-applied against the full-resolution source bitmap so exported quality
  isn't limited by the on-screen working size.
- Layer thumbnails are generated at a fixed small size (e.g. 64px) and
  regenerated on a debounce, not on every stroke.
- P2 convolution filters run in a Web Worker via `OffscreenCanvas`
  (`transferControlToOffscreen`), falling back to a chunked main-thread pass
  with a progress indicator on browsers without `OffscreenCanvas`.
- Object/layer count and history depth are the two unbounded-growth risks;
  both are capped (see State section) with the cap surfaced in the UI
  rather than silently dropped.

---

## Accessibility

- Full keyboard navigation of the tool rail, panels, and dialogs (`Tab`/
  `Arrow` keys, matching shadcn-ui's existing focus patterns).
- `aria-label` on every icon-only tool button and panel control.
- Respects `prefers-contrast`/the site's existing high-contrast theme.
- Canvas editing itself is inherently pointer/visual; where a screen reader
  user cannot perform a canvas gesture, the equivalent numeric input (e.g.
  rotation degrees, opacity %) is always available as a focusable field —
  no control is canvas-gesture-only.

---

## How to Use Content (draft, for SEO section)

1. Drag and drop a photo onto the canvas, or click to browse — PNG, JPG,
   WEBP, GIF, BMP, SVG, ICO, AVIF and HEIC files all open directly
2. Use the tool rail to select, crop, draw, add text or shapes, or adjust
   colors and filters from the right-hand panels
3. Manage layers — reorder, adjust opacity and blend mode, hide or lock —
   from the Layers panel
4. Undo/redo freely from the history panel while you experiment
5. Export as PNG, JPG or WEBP with a quality and resize dialog, or resume
   later — your session autosaves in the browser

---

## About / Why Content (draft, for SEO section)

A layer-based photo editor that runs entirely inside your browser tab — no
image is ever uploaded to a server, and there's no account or software
install. It combines the core of what people reach for Photoshop or Canva
for — layers, selections, crop presets sized for Instagram/Facebook/
LinkedIn/YouTube, a brush and text engine, color adjustments, and filters —
in a single tool that autosaves your session locally so a closed tab
doesn't cost you the edit.

---

## FAQs (draft)

- **Is my photo uploaded anywhere?** No. Every edit — layers, brushes,
  filters, crop — runs on your device using the Canvas API. The file never
  leaves your browser, even for the format-decoding steps (HEIC included).
- **Which file formats can I open?** PNG, JPG/JPEG, WEBP, GIF, BMP, SVG, ICO
  and AVIF open directly; HEIC/HEIF (iPhone photos) are supported via
  in-browser conversion. TIFF support ships in a later update.
- **Will I lose my work if I close the tab?** Your session autosaves to
  your browser's local storage and is offered back to you the next time you
  open the editor, until you clear site data.
- **Can it remove a background automatically?** Not yet with AI — today you
  can cut out a flat or near-flat background with the magic wand and swap
  in a transparent, solid, or gradient background. Full AI background
  removal is a planned addition.
- **Is there a file size or resolution limit?** No hard limit, but very
  large images (well beyond typical photo resolution) will edit and export
  more slowly since everything runs on your device's CPU/GPU rather than a
  server.

---

## Related Tools (draft)

- `image-cropper` — a focused single-purpose crop tool if you don't need the full editor
- `image-compressor` — compress the exported image further if file size matters
- `background-remover` *(if/when a dedicated AI cutout tool ships)* — a lighter, single-purpose alternative to the editor's manual cutout tools

---

## Definition of Done (Phase 1)

1. Component tree under `src/components/tools/ImageEditor/` per the
   Architecture section, client-side only.
2. Register `image-editor` in `TOOLS` (`src/lib/constants/tools.ts`),
   category `image`, next available phase number.
3. Wire the dynamic import in `src/app/tools/[slug]/page.tsx`.
4. Write the `TOOL_CONTENT['image-editor']` entry in
   `src/lib/content/tool-content.ts` using the drafts above as a starting
   point (expand to the 380–540 word floor, verify every claim against the
   shipped P1 feature set — do not describe P2/P3 items as already working).
5. `npm run validate:content`, `npm run type-check`, `npm run build` all pass.
6. Manual smoke test: import each P1-supported format, edit across every
   tool category listed as `[P1]` above, export PNG/JPG/WEBP, reload the
   tab and confirm the autosave restore prompt works.
