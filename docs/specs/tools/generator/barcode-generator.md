# Spec — Barcode Generator

- **Slug:** `barcode-generator`
- **Component:** `src/components/tools/BarcodeGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `Barcode`

## What it does
Renders a 1D barcode from a data string using the client-side `jsbarcode`
library, drawn onto an SVG/canvas element. Supports the common retail and
logistics symbologies.

## Inputs / controls
- Text input for the data string.
- Format dropdown: CODE128, CODE39, EAN-13, EAN-8, UPC (UPC-A), ITF-14, ITF,
  MSI, Pharmacode, Codabar.
- Sliders: bar width (1–4), height (20–200 px), margin (0–40 px).
- Color pickers: line/bar color and background color.
- Toggle: show/hide the human-readable text under the bars.

## Outputs
- Live rendered barcode.
- **Download PNG** (rasterize the SVG/canvas to a PNG blob).
- Validation message when the data is invalid for the chosen symbology (e.g.
  EAN-13 needs 12–13 digits) — surfaced from jsbarcode's `valid` callback.

## Privacy / network
Fully client-side; jsbarcode runs in-browser, nothing uploaded.

## SEO
- Keywords: "free barcode generator", "create EAN-13 barcode online", "UPC
  maker", "CODE128 generator", "barcode to PNG".
- Content section: difference between CODE128 (alphanumeric, variable length,
  internal use) and UPC/EAN (fixed-length numeric retail GTINs).

## Related tools
`qr-generator`, `uuid-generator`.
