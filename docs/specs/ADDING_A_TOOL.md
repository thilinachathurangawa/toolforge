# Adding a New Tool — SEO & Content Standard

This is the **required checklist** for shipping any new tool on ToolForge. It
captures the content pattern introduced to resolve the Google AdSense rejections
("Google-served ads on screens with replicated content" and "Low value
content"). **A new tool is not done until it has a long-form content entry.**
Shipping a tool with only a registry stub recreates the exact thin/replicated
pages that caused the rejection.

> TL;DR: build the widget → register it → wire the dynamic import → **write a
> `TOOL_CONTENT` entry with all 5 sections** → run `npm run validate:content`
> and `npm run type-check`.

---

## Definition of Done (every new tool)

| # | Step | File |
|---|------|------|
| 1 | Build the tool component (client component; process locally in-browser where possible) | `src/components/tools/<ComponentName>/index.tsx` |
| 2 | Register the tool in the `TOOLS` array | `src/lib/constants/tools.ts` |
| 3 | Wire the component into the dynamic-import map (keyed by slug) | `src/app/tools/[slug]/page.tsx` |
| 4 | **Write the long-form content entry (the SEO requirement)** | `src/lib/content/tool-content.ts` |
| 5 | Run validation: `npm run validate:content` **and** `npm run type-check` | — |

Routing, the sitemap (`src/app/sitemap.ts`), category pages, breadcrumbs, and
FAQ structured data are all **driven automatically from the registry + content**
— no extra steps. Adding a brand-new category or calculator subcategory is the
only case that needs extra content (see "New categories" below).

---

## Step 4 in detail — the content entry (do not skip)

Add an entry to `TOOL_CONTENT` in `src/lib/content/tool-content.ts`, keyed by the
**exact same slug** used in the registry. The shape (`ToolLongContent`):

```ts
'your-tool-slug': {
  intro: [ /* 2–3 paragraphs */ ],
  steps: [ /* numbered, tool-specific */ ],
  why:   [ /* 2–4 genuine differentiators */ ],
  faqs:  [ { question: '…', answer: '…' } /* 3–5 */ ],
  related: [ { slug: 'other-tool', note: '…' } /* 2–3 */ ],
}
```

The page (`src/app/tools/[slug]/page.tsx`) renders these via
`ToolContent.tsx`: **About** (intro), **How to Use** (steps), **Why Use
ToolForge's …** (why), **Frequently Asked Questions** (faqs → also emitted as
`FAQPage` JSON-LD), and **Related Tools** (related, with reasons). When no entry
exists the page falls back to a thin generic block — which is exactly what we are
avoiding.

### The non-negotiable quality rules

These are what actually fixed the AdSense problem. Follow all of them.

1. **Unique, not templated.** Aim for **380–540 words** of prose per page. Do
   **not** reuse sentence structures across tools — vary the opening (a
   question, a scenario, a pain point), the examples, and the phrasing. The
   validator fails loudly on sentences repeated across tools.
2. **Accurate, pulled from the real implementation.** Read the component before
   writing. Base every claim on what the code actually does — supported formats,
   validation, option lists, exact formulas, limits. **Never invent a feature.**
   If a UI control is non-functional or cosmetic, do not claim it works.
3. **Honest about privacy & network.** Only say "runs client-side / nothing is
   uploaded" if that is true. If the tool calls an external API or proxy, say
   **which service** and that data leaves the browser. (See the network tools for
   examples, e.g. `dns-lookup` sends the domain to Google DoH.)
4. **Intro** — what it does, who needs it, and **2–3 concrete, tool-specific use
   cases** (not generic "save time" filler).
5. **Steps** — numbered, matching the tool's actual inputs/controls and labels.
6. **Why** — 2–4 real differentiators grounded in the implementation (client-side,
   no upload, no size limit, handles edge case X, supports N formats, shows its
   working, etc.).
