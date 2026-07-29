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

### Core Features
- Two CSV input areas: "Original CSV" and "Modified CSV"
- File upload or paste for both
- Drag and drop support for CSV files
- Generate a comparative grid table on compare
- Color coding:
  - Green background: new rows
  - Red background: removed rows
  - Yellow background: modified cells (unchanged rows shown in white/default)
- Show summary: X added, Y removed, Z modified rows
- Uses papaparse for CSV parsing
- No server upload

### Input Enhancements
- CSV file upload buttons for both original and modified inputs
- Drag and drop support for CSV files
- Clear/Reset buttons for individual inputs and master reset
- Sample data button to load test CSV data quickly

### CSV Parsing Options
- Delimiter selection: comma, semicolon, tab, pipe, or custom
- Header row toggle: explicit option to specify if first row contains headers
- Auto-detect delimiter: automatically detect the delimiter used in the CSV
- Quote character selection: single quote, double quote, or custom
- Encoding selection: UTF-8, ASCII, and other common encodings
- Skip empty rows toggle: option to skip or include empty rows

### Comparison Options
- Key column selection: choose which column to use as the key for matching rows (instead of just index)
- Case sensitivity toggle: option for case-sensitive or case-insensitive comparison
- Ignore whitespace toggle: option to ignore leading/trailing whitespace
- Trim cells toggle: option to trim whitespace from cells before comparison

### Output/Display Options
- Filter by status: filter results to show only added, removed, or modified rows
- Search functionality: search within the diff results
- Column visibility toggle: allow hiding/showing specific columns
- Side-by-side view: option to view original and modified side by side instead of merged
- Pagination: add pagination for large CSV files
- Row limit warning: warn users if CSV is too large (>1000 rows)

### Export Options
- Export diff results as CSV or JSON
- Export comparison statistics

### Statistics
- Detailed statistics: total rows, columns, file sizes, processing time
- Change percentage: show percentage of rows changed

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
