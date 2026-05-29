# ToolForge — Free Online Tools Platform

> A collection of free, fast, browser-based tools built for SEO performance and ad revenue.
> No backend required. No sign-up. No data leaves your browser.

---

## 🔗 Live URL
`https://toolforge.vercel.app` *(update after deployment)*

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| SEO | next-seo + next-sitemap + JSON-LD |
| Analytics | Google Analytics 4 |
| Ads | Google AdSense + Adsterra |
| Hosting | Vercel |

---

## 🗂️ Project Structure

```
toolforge/
├── docs/
│   └── specs/              ← Spec file for every tool + feature
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← Root layout (ads, analytics, fonts)
│   │   ├── page.tsx         ← Homepage
│   │   ├── sitemap.ts       ← Dynamic sitemap
│   │   ├── robots.ts        ← robots.txt
│   │   └── tools/
│   │       └── [tool]/      ← Dynamic tool pages
│   ├── components/
│   │   ├── ads/             ← Ad unit components
│   │   ├── tools/           ← Individual tool UIs
│   │   ├── shared/          ← Reusable UI pieces
│   │   └── layout/          ← Navbar, Footer, Sidebar
│   ├── lib/
│   │   ├── utils/           ← Helper functions
│   │   ├── hooks/           ← Custom React hooks
│   │   └── constants/       ← Tool registry, config
│   ├── styles/              ← Global CSS
│   └── types/               ← TypeScript interfaces
└── public/
    ├── icons/               ← Tool icons
    └── og-images/           ← Open Graph images per tool
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Generate sitemap
npm run postbuild
```

---

## 📋 Spec-Driven Development

Every tool and major feature has a spec file in `/docs/specs/`.
Development follows this flow:

```
1. Write Spec  →  2. Review Spec  →  3. Implement  →  4. Test  →  5. Ship
```

See `/docs/specs/` for all current specs.

---

## 🛠️ Adding a New Tool

1. Create spec: `docs/specs/tools/TOOL_NAME.md`
2. Create component: `src/components/tools/ToolName/`
3. Register in tool registry: `src/lib/constants/tools.ts`
4. Page auto-generates via dynamic route: `src/app/tools/[tool]/page.tsx`
5. Sitemap auto-updates on next build

---

## 💰 Ad Revenue Setup

See `docs/specs/ads/AD_STRATEGY.md` for full ad placement and network strategy.

---

## 📈 SEO Setup

See `docs/specs/seo/SEO_STRATEGY.md` for full SEO implementation guide.
