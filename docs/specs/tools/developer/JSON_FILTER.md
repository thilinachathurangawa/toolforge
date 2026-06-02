# SPEC: JSON Filter Tool
**File:** `docs/specs/tools/developer/JSON_FILTER.md`
**Status:** Completed
**Slug:** `json-filter`
**Category:** developer

---

## SEO

- **Title:** `JSON Filter Tool — Filter JSON Data Online | ToolForge`
- **Description:** `Filter JSON arrays and objects by keys, values, or custom conditions. Extract specific data from large JSON. No sign-up required.`
- **Primary Keyword:** json filter
- **Secondary Keywords:** filter json data, query json, json search tool

---

## Functional Requirements

- [ ] Paste JSON input (large textarea)
- [ ] Filter key input
- [ ] Filter value input (optional)
- [ ] Apply filter button
- [ ] Copy output button
- [ ] Show number of filtered results
- [ ] Handle JSON arrays and objects
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  JSON Input:                    │
│  ┌───────────────────────────┐  │
│  │ [{"name":"John","age":30}]│  │
│  └───────────────────────────┘  │
│                                 │
│  Filter Key: [name]            │
│  Filter Value: [John]          │
│                                 │
│  [Apply Filter]                 │
├─────────────────────────────────┤
│  Filtered Result:               │
│  ┌───────────────────────────┐  │
│  │ [{"name":"John","age":30}]│  │
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
  filterKey: string;
  filterValue: string;
  output: string;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste your JSON data into the input textarea
2. Enter the key to filter by
3. Optionally enter a value to match
4. Click "Apply Filter" to extract matching data
5. Review the filtered results
6. Copy the output for use in your application

---

## About Content (for SEO section)

Our JSON filter tool extracts specific data from JSON arrays and objects entirely in your browser. Filter by keys, values, or custom conditions to narrow down large datasets. Perfect for analyzing API responses, filtering configuration data, or extracting specific records. No data is sent to any server — all processing happens locally on your device.
