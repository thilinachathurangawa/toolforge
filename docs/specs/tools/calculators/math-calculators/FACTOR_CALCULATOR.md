# SPEC: Factor Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/FACTOR_CALCULATOR.md`
**Status:** Pending
**Slug:** `factor-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Factor Calculator — Find All Factors of a Number | ToolForge`
- **Description:** `Find all factors of any number instantly with our free factor calculator. Get the complete list of factors including positive and negative.`
- **Primary Keyword:** factor calculator
- **Secondary Keywords:** find factors, factors of a number, factor finder, list all factors

---

## Functional Requirements

- [ ] Input field for the number
- [ ] Support for positive integers only
- [ ] Find all positive factors
- [ ] Display factors in ascending order
- [ ] Display factor pairs
- [ ] Display the count of factors
- [ ] Display the sum of factors
- [ ] Display whether the number is prime, composite, or perfect
- [ ] Real-time calculation as user types
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in factor finding algorithm

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Factor Calculator                     │
├─────────────────────────────────────────┤
│  Number: [24]                          │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Factors: 1, 2, 3, 4, 6, 8, 12, 24      │
│  Factor Pairs:                          │
│  1 × 24, 2 × 12, 3 × 8, 4 × 6           │
│                                         │
│  Number of Factors: 8                   │
│  Sum of Factors: 60                     │
│  Type: Composite                        │
│  Perfect Number: No                     │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  number: number;
  factors: number[];
  factorPairs: Array<[number, number]>;
  factorCount: number;
  factorSum: number;
  numberType: 'prime' | 'composite' | 'neither';
  isPerfect: boolean;
}
```

---

## Formulas

```typescript
// Find all factors of a number
function findFactors(n: number): number[] {
  if (n <= 0) return [];
  const factors: number[] = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) {
        factors.push(n / i);
      }
    }
  }
  return factors.sort((a, b) => a - b);
}

// Find factor pairs
function findFactorPairs(factors: number[], n: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  const used = new Set<number>();
  
  for (const factor of factors) {
    if (!used.has(factor)) {
      const pair = n / factor;
      pairs.push([factor, pair]);
      used.add(factor);
      used.add(pair);
    }
  }
  
  return pairs.sort((a, b) => a[0] - b[0]);
}

// Determine if number is prime
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Determine if number is perfect
function isPerfect(n: number): boolean {
  const factors = findFactors(n).filter(f => f !== n);
  const sum = factors.reduce((acc, f) => acc + f, 0);
  return sum === n;
}
```

---

## How to Use Content (for SEO section)

1. Enter a positive integer
2. Click calculate to find all factors
3. View the complete list of factors and factor pairs
4. See the count and sum of factors
5. Check if the number is prime, composite, or perfect
6. Copy the result or reset to try another number

---

## About Content (for SEO section)

Our free factor calculator instantly finds all factors of any positive integer. Enter a number to get the complete list of factors displayed in ascending order, along with factor pairs that multiply to give the original number. The calculator also shows the count and sum of factors, and identifies whether the number is prime, composite, or perfect. Perfect for students learning about factors, number theory enthusiasts, or anyone needing to find divisors of a number. All calculations happen in your browser with complete privacy.
