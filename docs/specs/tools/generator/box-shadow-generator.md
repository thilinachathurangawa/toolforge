# Spec — Box Shadow Generator

- **Slug:** `box-shadow-generator`
- **Component:** `src/components/tools/BoxShadowGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `BoxSelect`

## What it does
Pure React state mapping sliders to the CSS `box-shadow` property, with a live
preview.

## Inputs / controls
- Sliders: horizontal offset (-100–100 px), vertical offset (-100–100 px), blur
  radius (0–100 px), spread radius (-50–50 px), shadow opacity (0–100%).
- Color pickers: shadow color, preview background color.
- Toggle: `inset` shadow.

## Outputs
- Real-time preview card showing the shadow against the chosen background.
- Code block + **Copy CSS** (`box-shadow: ...;`). The shadow color is emitted as
  `rgba()` combining the picked color with the opacity slider.

## Privacy / network
Fully client-side, no network.

## SEO
- Keywords: "CSS drop shadow generator", "box-shadow CSS tool", "soft UI shadow
  maker", "neumorphism shadow", "box shadow copy CSS".

## Related tools
`css-gradient-generator`, `css-grid-generator`, `color-palette-generator`.
