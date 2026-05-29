# SPEC: QR Code Generator Tool
**File:** `docs/specs/tools/QR_GENERATOR.md`  
**Status:** Pending  
**Slug:** `qr-generator`  
**Category:** generator

---

## SEO

- **Title:** `Free QR Code Generator — Create QR Codes Instantly | ToolForge`
- **Description:** `Generate QR codes for URLs, text, email, phone, and WiFi for free. Download as PNG or SVG. No sign-up required.`
- **Primary Keyword:** free QR code generator
- **Secondary Keywords:** create QR code online, QR code maker, generate QR code

---

## Functional Requirements

- [ ] Input types: URL, Plain Text, Email, Phone, SMS, WiFi
- [ ] Live preview (updates as user types)
- [ ] Customizable foreground color
- [ ] Customizable background color
- [ ] Size selector (128px to 1024px)
- [ ] Error correction level (L, M, Q, H)
- [ ] Download as PNG
- [ ] Download as SVG
- [ ] Copy to clipboard

---

## Library

```bash
npm install qrcode
```

---

## UI Layout

```
┌──────────────────┬──────────────┐
│ Type: [URL ▼]    │              │
│ Input: [______]  │  [QR PREVIEW]│
│                  │              │
│ Colors:          │  256x256     │
│ [FG] [BG]        │              │
│ Size: [256px ▼]  │              │
│                  │              │
│ [Download PNG]   │              │
│ [Download SVG]   │              │
└──────────────────┴──────────────┘
```
