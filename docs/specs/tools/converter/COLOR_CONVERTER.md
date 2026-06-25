# SPEC: Color Converter Tool
**File:** `docs/specs/tools/converter/COLOR_CONVERTER.md`
**Status:** Completed
**Slug:** `color-converter`
**Category:** converter

---

## SEO

- **Title:** `Color Converter — HEX to RGB, HSL, CMYK Online Free | ToolForge`
- **Description:** `Convert colors between HEX, RGB, HSL, and CMYK formats instantly. Free online color converter with live preview for designers and developers.`
- **Primary Keyword:** HEX to RGB converter
- **Secondary Keywords:** CMYK color converter online, RGB to HSL calculator, color format converter

---

## Functional Requirements

- [ ] HEX input field (6-digit + hash prefix, real-time validation)
- [ ] RGB inputs (R, G, B sliders + number fields, 0–255)
- [ ] HSL inputs (H: 0–360, S: 0–100%, L: 0–100%)
- [ ] CMYK inputs (C, M, Y, K 0–100%)
- [ ] Live color preview card (background swatch updating on every change)
- [ ] Two-way binding: changing any field syncs all others instantly
- [ ] Copy button per format
- [ ] Pure JS math — no external color libraries

---

## Conversion Math

- HEX → RGB: `parseInt(hex.slice(1,3), 16)` per channel
- RGB → HEX: `channel.toString(16).padStart(2, '0')`
- RGB → HSL: standard max/min algorithm
- HSL → RGB: hue-to-rgb helper
- RGB → CMYK: `K = 1 - max(R,G,B)/255`; `C = (1-R/255-K)/(1-K)`
- CMYK → RGB: `R = 255*(1-C)*(1-K)`

---

## UI Layout

```
┌───────────────────────────────────┐
│  [Color Preview Swatch]           │
├───────────────────────────────────┤
│  HEX:  [#1a73e8]  [Copy]         │
│  RGB:  R[26] G[115] B[232] [Copy]│
│  HSL:  H[216] S[85%] L[51%][Copy]│
│  CMYK: C[89%]M[50%]Y[0%]K[9%][Copy]│
└───────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  hex: string;
  r: number; g: number; b: number;
  h: number; s: number; l: number;
  c: number; m: number; y: number; k: number;
}
```
