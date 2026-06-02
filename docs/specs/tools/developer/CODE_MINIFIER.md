# SPEC: Code Minifier Tool
**File:** `docs/specs/tools/developer/CODE_MINIFIER.md`
**Status:** Completed
**Slug:** `code-minifier`
**Category:** developer

---

## SEO

- **Title:** `Code Minifier — Minify JavaScript, CSS, HTML Online | ToolForge`
- **Description:** `Minify JavaScript, CSS, and HTML code to reduce file size. Remove whitespace and comments automatically. No sign-up required.`
- **Primary Keyword:** code minifier
- **Secondary Keywords:** minify javascript, minify css, minify html

---

## Functional Requirements

- [ ] Code type selector (JavaScript, CSS, HTML)
- [ ] Code input textarea
- [ ] Minify button
- [ ] Minified output display
- [ ] Copy output button
- [ ] Show size reduction percentage
- [ ] Remove comments and whitespace
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  [JavaScript] [CSS] [HTML]      │
│                                 │
│  Code Input:                    │
│  ┌───────────────────────────┐  │
│  │ function hello() {       │  │
│  │   console.log("Hi");     │  │
│  │ }                         │  │
│  └───────────────────────────┘  │
│                                 │
│  [Minify]                       │
├─────────────────────────────────┤
│  Minified Output:               │
│  ┌───────────────────────────┐  │
│  │ function hello(){console. │  │
│  │ log("Hi")}                │  │
│  └───────────────────────────┘  │
│                                 │
│  Size: 45 → 32 bytes (29% reduction)
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  input: string;
  codeType: 'javascript' | 'css' | 'html';
  output: string;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Select the code type (JavaScript, CSS, or HTML)
2. Paste your code into the input textarea
3. Click "Minify" to compress the code
4. Review the minified output and size reduction
5. Copy the minified code for production use

---

## About Content (for SEO section)

Our code minifier compresses JavaScript, CSS, and HTML code entirely in your browser. Remove whitespace, comments, and unnecessary characters to reduce file size. Perfect for optimizing web performance, preparing code for production, or reducing bandwidth usage. No data is sent to any server — all minification happens locally on your device.
