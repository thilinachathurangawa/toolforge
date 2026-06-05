# SPEC: Open Graph Image Generator Tool
**File:** `docs/specs/tools/seo/OPEN_GRAPH_IMAGE_GENERATOR.md`
**Status:** Pending
**Slug:** `open-graph-image-generator`
**Category:** seo

---

## SEO

- **Title:** `Open Graph Image Generator — Create OG Images Online Free | ToolForge`
- **Description:** `Generate Open Graph images for social media sharing. Create custom OG images with your branding, text, and colors for free.`
- **Primary Keyword:** Open Graph image generator
- **Secondary Keywords:** OG image creator, social media image generator, Facebook image maker, Twitter card generator

---

## Functional Requirements

- [ ] Canvas editor for OG image creation (1200x630 default)
- [ ] Background options:
  - [ ] Solid color picker
  - [ ] Gradient color picker (2 colors)
  - [ ] Image upload
  - [ ] Pattern presets
- [ ] Text overlay:
  - [ ] Title text input (large, bold)
  - [ ] Description text input (smaller)
  - [ ] Font family selector
  - [ ] Font size sliders
  - [ ] Text color picker
  - [ ] Text position (drag or coordinates)
  - [ ] Text alignment (left, center, right)
- [ ] Logo/brand image upload
  - [ ] Position selector (top-left, top-right, bottom-left, bottom-right)
  - [ ] Size slider
- [ ] Preset templates (blog post, product, article, quote)
- [ ] Real-time preview
- [ ] Download as PNG/JPG
- [ ] Copy to clipboard
- [ ] Undo/Redo functionality
- [ ] Layer management (optional)

---

## Library

```bash
npm install html2canvas fabric
```

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Template: [Blog Post ▼]  [Undo] [Redo]│
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [Canvas Preview]           │   │
│  │      1200 x 630                 │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Background:                             │
│  ○ Solid  ○ Gradient  ○ Image  ○ Pattern│
│  Color: [#3B82F6]  Gradient: [#3B82F6 → #1E40AF]│
│  [Upload Background Image]              │
│                                         │
│  Title Text:                             │
│  Text: [Your Blog Post Title]           │
│  Font: [Inter ▼]  Size: [48]           │
│  Color: [#FFFFFF]  Align: [Center ▼]   │
│                                         │
│  Description:                           │
│  Text: [A compelling description...]    │
│  Font: [Inter ▼]  Size: [24]           │
│  Color: [#E5E7EB]  Align: [Center ▼]   │
│                                         │
│  Logo:                                  │
│  [Upload Logo]  Position: [Top Left ▼]  │
│  Size: [80]                              │
│                                         │
│  [Download PNG] [Download JPG] [Copy]   │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
interface OgImageConfig {
  background: {
    type: 'solid' | 'gradient' | 'image' | 'pattern';
    color: string;
    gradientEnd?: string;
    imageUrl?: string;
  };
  title: {
    text: string;
    font: string;
    size: number;
    color: string;
    align: 'left' | 'center' | 'right';
    x: number;
    y: number;
  };
  description: {
    text: string;
    font: string;
    size: number;
    color: string;
    align: 'left' | 'center' | 'right';
    x: number;
    y: number;
  };
  logo: {
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: number;
  };
}

state: {
  config: OgImageConfig;
  template: 'blog' | 'product' | 'article' | 'quote' | 'custom';
  history: OgImageConfig[];
  historyIndex: number;
}
```

---

## Canvas Dimensions

- **Standard OG:** 1200x630 pixels (1.91:1 ratio)
- **Square:** 1200x1200 pixels (1:1 ratio)
- **Twitter Large:** 1200x600 pixels (2:1 ratio)

---

## How to Use Content (for SEO section)

1. Choose a template or start from scratch
2. Set your background (solid color, gradient, or upload an image)
3. Add your title text with custom font and color
4. Add a description or subtitle
5. Upload your logo and position it
6. Adjust sizes, colors, and positions as needed
7. Preview your OG image in real-time
8. Download as PNG or JPG, or copy to clipboard
9. Use the image as your og:image meta tag

---

## About Content (for SEO section

Our free Open Graph image generator creates custom social media images for your website. Design professional OG images with your branding, text, and colors. Perfect for blog posts, products, articles, and more. All image generation happens in your browser with no data sent to any server.
