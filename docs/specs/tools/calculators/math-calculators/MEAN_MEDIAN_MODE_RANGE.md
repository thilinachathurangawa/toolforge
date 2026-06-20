# SPEC: Mean Median Mode Range Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/MEAN_MEDIAN_MODE_RANGE.md`
**Status:** Pending
**Slug:** `mean-median-mode-range`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Mean Median Mode Range Calculator — Statistics Basics | ToolForge`
- **Description:** `Calculate mean, median, mode, and range instantly with our free statistics calculator. Enter numbers to get comprehensive statistical analysis.`
- **Primary Keyword:** mean median mode range calculator
- **Secondary Keywords:** statistics calculator, calculate mean median mode, statistical measures, data analysis

---

## Functional Requirements

- [ ] Input field for multiple numbers (comma, space, or line separated)
- [ ] Support for decimal numbers
- [ ] Real-time calculation as user types
- [ ] Display mean (average)
- [ ] Display median (middle value)
- [ ] Display mode (most frequent value(s))
- [ ] Display range (max - min)
- [ ] Display count of numbers
- [ ] Display sum of numbers
- [ ] Display minimum and maximum values
- [ ] Handle multiple modes (bimodal, multimodal)
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in statistical formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Mean Median Mode Range Calculator      │
├─────────────────────────────────────────┤
│  Enter numbers (comma, space, or line   │
│  separated):                            │
│  ┌─────────────────────────────────┐   │
│  │ 1, 2, 2, 3, 4, 5, 5, 5          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Mean: 3.375                            │
│  Median: 3.5                            │
│  Mode: 5                                │
│  Range: 4                               │
│  Count: 8                               │
│  Sum: 27                                │
│  Min: 1                                 │
│  Max: 5                                 │
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
  mean: number;
  median: number;
  modes: number[];
  range: number;
  count: number;
  sum: number;
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
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
}

// Calculate mean (average)
function calculateMean(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

// Calculate median
function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// Calculate mode(s)
function calculateMode(numbers: number[]): number[] {
  if (numbers.length === 0) return [];
  const frequency: { [key: number]: number } = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  const maxFreq = Math.max(...Object.values(frequency));
  const modes = Object.entries(frequency)
    .filter(([_, freq]) => freq === maxFreq)
    .map(([num]) => parseFloat(num));
  
  // If all numbers appear equally, there's no mode
  if (maxFreq === 1) return [];
  return modes.sort((a, b) => a - b);
}

// Calculate range
function calculateRange(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers) - Math.min(...numbers);
}
```

---

## How to Use Content (for SEO section)

1. Enter your numbers separated by commas, spaces, or new lines
2. Click calculate to get comprehensive statistics
3. View mean, median, mode, range, count, sum, min, and max
4. If multiple modes exist, all will be displayed
5. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free mean median mode range calculator provides comprehensive statistical analysis for any dataset. Enter your numbers to instantly calculate the mean (average), median (middle value), mode (most frequent value), and range (difference between max and min). The calculator also shows the count, sum, minimum, and maximum values for complete data analysis. Perfect for students learning statistics, researchers analyzing data, or anyone needing to understand the distribution of a dataset. Handles multiple modes and decimal numbers with ease. All calculations happen in your browser with complete privacy.
