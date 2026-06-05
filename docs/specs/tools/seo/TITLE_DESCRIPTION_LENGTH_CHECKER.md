# SPEC: Title & Description Length Checker Tool
**File:** `docs/specs/tools/seo/TITLE_DESCRIPTION_LENGTH_CHECKER.md`
**Status:** Pending
**Slug:** `title-description-length-checker`
**Category:** seo

---

## SEO

- **Title:** `Title & Description Length Checker — SEO Meta Tag Analyzer | ToolForge`
- **Description:** `Check title tag and meta description length for SEO. Ensure your meta tags are within optimal character limits for Google and other search engines.`
- **Primary Keyword:** title description length checker
- **Secondary Keywords:** meta tag length checker, SEO title analyzer, meta description counter, title tag optimizer

---

## Functional Requirements

- [ ] Title tag input field with real-time character count
- [ ] Meta description input field with real-time character count
- [ ] Pixel width calculation for both fields
- [ ] Visual indicators:
  - [ ] Green bar: optimal length
  - [ ] Yellow bar: approaching limit
  - [ ] Red bar: over limit
- [ ] Percentage progress bars
- [ ] Multiple search engine support:
  - [ ] Google (title: 50-60, desc: 150-160)
  - [ ] Bing (title: 50-60, desc: 150-160)
  - [ ] Yahoo (title: 50-60, desc: 150-160)
- [ ] Character limit presets
- [ ] Suggestions for optimization
- [ ] Truncate preview (shows how text will be cut off)
- [ ] Copy optimized tags button
- [ ] Clear button
- [ ] Batch check multiple titles/descriptions

---

## Library

No external library needed — use canvas for pixel width calculation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Search Engine: [Google ▼]              │
├─────────────────────────────────────────┤
│  Title Tag:                              │
│  ┌─────────────────────────────────┐   │
│  │ Your Amazing Page Title Here    │   │
│  └─────────────────────────────────┘   │
│  Characters: 32/60  Pixels: 280/600     │
│  ████████████░░░░░░░░░░ 53%             │
│  ✓ Optimal length                       │
│                                         │
│  Truncated Preview:                     │
│  "Your Amazing Page Title Here"         │
├─────────────────────────────────────────┤
│  Meta Description:                       │
│  ┌─────────────────────────────────┐   │
│  │ This is a compelling meta      │   │
│  │ description that will attract   │   │
│  │ clicks from search results.     │   │
│  └─────────────────────────────────┘   │
│  Characters: 98/160  Pixels: 560/920    │
│  ████████████████░░░░░ 61%              │
│  ✓ Optimal length                       │
│                                         │
│  Truncated Preview:                     │
│  "This is a compelling meta description..."│
├─────────────────────────────────────────┤
│  Suggestions:                            │
│  • Your title is within optimal range   │
│  • Consider adding more keywords to title│
│  • Description could be more compelling │
│                                         │
│  [Copy Tags] [Clear]                     │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
interface LengthCheck {
  characters: number;
  pixels: number;
  percentage: number;
  status: 'optimal' | 'warning' | 'over';
  truncated: string;
}

state: {
  title: string;
  description: string;
  searchEngine: 'google' | 'bing' | 'yahoo';
  titleCheck: LengthCheck;
  descCheck: LengthCheck;
  suggestions: string[];
}
```

---

## Search Engine Limits

| Search Engine | Title Chars | Title Pixels | Desc Chars | Desc Pixels |
|---------------|-------------|--------------|------------|-------------|
| Google        | 50-60       | ~600         | 150-160    | ~920        |
| Bing          | 50-60       | ~600         | 150-160    | ~920        |
| Yahoo         | 50-60       | ~600         | 150-160    | ~920        |

---

## Pixel Width Calculation

```typescript
function calculatePixelWidth(text: string, fontSize: number = 16): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px Arial, sans-serif`;
  return context.measureText(text).width;
}
```

---

## How to Use Content (for SEO section)

1. Select your target search engine (Google, Bing, or Yahoo)
2. Enter your page title tag
3. Enter your meta description
4. Monitor character counts and pixel widths in real-time
5. Watch the progress bars to stay within optimal limits
6. Review the truncated preview to see how text will appear
7. Read suggestions for optimization
8. Adjust your tags until they show optimal status
9. Copy the optimized tags to your website

---

## About Content (for SEO section)

Our free title and description length checker ensures your meta tags are optimized for search engines. Check character counts and pixel widths for Google, Bing, and Yahoo. Get real-time feedback with visual indicators and optimization suggestions. All processing happens in your browser with no data sent to any server.
