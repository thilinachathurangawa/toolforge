# SPEC: Image Metadata Remover Tool
**File:** `docs/specs/tools/IMAGE_METADATA_REMOVER.md`  
**Status:** Pending  
**Slug:** `image-metadata-remover`  
**Category:** image

---

## SEO

- **Title:** `Image Metadata Remover — Remove EXIF Data Online Free | ToolForge`
- **Description:** `Remove EXIF metadata, GPS location, and hidden data from images online for free. Protect your privacy by stripping image metadata directly in your browser.`
- **Primary Keyword:** remove image metadata online free
- **Secondary Keywords:** remove exif data, strip image metadata, clean image info, remove gps from photos, exif remover

---

## Functional Requirements

- [ ] Accept JPG, PNG, WebP files via drag & drop or file picker
- [ ] Support multiple files (batch metadata removal)
- [ ] Detect and display all metadata found in images (EXIF, IPTC, XMP)
- [ ] Show specific metadata types: Camera info, GPS location, Date/Time, Software, etc.
- [ ] Option to selectively remove specific metadata types (e.g., keep copyright but remove GPS)
- [ ] Option to remove all metadata at once
- [ ] Preview metadata before removal
- [ ] Show file size before and after metadata removal
- [ ] Download individual cleaned files
- [ ] Download all as ZIP (if multiple)
- [ ] No file size limit (client-side only)
- [ ] No data sent to server

---

## Library

```bash
npm install exif-js jszip
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Drop images here or click      │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  Metadata Found:                │
│  [✓] Camera Info                │
│  [✓] GPS Location               │
│  [✓] Date/Time                  │
│  [✓] Software Info             │
│  [✓] Copyright                  │
│                                 │
│  [Remove All Metadata] button   │
│  [Remove Selected Only] button  │
├─────────────────────────────────┤
│  Results:                       │
│  filename.jpg  2.3MB → 2.1MB    │
│  Metadata removed: GPS, Camera  │
│  [Download]                     │
│  [Download All as ZIP]          │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface MetadataInfo {
  camera?: string;
  model?: string;
  gps?: { latitude: number; longitude: number };
  dateTime?: string;
  software?: string;
  copyright?: string;
  allTags: Record<string, any>;
}

interface MetadataRemovalResult {
  file: File;
  originalSize: number;
  cleanedBlob: Blob;
  cleanedSize: number;
  metadataRemoved: string[];
  previewUrl: string;
}

state: {
  files: File[];
  metadataInfo: Map<string, MetadataInfo>;
  selectedMetadataTypes: string[];
  results: MetadataRemovalResult[];
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Click the upload area or drag and drop your images
2. View the metadata detected in your images (GPS, camera info, etc.)
3. Select which metadata types to remove or choose to remove all
4. Click "Remove All Metadata" or "Remove Selected Only"
5. Download your cleaned files individually or as a ZIP

---

## About Content (for SEO section)

Our free image metadata remover strips EXIF data, GPS coordinates, and hidden information from your images directly in your browser. No files are uploaded to any server — metadata removal happens locally on your device. Perfect for protecting your privacy when sharing photos online, removing location data from social media posts, or preparing images for professional use.
