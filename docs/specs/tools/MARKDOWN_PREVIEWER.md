# SPEC: Markdown Previewer Tool
**File:** `docs/specs/tools/MARKDOWN_PREVIEWER.md`  
**Status:** Pending  
**Slug:** `markdown-previewer`  
**Category:** text

---

## SEO

- **Title:** `Markdown Previewer — Write & Preview Markdown Online Free | ToolForge`
- **Description:** `Write Markdown and see a live preview side by side. Supports GitHub Flavored Markdown with syntax highlighting. Free online editor.`
- **Primary Keyword:** markdown previewer online
- **Secondary Keywords:** markdown editor, live markdown preview, markdown viewer, GFM previewer

---

## Functional Requirements

- [ ] Split view: Editor on left, Preview on right
- [ ] Large textarea for Markdown input
- [ ] Real-time preview (updates as you type)
- [ ] Support GitHub Flavored Markdown (GFM)
- [ ] Syntax highlighting for code blocks
- [ ] Support tables, task lists, strikethrough
- [ ] Auto-save to localStorage
- [ ] Copy Markdown to clipboard
- [ ] Copy HTML to clipboard
- [ ] Download as .md file
- [ ] Download as .html file
- [ ] Clear button
- [ ] Toggle between split view and preview-only
- [ ] Line numbers in editor

---

## Library

```bash
npm install react-markdown remark-gfm rehype-highlight
```

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│  [Editor] [Preview] [Split]    [Copy] [DL]  │
├───────────────────┬─────────────────────────┤
│  Editor           │  Preview                │
│  [___________]    │  [Rendered Markdown]    │
│  [___________]    │                         │
│  [___________]    │  # Heading              │
│  [___________]    │  **Bold text**          │
│  [___________]    │  - List item            │
│  [___________]    │                         │
│                   │                         │
└───────────────────┴─────────────────────────┘
```

---

## Component State

```typescript
state: {
  markdown: string;
  html: string;
  viewMode: 'split' | 'editor' | 'preview';
  isAutoSaving: boolean;
  lastSaved: Date | null;
}
```

---

## How to Use Content (for SEO section)

1. Write or paste your Markdown in the editor on the left
2. See the live preview on the right as you type
3. Toggle between split view, editor-only, or preview-only modes
4. Copy the Markdown or HTML to your clipboard
5. Download your work as .md or .html file
6. Your content is auto-saved to browser storage

---

## About Content (for SEO section)

Our free Markdown previewer lets you write and preview Markdown in real time with split-screen editing. Supports GitHub Flavored Markdown including tables, task lists, code blocks with syntax highlighting, and more. All processing happens in your browser with no data sent to any server. Perfect for writing documentation, README files, or blog posts.
