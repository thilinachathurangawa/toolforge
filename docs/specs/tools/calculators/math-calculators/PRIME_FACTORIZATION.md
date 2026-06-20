# SPEC: Prime Factorization Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/PRIME_FACTORIZATION.md`
**Status:** Pending
**Slug:** `prime-factorization-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Prime Factorization Calculator — Factor Tree | ToolForge`
- **Description:** `Calculate prime factorization instantly with our free calculator. Generate factor trees and find prime factors of any number.`
- **Primary Keyword:** prime factorization calculator
- **Secondary Keywords:** factor tree, prime factors, find prime factors, factorization

---

## Functional Requirements

- [ ] Input field for the number
- [ ] Support for positive integers greater than 1
- [ ] Calculate prime factorization
- [ ] Display factor tree visualization
- [ ] Display prime factors in exponential notation
- [ ] Display prime factors as a list
- [ ] Display the product of prime factors (verification)
- [ ] Step-by-step factorization process
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in factorization algorithm

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Prime Factorization Calculator        │
├─────────────────────────────────────────┤
│  Number: [84]                           │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Prime Factors: 2² × 3¹ × 7¹           │
│  As List: 2, 2, 3, 7                    │
│                                         │
│  Factor Tree:                           │
│       84                                │
│      /  \                               │
│     2   42                              │
│        /  \                             │
│       2   21                            │
│          /  \                           │
│         3   7                           │
│                                         │
│  Verification:                          │
│  2 × 2 × 3 × 7 = 84 ✓                 │
│                                         │
│  Step-by-step:                          │
│  1. 84 ÷ 2 = 42                        │
│  2. 42 ÷ 2 = 21                        │
│  3. 21 ÷ 3 = 7                         │
│  4. 7 is prime                         │
│  5. Result: 2² × 3¹ × 7¹              │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  number: number;
  primeFactors: { [prime: number]: number };
  factorList: number[];
  factorTree: TreeNode;
  showSteps: boolean;
}

interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}
```

---

## Formulas

```typescript
// Prime factorization
function primeFactorization(n: number): { [prime: number]: number } {
  const factors: { [prime: number]: number } = {};
  let d = 2;
  while (n > 1) {
    while (n % d === 0) {
      factors[d] = (factors[d] || 0) + 1;
      n /= d;
    }
    d++;
  }
  return factors;
}

// Format as exponential notation
function formatExponential(factors: { [prime: number]: number }): string {
  return Object.entries(factors)
    .map(([prime, exp]) => `${prime}^${exp}`)
    .join(' × ')
    .replace(/\^1/g, '');
}

// Generate factor tree
function generateFactorTree(n: number): TreeNode {
  const node: TreeNode = { value: n };
  
  if (n <= 1) return node;
  if (isPrime(n)) return node;
  
  // Find smallest factor
  let factor = 2;
  while (n % factor !== 0 && factor <= Math.sqrt(n)) {
    factor++;
  }
  
  if (factor > Math.sqrt(n)) return node; // n is prime
  
  node.left = { value: factor };
  node.right = generateFactorTree(n / factor);
  
  return node;
}

// Check if prime
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}
```

---

## How to Use Content (for SEO section)

1. Enter a positive integer greater than 1
2. Click calculate to find prime factorization
3. View the prime factors in exponential notation
4. See the factor tree visualization
5. Check the step-by-step factorization process
6. Verify the product equals the original number
7. Copy the result or reset to try another number

---

## About Content (for SEO section)

Our free prime factorization calculator instantly breaks down any number into its prime factors. Enter a number to get the prime factorization displayed in exponential notation (e.g., 2² × 3¹ × 7¹), as a list of prime factors, and with a visual factor tree. The calculator shows the step-by-step division process and verifies that the product of prime factors equals the original number. Perfect for students learning about prime numbers, factor trees, and number theory. All calculations happen in your browser with complete privacy.
