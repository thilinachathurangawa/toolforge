# SPEC: Image Resizer Tool
**File:** `docs/specs/tools/IMAGE_RESIZER.md`  
**Status:** Completed  
**Slug:** `image-resizer`  
**Category:** image

---

## SEO

- **Title:** `Image Resizer — Resize Images Online Free | ToolForge`
- **Description:** `Resize images to any width and height online for free. Maintain aspect ratio or set custom dimensions. Download resized images instantly.`
- **Primary Keyword:** resize image online free
- **Secondary Keywords:** change image size, image dimensions, resize photo, scale image

---

## Functional Requirements

- [ ] Accept JPG, PNG, WebP, GIF files via drag & drop or file picker
- [ ] Support multiple files (batch resize)
- [ ] Width input (px)
- [ ] Height input (px)
- [ ] Maintain aspect ratio toggle (default: on)
- [ ] Percentage resize option (25%, 50%, 75%, 100%, 200%)
- [ ] Preset sizes: Instagram (1080x1080), Facebook (1200x630), Twitter (1200x675), YouTube (1280x720)
- [ ] Show original dimensions vs new dimensions
- [ ] Preview original and resized images side by side
- [ ] Download individual resized files
- [ ] Download all as ZIP (if multiple)
- [ ] No file size limit (client-side only)
- [ ] No data sent to server

---

## Library

```bash
npm install browser-image-compression jszip
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Drop images here or click      │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  Width:  [1920] px              │
│  Height: [1080] px              │
│  [✓] Maintain aspect ratio     │
│                                 │
│  Presets: [Instagram ▼]        │
│  Percentage: [100% ▼]          │
│                                 │
│  [Resize Images] button         │
├─────────────────────────────────┤
│  Results:                       │
│  filename.jpg  1920x1080 →     │
│  800x600 [Preview] [Download]  │
│  [Download All as ZIP]          │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface ResizeResult {
  file: File;
  originalWidth: number;
  originalHeight: number;
  resizedBlob: Blob;
  newWidth: number;
  newHeight: number;
  previewUrl: string;
}

state: {
  files: File[];
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  percentage: number;
  results: ResizeResult[];
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Click the upload area or drag and drop your images
2. Enter your desired width and height in pixels
3. Choose to maintain aspect ratio or set custom dimensions
4. Select a preset size for social media or use percentage scaling
5. Click "Resize Images" to process
6. Download your resized files individually or as a ZIP

---

## About Content (for SEO section)

Our free image resizer lets you change image dimensions directly in your browser. No files are uploaded to any server — resizing happens locally on your device. Perfect for preparing images for social media, websites, or email attachments while maintaining quality.
