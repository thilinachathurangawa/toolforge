# SPEC: CSV to JSON Converter
**File:** `docs/specs/tools/developer/CSV_TO_JSON.md`
**Status:** Completed
**Slug:** `csv-to-json`
**Category:** developer

---

## SEO

- **Title:** `CSV to JSON Converter — Free Online Tool | ToolForge`
- **Description:** `Convert CSV data to JSON arrays instantly. Paste CSV or drop a file. Supports headers, skip empty lines, auto-parse numbers. Runs offline in your browser.`
- **Primary Keywords:** CSV to JSON converter, convert CSV to JSON online
- **Secondary Keywords:** excel data to json array, free CSV string to JSON converter

---

## Functional Requirements

- Paste-in textarea OR file dropzone (CSV/TXT)
- Toggles:
  - Has Header Row (maps first row as JSON keys)
  - Skip Empty Lines
  - Parse Numbers & Booleans automatically
- Monospaced JSON output area
- Copy JSON button
- Clear button
- Uses `papaparse` library for robust parsing
- No server upload — fully offline

---

## UI Layout

```
┌──────────────────────────────────────────────┐
│  Input CSV:                                  │
│  ┌────────────────────────────────────────┐  │
│  │  name,age,city                         │  │
│  │  Alice,30,London                       │  │
│  └────────────────────────────────────────┘  │
│  [Upload File]                               │
│  ☑ Has Header Row  ☑ Skip Empty Lines        │
│  ☑ Parse Numbers/Booleans                    │
│  [Convert →]                                 │
├──────────────────────────────────────────────┤
│  JSON Output:                                │
│  ┌────────────────────────────────────────┐  │
│  │  [{"name":"Alice","age":30,...}]        │  │
│  └────────────────────────────────────────┘  │
│  [Copy JSON]  [Clear]                        │
└──────────────────────────────────────────────┘
```

---

## Notes

- Uses `papaparse` (already added to package.json)
- When "Has Header Row" is off, output as array of arrays
- Show row count in output header (e.g., "23 rows converted")
