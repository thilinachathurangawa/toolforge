---
description: Scaffold a new ToolForge tool end-to-end following the content/SEO standard
argument-hint: <tool name or what it should do>
---

You are adding a new tool to ToolForge. Follow the project's content/SEO standard
exactly — a new tool is NOT done until it has unique long-form content, because
shipping a thin page recreates the Google AdSense "replicated/low-value content"
problem this standard exists to prevent.

Tool to build: **$ARGUMENTS**

## 0. Read the standard first
Read `docs/specs/ADDING_A_TOOL.md` and `CLAUDE.md` before doing anything else, so
you apply the current rules and file conventions.

## 1. Nail down the spec
From the request above, determine: tool name, URL slug (kebab-case), category
(and calculator subcategory if applicable), what it does, its inputs/controls,
its outputs, and whether it runs fully client-side or calls an external service.
If any of these are unclear or missing, **ask the user concise clarifying
questions before writing code** — do not guess the behavior.

## 2. Build the tool component
Create `src/components/tools/<ComponentName>/index.tsx` as a client component.
Prefer doing the work locally in the browser (canvas, Web Crypto, pure JS) so the
tool can honestly claim privacy. Match the styling and patterns of existing tools
in `src/components/tools/`.

## 3. Register it
Add a `Tool` entry to the `TOOLS` array in `src/lib/constants/tools.ts` (slug,
name, shortDescription, description, category, subcategory?, tags, keywords, icon,
relatedTools?, phase). Use the registry reference in the standard doc.

## 4. Wire the dynamic import
Add the slug→`dynamic(() => import(...))` entry to the `toolComponents` map in
`src/app/tools/[slug]/page.tsx` (ssr: false, with the pulse loading placeholder).

## 5. Write the long-form content entry — the SEO requirement
Add a `TOOL_CONTENT` entry in `src/lib/content/tool-content.ts`, keyed by the same
slug, with all five sections: `intro`, `steps`, `why`, `faqs`, `related`. Obey the
non-negotiable quality rules from the standard:
- 380–540 words of UNIQUE prose; vary structure and examples — never mail-merge.
- Every claim accurate and based on the component you just built (its real inputs,
  validation, formats, formulas, limits). Never invent or overstate a feature.
- Honest about privacy/network: only claim client-side if true; if it calls an
  external API, name the service and say data leaves the browser.
- intro: 2–3 paragraphs incl. 2–3 concrete, tool-specific use cases.
- steps: numbered, matching the actual controls.
- why: 2–4 genuine, implementation-grounded differentiators.
- faqs: 3–5 real search-intent Q&As (they auto-emit FAQPage JSON-LD).
- related: 2–3 EXISTING tool slugs, each with a one-sentence reason (cross-category
  is fine when genuinely relevant; verify each slug exists in TOOLS).

If you added a brand-new category or calculator subcategory, also add the matching
`CATEGORY_CONTENT` / `SUBCATEGORY_CONTENT` entry in
`src/lib/content/category-content.ts`.

## 6. Validate
Run and ensure they pass:
```
npm run type-check
npm run validate:content
```
Fix any errors (missing sections, bad/self related slugs, too few FAQs/related)
and address warnings (under-floor word count, duplicate sentences across tools).

## 7. Report
Summarize what you created (component, registry, wiring, content), the validation
results, and flag anything you couldn't verify (e.g. needs a browser smoke-test).
Do not commit unless the user asks.
