# Schema Markup Generator — Spec

## Slug
`schema-markup-generator`

## Category
`seo`

## Component Location
`src/components/tools/SchemaMarkupGenerator/index.tsx`

## Overview
Pure React form → live JSON-LD output. Supports three schema types via tabs:
Article, Product, and FAQ. All logic is local state — no server calls.

## UI Controls
**Schema type selector:** Tab buttons — Article | Product | FAQ

**Article fields:**
- Headline (required)
- Description
- URL
- Image URL
- Author Name
- Date Published (date input)
- Publisher Name
- Publisher Logo URL

**Product fields:**
- Product Name (required)
- Description
- Image URL
- Price (number)
- Currency (select: USD, EUR, GBP, AUD, CAD, INR, JPY)
- Rating Value (1–5)
- Review Count
- Brand Name
- Availability (select: InStock, OutOfStock, PreOrder)

**FAQ fields:**
- Dynamic Q&A pairs: question + answer inputs
- "Add Question" button
- Remove button per pair (minimum 1)

**Output:**
- `<pre>` block with syntax-highlighted JSON-LD wrapped in `<script type="application/ld+json">` tag
- "Copy Code" button
- "Clear" button

## Core Logic
```ts
function buildArticleSchema(fields: ArticleFields): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": fields.headline,
    // ... conditional fields (omit empty)
  };
  return JSON.stringify(schema, null, 2);
}
// Wrap: `<script type="application/ld+json">\n${json}\n</script>`
```
- Always omit empty/falsy fields from the output

## TypeScript Interfaces
```ts
type SchemaType = 'article' | 'product' | 'faq';

interface ArticleFields { headline: string; description: string; url: string; imageUrl: string; authorName: string; datePublished: string; publisherName: string; publisherLogoUrl: string; }
interface ProductFields { name: string; description: string; imageUrl: string; price: string; currency: string; ratingValue: string; reviewCount: string; brand: string; availability: string; }
interface FaqPair { question: string; answer: string; }
```

## SEO Keywords
- "JSON-LD schema generator free"
- "FAQ schema markup builder"
- "rich snippets code generator"
- "structured data generator SEO"
- "article schema markup"

## Content Outline
**Intro:** Why structured data boosts SERP features; three supported schema types.
**Steps:** Select type → fill fields → copy the `<script>` tag → paste into `<head>`.
**Why:** Generates spec-compliant JSON-LD; omits empty fields automatically; real-time preview.
**FAQs:** What is JSON-LD, which schema type should I use, where does it go in my HTML,
does Google require all fields.
**Related:** meta-tag-generator, robots-txt-generator, serp-snippet-preview
