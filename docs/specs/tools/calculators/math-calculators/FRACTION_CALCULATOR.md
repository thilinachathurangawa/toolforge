# SPEC: Fraction Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/FRACTION_CALCULATOR.md`
**Status:** Pending
**Slug:** `fraction-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Fraction Calculator — Add, Subtract, Multiply, Divide Fractions | ToolForge`
- **Description:** `Calculate fractions instantly with our free fraction calculator. Add, subtract, multiply, and divide fractions with step-by-step solutions.`
- **Primary Keyword:** fraction calculator
- **Secondary Keywords:** add fractions, subtract fractions, multiply fractions, divide fractions, fraction operations

---

## Functional Requirements

- [ ] Support for 4 operations: addition, subtraction, multiplication, division
- [ ] Input for two fractions (numerator and denominator for each)
- [ ] Input for whole numbers (converts to fraction automatically)
- [ ] Real-time calculation as user types
- [ ] Display result in simplified form
- [ ] Display result as mixed number if applicable
- [ ] Display result as decimal
- [ ] Step-by-step solution showing the calculation process
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in fraction formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Fraction Calculator                    │
├─────────────────────────────────────────┤
│  Operation: [Add ▼]                     │
│                                         │
│  Fraction 1:                            │
│  ┌─────────────────────────────────┐   │
│  │ Numerator:   [1]                │   │
│  │ Denominator: [2]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Fraction 2:                            │
│  ┌─────────────────────────────────┐   │
│  │ Numerator:   [1]                │   │
│  │ Denominator: [4]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Result: 3/4                            │
│  Mixed Number: 3/4                      │
│  Decimal: 0.75                          │
│                                         │
│  Step-by-step:                          │
│  1. Find common denominator: 4         │
│  2. Convert fractions: 2/4 + 1/4      │
│  3. Add numerators: 3/4                │
│  4. Simplify: 3/4                      │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  fraction1: { numerator: number; denominator: number };
  fraction2: { numerator: number; denominator: number };
  result: { numerator: number; denominator: number };
  mixedNumber: string;
  decimal: number;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Greatest Common Divisor (for simplification)
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

// Simplify fraction
function simplifyFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  };
}

// Add fractions
function addFractions(f1: { n: number; d: number }, f2: { n: number; d: number }): { n: number; d: number } {
  const commonDenominator = f1.d * f2.d;
  const numerator = f1.n * f2.d + f2.n * f1.d;
  return simplifyFraction(numerator, commonDenominator);
}

// Subtract fractions
function subtractFractions(f1: { n: number; d: number }, f2: { n: number; d: number }): { n: number; d: number } {
  const commonDenominator = f1.d * f2.d;
  const numerator = f1.n * f2.d - f2.n * f1.d;
  return simplifyFraction(numerator, commonDenominator);
}

// Multiply fractions
function multiplyFractions(f1: { n: number; d: number }, f2: { n: number; d: number }): { n: number; d: number } {
  const numerator = f1.n * f2.n;
  const denominator = f1.d * f2.d;
  return simplifyFraction(numerator, denominator);
}

// Divide fractions
function divideFractions(f1: { n: number; d: number }, f2: { n: number; d: number }): { n: number; d: number } {
  if (f2.n === 0) throw new Error("Cannot divide by zero");
  const numerator = f1.n * f2.d;
  const denominator = f1.d * f2.n;
  return simplifyFraction(numerator, denominator);
}

// Convert to mixed number
function toMixedNumber(numerator: number, denominator: number): string {
  if (denominator === 0) return "Undefined";
  if (Math.abs(numerator) < Math.abs(denominator)) {
    return `${numerator}/${denominator}`;
  }
  const whole = Math.floor(Math.abs(numerator) / Math.abs(denominator));
  const remainder = Math.abs(numerator) % Math.abs(denominator);
  const sign = numerator < 0 ? "-" : "";
  if (remainder === 0) {
    return `${sign}${whole}`;
  }
  return `${sign}${whole} ${remainder}/${Math.abs(denominator)}`;
}
```

---

## How to Use Content (for SEO section)

1. Select the operation you want to perform (add, subtract, multiply, or divide)
2. Enter the numerator and denominator for the first fraction
3. Enter the numerator and denominator for the second fraction
4. Click calculate to see the result
5. View the result in fraction form, mixed number, and decimal
6. Check the step-by-step explanation to understand the calculation
7. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free fraction calculator handles all four basic operations with fractions: addition, subtraction, multiplication, and division. Simply enter two fractions and select your operation to get instant results. The calculator automatically simplifies fractions and displays results in multiple formats: as a proper fraction, mixed number, and decimal. Perfect for students, teachers, or anyone working with fractions in cooking, construction, or any field requiring precise measurements. The step-by-step solutions help you understand the mathematical process. All calculations happen in your browser with complete privacy.
