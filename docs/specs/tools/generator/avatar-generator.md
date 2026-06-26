# Spec — Avatar / Initials Generator

- **Slug:** `avatar-generator`
- **Component:** `src/components/tools/AvatarGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `CircleUserRound`

## What it does
Draws an initials avatar on a native HTML5 `<canvas>`: a background shape
(circle / square / squircle via rounded-rect) with 1–2 initials centered on top.

## Inputs / controls
- Name text input → auto-extracts initials (first letter of first + last word,
  uppercased; single word → first letter).
- Shape select: Circle / Square / Squircle.
- Sliders: font size, corner/border radius (for squircle/square).
- Color pickers: background color, text color.
- (Optional) preset background palette swatches.

## Outputs
- Live canvas preview (e.g. 256×256 internal, displayed scaled).
- **Download PNG** (transparent corners outside the shape).
- **Download SVG** — reconstruct an equivalent SVG string (shape + text) and
  download as `.svg`.

## Privacy / network
Fully client-side, canvas only.

## SEO
- Keywords: "initials avatar generator", "default profile picture maker",
  "generate user avatar PNG", "letter avatar", "placeholder avatar".

## Related tools
`color-palette-generator`, `favicon-generator`, `meme-generator`.
