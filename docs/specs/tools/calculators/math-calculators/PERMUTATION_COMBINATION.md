# SPEC: Permutation & Combination Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/PERMUTATION_COMBINATION.md`
**Status:** Pending
**Slug:** `permutation-combination-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Permutation & Combination Calculator — nPr, nCr | ToolForge`
- **Description:** `Calculate permutations and combinations instantly with our free calculator. Compute nPr and nCr with formulas and step-by-step solutions.`
- **Primary Keyword:** permutation combination calculator
- **Secondary Keywords:** nPr calculator, nCr calculator, permutation formula, combination formula

---

## Functional Requirements

- [ ] Input field for n (total items)
- [ ] Input field for r (items to choose)
- [ ] Calculate permutations (nPr)
- [ ] Calculate combinations (nCr)
- [ ] Display results with formulas
- [ ] Display factorial breakdown
- [ ] Support for large numbers (with warnings)
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in factorial formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Permutation & Combination Calculator  │
├─────────────────────────────────────────┤
│  n (total items): [10]                  │
│  r (items to choose): [3]               │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Permutation (nPr): 720                 │
│  Combination (nCr): 120                 │
│                                         │
│  Permutation Formula:                   │
│  nPr = n! / (n-r)!                      │
│  10P3 = 10! / 7! = 720                 │
│                                         │
│  Combination Formula:                   │
│  nCr = n! / (r! × (n-r)!)              │
│  10C3 = 10! / (3! × 7!) = 120          │
│                                         │
│  Factorial Breakdown:                   │
│  10! = 3,628,800                        │
│  7! = 5,040                            │
│  3! = 6                                │
│                                         │
│  Step-by-step:                          │
│  Permutation:                           │
│  1. n! = 10! = 3,628,800               │
│  2. (n-r)! = 7! = 5,040                │
│  3. nPr = 3,628,800 / 5,040 = 720     │
│                                         │
│  Combination:                           │
│  1. n! = 10! = 3,628,800               │
│  2. r! = 3! = 6                        │
│  3. (n-r)! = 7! = 5,040                │
│  4. nCr = 3,628,800 / (6 × 5,040) = 120│
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  n: number;
  r: number;
  permutation: number;
  combination: number;
  nFactorial: number;
  rFactorial: number;
  nMinusRFactorial: number;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Calculate factorial
function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Calculate permutation nPr
function calculatePermutation(n: number, r: number): number {
  if (r > n || r < 0) return 0;
  return factorial(n) / factorial(n - r);
}

// Calculate combination nCr
function calculateCombination(n: number, r: number): number {
  if (r > n || r < 0) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// Format large numbers with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}
```

---

## How to Use Content (for SEO section)

1. Enter n (total number of items)
2. Enter r (number of items to choose/arrange)
3. Click calculate to find permutations and combinations
4. View both nPr and nCr results with formulas
5. Check the factorial breakdown and step-by-step explanation
6. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free permutation and combination calculator instantly computes nPr (permutations) and nCr (combinations) for any values of n and r. Enter the total number of items (n) and the number to choose (r) to get both results. The calculator displays the formulas used, factorial breakdowns, and step-by-step calculations. Perfect for students learning combinatorics, probability calculations, or anyone needing to count arrangements and selections. Understanding the difference between permutations (order matters) and combinations (order doesn't matter) is made easy with clear explanations. All calculations happen in your browser with complete privacy.
