# SPEC: JSON Path Finder Tool
**File:** `docs/specs/tools/developer/JSON_PATH_FINDER.md`
**Status:** Completed
**Slug:** `json-path-finder`
**Category:** developer

---

## SEO

- **Title:** `JSON Path Finder — Query JSON with JSONPath Online | ToolForge`
- **Description:** `Query JSON data using JSONPath expressions. Extract specific values and paths from complex JSON structures. No sign-up required.`
- **Primary Keyword:** json path finder
- **Secondary Keywords:** jsonpath query, extract json values, json query tool

---

## Functional Requirements

- [ ] Paste JSON input (large textarea)
- [ ] JSONPath expression input
- [ ] Quick preset buttons (root, first item, all items)
- [ ] Find/Query button
- [ ] Display matched results
- [ ] Copy result button
- [ ] Show path and value
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  JSON Input:                    │
│  ┌───────────────────────────┐  │
│  │ {"users":[{"name":"John"}]│  │
│  └───────────────────────────┘  │
│                                 │
│  JSONPath:                      │
│  ┌───────────────────────────┐  │
│  │ $.users[0].name           │  │
│  └───────────────────────────┘  │
│  [Root] [First] [All]           │
│                                 │
│  [Find]                         │
├─────────────────────────────────┤
│  Result:                        │
│  ┌───────────────────────────┐  │
│  │ "John"                    │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  input: string;
  path: string;
  output: any;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste your JSON data into the input textarea
2. Enter a JSONPath expression or use preset buttons
3. Click "Find" to query the JSON data
4. View the extracted value and path
5. Copy the result for use in your code

---

## About Content (for SEO section)

Our JSON path finder queries JSON data using JSONPath expressions entirely in your browser. Extract specific values from complex JSON structures using path notation. Perfect for developers working with APIs, configuration files, or nested data structures. No JSON data is sent to any server — all processing happens locally on your device.
