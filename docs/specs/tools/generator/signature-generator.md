# Spec — Signature Generator

- **Slug:** `signature-generator`
- **Component:** `src/components/tools/SignatureGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `PenTool`

## What it does
Two modes for producing a transparent-PNG signature.

### Draw mode
Native HTML5 `<canvas>` + pointer events (mouse + touch). Track coordinates and
`ctx.lineTo` with rounded line joins for smooth strokes.
- Controls: pen color, pen thickness slider, **Clear** button.

### Type mode
Text input rendered in a cursive web font. Bundle the fonts locally or via
`next/font/google` (Dancing Script, Caveat, Sacramento) — must work offline;
if Google Fonts can't be self-hosted, fall back to a system cursive and say so.
- Controls: font select, font size, color.

## Outputs
- **Download transparent PNG** (canvas exported with alpha; type mode rendered
  onto an offscreen canvas at export time).

## Privacy / network
Drawing and export are fully client-side. Note any web-font loading honestly in
content (fonts loaded for display only; the signature image is generated
locally).

## SEO
- Keywords: "draw signature online", "digital signature maker", "transparent
  signature PNG", "type signature font", "free signature generator".

## Related tools
`image-metadata-remover`, `favicon-generator`, `image-converter`.
