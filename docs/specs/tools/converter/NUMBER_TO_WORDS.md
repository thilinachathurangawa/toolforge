# SPEC: Number to Words Converter Tool
**File:** `docs/specs/tools/converter/NUMBER_TO_WORDS.md`
**Status:** Completed
**Slug:** `number-to-words`
**Category:** converter

---

## SEO

- **Title:** `Number to Words Converter — Integer to Text, Check Writing | ToolForge`
- **Description:** `Convert numbers to words in plain text or cheque-writing format. Handles integers up to trillions. Free online number to words generator with check amount formatter.`
- **Primary Keyword:** number to words text generator
- **Secondary Keywords:** how to write check amounts in words, integer string converter, convert number to english words

---

## Functional Requirements

- [ ] Integer input (up to 999,999,999,999,999 — up to quadrillions)
- [ ] Standard mode: convert to plain English words (e.g., "One Thousand Two Hundred Thirty-Four")
- [ ] Cheque/Check Mode: format as bank cheque string e.g. "One Thousand Two Hundred Thirty-Four Dollars and 00/100 Cents"
- [ ] Decimal support in cheque mode: input "1234.56" → "One Thousand Two Hundred Thirty-Four Dollars and 56/100 Cents"
- [ ] Real-time conversion as user types
- [ ] Copy button
- [ ] Pure recursive JS logic — no libraries

---

## Logic Sketch

```typescript
const ones = ['', 'One', 'Two', ..., 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', ..., 'Ninety'];
const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

function convertChunk(n: number): string { /* hundreds + tens + ones */ }
function toWords(n: number): string { /* split into chunks of 1000, reverse, apply scales */ }
```
