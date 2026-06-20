# SPEC: Ratio Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/RATIO_CALCULATOR.md`
**Status:** Pending
**Slug:** `ratio-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Ratio Calculator — Simplify & Scale Ratios | ToolForge`
- **Description:** `Calculate and simplify ratios instantly with our free ratio calculator. Scale ratios up or down and find equivalent ratios.`
- **Primary Keyword:** ratio calculator
- **Secondary Keywords:** simplify ratio, scale ratio, equivalent ratio, ratio simplifier

---

## Functional Requirements

- [ ] Input fields for two or three ratio values
- [ ] Support for decimal numbers
- [ ] Simplify ratio to lowest terms
- [ ] Scale ratio by a factor
- [ ] Find equivalent ratios
- [ ] Display ratio in different formats (a:b, a/b, as fraction)
- [ ] Real-time calculation as user types
- [ ] Step-by-step simplification explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in GCD formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Ratio Calculator                       │
├─────────────────────────────────────────┤
│  Enter ratio values:                    │
│  A: [12]  B: [18]  C: [24] (optional)  │
│                                         │
│  Scale by factor: [2]                  │
│                                         │
│  [Simplify] [Scale] [Find Equivalent]  │
├─────────────────────────────────────────┤
│  Simplified Ratio: 2:3:4               │
│  As Fraction: 2/3                      │
│  Scaled Ratio (×2): 4:6:8              │
│                                         │
│  Step-by-step:                          │
│  1. Find GCD of 12, 18, 24: 6          │
│  2. Divide each by GCD:                │
│     12/6 = 2, 18/6 = 3, 24/6 = 4       │
│  3. Simplified ratio: 2:3:4            │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  valueA: number;
  valueB: number;
  valueC: number;
  scaleFactor: number;
  simplifiedRatio: number[];
  scaledRatio: number[];
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Greatest Common Divisor
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// GCD for multiple numbers
function gcdMultiple(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    result = gcd(result, numbers[i]);
  }
  return result;
}

// Simplify ratio
function simplifyRatio(values: number[]): number[] {
  const divisor = gcdMultiple(values);
  return values.map(v => v / divisor);
}

// Scale ratio
function scaleRatio(values: number[], factor: number): number[] {
  return values.map(v => v * factor);
}
```

---

## How to Use Content (for SEO section)

1. Enter your ratio values (A and B required, C optional)
2. Click Simplify to reduce the ratio to lowest terms
3. Enter a scale factor and click Scale to multiply the ratio
4. View the simplified ratio, scaled ratio, and step-by-step explanation
5. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free ratio calculator simplifies and scales ratios instantly. Enter two or three values to reduce them to their simplest form using the greatest common divisor. You can also scale ratios up or down by any factor to find equivalent ratios. The calculator displays ratios in multiple formats (a:b, a/b, as fraction) and provides step-by-step simplification explanations. Perfect for students learning about ratios, cooks adjusting recipes, or anyone working with proportional relationships. All calculations happen in your browser with complete privacy.
