# SPEC: Excel Formula Explainer Tool
**File:** `docs/specs/tools/workplace/EXCEL_FORMULA_EXPLAINER.md`
**Status:** Pending
**Slug:** `excel-formula-explainer`
**Category:** workplace
**Subcategory**: excel-tools

---

## SEO

- **Title:** `Excel Formula Explainer — Understand Complex Formulas | ToolForge`
- **Description:** `Paste any Excel or Google Sheets formula and get instant plain-English explanations. Learn what each function does, understand arguments, and identify cell references.`
- **Primary Keyword:** excel formula explainer
- **Secondary Keywords:** excel formula help, understand excel formulas, excel function explanation, google sheets formula help

---

## Functional Requirements

- [ ] Text input for pasting Excel/Google Sheets formulas
- [ ] Parse formulas and identify all functions used (including nested)
- [ ] Reference database of 60+ common Excel functions with:
  - Function name
  - Syntax
  - Plain-English summary
  - Argument breakdown
- [ ] Display explanation for each function in the formula
- [ ] List all cell references found in the formula
- [ ] Handle nested function explanations with proper hierarchy
- [ ] Support for array formulas and special operators
- [ ] Copy explanation to clipboard
- [ ] Clear/reset button
- [ ] Example formulas for quick testing
- [ ] No external library needed (built-in parsing)

---

## Library

No external library needed — use built-in formula parsing logic

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Excel Formula Explainer                │
├─────────────────────────────────────────┤
│  Paste your formula:                    │
│  [=VLOOKUP(A1,B:C,2,FALSE)            ] │
│                                         │
│  [Explain Formula]  [Clear]            │
├─────────────────────────────────────────┤
│  Formula Breakdown:                     │
│                                         │
│  1. VLOOKUP                             │
│     Looks up a value in a table        │
│     Syntax: VLOOKUP(lookup, table, col, exact)│
│     Arguments:                          │
│     • A1: The value to look up         │
│     • B:C: The table range             │
│     • 2: Column number to return        │
│     • FALSE: Exact match required       │
│                                         │
│  Cell References Found:                 │
│  • A1, B:C                              │
│                                         │
│  [Copy Explanation]                     │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  formula: string;
  parsedFunctions: Array<{
    name: string;
    description: string;
    syntax: string;
    arguments: Array<{name: string, value: string, description: string}>;
  }>;
  cellReferences: string[];
  error: string | null;
}
```

---

## Function Database (60+ functions)

Include functions from these categories:
- Lookup & Reference: VLOOKUP, HLOOKUP, INDEX, MATCH, XLOOKUP, XMATCH, INDIRECT, OFFSET
- Logical: IF, AND, OR, NOT, IFERROR, IFNA, IFS, SWITCH
- Text: CONCATENATE, LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, PROPER, TEXT, SUBSTITUTE, REPLACE, FIND, SEARCH
- Math & Trig: SUM, SUMIF, SUMIFS, AVERAGE, AVERAGEIF, AVERAGEIFS, COUNT, COUNTA, COUNTIF, COUNTIFS, ROUND, ROUNDUP, ROUNDDOWN, INT, MOD, ABS, POWER, SQRT
- Date & Time: TODAY, NOW, DATE, TIME, DATEDIF, EOMONTH, EDATE, YEAR, MONTH, DAY, HOUR, MINUTE, SECOND
- Financial: PV, FV, PMT, RATE, NPER, NPV, IRR
- Statistical: MAX, MIN, MEDIAN, MODE, STDEV, VAR, RANK, PERCENTILE
- Information: ISNUMBER, ISTEXT, ISBLANK, ISERROR, TYPE, CELL

---

## Parsing Logic

```typescript
// Function to parse Excel formula and extract functions
function parseFormula(formula: string): {
  functions: Array<{name: string, args: string[]}>;
  cellReferences: string[];
} {
  // Remove leading = if present
  const cleanFormula = formula.replace(/^=/, '');
  
  // Extract cell references (A1, Z100, A1:B10, etc.)
  const cellRefRegex = /([A-Z]+[0-9]+:[A-Z]+[0-9]+|[A-Z]+[0-9]+)/g;
  const cellReferences = [...cleanFormula.matchAll(cellRefRegex)].map(m => m[1]);
  
  // Extract function calls with their arguments
  const functionRegex = /([A-Z]+)\(([^)]*)\)/g;
  const functions = [...cleanFormula.matchAll(functionRegex)].map(m => ({
    name: m[1],
    args: parseArguments(m[2])
  }));
  
  return { functions, cellReferences };
}

// Parse comma-separated arguments, handling nested functions
function parseArguments(argsString: string): string[] {
  const args: string[] = [];
  let current = '';
  let depth = 0;
  
  for (const char of argsString) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) args.push(current.trim());
  
  return args;
}
```

---

## How to Use Content (for SEO section)

1. Paste your Excel or Google Sheets formula into the input field
2. Click "Explain Formula" to analyze the formula
3. View the breakdown of each function with plain-English explanations
4. See what each argument means in the context of your formula
5. Review all cell references used in the formula
6. Copy the explanation for documentation or sharing
7. Try example formulas to understand how the tool works

---

## About Content (for SEO section)

Our Excel Formula Explainer helps you understand complex spreadsheet formulas by breaking them down into plain English. Simply paste any Excel or Google Sheets formula, and our tool will identify each function used, explain what it does, and clarify the purpose of every argument. Perfect for learning new functions, debugging formulas, or documenting spreadsheet logic. The tool handles nested functions, array formulas, and identifies all cell references. Whether you're a beginner trying to understand a colleague's spreadsheet or an experienced user looking to document your work, this explainer makes formula comprehension instant and painless. All processing happens in your browser for complete privacy.
