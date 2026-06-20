# SPEC: Average Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/AVERAGE_CALCULATOR.md`
**Status:** Pending
**Slug:** `average-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Average Calculator — Calculate Mean of Numbers | ToolForge`
- **Description:** `Calculate the average (mean) of numbers instantly with our free average calculator. Enter multiple numbers to find their arithmetic mean.`
- **Primary Keyword:** average calculator
- **Secondary Keywords:** mean calculator, calculate average, arithmetic mean, average of numbers

---

## Functional Requirements

- [ ] Input field for multiple numbers (comma, space, or line separated)
- [ ] Support for decimal numbers
- [ ] Real-time calculation as user types
- [ ] Display the average (mean)
- [ ] Display the sum of all numbers
- [ ] Display the count of numbers
- [ ] Display minimum and maximum values
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in average formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Average Calculator                     │
├─────────────────────────────────────────┤
│  Enter numbers (comma, space, or line   │
│  separated):                            │
│  ┌─────────────────────────────────┐   │
│  │ 10, 20, 30, 40, 50              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Average (Mean): 30                     │
│  Sum: 150                               │
│  Count: 5                               │
│  Minimum: 10                            │
│  Maximum: 50                            │
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
  average: number;
  sum: number;
  count: number;
  min: number;
  max: number;
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

// Calculate average (mean)
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

// Calculate sum
function calculateSum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}

// Find minimum
function findMin(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
}

// Find maximum
function findMax(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
}
```

---

## How to Use Content (for SEO section)

1. Enter your numbers separated by commas, spaces, or new lines
2. Click calculate to find the average
3. View the average (mean) along with sum, count, min, and max
4. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free average calculator instantly calculates the arithmetic mean of any set of numbers. Simply enter your numbers separated by commas, spaces, or new lines, and get the average along with useful statistics like sum, count, minimum, and maximum values. Perfect for students calculating grade averages, businesses analyzing data, or anyone needing to find the mean of a dataset. The calculator handles decimal numbers and provides instant results. All calculations happen in your browser with complete privacy.
