# SPEC: Meme & Sticker Studio Tool
**File:** `docs/specs/tools/creative/MEME_STICKER_STUDIO.md`  
**Status:** Pending  
**Slug:** `meme-sticker-studio`  
**Category:** creative

---

## SEO

- **Title:** `Meme & Sticker Studio — Create Memes & Stickers Online | ToolForge`
- **Description:** `Create custom memes and stickers with our advanced studio. Add text, stickers, effects, and layers. Download in multiple formats. Free, no sign-up required.`
- **Primary Keyword:** meme and sticker studio
- **Secondary Keywords:** create stickers online, sticker maker, meme creator, image editor

---

## Functional Requirements

- [ ] Upload image (JPG, PNG, WebP, GIF)
- [ ] Add text with full formatting (font, size, color, stroke, shadow)
- [ ] Built-in sticker library (emojis, shapes, icons)
- [ ] Upload custom stickers
- [ ] Layer management (reorder, delete, hide/show)
- [ ] Image filters (brightness, contrast, saturation, blur)
- [ ] Crop and resize tools
- [ ] Rotate and flip images
- [ ] Undo/redo functionality
- [ ] Zoom in/out
- [ ] Download as JPG, PNG, or WebP
- [ ] No data sent to server

---

## Library

```bash
npm install fabric
npm install konva
# OR use canvas API with custom layer system
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  [Upload] [New Canvas]          │
├─────────────────────────────────┤
│  Tools:                         │
│  [Text] [Sticker] [Filter]      │
│  [Crop] [Resize] [Rotate]       │
├─────────────────────────────────┤
│  Sticker Library:               │
│  😀 😂 😎 🎉 ❤️ ⭐ 🔥 💯          │
│  [Upload Custom Sticker]        │
├─────────────────────────────────┤
│  Layers:                        │
│  ☐ Text 1          [↑][↓][×]    │
│  ☑ Sticker 1       [↑][↓][×]    │
│  ☑ Background       [↑][↓][×]    │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │      [Canvas]           │    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│  [Zoom -] [Zoom +]              │
│  [Undo] [Redo]                  │
│  [Download JPG] [Download PNG]  │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface Layer {
  id: string;
  type: 'image' | 'text' | 'sticker';
  visible: boolean;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  // Type-specific properties
}

interface TextLayer extends Layer {
  type: 'text';
  text: string;
  font: string;
  size: number;
  color: string;
  hasStroke: boolean;
  strokeColor: string;
  hasShadow: boolean;
}

interface ImageLayer extends Layer {
  type: 'image' | 'sticker';
  src: string;
}

state: {
  canvasSize: { width: number; height: number };
  layers: Layer[];
  selectedLayerId: string | null;
  history: Layer[][];
  historyIndex: number;
  zoom: number;
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Upload an image or create a new canvas
2. Add text layers with full formatting options
3. Choose stickers from the library or upload custom ones
4. Use filters to adjust brightness, contrast, and saturation
5. Crop, resize, rotate, or flip your image
6. Manage layers with reorder, hide, and delete options
7. Use undo/redo to fix mistakes
8. Download your creation as JPG, PNG, or WebP

---

## About Content (for SEO section)

Our Meme & Sticker Studio is a powerful creative tool for making memes, stickers, and edited images. With a full layer system, built-in sticker library, image filters, and text formatting tools, you can create professional-looking content in minutes. Perfect for social media, marketing, or personal projects. All processing happens locally in your browser — your images are never uploaded to any server.
