# SPEC: Regex Explainer Tool
**File:** `docs/specs/tools/developer/REGEX_EXPLAINER.md`
**Status:** Completed
**Slug:** `regex-explainer`
**Category:** developer

---

## SEO

- **Title:** `Regex Explainer — Explain Regular Expressions Online | ToolForge`
- **Description:** `Break down regular expressions and explain each part in plain English. Understand complex regex patterns. No sign-up required.`
- **Primary Keyword:** regex explainer
- **Secondary Keywords:** explain regex, regex documentation, regex pattern explanation

---

## Functional Requirements

- [ ] Regex pattern input
- [ ] Explain button
- [ ] Breakdown of each regex component
- [ ] Plain English explanations
- [ ] Color-coded parts (literal, class, quantifier, etc.)
- [ ] Copy explanation button
- [ ] Show pattern type for each part
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  /pattern/                      │
│  ┌───────────────────────────┐  │
│  │ [a-z]+\d+                 │  │
│  └───────────────────────────┘  │
│                                 │
│  [Explain]                      │
├─────────────────────────────────┤
│  Explanation:                   │
│  ┌───────────────────────────┐  │
│  │ [a-z]+ - Character class  │  │
│  │   Matches one or more     │  │
│  │   lowercase letters        │  │
│  │                           │  │
│  │ \d+ - Special character   │  │
│  │   Matches one or more     │  │
│  │   digits                  │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  pattern: string;
  explanation: ExplanationPart[];
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Enter your regular expression pattern
2. Click "Explain" to break down the pattern
3. Review the explanation for each component
4. Learn what each part of the regex does
5. Copy the explanation for documentation

---

## About Content (for SEO section)

Our regex explainer breaks down regular expressions into understandable parts entirely in your browser. Learn what each character, class, and quantifier does in plain English. Perfect for learning regex syntax, understanding complex patterns, or documenting regex for your team. No data is sent to any server — all processing happens locally on your device.
