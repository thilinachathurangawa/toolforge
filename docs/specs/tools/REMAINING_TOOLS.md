# SPEC: Color Palette Extractor
**File:** `docs/specs/tools/COLOR_PALETTE.md`  
**Slug:** `color-palette`  
**Category:** image

## SEO
- **Title:** `Color Palette Extractor — Extract Colors from Any Image | ToolForge`
- **Description:** `Upload an image and instantly extract its dominant color palette. Get HEX, RGB, and HSL codes. Free, no sign-up required.`
- **Primary Keyword:** color palette from image
- **Secondary:** extract colors from image, dominant colors, image color picker

## Functional Requirements
- [ ] Upload image (JPG, PNG, WebP)
- [ ] Extract 5–10 dominant colors using Color Thief
- [ ] Display color swatches
- [ ] Show HEX, RGB, HSL values for each color
- [ ] Click color to copy HEX code
- [ ] Download palette as PNG or JSON
- [ ] Adjustable number of colors (3–12)

## Library
```bash
npm install colorthief
```

---

# SPEC: Image Cropper Tool
**File:** `docs/specs/tools/IMAGE_CROPPER.md`  
**Slug:** `image-cropper`  
**Category:** image

## SEO
- **Title:** `Image Cropper — Crop Images Online Free | ToolForge`
- **Description:** `Crop and resize images online for free. Supports custom ratios, square, 16:9, and more. Download cropped image instantly.`
- **Primary Keyword:** crop image online free
- **Secondary:** image crop tool, cut image online, free image cropper

## Functional Requirements
- [ ] Upload JPG, PNG, WebP, GIF
- [ ] Drag-to-crop interface
- [ ] Preset aspect ratios: Free, 1:1, 16:9, 4:3, 3:2
- [ ] Custom width/height input
- [ ] Rotate 90°/180°/270°
- [ ] Flip horizontal / vertical
- [ ] Download as JPG or PNG
- [ ] Preview before download

## Library
```bash
npm install react-image-crop
```

---

# SPEC: Password Generator
**File:** `docs/specs/tools/PASSWORD_GENERATOR.md`  
**Slug:** `password-generator`  
**Category:** security

## SEO
- **Title:** `Password Generator — Create Strong Secure Passwords | ToolForge`
- **Description:** `Generate strong, random, secure passwords instantly. Customize length, symbols, numbers, and more. Free online password generator.`
- **Primary Keyword:** strong password generator
- **Secondary:** random password generator, secure password, password maker

## Functional Requirements
- [ ] Length slider (8–128 characters)
- [ ] Toggle: Uppercase letters
- [ ] Toggle: Lowercase letters
- [ ] Toggle: Numbers
- [ ] Toggle: Symbols
- [ ] Toggle: Exclude ambiguous characters (0, O, l, 1)
- [ ] Password strength indicator (Weak / Fair / Strong / Very Strong)
- [ ] Generate button (regenerate on click)
- [ ] Copy to clipboard button
- [ ] Generate multiple passwords (1–10)
- [ ] No library needed (Web Crypto API)

---

# SPEC: JSON Formatter
**File:** `docs/specs/tools/JSON_FORMATTER.md`  
**Slug:** `json-formatter`  
**Category:** developer

## SEO
- **Title:** `JSON Formatter & Validator — Beautify JSON Online | ToolForge`
- **Description:** `Format, beautify, and validate JSON online for free. Minify JSON, fix errors, and view JSON tree structure. No sign-up required.`
- **Primary Keyword:** JSON formatter online
- **Secondary:** JSON beautifier, format JSON, validate JSON, JSON viewer

## Functional Requirements
- [ ] Paste JSON input (large textarea)
- [ ] Format/Beautify button
- [ ] Minify button
- [ ] Validate (show errors with line numbers)
- [ ] Copy output button
- [ ] Download as .json file
- [ ] Syntax highlighting (Prism.js or highlight.js)
- [ ] JSON tree view toggle
- [ ] Line numbers in output
- [ ] Auto-detect and fix common errors

## Library
```bash
npm install prismjs
```

---

# SPEC: Word & Character Counter
**File:** `docs/specs/tools/WORD_COUNTER.md`  
**Slug:** `word-counter`  
**Category:** text

## SEO
- **Title:** `Word Counter — Count Words, Characters & Sentences Online | ToolForge`
- **Description:** `Count words, characters, sentences, and paragraphs in real time. Free online word counter for writers, students, and bloggers.`
- **Primary Keyword:** word counter online
- **Secondary:** character count, word count tool, letter counter, sentence counter

## Functional Requirements
- [ ] Large text input area
- [ ] Real-time counting (no button needed)
- [ ] Count: Words, Characters (with/without spaces), Sentences, Paragraphs, Lines
- [ ] Reading time estimate
- [ ] Speaking time estimate
- [ ] Keyword density analyzer
- [ ] Clear button
- [ ] Character limit warning (configurable)

---

# SPEC: Base64 Encoder/Decoder
**File:** `docs/specs/tools/BASE64_ENCODER.md`  
**Slug:** `base64-encoder`  
**Category:** developer

## SEO
- **Title:** `Base64 Encoder & Decoder — Encode/Decode Online Free | ToolForge`
- **Description:** `Encode text or files to Base64 and decode Base64 strings online for free. Supports text, images, and files.`
- **Primary Keyword:** base64 encode online
- **Secondary:** base64 decoder, text to base64, base64 converter, decode base64

## Functional Requirements
- [ ] Tab: Text encode/decode
- [ ] Tab: File to Base64
- [ ] Tab: Image to Base64 (with preview)
- [ ] Auto-detect mode (encode if text, decode if base64)
- [ ] Copy output button
- [ ] Download output as file
- [ ] URL-safe Base64 option
- [ ] No library needed (btoa/atob + FileReader API)
