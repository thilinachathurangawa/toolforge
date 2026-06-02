# SPEC: JSON Schema Visualizer Tool
**File:** `docs/specs/tools/developer/JSON_SCHEMA_VISUALIZER.md`
**Status:** Completed
**Slug:** `json-schema-visualizer`
**Category:** developer

---

## SEO

- **Title:** `JSON Schema Visualizer — View JSON Structure Online | ToolForge`
- **Description:** `Visualize JSON Schema definitions and validate JSON against schemas. View schema structure in tree format. No sign-up required.`
- **Primary Keyword:** json schema visualizer
- **Secondary Keywords:** json schema validator, view json schema, json structure viewer

---

## Functional Requirements

- [ ] Paste JSON input (large textarea)
- [ ] Visualize button
- [ ] Tree view of schema structure
- [ ] Color-coded types (object, array, string, number, etc.)
- [ ] Copy schema button
- [ ] Show type information
- [ ] Handle nested structures
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  JSON Input:                    │
│  ┌───────────────────────────┐  │
│  │ {"name":"John","age":30} │  │
│  └───────────────────────────┘  │
│                                 │
│  [Visualize]                    │
├─────────────────────────────────┤
│  Schema Tree:                   │
│  ┌───────────────────────────┐  │
│  │ 🌳 object                  │  │
│  │   ├── name: string         │  │
│  │   └── age: number          │  │
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
  tree: SchemaNode | null;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste your JSON data into the input textarea
2. Click "Visualize" to generate a schema tree
3. Review the structure in tree format
4. See type information for each field
5. Copy the schema for documentation

---

## About Content (for SEO section)

Our JSON schema visualizer analyzes JSON structure and generates a visual tree representation entirely in your browser. Understand data types, nested structures, and field relationships at a glance. Perfect for documenting APIs, understanding complex data models, or creating schema definitions. No data is sent to any server — all processing happens locally on your device.
