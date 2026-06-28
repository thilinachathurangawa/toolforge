# SPEC: Column Letter Converter Tool
**File:** `docs/specs/tools/workplace/COLUMN_LETTER_CONVERTER.md`
**Status:** Pending
**Slug:** `column-letter-converter`
**Category:** workplace
**Subcategory**: excel-tools

---

## SEO

- **Title:** `Column Letter Converter — Excel Column to Number | ToolForge`
- **Description:** `Convert Excel column letters to numbers and vice versa. Supports up to column XFD (16384). Instant bidirectional conversion.`
- **Primary Keyword:** column letter converter
- **Secondary Keywords:** excel column to number, column number to letter, excel column converter, spreadsheet column

---

## Functional Requirements

- [ ] Input for column letter (e.g., A, Z, AB, XFD)
- [ ] Input for column number (e.g., 1, 26, 28, 16384)
- [ ] Bidirectional conversion (letter ↔ number)
- [ ] Support full Excel range (A to XFD / 1 to 16384)
- [ ] Real-time conversion as user types
- [ ] Input validation (max XFD/16384)
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
│  Column Letter Converter                │
├─────────────────────────────────────────┤
│  Conversion Direction:                  │
│  ◉ Letter → Number  ○ Number → Letter   │
│                                         │
│  Column Letter:                         │
│  [AB                     ]              │
│  (Max: XFD)                             │
│                                         │
│  [Swap]                                 │
│                                         │
│  Column Number:                         │
│  [28                     ]              │
│  (Max: 16384)                           │
│                                         │
│  [Copy Result]  [Clear]                 │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  direction: 'letter-to-number' | 'number-to-letter';
  letterInput: string;
  numberInput: string;
  result: string;
  error: string | null;
}
```

---

## Conversion Logic

```typescript
// Column letter to number (A=1, Z=26, AA=27, XFD=16384)
function columnLetterToNumber(letter: string): number {
  letter = letter.toUpperCase();
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    const charCode = letter.charCodeAt(i);
    if (charCode < 65 || charCode > 90) {
      throw new Error('Invalid column letter');
    }
    result = result * 26 + (charCode - 64);
  }
  if (result > 16384) {
    throw new Error('Column exceeds Excel maximum (XFD/16384)');
  }
  return result;
}

// Column number to letter (1=A, 26=Z, 27=AA, 16384=XFD)
function columnNumberToLetter(num: number): string {
  if (num < 1 || num > 16384) {
    throw new Error('Column number must be between 1 and 16384');
  }
  
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

1. Select the conversion direction (Letter to Number or Number to Letter)
2. Enter your column letter (A, AB, XFD) or column number (1, 28, 16384)
3. View the converted result instantly
4. The tool supports the full Excel range up to column XFD (16384)
5. Use the swap button to quickly change conversion direction
6. Copy the result to your clipboard
7. Clear the inputs to start a new conversion

---

## About Content (for SEO section)

Our Column Letter Converter instantly converts between Excel column letters and numbers. Whether you need to know that column AB is number 28, or convert column 16384 to its letter equivalent (XFD), this tool handles the conversion instantly. Excel supports columns from A to XFD (1 to 16384), and our converter covers the entire range. Perfect for programmers working with Excel APIs, users creating complex formulas, or anyone who needs to translate between the two reference systems. All conversions happen in your browser with instant results and no server requests.
