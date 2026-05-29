# SPEC: Technical Architecture
**File:** `docs/specs/ARCHITECTURE.md`  
**Status:** Active  
**Version:** 1.0

---

## 1. Next.js App Router Structure

```
src/app/
├── layout.tsx              ← Root layout: fonts, GA4, AdSense script, global UI
├── page.tsx                ← Homepage: hero, tool grid, categories
├── not-found.tsx           ← Custom 404 page
├── sitemap.ts              ← Dynamic sitemap from tool registry
├── robots.ts               ← robots.txt config
└── tools/
    └── [slug]/
        ├── page.tsx        ← Dynamic tool page (SSG per tool)
        └── loading.tsx     ← Skeleton loading state
```

---

## 2. Component Architecture

```
src/components/
├── layout/
│   ├── Navbar.tsx          ← Logo, search, nav links
│   ├── Footer.tsx          ← Links, copyright, sitemap links
│   └── Sidebar.tsx         ← Related tools + sidebar ad
├── ads/
│   ├── AdBanner.tsx        ← Leaderboard 728x90 / 320x50 mobile
│   ├── AdSidebar.tsx       ← 300x250 / 300x600
│   ├── AdInArticle.tsx     ← In-content ad unit
│   └── AdProvider.tsx      ← Loads ad scripts conditionally
├── shared/
│   ├── ToolCard.tsx        ← Tool grid card
│   ├── ToolGrid.tsx        ← Responsive tool grid
│   ├── CategoryFilter.tsx  ← Filter tools by category
│   ├── SearchBar.tsx       ← Tool search
│   ├── PageHeader.tsx      ← Tool page title + description
│   ├── BreadCrumb.tsx      ← SEO breadcrumbs
│   └── CopyButton.tsx      ← Reusable copy-to-clipboard
└── tools/
    ├── ImageCompressor/
    │   ├── index.tsx
    │   └── types.ts
    ├── ImageCropper/
    ├── QRGenerator/
    ├── ColorPalette/
    └── ...                 ← One folder per tool
```

---

## 3. Data Flow

```
Tool Registry (tools.ts)
        ↓
Dynamic Route [slug]/page.tsx
        ↓
generateStaticParams() → SSG at build time
        ↓
Tool Page renders:
  - SEO metadata (title, description, OG, JSON-LD)
  - Ad Banner (top)
  - PageHeader
  - Tool Component (100% client-side logic)
  - Ad In-Article
  - Related Tools
  - Ad Banner (bottom)
```

---

## 4. Tool Registry Schema

```typescript
// src/lib/constants/tools.ts

export interface Tool {
  slug: string;           // URL: /tools/image-compressor
  name: string;           // "Image Compressor"
  shortDescription: string; // Card subtitle (max 80 chars)
  description: string;    // SEO meta description (max 160 chars)
  category: ToolCategory;
  tags: string[];         // Search tags
  keywords: string[];     // SEO keywords
  icon: string;           // Lucide icon name
  isNew?: boolean;        // Show "New" badge
  isPopular?: boolean;    // Show "Popular" badge
  relatedTools?: string[]; // Slugs of related tools
}

export type ToolCategory =
  | 'image'
  | 'text'
  | 'developer'
  | 'converter'
  | 'generator'
  | 'calculator'
  | 'security';
```

---

## 5. SEO Per-Page Pattern

```typescript
// Every tool page exports metadata:
export async function generateMetadata({ params }): Promise<Metadata> {
  const tool = getTool(params.slug);
  return {
    title: `${tool.name} — Free Online Tool | ToolForge`,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: tool.name,
      description: tool.description,
      url: `https://toolforge.vercel.app/tools/${tool.slug}`,
      images: [`/og-images/${tool.slug}.png`],
    },
    alternates: {
      canonical: `https://toolforge.vercel.app/tools/${tool.slug}`,
    },
  };
}
```

---

## 6. Ad Placement Pattern Per Tool Page

```
[AdBanner]          ← top of page, full width
[PageHeader]        ← H1, description, breadcrumb
[Tool Component]    ← main tool UI
[AdInArticle]       ← between tool and results
[Tool Results]      ← output area
[RelatedTools]      ← internal linking for SEO
[AdBanner]          ← bottom of page
```

Sidebar layout (desktop only):
```
[Tool Content]  |  [AdSidebar 300x250]
                |  [AdSidebar 300x600]
                |  [Related Tools]
```

---

## 7. Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | 90+ |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |
| Bundle size (per tool page) | < 150kb JS |

---

## 8. Environment Variables

```env
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSTERRA_KEY=XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://toolforge.vercel.app
```

---

## 9. Vercel Config

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```
