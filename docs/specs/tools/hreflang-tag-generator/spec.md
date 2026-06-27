# Hreflang Tag Generator — Spec

## Slug
`hreflang-tag-generator`

## Category
`seo`

## Component Location
`src/components/tools/HreflangTagGenerator/index.tsx`

## Overview
Dynamic row builder that produces `<link rel="alternate" hreflang="..." href="...">` tags
for multilingual SEO. Pure React state — no server calls.

## UI Controls
- "Add URL" button — appends a new row
- Each row contains:
  - URL `<input>` (e.g. https://example.com/en/)
  - Language `<select>` (ISO 639-1, ~30 common languages)
  - Region `<select>` (ISO 3166-1 alpha-2, optional — "(none)" default)
  - Remove row button (disabled when only 1 row remains)
- "Add x-default" checkbox: adds an x-default row pointing to a configurable URL
- x-default URL input (visible when checkbox checked)
- Output `<textarea readonly>`: all `<link>` tags
- "Copy All Tags" button
- "Clear All" button

## Language Options (ISO 639-1 selection)
af, ar, bg, bn, cs, da, de, el, en, es, et, fi, fr, gu, he, hi, hr, hu, id, it,
ja, kn, ko, lt, lv, ml, mr, ms, nl, no, pa, pl, pt, ro, ru, sk, sl, sq, sr, sv,
sw, ta, te, th, tl, tr, uk, ur, vi, zh (+ x-default as special)

## Region Options (ISO 3166-1 alpha-2 selection)
Most common: US, GB, AU, CA, IN, NZ, IE, ZA, SG, MY, PH, NG, KE, GH — show full list

## Core Logic
```ts
function buildTag(url: string, lang: string, region: string): string {
  const hreflang = region ? `${lang}-${region}` : lang;
  return `<link rel="alternate" hreflang="${hreflang}" href="${url}" />`;
}
```
- x-default: `<link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`
- Output all tags joined by newlines

## TypeScript Interfaces
```ts
interface HreflangRow {
  id: string;
  url: string;
  language: string;
  region: string;
}
```

## SEO Keywords
- "hreflang tag generator online"
- "multilingual SEO link builder"
- "HTML language alternate tags"
- "hreflang code generator"
- "international SEO hreflang"

## Content Outline
**Intro:** What hreflang solves (duplicate content across locales); Google and Bing support.
**Steps:** Add rows → set URL + language + region → optionally add x-default → copy tags.
**Why:** Builds valid RFC 5646 language tags; x-default support; instant code output.
**FAQs:** What is hreflang, when do I need x-default, does order matter, what if I have 50+ URLs.
**Related:** sitemap-generator, robots-txt-generator, meta-tag-generator
