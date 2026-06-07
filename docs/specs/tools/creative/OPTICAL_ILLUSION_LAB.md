# SPEC: Optical Illusion Lab Tool
**File:** `docs/specs/tools/creative/OPTICAL_ILLUSION_LAB.md`  
**Status:** Pending  
**Slug:** `optical-illusion-lab`  
**Category:** creative

---

## SEO

- **Title:** `Optical Illusion Lab — Create Mind-Bending Illusions | ToolForge`
- **Description:** `Create stunning optical illusions and visual effects online. Generate spiral patterns, moiré effects, and more. Free, no sign-up required.`
- **Primary Keyword:** optical illusion generator
- **Secondary Keywords:** create optical illusions, visual effects generator, spiral pattern maker, moiré effect

---

## Functional Requirements

- [ ] Generate spiral illusions (Archimedean, logarithmic)
- [ ] Create moiré pattern effects
- [ ] Generate geometric illusions (impossible shapes, tessellations)
- [ ] Create motion illusions (moving patterns)
- [ ] Color scheme selection (grayscale, rainbow, custom)
- [ ] Adjustable parameters (density, speed, size, rotation)
- [ ] Real-time preview
- [ ] Animation controls (play/pause, speed)
- [ ] Download as static image (JPG, PNG)
- [ ] Download as animated GIF
- [ ] No data sent to server

---

## Library

```bash
npm install canvas
# OR use HTML5 Canvas API directly
```

---

## UI Layout

```
┌─────────────────────────────────┐
│  Illusion Type: [Spiral ▼]      │
│  Options:                       │
│  • Archimedean Spiral           │
│  • Logarithmic Spiral           │
│  • Moiré Pattern                │
│  • Geometric Illusion           │
│  • Motion Illusion              │
├─────────────────────────────────┤
│  Parameters:                    │
│  Density: [──●────] 50          │
│  Size: [──●────] 100            │
│  Rotation: [──●────] 0°         │
│  Speed: [──●────] 1x            │
│                                 │
│  Color Scheme: [Rainbow ▼]      │
│  • Grayscale                    │
│  • Rainbow                      │
│  • Custom                       │
│  Color 1: [#FF0000]             │
│  Color 2: [#0000FF]             │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │   [Illusion Preview]    │    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│  [▶ Play] [⏸ Pause]            │
│  [Download PNG] [Download GIF]   │
└─────────────────────────────────┘
```

---

## Component State

```typescript
type IllusionType = 'archimedean' | 'logarithmic' | 'moire' | 'geometric' | 'motion';
type ColorScheme = 'grayscale' | 'rainbow' | 'custom';

state: {
  illusionType: IllusionType;
  density: number;           // 1 to 100
  size: number;              // 10 to 500
  rotation: number;          // 0 to 360
  speed: number;             // 0.1 to 5
  colorScheme: ColorScheme;
  customColors: string[];    // for custom scheme
  isPlaying: boolean;
  isProcessing: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Select an illusion type from the dropdown (spiral, moiré, geometric, motion)
2. Adjust parameters like density, size, rotation, and speed
3. Choose a color scheme (grayscale, rainbow, or custom colors)
4. Click play to see animated illusions
5. Download as a static PNG image or animated GIF

---

## About Content (for SEO section)

Our Optical Illusion Lab lets you create mind-bending visual effects and optical illusions. Generate spiral patterns, moiré effects, geometric illusions, and motion effects with customizable parameters. Perfect for art projects, educational purposes, or just for fun. All processing happens locally in your browser using HTML5 Canvas — no data is sent to any server.
