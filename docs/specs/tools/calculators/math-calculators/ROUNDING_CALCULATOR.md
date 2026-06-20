# SPEC: Rounding Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/ROUNDING_CALCULATOR.md`
**Status:** Pending
**Slug:** `rounding-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Rounding Calculator — Round to Nearest N Places | ToolForge`
- **Description:** `Round numbers to the nearest decimal place instantly with our free rounding calculator. Round to any precision with step-by-step explanations.`
- **Primary Keyword:** rounding calculator
- **Secondary Keywords:** round to decimal place, round to nearest, round number, precision calculator

---

## Functional Requirements

- [ ] Input field for the number to round
- [ ] Input field for decimal places (0 for whole number)
- [ ] Support for negative decimal places (round to tens, hundreds, etc.)
- [ ] Support for decimal numbers
- [ ] Real-time calculation as user types
- [ ] Display the rounded result
- [ ] Display the original number
- [ ] Display rounding direction (up, down, or same)
- [ ] Step-by-step rounding explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in rounding methods

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Rounding Calculator                    │
├─────────────────────────────────────────┤
│  Number: [3.14159]                      │
│  Decimal Places: [2]                    │
│  (Use negative for tens, hundreds, etc.)│
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Result: 3.14                           │
│                                         │
│  Original: 3.14159                      │
│  Rounded to: 2 decimal places           │
│  Direction: Down                        │
│                                         │
│  Step-by-step:                          │
│  1. Number: 3.14159                     │
│  2. Look at 3rd decimal: 1              │
│  3. 1 < 5, so round down               │
│  4. Result: 3.14                        │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  number: number;
  decimalPlaces: number;
  result: number;
  direction: 'up' | 'down' | 'same';
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Round to specified decimal places
function roundToPlaces(number: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(number * factor) / factor;
}

// Determine rounding direction
function getRoundingDirection(original: number, rounded: number): 'up' | 'down' | 'same' {
  if (original === rounded) return 'same';
  return original < rounded ? 'up' : 'down';
}

// Get the digit that determines rounding
function getRoundingDigit(number: number, places: number): number {
  const factor = Math.pow(10, places + 1);
  const shifted = Math.abs(number * factor);
  return Math.floor(shifted) % 10;
}
```

---

## How to Use Content (for SEO section)

1. Enter the number you want to round
2. Enter the number of decimal places (0 for whole number, negative for tens/hundreds)
3. Click calculate to round the number
4. View the rounded result and rounding direction
5. Check the step-by-step explanation
6. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free rounding calculator instantly rounds numbers to any precision you need. Enter your number and specify the decimal places (use 0 for whole numbers, negative values for rounding to tens, hundreds, etc.). The calculator shows the rounded result, the original number, and the rounding direction (up, down, or same). Perfect for students learning rounding, financial calculations, or anyone needing to round numbers to specific precision. The step-by-step explanations help you understand the rounding process. All calculations happen in your browser with complete privacy.
