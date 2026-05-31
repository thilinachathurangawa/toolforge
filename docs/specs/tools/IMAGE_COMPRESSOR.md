# SPEC: Image Compressor Tool
**File:** `docs/specs/tools/IMAGE_COMPRESSOR.md`  
**Status:** Completed  
**Slug:** `image-compressor`  
**Category:** image

---

## SEO

- **Title:** `Image Compressor — Compress JPG, PNG, WebP Online Free | ToolForge`
- **Description:** `Compress and optimize images online for free. Reduce JPG, PNG, and WebP file sizes without losing quality. No upload required — works in your browser.`
- **Primary Keyword:** compress image online free
- **Secondary Keywords:** reduce image size, image optimizer, compress jpg online, compress png free

---

## Functional Requirements

- [ ] Accept JPG, PNG, WebP, GIF files via drag & drop or file picker
- [ ] Support multiple files (batch compression)
- [ ] Compression quality slider (10%–100%, default 80%)
- [ ] Show original size vs compressed size
- [ ] Show compression percentage saved
- [ ] Preview original and compressed images side by side
- [ ] Download individual compressed files
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
│  Quality: [──●──────] 80%      │
│  [Compress Images] button       │
├─────────────────────────────────┤
│  Results:                       │
│  filename.jpg  2.3MB → 450KB   │
│  (-80%) [Preview] [Download]    │
│  [Download All as ZIP]          │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface CompressionResult {
  file: File;
  originalSize: number;
  compressedBlob: Blob;
  compressedSize: number;
  compressionRatio: number;
  previewUrl: string;
}

state: {
  files: File[];
  quality: number;       // 0.1 to 1.0
  results: CompressionResult[];
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Click the upload area or drag and drop your images
2. Adjust the quality slider (80% recommended for best balance)
3. Click "Compress Images"
4. Download your compressed files individually or as a ZIP

---

## About Content (for SEO section)

Our free image compressor reduces JPG, PNG, and WebP file sizes directly in your browser. No files are uploaded to any server — compression happens locally on your device using advanced algorithms. Perfect for optimizing images for websites, email attachments, or social media.
