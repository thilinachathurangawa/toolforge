# SPEC: GCF / LCM Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/GCF_LCM_CALCULATOR.md`
**Status:** Pending
**Slug:** `gcf-lcm-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `GCF / LCM Calculator — Greatest Common Factor & Least Common Multiple | ToolForge`
- **Description:** `Calculate GCF and LCM instantly with our free calculator using Euclid's algorithm. Find greatest common factor and least common multiple of numbers.`
- **Primary Keyword:** GCF LCM calculator
- **Secondary Keywords:** greatest common factor calculator, least common multiple calculator, GCD calculator, find GCF and LCM

---

## Functional Requirements

- [ ] Input fields for two or more numbers
- [ ] Support for positive integers only
- [ ] Calculate GCF (Greatest Common Factor) using Euclid's algorithm
- [ ] Calculate LCM (Least Common Multiple)
- [ ] Display prime factorization for each number
- [ ] Display the GCF and LCM results
- [ ] Show the relationship: GCF × LCM = a × b
- [ ] Step-by-step Euclid's algorithm explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use Euclid's algorithm

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  GCF / LCM Calculator                  │
├─────────────────────────────────────────┤
│  Enter numbers (comma separated):       │
│  [48, 180]                              │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  GCF (GCD): 12                          │
│  LCM: 720                               │
│                                         │
│  Prime Factorization:                   │
│  48 = 2⁴ × 3¹                          │
│  180 = 2² × 3² × 5¹                    │
│                                         │
│  Verification:                         │
│  GCF × LCM = 12 × 720 = 8640           │
│  a × b = 48 × 180 = 8640 ✓            │
│                                         │
│  Euclid's Algorithm:                   │
│  180 ÷ 48 = 3 remainder 36             │
│  48 ÷ 36 = 1 remainder 12              │
│  36 ÷ 12 = 3 remainder 0               │
│  GCF = 12                              │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  numbers: number[];
  gcf: number;
  lcm: number;
  primeFactorizations: { [key: number]: string };
  euclidSteps: string[];
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Euclid's Algorithm for GCF
function euclidGCF(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// GCF for multiple numbers
function gcfMultiple(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    result = euclidGCF(result, numbers[i]);
  }
  return result;
}

// LCM using GCF
function calculateLCM(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / euclidGCF(a, b);
}

// LCM for multiple numbers
function lcmMultiple(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    result = calculateLCM(result, numbers[i]);
  }
  return result;
}

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

// Format prime factorization
function formatFactorization(factors: { [prime: number]: number }): string {
  return Object.entries(factors)
    .map(([prime, exp]) => `${prime}^${exp}`)
    .join(' × ');
}
```

---

## How to Use Content (for SEO section)

1. Enter two or more numbers separated by commas
2. Click calculate to find GCF and LCM
3. View the GCF, LCM, and prime factorizations
4. Check the Euclid's algorithm steps
5. Verify the relationship: GCF × LCM = product of numbers
6. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free GCF / LCM calculator instantly computes the Greatest Common Factor (GCD) and Least Common Multiple using Euclid's algorithm. Enter two or more numbers to find their GCF and LCM along with prime factorizations. The calculator shows the step-by-step Euclid's algorithm process and verifies the mathematical relationship that GCF × LCM equals the product of the numbers. Perfect for students learning number theory, simplifying fractions, or solving problems involving common multiples and factors. All calculations happen in your browser with complete privacy.
