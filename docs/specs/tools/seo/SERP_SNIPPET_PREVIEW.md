# SPEC: SERP Snippet Preview Tool
**File:** `docs/specs/tools/seo/SERP_SNIPPET_PREVIEW.md`
**Status:** Pending
**Slug:** `serp-snippet-preview`
**Category:** seo

---

## SEO

- **Title:** `SERP Snippet Preview — Test Google Search Results Free | ToolForge`
- **Description:** `Preview how your website appears in Google search results. Test title tags, meta descriptions, and optimize your SERP snippets for SEO.`
- **Primary Keyword:** SERP snippet preview
- **Secondary Keywords:** Google search preview, SERP simulator, title tag preview, meta description preview

---

## Functional Requirements

- [ ] Title tag input (character counter, recommended 50-60 chars)
- [ ] Meta description input (character counter, recommended 150-160 chars)
- [ ] URL input (display URL)
- [ ] Live SERP preview (Google-style)
- [ ] Desktop and mobile preview toggle
- [ ] Date display toggle (shows "Jan 15, 2024" style)
- [ ] Site name input
- [ ] Favicon upload or URL
- [ ] Character count indicators with color coding:
  - [ ] Green: optimal length
  - [ ] Yellow: near limit
  - [ ] Red: over limit
- [ ] Pixel width indicator for title (approx 600px max)
- [ ] Copy preview as text
- [ ] Download preview as image
- [ ] Multiple preview comparison (A/B testing)

---

## Library

No external library needed — use CSS for Google-style styling

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  [Desktop ▼]  [Mobile]                  │
├─────────────────────────────────────────┤
│  Title Tag:                              │
│  ┌─────────────────────────────────┐   │
│  │ Your Amazing Page Title Here    │   │
│  └─────────────────────────────────┘   │
│  Characters: 32/60  Pixels: 280/600 ✓    │
│                                         │
│  Meta Description:                       │
│  ┌─────────────────────────────────┐   │
│  │ This is a compelling meta      │   │
│  │ description that will attract   │   │
│  │ clicks from search results.     │   │
│  └─────────────────────────────────┘   │
│  Characters: 98/160 ✓                    │
│                                         │
│  URL:                                   │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/your-page  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Site Name: [Example]                   │
│  Favicon: [Upload] [URL]                │
│  [✓] Show date                          │
├─────────────────────────────────────────┤
│  Google Search Preview:                  │
│  ┌─────────────────────────────────┐   │
│  │ [Favicon] Example               │   │
│  │ https://example.com/your-page  │   │
│  │                                 │   │
│  │ Your Amazing Page Title Here    │   │
│  │ This is a compelling meta      │   │
│  │ description that will attract   │   │
│  │ clicks from search results.     │   │
│  │                                 │   │
│  │ Jan 15, 2024                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Copy Preview] [Download Image]        │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  title: string;
  description: string;
  url: string;
  siteName: string;
  faviconUrl: string;
  showDate: boolean;
  previewMode: 'desktop' | 'mobile';
  titleCharCount: number;
  descCharCount: number;
  titlePixelWidth: number;
}
```

---

## Character Limits

- **Title Tag:** 50-60 characters (optimal), max ~600 pixels
- **Meta Description:** 150-160 characters (optimal), max ~920 pixels
- **URL:** Displayed as breadcrumb style in Google

---

## How to Use Content (for SEO section)

1. Enter your page title tag (aim for 50-60 characters)
2. Write your meta description (aim for 150-160 characters)
3. Enter your page URL
4. Add site name and favicon for authenticity
5. Toggle between desktop and mobile previews
6. Monitor character counts and pixel widths
7. Adjust content to stay within optimal limits
8. Copy the preview or download as image for documentation

---

## About Content (for SEO section)

Our free SERP snippet preview tool shows exactly how your website appears in Google search results. Test and optimize your title tags and meta descriptions before publishing. Includes desktop and mobile previews, character counters, and pixel width indicators. All processing happens in your browser with no data sent to any server.
