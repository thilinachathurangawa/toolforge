# SPEC: Social Media Image Resizer

**File:** `docs/specs/tools/image/SOCIAL_MEDIA_IMAGE_RESIZER.md`
**Status:** Planned
**Slug:** `social-media-image-resizer`
**Category:** image

---

## SEO

- **Title:** `Social Media Image Resizer — Free Instagram, Facebook, Twitter & LinkedIn Size Tool | ToolForge`
- **Description:** `Resize images to the exact size every social platform needs. Free presets for Instagram posts, stories, Facebook covers, Twitter/X headers, LinkedIn banners and more. Works in your browser — no upload.`
- **Primary Keyword:** social media image resizer
- **Secondary Keywords:** resize image for Instagram, Twitter header dimensions, Facebook cover size, LinkedIn banner size, story size resizer

---

## Functional Requirements

- [ ] Accept JPG, PNG, WebP via drag & drop or file picker (single image)
- [ ] Platform preset groups, selectable via tabs/dropdown:
  - Instagram: Square Post (1080×1080), Portrait Post (1080×1350), Story/Reel (1080×1920)
  - Facebook: Cover (820×312), Post (1200×630)
  - Twitter/X: Header (1500×500), Post (1600×900)
  - LinkedIn: Banner (1584×396), Post (1200×627)
- [ ] Real-time canvas preview of the source image inside the chosen target frame
- [ ] Fit mode: "Cover" (fill frame, crop overflow) and "Contain" (fit whole image, pad with a background color)
- [ ] Background color picker used when "Contain" leaves empty space
- [ ] Show the selected target dimensions in px
- [ ] Download PNG and Download JPG buttons (JPG quality fixed at 0.92)
- [ ] 100% client-side — canvas only, nothing uploaded

---

## Library

Native HTML5 `<canvas>`. No external libs required.

---

## UI Layout

```
┌──────────────────────────────────────┐
│  [Drop image here or click]          │
├──────────────────────────────────────┤
│  Platform: [Instagram][Facebook]...  │  ← tabs
│  Size:     [Square 1080×1080 ▼]      │
│  Fit:      (•) Cover  ( ) Contain    │
│  BG color: [#ffffff] (Contain only)  │
├──────────────────────────────────────┤
│  Preview (target frame, real ratio)  │
│   ┌────────────────┐                 │
│   │   image in box │  1080 × 1080    │
│   └────────────────┘                 │
├──────────────────────────────────────┤
│  [Download PNG]   [Download JPG]     │
└──────────────────────────────────────┘
```

---

## Component State

```typescript
type FitMode = 'cover' | 'contain';
interface Preset { platform: string; label: string; width: number; height: number; }

state: {
  file: File | null;
  imgEl: HTMLImageElement | null;
  platform: string;       // active tab
  preset: Preset;         // active size within platform
  fitMode: FitMode;
  bgColor: string;        // used for contain padding
  error: string | null;
}
```

Rendering: draw to an offscreen canvas at the preset's exact pixel size; `cover`
scales by `max(w/iw, h/ih)` and centers (cropping overflow); `contain` fills the
canvas with `bgColor` then scales by `min(...)` and centers. Download via
`canvas.toBlob('image/png')` / `('image/jpeg', 0.92)`.

---

## How to Use Content (for SEO section)

1. Upload the image you want to size for social media
2. Pick the platform tab (Instagram, Facebook, Twitter/X, LinkedIn)
3. Choose the exact placement — post, story, cover, header or banner
4. Choose Cover to fill the frame or Contain to keep the whole image with a background
5. Download as PNG or JPG at the platform's exact pixel dimensions

---

## About Content (for SEO section)

A free social media image resizer that outputs the exact pixel dimensions each
platform expects, so posts, stories, covers and headers display crisply without
awkward auto-cropping. Everything runs on a `<canvas>` in your browser — your
photo is never uploaded.
