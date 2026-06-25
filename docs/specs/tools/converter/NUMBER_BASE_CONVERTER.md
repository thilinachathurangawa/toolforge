# SPEC: Number Base Converter Tool
**File:** `docs/specs/tools/converter/NUMBER_BASE_CONVERTER.md`
**Status:** Completed
**Slug:** `number-base-converter`
**Category:** converter

---

## SEO

- **Title:** `Number Base Converter — Binary, Octal, Decimal, Hex Online | ToolForge`
- **Description:** `Convert numbers between Binary (Base 2), Octal (Base 8), Decimal (Base 10), and Hexadecimal (Base 16). Real-time validation with illegal-character highlighting. Free online base converter.`
- **Primary Keyword:** Binary to Decimal converter
- **Secondary Keywords:** Hex to Binary calculator, number base converter, binary hex octal decimal

---

## Functional Requirements

- [ ] Four simultaneous display fields: Binary (base 2), Octal (base 8), Decimal (base 10), Hexadecimal (base 16)
- [ ] Any field can be the source; all others update instantly
- [ ] Per-field input validation: only legal characters for that base (e.g., 0-1 for binary)
- [ ] Illegal character highlighted in red, with tooltip explaining the constraint
- [ ] Supports integers only; unsigned; up to 2^53 safe integer range
- [ ] Copy button per field

---

## Logic

```typescript
// parseInt/toString approach
const decimal = parseInt(value, fromBase);
const binary  = decimal.toString(2);
const octal   = decimal.toString(8);
const hex     = decimal.toString(16).toUpperCase();
```

---

## Validation Rules

- Binary: `/^[01]*$/`
- Octal: `/^[0-7]*$/`
- Decimal: `/^[0-9]*$/`
- Hexadecimal: `/^[0-9A-Fa-f]*$/`
