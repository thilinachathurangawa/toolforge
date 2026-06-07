# SPEC: ASCII Art Generator Tool
**File:** `docs/specs/tools/creative/ASCII_ART_GENERATOR.md`  
**Status:** Pending  
**Slug:** `ascii-art-generator`  
**Category:** creative

---

## SEO

- **Title:** `ASCII Art Generator — Convert Images to ASCII Text Art | ToolForge`
- **Description:** `Convert images to ASCII art text instantly. Upload JPG, PNG, or GIF and create stunning text-based artwork. Free, no sign-up required.`
- **Primary Keyword:** ascii art generator
- **Secondary Keywords:** image to ascii, text art generator, ascii converter, picture to text art

---

## Functional Requirements

- [ ] Upload image (JPG, PNG, GIF)
- [ ] Convert image to ASCII art using character density mapping
- [ ] Adjustable character set (standard, simple, complex, blocks)
- [ ] Adjustable output width (20-200 characters)
- [ ] Invert colors option
- [ ] Display preview of original image alongside ASCII output
- [ ] Copy ASCII art to clipboard
- [ ] Download as .txt file
- [ ] No data sent to server

---

## Library

```bash
npm install ascii-art-generator
# OR use custom implementation with canvas
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Drop image here or click        │
│  [Drag & Drop Zone]             │
├─────────────────────────────────┤
│  Character Set: [Standard ▼]    │
│  Output Width: [──●────] 80      │
│  [☐] Invert Colors              │
│  [Generate ASCII] button         │
├─────────────────────────────────┤
│  Original Image  │  ASCII Output │
│  ┌───────────┐   │  ┌───────────┐│
│  │           │   │  │  .:::.    ││
│  │  Preview  │   │  │  :::::   ││
│  │           │   │  │  .:::.    ││
│  └───────────┘   │  └───────────┘│
│                                 │
│  [Copy to Clipboard]            │
│  [Download .txt]                │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  imageFile: File | null;
  imageUrl: string | null;
  asciiOutput: string;
  characterSet: 'standard' | 'simple' | 'complex' | 'blocks';
  outputWidth: number;         // 20 to 200
  invertColors: boolean;
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Upload an image by clicking the upload area or dragging and dropping
2. Select a character set (standard, simple, complex, or blocks)
3. Adjust the output width to control the ASCII art size
4. Optionally check "Invert Colors" for different effects
5. Click "Generate ASCII" to convert your image
6. Copy the ASCII art to clipboard or download as a .txt file

---

## About Content (for SEO section)

Our ASCII art generator transforms images into text-based artwork using character density mapping. Each pixel is converted to a character based on its brightness, creating stunning visual representations using only text characters. Perfect for social media, code comments, terminal displays, and creative projects. All processing happens locally in your browser — no images are uploaded to any server.
