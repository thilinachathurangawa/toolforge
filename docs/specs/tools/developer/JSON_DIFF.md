# SPEC: JSON Diff Comparator Tool
**File:** `docs/specs/tools/developer/JSON_DIFF.md`
**Status:** Completed
**Slug:** `json-diff`
**Category:** developer

---

## SEO

- **Title:** `JSON Diff Comparator — Compare JSON Files Online | ToolForge`
- **Description:** `Compare two JSON objects and visualize differences. Highlight added, removed, and modified fields. No sign-up required.`
- **Primary Keyword:** json diff
- **Secondary Keywords:** compare json, json difference checker, json compare tool

---

## Functional Requirements

- [ ] Two input textareas for JSON comparison
- [ ] Compare button
- [ ] Visual diff highlighting (added/removed/modified)
- [ ] Copy diff output button
- [ ] Show number of differences
- [ ] Handle nested objects and arrays
- [ ] Color-coded changes
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  JSON 1 (Original):             │
│  ┌───────────────────────────┐  │
│  │ {"name":"John","age":30} │  │
│  └───────────────────────────┘  │
│                                 │
│  JSON 2 (Modified):             │
│  ┌───────────────────────────┐  │
│  │ {"name":"John","age":31} │  │
│  └───────────────────────────┘  │
│                                 │
│  [Compare]                       │
├─────────────────────────────────┤
│  Differences:                   │
│  ┌───────────────────────────┐  │
│  │ - age: 30                │  │
│  │ + age: 31                │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  json1: string;
  json2: string;
  diffs: DiffResult[];
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste the original JSON into the first textarea
2. Paste the modified JSON into the second textarea
3. Click "Compare" to find differences
4. Review the highlighted changes (added, removed, modified)
5. Copy the diff output for documentation

---

## About Content (for SEO section)

Our JSON diff comparator compares two JSON objects and visualizes differences entirely in your browser. Identify added fields, removed fields, and modified values with color-coded highlighting. Perfect for tracking configuration changes, comparing API responses, or debugging data transformations. No JSON data is sent to any server — all processing happens locally on your device.
