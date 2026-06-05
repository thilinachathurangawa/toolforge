# SPEC: Meta Tag Generator Tool
**File:** `docs/specs/tools/seo/META_TAG_GENERATOR.md`
**Status:** Pending
**Slug:** `meta-tag-generator`
**Category:** seo

---

## SEO

- **Title:** `Meta Tag Generator — Create SEO Meta Tags Online Free | ToolForge`
- **Description:** `Generate meta tags for your website instantly. Create title, description, keywords, Open Graph, Twitter Card, and other SEO meta tags for free.`
- **Primary Keyword:** meta tag generator
- **Secondary Keywords:** meta tags creator, SEO meta tags, HTML meta tags generator, open graph generator

---

## Functional Requirements

- [ ] Page title input (character counter, recommended 50-60 chars)
- [ ] Meta description input (character counter, recommended 150-160 chars)
- [ ] Meta keywords input (comma-separated)
- [ ] Author input field
- [ ] Canonical URL input
- [ ] Robots meta tag selector (index/noindex, follow/nofollow)
- [ ] Open Graph tags section:
  - [ ] OG title
  - [ ] OG description
  - [ ] OG image URL
  - [ ] OG URL
  - [ ] OG type selector (website, article, etc.)
- [ ] Twitter Card tags section:
  - [ ] Card type selector (summary, summary_large_image)
  - [ ] Twitter title
  - [ ] Twitter description
  - [ ] Twitter image URL
- [ ] Additional meta tags:
  - [ ] Viewport meta tag toggle
  - [ ] Charset selector (UTF-8 default)
  - [ ] Language selector
- [ ] Live preview of generated meta tags
- [ ] Copy to clipboard button
- [ ] Download as HTML file option
- [ ] Clear all button
- [ ] Validation for character limits with visual indicators

---

## Library

No external library needed — use template strings and validation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Basic Meta Tags                        │
│  ┌─────────────────────────────────┐   │
│  │ Title: [_________________] 45/60│   │
│  │ Description: [_____________] 142/160│
│  │ Keywords: [_________________]     │   │
│  │ Author: [_________________]       │   │
│  │ Canonical URL: [_____________]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Open Graph Tags [▼]                    │
│  ┌─────────────────────────────────┐   │
│  │ OG Title: [_________________]    │   │
│  │ OG Description: [_____________]  │   │
│  │ OG Image URL: [_____________]    │   │
│  │ OG Type: [Website ▼]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Twitter Card Tags [▼]                  │
│  ┌─────────────────────────────────┐   │
│  │ Card Type: [Summary ▼]          │   │
│  │ Twitter Image: [_____________]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Generate Tags] [Clear]                │
├─────────────────────────────────────────┤
│  Generated Meta Tags:                    │
│  ┌─────────────────────────────────┐   │
│  │ <meta name="description"...>    │   │
│  │ <meta property="og:title"...>    │   │
│  │ ...                              │   │
│  └─────────────────────────────────┘   │
│  [Copy] [Download HTML]                 │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  title: string;
  description: string;
  keywords: string;
  author: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: 'website' | 'article' | 'product';
  
  // Twitter Card
  twitterCardType: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  
  // Additional
  includeViewport: boolean;
  charset: string;
  language: string;
  
  generatedTags: string;
}
```

---

## How to Use Content (for SEO section)

1. Enter your page title (aim for 50-60 characters for optimal display)
2. Write a compelling meta description (150-160 characters recommended)
3. Add relevant keywords separated by commas
4. Fill in author and canonical URL if applicable
5. Expand Open Graph section to add social media tags
6. Expand Twitter Card section for Twitter-specific tags
7. Click "Generate Tags" to create your meta tags
8. Copy the generated code or download as HTML file
9. Paste the meta tags into your website's `<head>` section

---

## About Content (for SEO section)

Our free meta tag generator creates comprehensive SEO meta tags for your website. Generate title tags, meta descriptions, Open Graph tags, Twitter Cards, and more — all in one place. Character counters help you stay within optimal limits for search engines and social media platforms. All processing happens in your browser with no data sent to any server.
