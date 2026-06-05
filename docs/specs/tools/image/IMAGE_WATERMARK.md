# SPEC: Image Watermark Tool
**File:** `docs/specs/tools/image/IMAGE_WATERMARK.md`  
**Status:** Pending  
**Slug:** `image-watermark`  
**Category:** image

---

## SEO

- **Title:** `Image Watermark Tool — Add Watermark to Photos Online Free | ToolForge`
- **Description:** `Add text or image watermarks to your photos online for free. Protect your images with customizable watermarks. No upload required — works in your browser.`
- **Primary Keyword:** image watermark tool
- **Secondary Keywords:** add watermark to photo, copyright watermark, image protection, watermark images online

---

## Functional Requirements

- [ ] Accept JPG, PNG, WebP files via drag & drop or file picker
- [ ] Support multiple files (batch watermarking)
- [ ] Watermark type selector: Text or Image
- [ ] Text watermark options:
  - [ ] Text input field
  - [ ] Font family selector
  - [ ] Font size slider
  - [ ] Font color picker
  - [ ] Font weight (normal, bold)
  - [ ] Font style (normal, italic)
- [ ] Image watermark options:
  - [ ] Upload watermark image
  - [ ] Scale slider
  - [ ] Opacity slider
- [ ] Position options:
  - [ ] 9-position grid (top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right)
  - [ ] Custom X/Y offset
- [ ] Opacity slider (0%–100%, default 50%)
- [ ] Rotation slider (0°–360°, default 0°)
- [ ] Preview original and watermarked images side by side
- [ ] Download individual watermarked files
- [ ] Download all as ZIP (if multiple)
- [ ] No file size limit (client-side only)
- [ ] No data sent to server

---

## Library

```bash
npm install jszip
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Drop images here or click       │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  Watermark Type: [Text ▼]      │
│                                 │
│  Text Options:                  │
│  Text: [© Your Name]            │
│  Font: [Arial ▼]               │
│  Size: [──●──────] 48px         │
│  Color: [#000000]               │
│  ☑ Bold  ☐ Italic               │
│                                 │
│  Position:                     │
│  [ ┌─┬─┬─┐ ]                   │
│  [ │ │●│ │ ]  (center selected) │
│  [ └─┴─┴─┘ ]                   │
│  Offset X: [10] px             │
│  Offset Y: [10] px             │
│                                 │
│  Opacity: [──●──────] 50%      │
│  Rotation: [──●──────] 0°      │
│                                 │
│  [Add Watermark] button         │
├─────────────────────────────────┤
│  Results:                       │
│  photo.jpg → photo_watermarked.jpg│
│  [Preview] [Download]            │
│  [Download All as ZIP]          │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface WatermarkResult {
  file: File;
  watermarkedBlob: Blob;
  previewUrl: string;
}

state: {
  files: File[];
  watermarkType: 'text' | 'image';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  watermarkImage: File | null;
  watermarkScale: number;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  offsetX: number;
  offsetY: number;
  opacity: number;
  rotation: number;
  results: WatermarkResult[];
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Click the upload area or drag and drop your images
2. Choose watermark type (Text or Image)
3. For text: enter your text, customize font, size, color, and style
4. For image: upload your watermark image and adjust scale
5. Select position using the grid or custom offsets
6. Adjust opacity and rotation as needed
7. Click "Add Watermark" to process
8. Download your watermarked images individually or as a ZIP

---

## About Content (for SEO section)

Our free image watermark tool helps you protect your photos by adding custom text or image watermarks directly in your browser. No files are uploaded to any server — watermarking happens locally on your device. Perfect for photographers, designers, and content creators who want to copyright their work, brand their images, or prevent unauthorized use. Customize text, fonts, colors, positioning, and opacity to create professional watermarks that match your style.
