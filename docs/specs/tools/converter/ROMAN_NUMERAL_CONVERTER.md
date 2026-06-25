# SPEC: Roman Numeral Converter Tool
**File:** `docs/specs/tools/converter/ROMAN_NUMERAL_CONVERTER.md`
**Status:** Completed
**Slug:** `roman-numeral-converter`
**Category:** converter

---

## SEO

- **Title:** `Roman Numeral Converter — Numbers to Roman Numerals Online | ToolForge`
- **Description:** `Convert integers to Roman numerals and Roman numerals back to integers. Real-time validation, supports 1–3999. Free online Roman numeral converter.`
- **Primary Keyword:** Roman numerals to numbers conversion
- **Secondary Keywords:** convert integer to roman numeral, years to roman numerals chart, roman numeral calculator

---

## Functional Requirements

- [ ] Two text boxes: Integer → Roman and Roman → Integer (two-way)
- [ ] Integer range: 1–3999 (MMMCMXCIX)
- [ ] Real-time conversion as user types
- [ ] Validation with clear error states (out of range, invalid Roman string)
- [ ] Pure JS lookup array (no regex dependency for core logic)
- [ ] Copy button on each output

---

## Logic

```typescript
const values = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
const symbols = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];

function toRoman(num: number): string { /* greedy subtraction */ }
function fromRoman(s: string): number { /* value map + additive/subtractive parse */ }
```
