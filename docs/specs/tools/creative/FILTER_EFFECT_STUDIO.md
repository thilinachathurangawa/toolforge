# SPEC: Filter & Effect Studio Tool
**File:** `docs/specs/tools/creative/FILTER_EFFECT_STUDIO.md`  
**Status:** Pending  
**Slug:** `filter-effect-studio`  
**Category:** creative

---

## SEO

- **Title:** `Filter & Effect Studio — Apply Image Filters & Effects | ToolForge`
- **Description:** `Apply professional filters and effects to your images online. Vintage, blur, sharpen, color adjustments and more. Free, no sign-up required.`
- **Primary Keyword:** image filter studio
- **Secondary Keywords:** apply image filters, photo effects, image editor online, filter effects

---

## Functional Requirements

- [ ] Upload image (JPG, PNG, WebP)
- [ ] Basic adjustments (brightness, contrast, saturation, exposure)
- [ ] Color filters (grayscale, sepia, invert, hue rotate)
- [ ] Blur effects (gaussian blur, motion blur)
- [ ] Sharpen and unsharp mask
- [ ] Vintage/retro filters (vignette, noise, film grain)
- [ ] Artistic effects (pixelate, oil paint, edge detection)
- [ ] Adjust filter intensity (0-100%)
- [ ] Compare original vs filtered (before/after)
- [ ] Real-time preview
- [ ] Reset to original
- [ ] Download as JPG or PNG
- [ ] No data sent to server

---

## Library

```bash
npm install canvas
npm install glfx
# OR use CSS filters + Canvas API
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Drop image here or click        │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  Basic Adjustments:             │
│  Brightness: [──●────] 100%     │
│  Contrast:   [──●────] 100%     │
│  Saturation: [──●────] 100%     │
│  Exposure:   [──●────] 100%     │
├─────────────────────────────────┤
│  Color Filters:                 │
│  [Grayscale] [Sepia] [Invert]   │
│  [Hue Rotate]                   │
├─────────────────────────────────┤
│  Blur Effects:                  │
│  [Gaussian Blur] [Motion Blur]  │
│  Intensity: [──●────] 50%       │
├─────────────────────────────────┤
│  Sharpen:                       │
│  [Sharpen] [Unsharp Mask]       │
│  Intensity: [──●────] 50%       │
├─────────────────────────────────┤
│  Vintage Effects:               │
│  [Vignette] [Noise] [Film Grain]│
│  Intensity: [──●────] 50%       │
├─────────────────────────────────┤
│  Artistic Effects:              │
│  [Pixelate] [Oil Paint] [Edge]  │
│  Intensity: [──●────] 50%       │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │   [Image Preview]       │    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│  [☐ Show Original]              │
│  [Reset All]                    │
│  [Download JPG] [Download PNG]  │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface FilterSettings {
  brightness: number;      // 0 to 200
  contrast: number;        // 0 to 200
  saturation: number;      // 0 to 200
  exposure: number;        // 0 to 200
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  hueRotate: number;       // 0 to 360
  gaussianBlur: number;    // 0 to 20
  motionBlur: number;      // 0 to 20
  sharpen: number;         // 0 to 100
  unsharpMask: number;     // 0 to 100
  vignette: number;        // 0 to 100
  noise: number;           // 0 to 100
  filmGrain: number;       // 0 to 100
  pixelate: number;        // 0 to 50
  oilPaint: number;        // 0 to 100
  edgeDetection: number;   // 0 to 100
}

state: {
  imageFile: File | null;
  imageUrl: string | null;
  originalImageUrl: string | null;
  filters: FilterSettings;
  showOriginal: boolean;
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Upload an image by clicking the upload area or dragging and dropping
2. Adjust basic settings like brightness, contrast, saturation, and exposure
3. Apply color filters (grayscale, sepia, invert, hue rotate)
4. Add blur effects (gaussian or motion blur)
5. Use sharpen tools to enhance details
6. Apply vintage effects like vignette, noise, or film grain
7. Try artistic effects like pixelate, oil paint, or edge detection
8. Adjust the intensity of each effect
9. Toggle "Show Original" to compare with the original image
10. Reset all filters or download your edited image

---

## About Content (for SEO section)

Our Filter & Effect Studio provides professional-grade image filters and effects. From basic adjustments like brightness and contrast to artistic effects like oil paint and edge detection, you can transform your images with ease. Perfect for photographers, designers, and anyone who wants to enhance their photos. All processing happens locally in your browser using HTML5 Canvas — your images are never uploaded to any server.
