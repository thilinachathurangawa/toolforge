# SPEC: Image Cropper Tool
**File:** `docs/specs/tools/IMAGE_CROPPER.md`  
**Status:** Pending  
**Slug:** `image-cropper`  
**Category:** image

---

## SEO

- **Title:** `Image Cropper — Crop Images Online Free | ToolForge`
- **Description:** `Crop and resize images online for free. Supports custom ratios, square, 16:9, and more. Download cropped image instantly.`
- **Primary Keyword:** crop image online free
- **Secondary Keywords:** image crop tool, cut image online, free image cropper

---

## Functional Requirements

- [ ] Upload JPG, PNG, WebP, GIF
- [ ] Drag-to-crop interface
- [ ] Preset aspect ratios: Free, 1:1, 16:9, 4:3, 3:2
- [ ] Custom width/height input
- [ ] Rotate 90°/180°/270°
- [ ] Flip horizontal / vertical
- [ ] Download as JPG or PNG
- [ ] Preview before download
- [ ] No data sent to server

---

## Library

```bash
npm install react-image-crop
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Aspect Ratio: [Free ▼]         │
│  [1:1] [16:9] [4:3] [3:2]       │
├─────────────────────────────────┤
│                                 │
│     [Image with Crop Box]       │
│                                 │
├─────────────────────────────────┤
│  Rotate: [↻] [↺]  Flip: [⇄] [⇅]│
│  Custom: W:[300] H:[300]        │
│                                 │
│  [Download JPG] [Download PNG]  │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  imageFile: File | null;
  imageUrl: string | null;
  crop: { x: number; y: number; width: number; height: number };
  aspectRatio: number | 'free';
  rotation: number;        // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  customWidth: number;
  customHeight: number;
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Upload an image by clicking the upload area or dragging and dropping
2. Select an aspect ratio from the presets or choose "Free" for custom cropping
3. Drag the corners of the crop box to adjust the selection
4. Use rotate and flip buttons to adjust the image orientation
5. Click download to save your cropped image as JPG or PNG

---

## About Content (for SEO section)

Our free image cropper lets you crop and resize images directly in your browser. With support for common aspect ratios (square, 16:9, 4:3, 3:2) and free-form cropping, it's perfect for social media posts, profile pictures, or any image editing needs. All processing happens locally — your images are never uploaded to any server.
