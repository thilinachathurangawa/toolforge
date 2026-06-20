# SPEC: Standard Deviation Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/STANDARD_DEVIATION.md`
**Status:** Pending
**Slug:** `standard-deviation-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Standard Deviation Calculator — Population & Sample SD | ToolForge`
- **Description:** `Calculate standard deviation instantly with our free calculator. Compute both population and sample standard deviation with step-by-step explanations.`
- **Primary Keyword:** standard deviation calculator
- **Secondary Keywords:** population standard deviation, sample standard deviation, variance calculator, statistics calculator

---

## Functional Requirements

- [ ] Input field for multiple numbers (comma, space, or line separated)
- [ ] Support for decimal numbers
- [ ] Toggle between population and sample standard deviation
- [ ] Real-time calculation as user types
- [ ] Display standard deviation
- [ ] Display variance
- [ ] Display mean
- [ ] Display count of numbers
- [ ] Display sum of numbers
- [ ] Display sum of squared differences
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in standard deviation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Standard Deviation Calculator         │
├─────────────────────────────────────────┤
│  Enter numbers (comma, space, or line   │
│  separated):                            │
│  ┌─────────────────────────────────┐   │
│  │ 2, 4, 4, 4, 5, 5, 7, 9         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Type: [Population ▼] [Sample]         │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Standard Deviation: 2.0                │
│  Variance: 4.0                          │
│  Mean: 5.0                              │
│  Count: 8                               │
│  Sum: 40                                │
│  Sum of Squared Differences: 28         │
│                                         │
│  Step-by-step:                          │
│  1. Calculate mean: 40 / 8 = 5.0       │
│  2. Calculate squared differences       │
│  3. Sum squared differences: 28        │
│  4. Divide by n (population): 28 / 8   │
│  5. Take square root: √3.5 = 1.87     │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  input: string;
  numbers: number[];
  type: 'population' | 'sample';
  standardDeviation: number;
  variance: number;
  mean: number;
  count: number;
  sum: number;
  sumSquaredDifferences: number;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Parse input string into array of numbers
function parseNumbers(input: string): number[] {
  return input
    .split(/[\s,\n]+/)
    .map(s => parseFloat(s.trim()))
    .filter(n => !isNaN(n));
}

// Calculate mean
function calculateMean(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((acc, num) => acc + num, 0) / numbers.length;
}

// Calculate population standard deviation
function calculatePopulationSD(numbers: number[]): { sd: number; variance: number; mean: number; sumSquaredDiffs: number } {
  if (numbers.length === 0) return { sd: 0, variance: 0, mean: 0, sumSquaredDiffs: 0 };
  
  const mean = calculateMean(numbers);
  const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
  const sumSquaredDiffs = squaredDifferences.reduce((acc, val) => acc + val, 0);
  const variance = sumSquaredDiffs / numbers.length;
  const sd = Math.sqrt(variance);
  
  return { sd, variance, mean, sumSquaredDiffs };
}

// Calculate sample standard deviation
function calculateSampleSD(numbers: number[]): { sd: number; variance: number; mean: number; sumSquaredDiffs: number } {
  if (numbers.length < 2) return { sd: 0, variance: 0, mean: 0, sumSquaredDiffs: 0 };
  
  const mean = calculateMean(numbers);
  const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
  const sumSquaredDiffs = squaredDifferences.reduce((acc, val) => acc + val, 0);
  const variance = sumSquaredDiffs / (numbers.length - 1);
  const sd = Math.sqrt(variance);
  
  return { sd, variance, mean, sumSquaredDiffs };
}
```

---

## How to Use Content (for SEO section)

1. Enter your numbers separated by commas, spaces, or new lines
2. Select whether to calculate population or sample standard deviation
3. Click calculate to get the standard deviation and variance
4. View the step-by-step calculation process
5. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free standard deviation calculator computes both population and sample standard deviation instantly. Enter your dataset to calculate the standard deviation, variance, and mean with detailed step-by-step explanations. Use population standard deviation when your data represents the entire population, and sample standard deviation when working with a sample of a larger population. Perfect for students, researchers, and data analysts needing to measure data spread and variability. The calculator handles decimal numbers and provides comprehensive statistical insights. All calculations happen in your browser with complete privacy.
