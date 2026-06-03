# SPEC: SEO Strategy
**File:** `docs/specs/seo/SEO_STRATEGY.md`  
**Status:** Active  
**Version:** 1.0

---

## 1. SEO Goals

- Rank on Page 1 for "[tool name] online free" keywords
- Target low-competition, high-volume tool keywords
- Build domain authority through content volume (50+ tool pages)
- Achieve Core Web Vitals "Good" status across all pages

---

## 2. Keyword Strategy

### Primary Keyword Pattern Per Tool
```
"[tool action] online free"     → "compress image online free"
"free online [tool name]"       → "free online QR code generator"
"[tool action] without software" → "resize image without software"
```

### Target Keywords Per Tool

| Tool | Primary Keyword | Secondary Keywords |
|---|---|---|
| Image Compressor | compress image online free | reduce image size, image optimizer |
| Image Cropper | crop image online free | image crop tool, cut image online |
| QR Generator | free QR code generator | create QR code, QR code maker |
| Color Palette | color palette from image | extract colors from image, color picker |
| JSON Formatter | JSON formatter online | JSON beautifier, format JSON |
| Password Generator | strong password generator | random password generator |
| Base64 Encoder | base64 encode online | text to base64, base64 converter |
| Word Counter | word counter online | character count, word count tool |
| Unit Converter | unit converter online | length converter, weight converter |
| Image Resizer | resize image online free | change image size, image dimensions |

---

## 3. On-Page SEO Requirements

### Every Tool Page MUST Have:
- [ ] Unique `<title>` tag: `{Tool Name} — Free Online Tool | ToolForge`
- [ ] Unique `<meta description>` (150–160 chars)
- [ ] Canonical URL tag
- [ ] H1 tag (tool name only, once)
- [ ] H2 tags for "How to Use" and "About" sections
- [ ] JSON-LD WebApplication schema
- [ ] Open Graph tags (title, description, image, url)
- [ ] Twitter Card tags
- [ ] Breadcrumb (Home > Tools > Tool Name)
- [ ] Alt text on all images
- [ ] Internal links to 3+ related tools

### JSON-LD Schema Template
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "{Tool Name}",
  "url": "https://toolforge-jet.vercel.app/tools/{slug}",
  "description": "{tool description}",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "browserRequirements": "Requires JavaScript",
  "featureList": ["{feature1}", "{feature2}"]
}
```

---

## 4. Technical SEO

### Sitemap
- Auto-generated via `src/app/sitemap.ts`
- Includes all tool pages + homepage + category pages
- Submit to Google Search Console on launch

### robots.txt
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://toolforge-jet.vercel.app/sitemap.xml
```

### URL Structure
```
https://toolforge-jet.vercel.app/                        ← Homepage
https://toolforge-jet.vercel.app/tools/image-compressor  ← Tool page
https://toolforge-jet.vercel.app/tools/qr-generator      ← Tool page
https://toolforge-jet.vercel.app/category/image          ← Category page (Phase 4)
https://toolforge-jet.vercel.app/blog/how-to-compress-images ← Blog (Phase 4)
```

---

## 5. Content SEO (Per Tool Page)

Each tool page should include below the tool UI:

### "How to Use" Section (H2)
- 3–5 numbered steps
- Screenshot or GIF (optional Phase 4)
- Helps with Featured Snippets

### "About This Tool" Section (H2)
- 100–150 word description
- Naturally include primary + secondary keywords
- Answer "what is X" and "why use X"

### FAQ Section (H2) — Phase 4
- 3–5 FAQs per tool
- Use FAQPage JSON-LD schema
- Targets "People Also Ask" boxes

---

## 6. Internal Linking Strategy

- Each tool page links to 3–5 related tools
- Homepage shows all tools in a searchable grid
- Category pages group tools by type
- Footer contains full sitemap links

---

## 7. Google Search Console Setup

1. Verify domain ownership via Vercel DNS
2. Submit sitemap.xml
3. Monitor:
   - Coverage (indexed pages)
   - Core Web Vitals report
   - Search queries driving traffic
   - Click-through rates per page

---

## 8. Page Speed Optimization

- Next.js Image component for all images (`next/image`)
- Tool JS libraries loaded **lazily** (dynamic imports)
- Ad scripts loaded with `strategy="lazyOnload"`
- No render-blocking resources
- Font optimization via `next/font`
