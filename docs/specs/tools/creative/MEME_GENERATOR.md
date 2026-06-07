# SPEC: Meme Generator Tool
**File:** `docs/specs/tools/creative/MEME_GENERATOR.md`  
**Status:** Pending  
**Slug:** `meme-generator`  
**Category:** creative

---

## SEO

- **Title:** `Meme Generator — Create Custom Memes Online | ToolForge`
- **Description:** `Create custom memes instantly with our free meme generator. Add text to images, choose fonts, and download your memes. No sign-up required.`
- **Primary Keyword:** meme generator
- **Secondary Keywords:** make a meme, create meme online, meme maker, text on image

---

## Functional Requirements

- [ ] Upload image (JPG, PNG, WebP)
- [ ] Add top text and bottom text
- [ ] Multiple text layers (add/remove)
- [ ] Font selection (Impact, Arial, Comic Sans, etc.)
- [ ] Font size adjustment
- [ ] Font color picker
- [ ] Text stroke/outline option
- [ ] Drag and drop text positioning
- [ ] Real-time preview
- [ ] Download as JPG or PNG
- [ ] No data sent to server

---

## Library

```bash
npm install fabric
# OR use canvas API directly
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Drop image here or click        │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  [Add Text Layer] button        │
│                                 │
│  Text Layer 1:                  │
│  Font: [Impact ▼]               │
│  Size: [──●────] 48             │
│  Color: [#000000]               │
│  [☐] Add Stroke                 │
│  [Delete Layer]                 │
│                                 │
│  Text Layer 2:                  │
│  Font: [Impact ▼]               │
│  Size: [──●────] 48             │
│  Color: [#FFFFFF]               │
│  [☐] Add Stroke                 │
│  [Delete Layer]                 │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │    TOP TEXT             │    │
│  │                         │    │
│  │      [Image]            │    │
│  │                         │    │
│  │    BOTTOM TEXT          │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  [Download JPG] [Download PNG]   │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  font: string;
  size: number;
  color: string;
  hasStroke: boolean;
  strokeColor: string;
}

state: {
  imageFile: File | null;
  imageUrl: string | null;
  textLayers: TextLayer[];
  selectedLayerId: string | null;
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Upload an image by clicking the upload area or dragging and dropping
2. Click "Add Text Layer" to add text to your meme
3. Customize each text layer with font, size, and color
4. Enable stroke for better readability on any background
5. Drag text to position it on the image
6. Download your meme as JPG or PNG

---

## About Content (for SEO section)

Our meme generator lets you create custom memes in seconds. Upload any image and add customizable text layers with full control over fonts, sizes, colors, and positioning. Perfect for social media, presentations, or just for fun. All processing happens locally in your browser — your images are never uploaded to any server.
