# SPEC: Open Graph Preview Generator Tool
**File:** `docs/specs/tools/seo/OPEN_GRAPH_PREVIEW_GENERATOR.md`
**Status:** Pending
**Slug:** `open-graph-preview-generator`
**Category:** seo

---

## SEO

- **Title:** `Open Graph Preview Generator — Test OG Tags Online Free | ToolForge`
- **Description:** `Preview how your website appears on social media. Test Open Graph tags, see Facebook and LinkedIn previews, and optimize your social sharing.`
- **Primary Keyword:** Open Graph preview generator
- **Secondary Keywords:** OG tag tester, social media preview, Facebook link preview, Open Graph debugger

---

## Functional Requirements

- [ ] URL input field to fetch existing OG tags
- [ ] Manual OG tag input fields:
  - [ ] OG Title
  - [ ] OG Description
  - [ ] OG Image URL
  - [ ] OG URL
  - [ ] OG Site Name
  - [ ] OG Type selector
- [ ] Live preview cards for:
  - [ ] Facebook
  - [ ] LinkedIn
  - [ ] Twitter (large card)
  - [ ] WhatsApp
- [ ] Image upload for OG image preview
- [ ] Character counters for title and description
- [ ] Recommended length indicators
- [ ] Copy generated meta tags button
- [ ] Download preview as image option
- [ ] Validate OG tags
- [ ] Show warnings for missing tags
- [ ] Fetch real URL's OG tags (if CORS allows)

---

## Library

No external library needed — use CSS for preview styling

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Enter URL to Fetch OG Tags              │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/page        │   │
│  │ [Fetch Tags]                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  OR Enter Manually:                     │
│  ┌─────────────────────────────────┐   │
│  │ OG Title: [_________________] 45/60│
│  │ OG Description: [_________] 142/160│
│  │ OG Image URL: [_____________]    │   │
│  │ OG URL: [_________________]      │   │
│  │ Site Name: [_________________]   │   │
│  │ Type: [Website ▼]              │   │
│  │ [Upload Image]                  │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Live Previews:                          │
│  ┌─────────────────────────────────┐   │
│  │ Facebook Preview:                │   │
│  │ ┌─────────────────────────────┐ │   │
│  │ │ [Image Preview]              │ │   │
│  │ │ Site Name                    │ │   │
│  │ │ Title                        │ │   │
│  │ │ Description                  │ │   │
│  │ └─────────────────────────────┘ │   │
│  ├─────────────────────────────────┤   │
│  │ LinkedIn Preview:                │   │
│  │ ┌─────────────────────────────┐ │   │
│  │ │ [Image Preview]              │ │   │
│  │ │ Title                        │ │   │
│  │ │ Description                  │ │   │
│  │ └─────────────────────────────┘ │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Copy Meta Tags] [Download Preview]    │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  fetchUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  siteName: string;
  ogType: 'website' | 'article' | 'product';
  uploadedImage: File | null;
  imagePreviewUrl: string;
  warnings: string[];
}
```

---

## Recommended Lengths

- **OG Title:** 40-60 characters (optimal)
- **OG Description:** 150-160 characters (optimal)
- **OG Image:** 1200x630 pixels (recommended 1.91:1 ratio)
- **OG Image Size:** Under 5MB

---

## How to Use Content (for SEO section)

1. Enter your website URL to fetch existing Open Graph tags
2. Or manually enter OG tag information
3. Upload an image for your OG preview (recommended 1200x630px)
4. See live previews for Facebook, LinkedIn, Twitter, and WhatsApp
5. Adjust title and description to fit recommended character limits
6. Copy the generated meta tags to your website
7. Download preview images for documentation or sharing

---

## About Content (for SEO section)

Our free Open Graph preview generator lets you see how your website appears when shared on social media. Test and optimize your OG tags for Facebook, LinkedIn, Twitter, and WhatsApp in real-time. Includes character counters, image upload, and downloadable previews. All processing happens in your browser with no data sent to any server.
