# SPEC: HTML Viewer & Live Preview Tool
**File:** `docs/specs/tools/developer/HTML_VIEWER.md`
**Status:** Completed
**Slug:** `html-viewer`
**Category:** developer

---

## SEO

- **Title:** `HTML Viewer — Live HTML Preview Online | ToolForge`
- **Description:** `Write HTML code and see live preview instantly. Test HTML snippets and visualize rendered output. No sign-up required.`
- **Primary Keyword:** html viewer
- **Secondary Keywords:** html preview, live html preview, html code viewer

---

## Functional Requirements

- [ ] HTML input textarea
- [ ] Preview button
- [ ] Live preview iframe/div
- [ ] Copy HTML button
- [ ] Basic HTML validation
- [ ] Show unclosed tags warning
- [ ] Render HTML safely
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  HTML Input:                    │
│  ┌───────────────────────────┐  │
│  │ <h1>Hello World</h1>     │  │
│  │ <p>This is a paragraph</p>│  │
│  └───────────────────────────┘  │
│                                 │
│  [Preview] [Copy]               │
├─────────────────────────────────┤
│  Live Preview:                  │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   Hello World            │  │
│  │   This is a paragraph    │  │
│  │                           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  input: string;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Write or paste your HTML code into the input textarea
2. Click "Preview" to see the rendered output
3. Review the live preview instantly
4. Copy the HTML code for use in your project

---

## About Content (for SEO section)

Our HTML viewer renders HTML code with a live preview entirely in your browser. Test HTML snippets, visualize rendered output, and validate basic HTML structure. Perfect for prototyping web pages, testing email templates, or learning HTML. No data is sent to any server — all rendering happens locally on your device.
