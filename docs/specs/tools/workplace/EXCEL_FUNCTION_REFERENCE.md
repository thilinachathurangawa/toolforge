# SPEC: Excel Function Reference Tool
**File:** `docs/specs/tools/workplace/EXCEL_FUNCTION_REFERENCE.md`
**Status:** Pending
**Slug:** `excel-function-reference`
**Category:** workplace
**Subcategory**: excel-tools

---

## SEO

- **Title:** `Excel Function Reference — Complete Function Guide | ToolForge`
- **Description:** `Browse and search 60+ Excel and Google Sheets functions with syntax, examples, and explanations. The complete reference for spreadsheet users.`
- **Primary Keyword:** excel function reference
- **Secondary Keywords:** excel functions list, google sheets functions, excel function guide, spreadsheet functions

---

## Functional Requirements

- [ ] Searchable/filterable function database (same as Tool 1, shared)
- [ ] Filter by category (Lookup, Logical, Text, Math, Date, Financial, Statistical, Information)
- [ ] Browse functions alphabetically
- [ ] Display function details:
  - Name
  - Category
  - Syntax
  - Plain-English description
  - Argument breakdown
  - Example usage
- [ ] Quick search by function name or keyword
- [ ] Copy function syntax to clipboard
- [ ] Link to related functions
- [ ] Mobile-responsive grid/list view
- [ ] No external library needed

---

## Library

No external library needed — share function database with Excel Formula Explainer

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Excel Function Reference               │
├─────────────────────────────────────────┤
│  [Search functions...]                  │
│  Category: [All ▼]                       │
│                                         │
│  Functions (60+):                       │
│  ┌──────────────────────────────────┐  │
│  │ VLOOKUP    Lookup & Reference    │  │
│  │ Look up values in a table        │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ IF         Logical               │  │
│  │ Return one value if condition... │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ SUM        Math & Trig            │  │
│  │ Add numbers together             │  │
│  └──────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  [Selected Function: VLOOKUP]           │
│                                         │
│  Category: Lookup & Reference           │
│  Syntax: VLOOKUP(lookup, table, col, exact)│
│                                         │
│  Description:                           │
│  Searches for a value in the first column│
│  of a table and returns a value in the  │
│  same row from a specified column.      │
│                                         │
│  Arguments:                              │
│  • lookup: The value to search for      │
│  • table: The range containing the data│
│  • col: Column number to return         │
│  • exact: TRUE/FALSE for exact match    │
│                                         │
│  Example: =VLOOKUP(A1, B:D, 3, FALSE)   │
│                                         │
│  [Copy Syntax]  [Related: HLOOKUP]     │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  searchQuery: string;
  selectedCategory: string;
  selectedFunction: string | null;
  filteredFunctions: FunctionInfo[];
}
```

---

## Shared Function Database

Import and reuse the same function database from Excel Formula Explainer tool to avoid duplication.

---

## How to Use Content (for SEO section)

1. Browse the complete list of Excel and Google Sheets functions
2. Use the search bar to find specific functions by name or keyword
3. Filter functions by category to narrow down your search
4. Click on any function to see detailed syntax and usage information
5. Review examples to understand how to use each function
6. Copy function syntax directly to your clipboard
7. Explore related functions for alternative solutions

---

## About Content (for SEO section)

Our Excel Function Reference is a comprehensive guide to 60+ spreadsheet functions used in Excel and Google Sheets. Browse functions by category or search by name to find exactly what you need. Each function entry includes syntax, argument descriptions, and practical examples. Perfect for beginners learning spreadsheet functions or experienced users looking up quick syntax reminders. The reference covers all major function categories including Lookup, Logical, Text, Math, Date & Time, Financial, Statistical, and Information functions. All data is available instantly in your browser with no need for external resources or internet connection once loaded.
