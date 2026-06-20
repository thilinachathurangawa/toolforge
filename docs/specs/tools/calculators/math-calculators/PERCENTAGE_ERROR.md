# SPEC: Percentage Error Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/PERCENTAGE_ERROR.md`
**Status:** Pending
**Slug:** `percentage-error-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Percentage Error Calculator — Calculate % Error | ToolForge`
- **Description:** `Calculate percentage error instantly with our free calculator. Use the formula |approximate - exact| / exact × 100 to measure accuracy.`
- **Primary Keyword:** percentage error calculator
- **Secondary Keywords:** percent error calculator, calculate percentage error, error calculation, accuracy measurement

---

## Functional Requirements

- [ ] Input field for exact value
- [ ] Input field for approximate (observed) value
- [ ] Support for decimal numbers
- [ ] Real-time calculation as user types
- [ ] Display percentage error
- [ ] Display absolute error
- [ ] Display relative error
- [ ] Show the formula used
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in percentage error formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Percentage Error Calculator            │
├─────────────────────────────────────────┤
│  Exact Value: [100]                     │
│  Approximate Value: [95]                │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Percentage Error: 5%                   │
│  Absolute Error: 5                      │
│  Relative Error: 0.05                   │
│                                         │
│  Formula:                               │
│  |95 - 100| / 100 × 100 = 5%           │
│                                         │
│  Step-by-step:                          │
│  1. Calculate difference: 95 - 100 = -5 │
│  2. Take absolute value: |-5| = 5      │
│  3. Divide by exact: 5 / 100 = 0.05    │
│  4. Multiply by 100: 0.05 × 100 = 5%   │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  exactValue: number;
  approximateValue: number;
  percentageError: number;
  absoluteError: number;
  relativeError: number;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Calculate absolute error
function calculateAbsoluteError(exact: number, approximate: number): number {
  return Math.abs(approximate - exact);
}

// Calculate relative error
function calculateRelativeError(exact: number, approximate: number): number {
  if (exact === 0) return 0;
  return Math.abs(approximate - exact) / Math.abs(exact);
}

// Calculate percentage error
function calculatePercentageError(exact: number, approximate: number): number {
  if (exact === 0) return 0;
  return (Math.abs(approximate - exact) / Math.abs(exact)) * 100;
}
```

---

## How to Use Content (for SEO section)

1. Enter the exact (true) value
2. Enter the approximate (observed/measured) value
3. Click calculate to find the percentage error
4. View the percentage error, absolute error, and relative error
5. Check the step-by-step explanation to understand the calculation
6. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free percentage error calculator instantly measures the accuracy of measurements using the standard formula |approximate - exact| / exact × 100. Simply enter the exact value and your approximate measurement to calculate the percentage error, absolute error, and relative error. Perfect for students conducting experiments, scientists analyzing data, or anyone needing to quantify measurement accuracy. The calculator shows the formula and provides step-by-step explanations to help you understand the error calculation process. All calculations happen in your browser with complete privacy.
