# ToolForge — project conventions

Next.js 14 / TypeScript / Tailwind / shadcn-ui multi-tool site. ~153 tools across
10 categories. Content is **data-driven**: the tool registry plus per-tool
long-form content modules drive routing, SEO, category pages, sitemap, and
structured data.

## ⚠️ Every new tool MUST ship with long-form content

This is the project's most important rule. Google AdSense rejected the site for
"replicated content" and "low value content" because tool pages were thin and
shared identical boilerplate. The fix was to give **every** tool page unique,
substantial content. **Do not reintroduce the problem**: a new tool is not done
until it has a `TOOL_CONTENT` entry with all five sections.

**Full standard + copy-paste template: [docs/specs/ADDING_A_TOOL.md](docs/specs/ADDING_A_TOOL.md). Read it before adding a tool.**

### Definition of Done for a new tool
1. Component → `src/components/tools/<Name>/index.tsx` (client-side; process locally where possible).
2. Register it in `TOOLS` → `src/lib/constants/tools.ts`.
3. Wire the dynamic import (keyed by slug) → `src/app/tools/[slug]/page.tsx`.
4. **Write the content entry** (intro, steps, why, faqs, related) → `src/lib/content/tool-content.ts`, keyed by the same slug.
5. Validate: `npm run validate:content` **and** `npm run type-check` (then `npm run build` before merging).

Sitemap, category pages, breadcrumbs, and FAQ JSON-LD are automatic from the
registry + content. A new top-level category needs a `CATEGORY_CONTENT` entry,
and a new calculator subcategory needs a `SUBCATEGORY_CONTENT` entry, both in
`src/lib/content/category-content.ts`.

### Content quality rules (non-negotiable)
- **Unique, not templated** — 380–540 words per page; vary sentence structure and
  examples tool-to-tool. Never mail-merge with the tool name swapped in.
- **Accurate** — read the component first; base every claim on what the code
  actually does (formats, validation, formulas, limits). Never invent a feature
  or describe a non-functional/cosmetic control as if it works.
- **Honest about privacy/network** — only claim "client-side / nothing uploaded"
  if true; if it calls an external API, name the service and say data leaves the
  browser.
- **Flag, don't guess** — if you can't write accurate content (stub or fake
  widget), leave it out and fix/flag the widget first.

## Key files
- `src/lib/constants/tools.ts` — tool registry (`TOOLS`, `CATEGORIES`, `CALCULATOR_SUBCATEGORIES`).
- `src/lib/content/tool-content.ts` — per-tool long-form content (`TOOL_CONTENT`).
- `src/lib/content/category-content.ts` — category + subcategory landing content.
- `src/components/shared/ToolContent.tsx` — renders the five content sections.
- `src/app/tools/[slug]/page.tsx` — tool page + dynamic-import map.
- `src/app/category/[slug]/page.tsx` and `src/app/category/calculator/[subcategory]/page.tsx` — landing pages.
- `scripts/validate-tool-content.cjs` — content validator (`npm run validate:content`).

## Commands
- `npm run dev` / `npm run build` / `npm run type-check`
- `npm run validate:content` — checks structure, related-slug validity, duplicate
  sentences across tools, and the word-count floor. Run it after editing content.

## Git
Work on a feature branch; `main` auto-deploys. Don't commit/push unless asked.
