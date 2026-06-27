# SVG to PNG Converter — Spec

## Slug
`svg-to-png`

## Category
`creative`

## Component Location
`src/components/tools/SvgToPng/index.tsx`

## Overview
Convert SVG vector files to rasterised PNG images using HTML5 Canvas.
**Component already exists.** This spec documents the built implementation for
registry wiring and content generation.

## Implemented Features (from code review)
- Multi-file SVG drag-and-drop zone
- Output settings: width/height inputs, aspect ratio lock checkbox
- Scale presets: 0.5x, 1x, 2x, 3x, 4x, Custom
- Background color: Transparent | White | Custom (color picker)
- Per-file conversion results with before/after preview toggle
- Individual download per file + Download All as ZIP (using jszip)
- Loading/error states
- File size display

## Core Logic
1. FileReader reads SVG text
2. DOMParser extracts viewBox/width/height attributes for original dimensions
3. SVG blob → `URL.createObjectURL` → `Image` load → draw on Canvas
4. `canvas.toBlob('image/png')` → preview URL + download blob
5. JSZip bundles multiple results for batch download

## Libraries Used
- `jszip` (already in package.json) for batch ZIP download

## SEO Keywords
- "convert SVG to PNG online"
- "free vector to raster image tool"
- "transparent SVG PNG converter"
- "SVG to PNG batch converter"
- "download SVG as PNG"

## Content Outline
**Intro:** When you need a raster version of a vector — emails, legacy systems, screenshots.
**Steps:** Drop SVG → choose scale/background → click Convert → download PNG or ZIP.
**Why:** Runs in browser (files not uploaded); supports batch; scale preserves vector quality;
background color control for transparent SVGs.
**FAQs:** Does scale affect quality, can I convert multiple SVGs at once, what about
SVGs with external assets, what is transparent background PNG.
**Related:** image-converter, image-compressor, ascii-art-generator
