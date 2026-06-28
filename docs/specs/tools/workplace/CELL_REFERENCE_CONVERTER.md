# SPEC: Cell Reference Converter Tool
**File:** `docs/specs/tools/workplace/CELL_REFERENCE_CONVERTER.md`
**Status:** Pending
**Slug:** `cell-reference-converter`
**Category:** workplace
**Subcategory**: excel-tools

---

## SEO

- **Title:** `Cell Reference Converter — A1 to R1C1 Notation | ToolForge`
- **Description:** `Convert Excel cell references between A1 and R1C1 notation instantly. Supports single cells and ranges. Free online converter.`
- **Primary Keyword:** cell reference converter
- **Secondary Keywords:** A1 to R1C1 converter, excel cell notation, R1C1 notation converter, excel reference format

---

## Functional Requirements

- [ ] Input for A1 notation (e.g., B12, A1:B10)
- [ ] Input for R1C1 notation (e.g., R12C2, R1C1:R10C3)
- [ ] Bidirectional conversion (A1 ↔ R1C1)
- [ ] Support for single cell references
- [ ] Support for cell ranges (e.g., A1:B10)
- [ ] Real-time conversion as user types
- [ ] Copy result to clipboard
- [ ] Clear/reset button
- [ ] Swap button to switch conversion direction
- [ ] No external library needed

---

## Library

No external library needed — use built-in conversion logic

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Cell Reference Converter               │
├─────────────────────────────────────────┤
│  Conversion Direction:                  │
│  ◉ A1 → R1C1  ○ R1C1 → A1               │
│                                         │
│  A1 Notation:                           │
│  [B12                    ]              │
│  [A1:B10                 ]              │
│                                         │
│  [Swap]                                 │
│                                         │
│  R1C1 Notation:                         │
│  [R12C2                  ]              │
│  [R1C1:R10C3             ]              │
│                                         │
│  [Copy Result]  [Clear]                 │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  direction: 'a1-to-r1c1' | 'r1c1-to-a1';
  a1Input: string;
  r1c1Input: string;
  result: string;
  error: string | null;
}
```

---

## Conversion Logic

```typescript
// A1 to R1C1 conversion
function a1ToR1C1(a1: string): string {
  // Handle ranges
  if (a1.includes(':')) {
    const [start, end] = a1.split(':');
    return `${a1ToR1C1(start)}:${a1ToR1C1(end)}`;
  }
  
  const match = a1.match(/^([A-Z]+)(\d+)$/);
  if (!match) return a1;
  
  const [, col, row] = match;
  const colNum = columnLetterToNumber(col);
  
  return `R${row}C${colNum}`;
}

// R1C1 to A1 conversion
function r1c1ToA1(r1c1: string): string {
  // Handle ranges
  if (r1c1.includes(':')) {
    const [start, end] = r1c1.split(':');
    return `${r1c1ToA1(start)}:${r1c1ToA1(end)}`;
  }
  
  const match = r1c1.match(/^R(\d+)C(\d+)$/);
  if (!match) return r1c1;
  
  const [, row, col] = match;
  const colLetter = columnNumberToLetter(parseInt(col));
  
  return `${colLetter}${row}`;
}

// Column letter to number (A=1, Z=26, AA=27)
function columnLetterToNumber(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result;
}

// Column number to letter (1=A, 26=Z, 27=AA)
function columnNumberToLetter(num: number): string {
  let result = '';
  while (num > 0) {
    num--;
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}
```

---

## How to Use Content (for SEO section)

1. Select the conversion direction (A1 to R1C1 or R1C1 to A1)
2. Enter your cell reference in the input field
3. View the converted notation instantly
4. Support for single cells (B12) and ranges (A1:B10)
5. Use the swap button to quickly change conversion direction
6. Copy the result to your clipboard
7. Clear the inputs to start a new conversion

---

## About Content (for SEO section)

Our Cell Reference Converter instantly converts between Excel's two cell notation systems: A1 notation (like B12) and R1C1 notation (like R12C2). Simply enter your reference and get the converted format immediately. The tool supports both single cell references and cell ranges, making it perfect for working with different Excel configurations or VBA programming. Whether you're transitioning between spreadsheet systems or need to understand references in macros, this converter handles the math for you. All conversions happen instantly in your browser with no server requests.
