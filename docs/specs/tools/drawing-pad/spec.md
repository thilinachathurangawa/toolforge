# Doodle / Drawing Pad — Spec

## Slug
`drawing-pad`

## Category
`creative`

## Component Location
`src/components/tools/DrawingPad/index.tsx`

## Overview
Browser-based drawing canvas using HTML5 Canvas and Pointer Events API for
cross-device compatibility (mouse, touch, stylus). Provides a simple freehand
drawing tool with color, size, eraser, clear, and PNG download.

## UI Controls
**Toolbar (above canvas):**
- Color picker `<input type="color">` — default #1e1e1e
- Brush size slider: 1–40px — default 4
- Mode toggle: "Draw" | "Eraser" (eraser uses destination-out composite or white color)
- "Clear Canvas" button
- "Download PNG" button — `canvas.toDataURL('image/png')`

**Canvas:**
- Responsive width (100% of container), fixed height 500px
- Pointer events: `pointerdown`, `pointermove`, `pointerup`, `pointerleave`
- `touch-action: none` CSS to prevent page scroll on touch devices
- Smooth lines: use `lineTo` with bezier via `quadraticCurveTo` midpoints

## Core Logic
```ts
// On pointerdown: begin path, setPointerCapture
// On pointermove: if drawing → lineTo current point → stroke
// Use quadraticCurveTo for smooth curves:
//   midpoint between prev and current → draw curve from prev to mid
// Canvas 2D context settings:
//   lineWidth = brushSize
//   strokeStyle = color (or 'white' for eraser)
//   lineCap = 'round'
//   lineJoin = 'round'
//   globalCompositeOperation = erasing ? 'destination-out' : 'source-over'
```

**Download:**
```ts
const link = document.createElement('a');
link.download = 'drawing.png';
link.href = canvas.toDataURL('image/png');
link.click();
```

**Resize handling:**
- Canvas element sized via CSS, but canvas buffer dimensions set explicitly
- On window resize: redraw is NOT triggered (avoids clearing); warn user if needed

## TypeScript Interfaces
```ts
interface DrawState {
  isDrawing: boolean;
  color: string;
  brushSize: number;
  mode: 'draw' | 'erase';
  lastPoint: { x: number; y: number } | null;
}
```

## Coordinate Correction
```ts
function getCanvasCoords(e: PointerEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}
```

## SEO Keywords
- "free online drawing pad"
- "browser doodle canvas"
- "quick sketch tool online"
- "draw online without download"
- "digital drawing pad browser"

## Content Outline
**Intro:** Quick browser sketching without software installs; use cases (quick diagrams,
teaching, wireframes, fun doodles).
**Steps:** Choose color → set brush size → draw on canvas → erase mistakes → download PNG.
**Why:** Works on touch/stylus/mouse; no software install; smooth lines via midpoint algorithm.
**FAQs:** Can I use this on a tablet, is the canvas saved, what resolution is the PNG,
can I undo strokes.
**Related:** pixel-art-maker, ascii-art-generator, meme-generator
