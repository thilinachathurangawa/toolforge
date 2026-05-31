# SPEC: Phase 1 — Foundation
**File:** `docs/specs/phases/PHASE_1_FOUNDATION.md`  
**Status:** Completed  
**Version:** 1.0

---

## Overview

Build the complete project scaffold, design system, layout components, SEO base, and deployment pipeline. No tools built in this phase — foundation only.

---

## Tasks

### Task 1.1 — Next.js Project Setup
**Status:** Completed  
**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`

```bash
npx create-next-app@latest toolforge \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**Dependencies to install:**
```bash
# UI
npx shadcn@latest init
npx shadcn@latest add button card badge separator sheet

# SEO
npm install next-sitemap

# Icons
npm install lucide-react

# Image tools (for later)
npm install browser-image-compression cropperjs qrcode color-thief-browser

# Utilities
npm install clsx tailwind-merge
```

---

### Task 1.2 — Design System
**Status:** Completed  
**Files:** `src/styles/globals.css`, `tailwind.config.ts`

**Color Palette:**
```css
--primary: #0F172A      /* Dark navy */
--accent: #6366F1       /* Indigo */
--accent-light: #818CF8
--background: #FFFFFF
--surface: #F8FAFC
--border: #E2E8F0
--text-primary: #0F172A
--text-secondary: #64748B
--success: #10B981
--warning: #F59E0B
--error: #EF4444
```

**Typography:**
- Display: `Syne` (bold headings, tool names)
- Body: `DM Sans` (readable, clean)
- Mono: `JetBrains Mono` (code, hashes, outputs)
- Source: Google Fonts via `next/font`

---

### Task 1.3 — Global Layout
**Status:** Completed  
**Files:** `src/app/layout.tsx`

Requirements:
- [ ] Load fonts via `next/font/google`
- [ ] GA4 script (lazy loaded)
- [ ] AdSense script (lazy loaded)
- [ ] Global metadata defaults
- [ ] Renders `<Navbar>` and `<Footer>`
- [ ] Body background pattern (subtle grid)

---

### Task 1.4 — Navbar Component
**Status:** Completed  
**Files:** `src/components/layout/Navbar.tsx`

Requirements:
- [ ] Logo (ToolForge wordmark + icon)
- [ ] Navigation links: Home, Tools, Categories
- [ ] Search bar (filters tools client-side)
- [ ] Mobile hamburger menu (Sheet component)
- [ ] Sticky on scroll with blur backdrop
- [ ] Dark mode toggle (Phase 2)

---

### Task 1.5 — Footer Component
**Status:** Completed  
**Files:** `src/components/layout/Footer.tsx`

Requirements:
- [ ] Logo + tagline
- [ ] Tool category links (SEO internal linking)
- [ ] Pages: About, Privacy Policy, Contact
- [ ] Copyright
- [ ] "All tools work 100% in your browser — your data never leaves your device"

---

### Task 1.6 — Homepage
**Status:** Completed  
**Files:** `src/app/page.tsx`

Requirements:
- [ ] Hero section: headline, subheadline, search bar
- [ ] Stats bar: "50+ Tools | 100% Free | No Sign-up"
- [ ] Category filter tabs
- [ ] Tool grid (ToolCard components)
- [ ] Ad Banner below hero
- [ ] SEO: H1, meta description, JSON-LD (WebSite schema)

---

### Task 1.7 — Tool Page Template
**Status:** Completed  
**Files:** `src/app/tools/[slug]/page.tsx`, `src/app/tools/[slug]/loading.tsx`

Requirements:
- [ ] `generateStaticParams()` from tool registry
- [ ] `generateMetadata()` per tool
- [ ] JSON-LD WebApplication schema
- [ ] Breadcrumb component
- [ ] AdBanner (top)
- [ ] Tool component (dynamic import)
- [ ] AdInArticle (middle)
- [ ] "How to Use" section
- [ ] "About This Tool" section
- [ ] Related tools grid
- [ ] AdBanner (bottom)

---

### Task 1.8 — Ad Components
**Status:** Completed  
**Files:** `src/components/ads/`

- [ ] `AdBanner.tsx` — responsive top/bottom banner
- [ ] `AdSidebar.tsx` — sticky desktop sidebar
- [ ] `AdInArticle.tsx` — in-content ad
- [ ] `AdProvider.tsx` — script loader

---

### Task 1.9 — SEO Infrastructure
**Status:** Completed  
**Files:** `src/app/sitemap.ts`, `src/app/robots.ts`, `next-sitemap.config.js`

- [ ] Dynamic sitemap from tool registry
- [ ] robots.txt
- [ ] Default OG image (`public/og-default.png`)

---

### Task 1.10 — Vercel Deployment
**Status:** Completed  
**Files:** `vercel.json`, `.env.example`, `.gitignore`

- [ ] `vercel.json` with security headers
- [ ] `.env.example` with all required env vars
- [ ] GitHub repo setup
- [ ] Connect to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Verify deployment

---

## Acceptance Criteria for Phase 1

- [x] Site deploys successfully to Vercel
- [x] Homepage loads in < 2 seconds
- [x] Lighthouse score: Performance 90+, SEO 100
- [x] No TypeScript errors
- [x] Mobile responsive (tested at 375px, 768px, 1280px)
- [x] Ad placeholders visible (not yet monetized)
- [x] Sitemap accessible at `/sitemap.xml`
- [x] robots.txt accessible at `/robots.txt`
