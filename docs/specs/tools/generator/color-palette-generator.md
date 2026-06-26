# Spec — Color Palette Generator

- **Slug:** `color-palette-generator` (distinct from existing `color-palette`,
  which *extracts* colors from an image)
- **Component:** `src/components/tools/ColorPaletteGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `Swatch` (fallback `Palette`)

## What it does
Generates a harmonious color scheme from a single base hex using color-theory
math in HSL space. No external libraries.

## Harmony rules
- Complementary (+180°)
- Analogous (±30°)
- Triadic (±120°)
- Split-Complementary (+150°, +210°)
- Monochromatic (same hue, varied lightness)

## Inputs / controls
- Hex text input + native color picker for the base color.
- Buttons to switch harmony rule.

## Outputs
- Grid of swatches. Each swatch shows HEX and on click copies; small buttons /
  menu to copy HEX, RGB, or HSL of that swatch.

## Privacy / network
Fully client-side, pure JS HSL math.

## SEO
- Keywords: "color scheme generator", "website color palette maker", "triadic
  color calculator", "complementary colors", "analogous color palette".

## Related tools
`color-converter`, `color-palette` (extractor), `css-gradient-generator`.
