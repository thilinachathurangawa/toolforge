# SPEC: YAML ↔ JSON Converter
**File:** `docs/specs/tools/developer/YAML_JSON_CONVERTER.md`
**Status:** Completed
**Slug:** `yaml-json-converter`
**Category:** developer

---

## SEO

- **Title:** `YAML ↔ JSON Converter — Online Bidirectional Tool | ToolForge`
- **Description:** `Convert YAML to JSON and JSON to YAML online free. Real-time bi-directional conversion with line-number error reporting. No sign-up, no upload.`
- **Primary Keywords:** YAML to JSON converter, JSON to YAML formatter
- **Secondary Keywords:** YAML parser checker, kubernetes yaml to json tool, convert yaml to json online

---

## Functional Requirements

- Two tabs: "YAML → JSON" and "JSON → YAML"
- Real-time conversion as user types
- Display line-number errors when parsing fails
- Copy button for output side
- Clear button
- Uses `js-yaml` library (npm install js-yaml)
- No server calls — fully client-side

---

## UI Layout

```
┌──────────────────────────────────────────────┐
│  [YAML → JSON]  [JSON → YAML]                │
├──────────────────────────────────────────────┤
│  Input (YAML):          Output (JSON):       │
│  ┌───────────────┐      ┌───────────────┐    │
│  │ name: Alice   │  →   │ {             │    │
│  │ age: 30       │      │   "name": "Al"│    │
│  └───────────────┘      │   "age": 30   │    │
│                         │ }             │    │
│  [error: line 2: ...]   └───────────────┘    │
│                         [Copy] [Clear]       │
└──────────────────────────────────────────────┘
```

---

## Notes

- js-yaml `safeLoad` / `dump` for YAML↔JSON conversion
- Catch YAMLException and display message with line/column info
- JSON errors: use try/catch JSON.parse and show the error message
- Pretty-print JSON output with 2-space indent by default
