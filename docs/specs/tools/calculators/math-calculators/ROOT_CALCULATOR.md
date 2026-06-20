# SPEC: Root Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/ROOT_CALCULATOR.md`
**Status:** Pending
**Slug:** `root-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Root Calculator — Square, Cube, Nth Root | ToolForge`
- **Description:** `Calculate square roots, cube roots, and nth roots instantly with our free root calculator. Compute any root with step-by-step solutions.`
- **Primary Keyword:** root calculator
- **Secondary Keywords:** square root calculator, cube root calculator, nth root calculator, calculate root

---

## Functional Requirements

- [ ] Input field for the number
- [ ] Input field for the root degree (n)
- [ ] Quick buttons for common roots (square, cube, 4th)
- [ ] Support for decimal numbers
- [ ] Real-time calculation as user types
- [ ] Display the root result
- [ ] Display the calculation in radical form
- [ ] Display decimal approximation
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in Math.pow()

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Root Calculator                       │
├─────────────────────────────────────────┤
│  Number: [64]                           │
│  Root Degree (n): [3]                   │
│                                         │
│  Quick Roots: [√] [³√] [⁴√]            │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Result: 4                              │
│                                         │
│  Radical Form: ³√64 = 4                │
│  Decimal: 4.0                           │
│                                         │
│  Step-by-step:                          │
│  1. Number: 64                         │
│  2. Root degree: 3 (cube root)         │
│  3. Calculate: 64^(1/3)               │
│  4. Result: 4                           │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  number: number;
  rootDegree: number;
  result: number;
  radicalForm: string;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Calculate nth root
function calculateNthRoot(number: number, degree: number): number {
  if (degree === 0) return NaN;
  if (degree < 0) return 1 / calculateNthRoot(number, -degree);
  return Math.pow(number, 1 / degree);
}

// Generate radical form notation
function generateRadicalForm(number: number, degree: number): string {
  const degreeSymbols: { [key: number]: string } = {
    2: '√',
    3: '³√',
    4: '⁴√'
  };
  const symbol = degreeSymbols[degree] || `ⁿ√(${degree})`;
  return `${symbol}${number}`;
}
```

---

## How to Use Content (for SEO section)

1. Enter the number you want to find the root of
2. Enter the root degree (2 for square root, 3 for cube root, etc.)
3. Or use quick buttons for common roots
4. Click calculate to find the root
5. View the result in radical and decimal form
6. Check the step-by-step explanation
7. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free root calculator instantly computes square roots, cube roots, and nth roots for any number. Simply enter your number and the root degree to get the result. The calculator provides quick-access buttons for common roots (square, cube, 4th root) and displays results in both radical form and decimal approximation. Perfect for students learning about roots, engineers doing calculations, or anyone needing to compute roots quickly. The step-by-step explanations help you understand the root calculation process. All calculations happen in your browser with complete privacy.
