# Spec — Favicon Generator

- **Slug:** `favicon-generator`
- **Component:** `src/components/tools/FaviconGenerator/index.tsx`
- **Category:** `generator`
- **Icon:** `AppWindow`

## What it does
Takes an uploaded raster image (PNG/JPG/WebP) and rescales it on a native HTML5
`<canvas>` into the standard favicon sizes: 16×16, 32×32, 48×48, 180×180 (Apple
touch), 192×192 and 512×512 (PWA/Android). Bundles all generated PNGs plus a
ready-to-paste HTML snippet into a single `.zip` using `jszip`.

## Inputs / controls
- Drag-and-drop / click upload zone (accepts `image/png`, `image/jpeg`,
  `image/webp`).
- Background toggle for preview: light vs dark checkerboard so transparency is
  visible.
- Size checklist is fixed (all standard sizes generated); each size shown in a
  preview grid.

## Outputs
- Live preview grid of every size against light + dark backgrounds.
- **Download All (.zip)** — all PNG sizes + `favicon-snippet.html` link tags.
- Per-size individual PNG download.
- A 32×32 PNG renamed `favicon.png` (true multi-resolution `.ico` is out of
  scope client-side; we ship PNG favicons, which all modern browsers support,
  and say so honestly in the content — do **not** claim a real `.ico`).

## Privacy / network
Fully client-side. The image is read with `FileReader`, drawn to canvas, and
never leaves the browser.

## SEO
- Keywords: "favicon generator online", "convert image to favicon", "create
  website icon", "favicon 16x16 32x32", "apple touch icon generator".
- FAQ topics: standard favicon sizes for modern web + iOS, why PNG favicons are
  fine today, how to install the favicon (the `<link>` tags), transparency.

## Related tools
`image-resizer`, `image-converter`, `image-compressor`.
