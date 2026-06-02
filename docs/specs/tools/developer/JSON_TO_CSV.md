# SPEC: JSON to CSV Converter Tool
**File:** `docs/specs/tools/developer/JSON_TO_CSV.md`
**Status:** Completed
**Slug:** `json-to-csv`
**Category:** developer

---

## SEO

- **Title:** `JSON to CSV Converter — Convert JSON to CSV Online | ToolForge`
- **Description:** `Convert JSON data to CSV format online for free. Download converted CSV files instantly. No sign-up required.`
- **Primary Keyword:** json to csv converter
- **Secondary Keywords:** convert json to csv, json csv export, json to excel

---

## Functional Requirements

- [ ] Paste JSON input (large textarea)
- [ ] Convert button
- [ ] Copy output button
- [ ] Download as .csv file
- [ ] Handle nested JSON objects (flatten)
- [ ] Handle JSON arrays
- [ ] Auto-detect headers from keys
- [ ] Show number of rows converted
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  JSON Input:                    │
│  ┌───────────────────────────┐  │
│  │ [{"name":"John","age":30}]│  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Convert]                       │
├─────────────────────────────────┤
│  CSV Output:                    │
│  ┌───────────────────────────┐  │
│  │ name,age                  │  │
│  │ John,30                  │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy] [Download]              │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  input: string;
  output: string;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste your JSON data into the input textarea
2. Click "Convert" to transform JSON to CSV format
3. Review the CSV output in the preview area
4. Copy the output or download it as a .csv file

---

## About Content (for SEO section)

Our JSON to CSV converter transforms JSON data into CSV format entirely in your browser. Convert JSON arrays and objects to spreadsheet-compatible CSV files. The tool automatically flattens nested objects and extracts headers from JSON keys. Perfect for exporting API responses, configuration data, or database records to Excel or other spreadsheet applications. No data is sent to any server — all processing happens locally on your device.
