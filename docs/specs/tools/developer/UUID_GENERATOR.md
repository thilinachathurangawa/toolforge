# SPEC: UUID Generator Tool
**File:** `docs/specs/tools/developer/UUID_GENERATOR.md`
**Status:** Completed
**Slug:** `uuid-generator`
**Category:** developer

---

## SEO

- **Title:** `UUID Generator — Generate UUID v4 Online | ToolForge`
- **Description:** `Generate UUID v4 and other UUID versions. Create bulk UUIDs and copy to clipboard instantly. No sign-up required.`
- **Primary Keyword:** uuid generator
- **Secondary Keywords:** generate uuid, uuid v4, guid generator

---

## Functional Requirements

- [ ] Count input (1-100)
- [ ] Generate button
- [ ] Display generated UUIDs
- [ ] Copy all button
- [ ] Copy individual UUID button
- [ ] Download as .txt file
- [ ] Use crypto API for secure generation
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  Count: [1]                     │
│                                 │
│  [Generate]                     │
├─────────────────────────────────┤
│  Generated UUIDs:               │
│  ┌───────────────────────────┐  │
│  │ 550e8400-e29b-41d4-a716... │ [Copy]
│  │ 6ba7b810-9dad-11d1-80b4... │ [Copy]
│  │ 6ba7b811-9dad-11d1-80b4... │ [Copy]
│  └───────────────────────────┘  │
│                                 │
│  [Copy All] [Download]           │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  uuids: string[];
  count: number;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Set the number of UUIDs to generate (1-100)
2. Click "Generate" to create UUIDs
3. View the generated UUIDs in the list
4. Copy individual UUIDs or copy all at once
5. Download as a .txt file if needed

---

## About Content (for SEO section)

Our UUID generator creates unique identifiers using the browser's crypto API entirely in your browser. Generate UUID v4 format with cryptographic randomness. Create bulk UUIDs for testing, database records, or unique identifiers. No data is sent to any server — all generation happens locally on your device.
