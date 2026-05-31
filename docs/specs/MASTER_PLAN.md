# SPEC: Master Project Plan
**File:** `docs/specs/MASTER_PLAN.md`  
**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2025

---

## 1. Project Overview

**Product Name:** ToolForge  
**Goal:** A free online multi-tool website generating revenue through display advertising.  
**Primary Revenue:** Google AdSense + Adsterra (scaling to Ezoic → Raptive)  
**Primary Traffic Source:** Organic SEO (Google Search)  
**Target Audience:** Developers, designers, students, general users needing quick browser tools

---

## 2. Success Metrics

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Monthly Pageviews | 10,000 | 50,000 | 100,000+ |
| Tools Published | 15 | 30 | 50+ |
| Monthly Ad Revenue | $20–$50 | $150–$300 | $500–$1,500 |
| Google Search Impressions | 5,000 | 50,000 | 200,000 |
| Core Web Vitals | All Green | All Green | All Green |

---

## 3. Development Phases

### Phase 1 — Foundation (Week 1–2)
- [x] Project scaffold (Next.js 14 + TypeScript + Tailwind)
- [x] Design system & global layout
- [x] Navbar, Footer, Sidebar components
- [x] Ad unit components (Banner, Sidebar, In-Article)
- [x] SEO base setup (next-seo, JSON-LD, sitemap, robots)
- [x] Google Analytics 4 integration
- [x] Vercel deployment pipeline
- [x] Homepage

### Phase 2 — Core Tools (Week 2–4)
- [x] Image Compressor
- [x] Image Cropper
- [x] QR Code Generator
- [x] Color Palette Extractor
- [x] Image Format Converter
- [x] Password Generator
- [x] JSON Formatter / Validator
- [x] Word / Character Counter

### Phase 3 — Expand Tools (Week 4–6)
- [x] Base64 Encoder/Decoder
- [x] URL Encoder/Decoder
- [x] Hash Generator (MD5, SHA-256)
- [x] Unit Converter
- [x] Image Resizer
- [x] Markdown Previewer
- [x] Lorem Ipsum Generator
- [ ] CSS Gradient Generator

### Phase 4 — SEO & Monetization (Week 6–8)
- [ ] Apply for Adsterra
- [ ] Individual tool landing page SEO content
- [ ] Blog section (SEO articles)
- [ ] Google Search Console setup
- [ ] Internal linking strategy
- [ ] Apply for Google AdSense

### Phase 5 — Scale (Month 3+)
- [ ] Add 20+ more tools
- [ ] Apply for Ezoic (10k sessions)
- [ ] Add Node.js backend (user accounts, history)
- [ ] Apply for Raptive (100k pageviews)

---

## 4. Spec-Driven Development Process

Every task follows this exact workflow:

```
┌─────────────────────────────────────────────────┐
│  1. SPEC         Write spec in /docs/specs/     │
│  2. PLAN         Break into subtasks            │
│  3. REVIEW       Confirm spec before coding     │
│  4. IMPLEMENT    Build per spec exactly         │
│  5. TEST         Manual + lighthouse check      │
│  6. SHIP         Merge + deploy to Vercel       │
└─────────────────────────────────────────────────┘
```

---

## 5. Tool Registry Plan

All tools are registered in `src/lib/constants/tools.ts`.  
Each tool has:
- `slug` — URL path (e.g. `image-compressor`)
- `name` — Display name
- `description` — SEO meta description
- `category` — For filtering/grouping
- `keywords` — SEO target keywords
- `icon` — Lucide icon name
- `component` — React component reference

---

## 6. Tech Decisions Log

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | SSR/SSG for SEO |
| Language | TypeScript | Type safety, scalability |
| Styling | Tailwind CSS | Speed, consistency |
| Components | shadcn/ui | Professional, accessible |
| SEO lib | next-seo + next-sitemap | Most complete solution |
| Ad network #1 | Adsterra | Easy approval, immediate revenue |
| Ad network #2 | Google AdSense | Best RPM long term |
| Hosting | Vercel | Native Next.js, best CDN |
| Analytics | GA4 | AdSense requirement |
| Future backend | Node.js + Express | Same language as frontend |
| Future DB | PostgreSQL + Prisma | Structured, scalable |
