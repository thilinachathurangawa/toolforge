# Pixel Art Maker — Spec

## Slug
`pixel-art-maker`

## Category
`creative`

## Component Location
`src/components/tools/PixelArtMaker/index.tsx`

## Overview
Interactive pixel-art editor using a 2D array of colored cells (rendered on a Canvas).
Grid sizes: 16×16, 32×32, 64×64. Tools: Pen, Fill Bucket, Eraser. Download exports
a crisp high-resolution PNG (each pixel scaled up ×8) with no anti-aliasing.

## UI Controls
**Toolbar:**
- Grid size selector: "16×16" | "32×32" | "64×64" (resets grid on change, with confirmation)
- Active tool toggle: Pen | Fill | Eraser
- Color picker `<input type="color">` — current paint color
- Palette bar: 16 preset colors (click to select as current color)
- "Clear Canvas" button
- "Download PNG" button (exports @8x scale = 128px, 256px, or 512px output)

**Canvas:**
- Rendered via HTML5 Canvas (preferred over DOM grid for performance)
- Each "pixel" is CELL_SIZE (e.g. 12px on-screen) rendered on canvas
- Grid lines drawn at 0.5px opacity for guidance
- Mouse/pointer events for drawing: mousedown + mousemove while pressed
- `imageSmoothingEnabled = false` on all contexts to keep pixels crisp

## Core Logic
```ts
// Grid state: string[][] (hex colors), initialized to 'transparent'
// or use '' / null for transparent

// Draw: grid[row][col] = currentColor on mousedown/mousemove
// Erase: grid[row][col] = '' (transparent)
// Fill bucket: flood fill BFS from clicked cell, replace matching color

// Render loop: redraw canvas from grid state on each change
function renderGrid(ctx: CanvasRenderingContext2D, grid: string[][], cellSize: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
  // Draw grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.5;
  // ...
}
```

**Download (crisp PNG):**
```ts
const EXPORT_SCALE = 8;
const exportCanvas = document.createElement('canvas');
exportCanvas.width = gridSize * EXPORT_SCALE;
exportCanvas.height = gridSize * EXPORT_SCALE;
const exportCtx = exportCanvas.getContext('2d')!;
exportCtx.imageSmoothingEnabled = false;
for (let r = 0; r < gridSize; r++) {
  for (let c = 0; c < gridSize; c++) {
    if (grid[r][c]) {
      exportCtx.fillStyle = grid[r][c];
      exportCtx.fillRect(c * EXPORT_SCALE, r * EXPORT_SCALE, EXPORT_SCALE, EXPORT_SCALE);
    }
  }
}
```

**Flood fill (BFS):**
```ts
function floodFill(grid: string[][], row: number, col: number, targetColor: string, fillColor: string): string[][] {
  if (targetColor === fillColor) return grid;
  const newGrid = grid.map(r => [...r]);
  const queue: [number, number][] = [[row, col]];
  while (queue.length) {
    const [r, c] = queue.shift()!;
    if (r < 0 || r >= newGrid.length || c < 0 || c >= newGrid[0].length) continue;
    if (newGrid[r][c] !== targetColor) continue;
    newGrid[r][c] = fillColor;
    queue.push([r-1,c],[r+1,c],[r,c-1],[r,c+1]);
  }
  return newGrid;
}
```

## TypeScript Interfaces
```ts
type GridSize = 16 | 32 | 64;
type Tool = 'pen' | 'fill' | 'eraser';

interface PixelArtState {
  gridSize: GridSize;
  grid: string[][];        // hex color string or '' for transparent
  currentColor: string;
  tool: Tool;
  isMouseDown: boolean;
}
```

## Preset Color Palette
'#000000', '#ffffff', '#ff0000', '#ff8800', '#ffff00', '#00cc00',
'#0000ff', '#8800ff', '#ff00ff', '#00ccff', '#ff6688', '#88ff66',
'#884400', '#444444', '#888888', '#cccccc'

## SEO Keywords
- "pixel art maker online"
- "8-bit drawing tool free"
- "sprite creator browser"
- "pixel art editor online free"
- "make pixel art no download"

## Content Outline
**Intro:** Retro pixel art renaissance; use cases (game sprites, icons, social media art).
**Steps:** Choose grid size → pick color → draw with Pen → fill areas → download crisp PNG.
**Why:** Crisp 8x export (no blur); flood fill for fast coloring; palette included; no install.
**FAQs:** What resolution is the download, can I make animated GIFs, what is flood fill,
how do I make pixel art for games.
**Related:** drawing-pad, ascii-art-generator, filter-effect-studio