7. **FAQs** — 3–5 questions real users search for (definitions, "why is X
   failing", "is my data safe", "what's a good value"). These become FAQPage
   structured data automatically.
8. **Related** — 2–3 existing tool slugs, each with a one-sentence reason.
   Cross-category links are fine when genuinely relevant. The slug must exist.
9. **When in doubt, flag it.** If you cannot write accurate content for a tool
   (e.g. the widget is a stub or returns fake data), do **not** guess — leave it
   out and flag the widget for a fix first. (This is why `internet-speed-test`
   was held back until its real measurement was wired in.)

### Copy-paste template

```ts
'your-tool-slug': {
  intro: [
    `Opening sentence that frames the real problem this tool solves — vary this per tool. Then what it does in plain terms.`,
    `Who reaches for it and 2–3 concrete, specific use cases. Mention a genuine, implementation-true detail (formats, limits, modes).`,
  ],
  steps: [
    `First action, matching the real first control/field.`,
    `Second action.`,
    `Third action.`,
    `Read / copy / download the result.`,
  ],
  why: [
    `Differentiator 1 — grounded in the code (e.g. runs entirely in your browser, so nothing is uploaded).`,
    `Differentiator 2 — a real capability competitors often lack.`,
    `Differentiator 3 — an accuracy/edge-case or UX advantage.`,
    `Differentiator 4 — free, no sign-up, instant (only if true).`,
  ],
  faqs: [
    { question: `A real search-intent question?`, answer: `A clear, accurate 2–3 sentence answer.` },
    { question: `Is my data private / where does it run?`, answer: `Honest answer about client-side vs external API.` },
    { question: `Why is my input failing / common gotcha?`, answer: `Explain the common mistake and fix.` },
    { question: `A "what's a good value / how does it work" question?`, answer: `Educational answer.` },
  ],
  related: [
    { slug: 'a-related-tool', note: `One sentence on why someone here might also need it.` },
    { slug: 'another-related-tool', note: `Another genuine reason.` },
    { slug: 'a-third-tool', note: `A third, optional.` },
  ],
},
```

---

## Registry entry reference (Step 2)

```ts
{
  slug: 'your-tool-slug',          // kebab-case; the page route is /tools/<slug>
  name: 'Your Tool Name',
  shortDescription: 'One line shown under the H1.',
  description: 'SEO meta description — what it does + key benefit + "no sign-up".',
  category: 'developer',           // one of the ToolCategory values
  subcategory: 'math-calculators', // calculators only
  tags: ['keyword', 'synonym'],
  keywords: ['search phrase people use', 'another phrase'],
  icon: 'LucideIconName',
  relatedTools: ['slug-a', 'slug-b'], // optional; powers the desktop sidebar
  phase: 4,
  // NOTE: prefer tool-content.ts over the legacy faqs/howToUse/aboutContent fields.
}
```

## Wiring the component (Step 3)

Add to the `toolComponents` map in `src/app/tools/[slug]/page.tsx`:

```ts
'your-tool-slug': dynamic(
  () => import('@/components/tools/YourComponent').then((m) => ({ default: m.YourComponent })),
  { loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />, ssr: false }
),
```

---

## New categories / subcategories (only if you add one)

- **New top-level category**: add it to `CATEGORIES` in `tools.ts`, then add a
  matching entry to `CATEGORY_CONTENT` in `src/lib/content/category-content.ts`
  (intro paragraphs + 3–4 FAQs). The category landing page and sitemap pick it up
  automatically.
- **New calculator subcategory**: add it to `CALCULATOR_SUBCATEGORIES` in
  `tools.ts`, then add a `SUBCATEGORY_CONTENT` entry. A hub page is generated at
  `/category/calculator/<subcategory>` and linked from the calculator category
  page automatically.

---

## Validation before you commit

```bash
npm run type-check        # TypeScript must pass
npm run validate:content  # content structure, related slugs, dup sentences, word floor
npm run build             # confirm all static pages still generate
```

`validate:content` (`scripts/validate-tool-content.cjs`) **fails** on missing
sections, bad/self related slugs, too few FAQs or related links, and warns on
under-floor word counts, duplicate sentences across tools, and any registered
tool with no content entry. Treat warnings as work to finish, not noise.

---

## Known widget caveats to avoid repeating

When building or auditing tools, watch for these patterns that previously shipped
and required honest content workarounds (fix the widget rather than describe a
lie): UI controls that don't change behavior (cosmetic dropdowns), buttons that
are unimplemented TODOs, "download X format" that outputs a different format,
simulated/random results presented as real measurements, and claims of privacy on
tools that actually call an external API. If you find one, fix it or flag it —
never write content that implies it works.
