# SPEC: Passport / ID Photo Maker

**File:** `docs/specs/tools/image/PASSPORT_PHOTO_MAKER.md`
**Status:** Planned
**Slug:** `passport-photo-maker`
**Category:** image

---

## SEO

- **Title:** `Passport Photo Maker — Make 2x2 & 35x45mm ID Photos Online Free | ToolForge`
- **Description:** `Make passport, visa and ID photos online free. Crop to US 2x2 inch, UK/EU 35x45mm and other official sizes, then build a 4x6 print sheet you can print at home. Runs in your browser.`
- **Primary Keyword:** passport photo maker
- **Secondary Keywords:** 2x2 inch picture generator, print ID photo at home, visa photo cropper, 35x45mm photo

---

## Functional Requirements

- [ ] Upload a portrait photo (JPG, PNG, WebP)
- [ ] Country/standard presets defining physical size + DPI, e.g.:
  - US Passport/Visa — 2×2 in (51×51mm)
  - UK / EU / Schengen — 35×45 mm
  - Canada — 50×70 mm
  - India — 35×45 mm
  - Australia — 35×45 mm
- [ ] Render at print DPI (default 300) → e.g. 2in @ 300dpi = 600×600 px
- [ ] Interactive cropper: pan (drag) and zoom (slider) the photo within a fixed
      target aspect-ratio frame, with a head-position guide overlay (oval + top/chin lines)
- [ ] Background color option (white / light grey / light blue) painted behind the photo
- [ ] Download single ID photo (PNG/JPG) at target pixel size
- [ ] "Generate 4×6 print sheet" — tiles as many copies as fit on a 4×6 in @ 300dpi
      (1200×1800 px) sheet with small gaps, for cheap photo-lab printing
- [ ] 100% client-side `<canvas>` — nothing uploaded

---

## Library

Native HTML5 `<canvas>`. No external libs required.

---

## UI Layout

```
┌──────────────────────────────────────┐
│  [Upload portrait]                   │
├──────────────────────────────────────┤
│  Standard: [US 2x2in ▼]  DPI: [300]  │
│  Background: (•)White ( )Grey ( )Blue│
├──────────────────────────────────────┤
│   Cropper (target ratio frame)       │
│   ┌────────────┐  guide oval + lines │
│   │   (face)   │  drag to pan        │
│   └────────────┘  Zoom [===|---]     │
├──────────────────────────────────────┤
│  [Download Photo] [Generate 4x6 Sheet]│
└──────────────────────────────────────┘
```

---

## Component State

```typescript
interface Standard { id: string; label: string; wMm: number; hMm: number; }
state: {
  file: File | null;
  imgEl: HTMLImageElement | null;
  standard: Standard;
  dpi: number;            // default 300
  bg: 'white' | 'grey' | 'blue';
  zoom: number;           // scale multiplier
  offset: { x: number; y: number }; // pan, in preview px
  sheet: { url: string } | null;    // generated print sheet
}
```

Target px = `round(mm / 25.4 * dpi)`. Crop canvas draws the bg, then the image
transformed by zoom+offset, clipped to the target frame. Sheet canvas =
1200×1800 (4×6 @300), computes columns/rows that fit `targetW+gap`/`targetH+gap`
and draws copies.

---

## How to Use Content (for SEO section)

1. Upload a clear, front-facing portrait
2. Pick the country/standard — US 2×2 inch, UK/EU 35×45mm, and more
3. Choose a background color and drag/zoom so your head sits inside the guide oval
4. Download the single ID photo, or generate a 4×6 print sheet with multiple copies
5. Print the sheet at any photo lab or home printer and cut out the photos

---

## About Content (for SEO section)

Official photo shops charge a premium for a few prints. This maker crops your own
portrait to exact passport and visa dimensions — US 2×2 inch, UK/EU 35×45mm and
more — at true 300 DPI, with a head-position guide so the framing meets
requirements. It can also tile copies onto a standard 4×6 inch sheet for cheap
lab printing. All cropping happens on a `<canvas>` in your browser; your photo
never leaves your device.
