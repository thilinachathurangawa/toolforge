# SPEC: Color Palette Extractor Tool
**File:** `docs/specs/tools/COLOR_PALETTE.md`  
**Status:** Completed  
**Slug:** `color-palette`  
**Category:** image

---

## SEO

- **Title:** `Color Palette Extractor — Extract Colors from Any Image | ToolForge`
- **Description:** `Upload an image and instantly extract its dominant color palette. Get HEX, RGB, and HSL codes. Free, no sign-up required.`
- **Primary Keyword:** color palette from image
- **Secondary Keywords:** extract colors from image, dominant colors, image color picker

---

## Functional Requirements

- [ ] Upload image (JPG, PNG, WebP)
- [ ] Extract 5–10 dominant colors using Color Thief
- [ ] Display color swatches
- [ ] Show HEX, RGB, and HSL values for each color
- [ ] Click color to copy HEX code
- [ ] Download palette as PNG or JSON
- [ ] Adjustable number of colors (3–12)
- [ ] No data sent to server

---

## Library

```bash
npm install color-thief-browser
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Drop image here or click        │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  Number of colors: [──●────] 6  │
│  [Extract Palette] button       │
├─────────────────────────────────┤
│  Color Palette:                 │
│  ┌───┬───┬───┬───┬───┬───┐     │
│  │ #1│ #2│ #3│ #4│ #5│ #6│     │
│  └───┴───┴───┴───┴───┴───┘     │
│  HEX: #FF5733  [Copy]          │
│  RGB: 255, 87, 51              │
│  HSL: 11, 100%, 60%            │
│                                 │
│  [Download PNG] [Download JSON] │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface ColorSwatch {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

state: {
  imageFile: File | null;
  imageUrl: string | null;
  colors: ColorSwatch[];
  numColors: number;       // 3 to 12
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Upload an image by clicking the upload area or dragging and dropping
2. Adjust the number of colors to extract (3–12)
3. Click "Extract Palette" to analyze the image
4. Click any color swatch to copy its HEX code
5. Download the palette as PNG or JSON for use in your projects

---

## About Content (for SEO section)

Our color palette extractor analyzes images directly in your browser to identify dominant colors. Using advanced color quantization algorithms, it extracts the most prominent colors and provides them in multiple formats (HEX, RGB, HSL). Perfect for designers, developers, and anyone working with color schemes. No images are uploaded to any server — all processing happens locally on your device.
