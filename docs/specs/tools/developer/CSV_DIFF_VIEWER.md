# SPEC: CSV Diff Viewer
**File:** `docs/specs/tools/developer/CSV_DIFF_VIEWER.md`
**Status:** Completed
**Slug:** `csv-diff-viewer`
**Category:** developer

---

## SEO

- **Title:** `CSV Diff Viewer — Compare Two CSV Files Online | ToolForge`
- **Description:** `Compare two CSV files and highlight differences online free. Visual grid shows added rows (green), removed rows (red), and changed cells (yellow). Nothing uploaded.`
- **Primary Keywords:** compare two CSV files online, CSV diff checker tool
- **Secondary Keywords:** find differences between Excel sheets CSV, CSV comparison tool

---

## Functional Requirements

- Two CSV input areas: "Original CSV" and "Modified CSV"
- File upload or paste for both
- Generate a comparative grid table on compare
- Color coding:
  - Green background: new rows
  - Red background: removed rows
  - Yellow background: modified cells (unchanged rows shown in white/default)
- Show summary: X added, Y removed, Z modified rows
- Uses papaparse for CSV parsing
- No server upload

---

## UI Layout

```
┌──────────────────────────────────────────────┐
│  Original CSV:        Modified CSV:          │
│  ┌──────────────┐     ┌──────────────┐       │
│  │name,age      │     │name,age      │       │
│  │Alice,30      │     │Alice,31      │       │
│  │Bob,25        │     │Charlie,28    │       │
│  └──────────────┘     └──────────────┘       │
│  [Compare]                                   │
├──────────────────────────────────────────────┤
│  Summary: 1 modified, 1 added, 1 removed     │
├──────────────────────────────────────────────┤
│  ┌─────────┬──────────┬────────────────────┐ │
│  │ Status  │ name     │ age                │ │
│  ├─────────┼──────────┼────────────────────┤ │
│  │ modified│ Alice    │ [red:30]→[green:31]│ │
│  │ removed │ [red:Bob]│ [red:25]           │ │
│  │ added   │[grn:Charlie][grn:28]          │ │
│  └─────────┴──────────┴────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## Notes

- Use the first column (or row index) as the key for matching rows
- When headers are present, use them as column labels
- Diff algorithm: match rows by index, compare cell-by-cell
- Scroll the output table horizontally for wide CSVs
