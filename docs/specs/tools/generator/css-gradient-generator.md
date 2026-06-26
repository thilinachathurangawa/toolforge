# Spec — CSS Gradient Generator

- **Slug:** `css-gradient-generator`
- **Component:** `src/components/tools/CssGradientGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `Blend`

## What it does
Pure React state that builds a CSS `background` gradient string from interactive
color stops. No external libraries.

## Inputs / controls
- Gradient type: Linear / Radial / Conic.
- Angle slider 0–360° (linear + conic; for radial a shape select
  circle/ellipse).
- Color stops list: each has a color picker + position (0–100%). Add stop,
  remove stop, edit position. (Position edited via number/range input — honest:
  "drag to reposition" only if implemented; implement a range slider per stop.)
- Live large preview box showing the gradient full-bleed.

## Outputs
- Read-only code block (JetBrains Mono) with the full `background:` declaration.
- One-click **Copy CSS**.

## Privacy / network
Fully client-side, no network.

## SEO
- Keywords: "CSS background gradient generator", "linear gradient maker", "copy
  gradient CSS code", "radial gradient CSS", "conic gradient generator".

## Related tools
`box-shadow-generator`, `color-palette-generator`, `color-converter`.
