# SPEC: String Converter Tool
**File:** `docs/specs/tools/developer/STRING_CONVERTER.md`
**Status:** Completed
**Slug:** `string-converter`
**Category:** developer

---

## SEO

- **Title:** `String Converter — Convert String Cases Online | ToolForge`
- **Description:** `Convert string cases between camelCase, snake_case, kebab-case, PascalCase, and more. No sign-up required.`
- **Primary Keyword:** string converter
- **Secondary Keywords:** case converter, convert string case, string case converter

---

## Functional Requirements

- [ ] Input string textarea
- [ ] From case selector
- [ ] To case selector
- [ ] Swap cases button
- [ ] Copy output button
- [ ] Support 10+ case formats
- [ ] Real-time conversion
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  Input String:                  │
│  ┌───────────────────────────┐  │
│  │ myVariableName            │  │
│  └───────────────────────────┘  │
│                                 │
│  From: [camelCase]  To: [snake_case]
│  [⇄ Swap]                       │
├─────────────────────────────────┤
│  Output:                        │
│  ┌───────────────────────────┐  │
│  │ my_variable_name         │  │
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
  fromCase: CaseType;
  toCase: CaseType;
  output: string;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Enter your string in the input textarea
2. Select the source case format
3. Select the target case format
4. View the converted string automatically
5. Copy the output for use in your code

---

## About Content (for SEO section)

Our string converter transforms text between different case formats entirely in your browser. Convert between camelCase, snake_case, kebab-case, PascalCase, and more. Perfect for renaming variables, formatting API responses, or standardizing code conventions. No data is sent to any server — all conversion happens locally on your device.
