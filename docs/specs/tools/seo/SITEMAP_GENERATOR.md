# SPEC: Sitemap Generator Tool
**File:** `docs/specs/tools/seo/SITEMAP_GENERATOR.md`
**Status:** Pending
**Slug:** `sitemap-generator`
**Category:** seo

---

## SEO

- **Title:** `Sitemap Generator — Create XML Sitemaps Online Free | ToolForge`
- **Description:** `Generate XML sitemaps for your website instantly. Add URLs, set priorities, change frequencies, and download valid sitemap files for free.`
- **Primary Keyword:** sitemap generator
- **Secondary Keywords:** XML sitemap creator, sitemap builder, Google sitemap generator, SEO sitemap tool

---

## Functional Requirements

- [ ] URL input field with "Add URL" button
- [ ] Bulk URL import (textarea for multiple URLs, one per line)
- [ ] URL list management:
  - [ ] Edit URL
  - [ ] Delete URL
  - [ ] Clear all
- [ ] Per-URL settings:
  - [ ] Priority slider (0.0–1.0, default 0.5)
  - [ ] Change frequency selector (always, hourly, daily, weekly, monthly, yearly, never)
  - [ ] Last modified date picker
- [ ] Default settings for new URLs
- [ ] URL validation (must be valid URL format)
- [ ] Duplicate URL detection
- [ ] Live sitemap preview
- [ ] Download as XML file
- [ ] Copy XML to clipboard
- [ ] Sitemap statistics (total URLs, file size)
- [ ] Support for up to 50,000 URLs (XML sitemap limit)

---

## Library

No external library needed — use XML template string generation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Add URLs                                │
│  ┌─────────────────────────────────┐   │
│  │ URL: [https://example.com/page] │   │
│  │ Priority: [0.5]  Freq: [Weekly ▼]│   │
│  │ Last Mod: [2024-01-15]          │   │
│  │ [Add URL]                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Bulk Import [▼]                         │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/page1        │   │
│  │ https://example.com/page2        │   │
│  │ ...                              │   │
│  │ [Import URLs]                    │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  URL List (12 URLs)                      │
│  ┌─────────────────────────────────┐   │
│  │ ✓ https://example.com/page1    │   │
│  │   Priority: 0.8  Weekly        │   │
│  │   [Edit] [Delete]               │   │
│  ├─────────────────────────────────┤   │
│  │ ✓ https://example.com/page2    │   │
│  │   Priority: 0.5  Monthly        │   │
│  │   [Edit] [Delete]               │   │
│  └─────────────────────────────────┘   │
│  [Clear All]                            │
├─────────────────────────────────────────┤
│  Sitemap Preview                         │
│  ┌─────────────────────────────────┐   │
│  │ <?xml version="1.0"...>          │   │
│  │ <urlset xmlns="...">             │   │
│  │   <url>                          │   │
│  │     <loc>https://...</loc>      │   │
│  │     <priority>0.8</priority>    │   │
│  │   </url>                         │   │
│  │   ...                            │   │
│  │ </urlset>                        │   │
│  └─────────────────────────────────┘   │
│  Size: 2.3KB  URLs: 12                  │
│  [Download XML] [Copy]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
interface SitemapUrl {
  id: string;
  loc: string;
  priority: number;
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastMod: string;
}

state: {
  urls: SitemapUrl[];
  currentUrl: string;
  defaultPriority: number;
  defaultChangeFreq: string;
  bulkImportText: string;
  generatedXml: string;
  errors: string[];
}
```

---

## XML Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## How to Use Content (for SEO section)

1. Add URLs individually using the URL input field
2. Set priority (0.0–1.0) and change frequency for each URL
3. Or use bulk import to add multiple URLs at once (one per line)
4. Edit or remove URLs from the list as needed
5. Review the live sitemap preview to ensure correctness
6. Download the XML file or copy it to clipboard
7. Upload the sitemap.xml file to your website's root directory
8. Submit the sitemap to Google Search Console and Bing Webmaster Tools

---

## About Content (for SEO section)

Our free sitemap generator creates valid XML sitemaps for search engines. Add your URLs, set priorities and change frequencies, and download a ready-to-use sitemap.xml file. Helps search engines discover and index your website pages more effectively. Supports up to 50,000 URLs per sitemap. All processing happens in your browser with no data sent to any server.
