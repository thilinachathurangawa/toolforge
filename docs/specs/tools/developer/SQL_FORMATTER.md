# SPEC: SQL Formatter Tool
**File:** `docs/specs/tools/developer/SQL_FORMATTER.md`
**Status:** Completed
**Slug:** `sql-formatter`
**Category:** developer

---

## SEO

- **Title:** `SQL Formatter — Format SQL Queries Online | ToolForge`
- **Description:** `Format SQL queries with proper indentation and syntax highlighting. Support for MySQL, PostgreSQL, and more. No sign-up required.`
- **Primary Keyword:** sql formatter
- **Secondary Keywords:** format sql, sql beautifier, sql query formatter

---

## Functional Requirements

- [ ] SQL input textarea
- [ ] Indent size input (1-8)
- [ ] Uppercase keywords toggle
- [ ] Format button
- [ ] Copy output button
- [ ] Syntax highlighting
- [ ] Handle SELECT, FROM, WHERE, JOIN, etc.
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  SQL Input:                     │
│  ┌───────────────────────────┐  │
│  │ SELECT * FROM users WHERE │  │
│  │ age > 18                  │  │
│  └───────────────────────────┘  │
│                                 │
│  Indent: [2]  [☑] Uppercase    │
│                                 │
│  [Format]                       │
├─────────────────────────────────┤
│  Formatted SQL:                 │
│  ┌───────────────────────────┐  │
│  │ SELECT                    │  │
│  │   *                       │  │
│  │ FROM                      │  │
│  │   users                   │  │
│  │ WHERE                     │  │
│  │   age > 18                │  │
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
  output: string;
  indentSize: number;
  uppercase: boolean;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste your SQL query into the input textarea
2. Set the desired indent size
3. Toggle uppercase keywords as needed
4. Click "Format" to beautify the SQL
5. Copy the formatted query for use

---

## About Content (for SEO section)

Our SQL formatter beautifies SQL queries with proper indentation entirely in your browser. Format SELECT statements, JOINs, WHERE clauses, and more for readability. Support for MySQL, PostgreSQL, and other SQL dialects. Perfect for debugging queries, sharing code, or maintaining SQL standards. No data is sent to any server — all formatting happens locally on your device.
