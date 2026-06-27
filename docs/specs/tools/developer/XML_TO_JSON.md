# SPEC: XML to JSON Converter
**File:** `docs/specs/tools/developer/XML_TO_JSON.md`
**Status:** Completed
**Slug:** `xml-to-json`
**Category:** developer

---

## SEO

- **Title:** `XML to JSON Converter — Free Online Parser | ToolForge`
- **Description:** `Convert XML to JSON online free. Parse XML strings to JSON objects, validate structure, and beautify output. Uses your browser's built-in parser — nothing uploaded.`
- **Primary Keywords:** XML to JSON converter online, parse XML string to JSON object
- **Secondary Keywords:** convert XML to JSON array free, XML parser online

---

## Functional Requirements

- Split-pane layout: Input XML (left) vs Output JSON (right)
- Real-time conversion as user types
- Validate XML using DOMParser — show descriptive error badge if malformed
- "Beautify Output" toggle (pretty-print with 2-space indent vs compact)
- Copy JSON button
- Uses browser-native `DOMParser` API — no npm dependency needed
- Recursive DOM traversal to build clean JSON object

---

## UI Layout

```
┌──────────────────────┬───────────────────────┐
│  XML Input:          │  JSON Output:          │
│  ┌──────────────┐    │  ┌──────────────────┐  │
│  │ <root>       │    │  │ {                │  │
│  │  <name>Alice │    │  │   "root": {      │  │
│  │  </name>     │    │  │     "name": "Al" │  │
│  │ </root>      │    │  │   }              │  │
│  └──────────────┘    │  │ }                │  │
│                      │  └──────────────────┘  │
│  [error badge here]  │  ☑ Beautify             │
│                      │  [Copy JSON]            │
└──────────────────────┴───────────────────────┘
```

---

## Notes

- DOMParser parses in "text/xml" mode
- Check for `<parsererror>` tag in result to detect malformed XML
- Attributes become `@key` properties in JSON
- Text content of a node becomes `#text` key when node also has children
- Array nodes: multiple sibling elements with same tag name → JSON array
