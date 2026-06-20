# SPEC: Percentage Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/PERCENTAGE_CALCULATOR.md`
**Status:** Pending
**Slug:** `percentage-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Percentage Calculator — Calculate Percentages Instantly | ToolForge`
- **Description:** `Calculate percentages instantly with our free percentage calculator. Solve 3 types of percentage problems: find percentage, find total, or find part.`
- **Primary Keyword:** percentage calculator
- **Secondary Keywords:** calculate percentage, percent calculator, percentage formula, find percentage, percentage problems

---

## Functional Requirements

- [ ] Support for 3 types of percentage problems:
  - Type 1: What is X% of Y? (Find the part)
  - Type 2: X is what % of Y? (Find the percentage)
  - Type 3: X is Y% of what? (Find the total)
- [ ] Input fields for the two known values
- [ ] Real-time calculation as user types
- [ ] Clear display of the result with formula shown
- [ ] Step-by-step solution explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in percentage formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Percentage Calculator                   │
├─────────────────────────────────────────┤
│  [Type 1] What is X% of Y?              │
│  [Type 2] X is what % of Y?             │
│  [Type 3] X is Y% of what?              │
│                                         │
│  Type 1: What is X% of Y?               │
│  ┌─────────────────────────────────┐   │
│  │ Percentage: [25] %               │   │
│  │ Of: [200]                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Result: 50                             │
│                                         │
│  Formula: (25 / 100) × 200 = 50         │
│                                         │
│  Step-by-step:                          │
│  1. Convert percentage to decimal: 0.25 │
│  2. Multiply by total: 0.25 × 200      │
│  3. Result: 50                         │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculationType: 'type1' | 'type2' | 'type3';
  input1: number;
  input2: number;
  result: number;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Type 1: What is X% of Y?
// Formula: (X / 100) × Y = Result
function calculateType1(percentage: number, total: number): number {
  return (percentage / 100) * total;
}

// Type 2: X is what % of Y?
// Formula: (X / Y) × 100 = Percentage
function calculateType2(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

// Type 3: X is Y% of what?
// Formula: X / (Y / 100) = Total
function calculateType3(part: number, percentage: number): number {
  if (percentage === 0) return 0;
  return part / (percentage / 100);
}
```

---

## How to Use Content (for SEO section)

1. Select the type of percentage problem you want to solve
2. For Type 1: Enter the percentage and the total value to find the part
3. For Type 2: Enter the part and the total value to find the percentage
4. For Type 3: Enter the part and the percentage to find the total
5. View the result instantly with the formula shown
6. Check the step-by-step explanation to understand the calculation
7. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free percentage calculator solves all three types of percentage problems instantly. Whether you need to find what percentage one number is of another, calculate a percentage of a total, or find the total when you know a percentage and part, this tool handles it all. Perfect for calculating discounts, tips, grades, tax, or any percentage-based calculation. The calculator shows the formula used and provides step-by-step explanations to help you understand the math. All calculations happen in your browser with complete privacy and no external dependencies.
