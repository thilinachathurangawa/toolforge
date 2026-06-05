# SPEC: Image Batch Resizer Tool
**File:** `docs/specs/tools/IMAGE_BATCH_RESIZER.md`  
**Status:** Pending  
**Slug:** `image-batch-resizer`  
**Category:** image

---

## SEO

- **Title:** `Image Batch Resizer — Resize Multiple Images Online Free | ToolForge`
- **Description:** `Resize multiple images at once online for free. Batch resize JPG, PNG, WebP files with custom dimensions, percentage scaling, or presets. Download as ZIP.`
- **Primary Keyword:** batch resize images online free
- **Secondary Keywords:** resize multiple images, bulk image resizer, batch image resize, resize photos in bulk

---

## Functional Requirements

- [ ] Accept JPG, PNG, WebP, GIF files via drag & drop or file picker
- [ ] Support multiple files (batch processing)
- [ ] Width input (px) - applies to all images
- [ ] Height input (px) - applies to all images
- [ ] Maintain aspect ratio toggle (default: on)
- [ ] Percentage resize option (25%, 50%, 75%, 100%, 200%)
- [ ] Preset sizes: Instagram (1080x1080), Facebook (1200x630), Twitter (1200x675), YouTube (1280x720)
- [ ] Show list of all uploaded images with original dimensions
- [ ] Show preview of first image with new dimensions
- [ ] Option to skip images that are already smaller than target size
- [ ] Option to rename files with suffix (e.g., _resized)
- [ ] Download all resized files as ZIP
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
│  [✓] Skip if smaller than target│
│  [✓] Add _resized suffix       │
│                                 │
│  [Resize All Images] button     │
├─────────────────────────────────┤
│  Uploaded Files (5):            │
│  ✓ photo1.jpg  1920x1080        │
│  ✓ photo2.png  2560x1440        │
│  ✓ photo3.webp 800x600          │
│                                 │
│  Preview:                       │
│  [Original] → [Resized]         │
├─────────────────────────────────┤
│  [Download All as ZIP] button   │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface BatchResizeResult {
  file: File;
  originalWidth: number;
  originalHeight: number;
  resizedBlob: Blob;
  newWidth: number;
  newHeight: number;
  skipped: boolean;
  previewUrl: string;
}

state: {
  files: File[];
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  percentage: number;
  skipSmaller: boolean;
  addSuffix: boolean;
  results: BatchResizeResult[];
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Click the upload area or drag and drop multiple images
2. Enter your desired width and height in pixels (applies to all images)
3. Choose to maintain aspect ratio or set custom dimensions
4. Select a preset size for social media or use percentage scaling
5. Configure options like skipping smaller images or adding suffix
6. Click "Resize All Images" to process
7. Download all resized files as a ZIP archive

---

## About Content (for SEO section)

Our free image batch resizer lets you resize multiple images at once directly in your browser. No files are uploaded to any server — resizing happens locally on your device. Perfect for preparing large batches of photos for websites, social media, or email attachments while maintaining consistent dimensions across all images.
