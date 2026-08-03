# SPEC: QR Code Generator Tool
**File:** `docs/specs/tools/QR_GENERATOR.md`  
**Status:** Completed  
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

### Core Features (Implemented)
- [x] Input types: URL, Plain Text, Email, Phone, SMS, WiFi
- [x] Live preview (updates as user types)
- [x] Customizable foreground color
- [x] Customizable background color
- [x] Size selector (128px to 1024px)
- [x] Error correction level (L, M, Q, H)
- [x] Download as PNG
- [x] Download as SVG
- [x] Copy to clipboard

### Enhancement Options

#### Phase 1 Enhancements (High Priority)
- [x] **Logo/Center Image Embedding** - Allow users to upload and embed a logo or image in the center of the QR code
- [x] **VCard/Contact Support** - Add support for vCard format to generate business card QR codes
- [x] **Calendar Event Support** - Generate QR codes for calendar events (ICS format)
- [x] **Geo Location Support** - Create QR codes with latitude/longitude coordinates
- [x] **Custom Margin Control** - Add adjustable margin/padding around the QR code (currently fixed at 2)

#### Phase 2 Enhancements (Medium Priority)
- [ ] **QR Code Templates** - Preset templates for common use cases (social media profiles, business cards, WiFi sharing, etc.)
- [ ] **Style Options** - Different module shapes (square dots, rounded dots, circles)
- [ ] **Gradient Colors** - Support for gradient foreground colors instead of solid colors
- [ ] **Frame/Border Options** - Add decorative frames with customizable text around the QR code
- [ ] **Print Size Presets** - Quick size presets for print materials (business card: 350x350, poster: 1024x1024, etc.)

#### Phase 3 Enhancements (Nice to Have)
- [ ] **Batch Generation** - Generate multiple QR codes from a list of inputs
- [ ] **History/Saved Codes** - Save generated QR codes locally for later reuse
- [ ] **Additional Export Formats** - Export as PDF, EPS, or other vector formats
- [ ] **Custom File Naming** - Allow users to specify custom filenames for downloads
- [ ] **QR Code Validation** - Built-in scanner to verify generated QR codes are scannable
- [ ] **Dark Mode Optimization** - Enhanced color presets for dark/light themes

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
