# SPEC: Exponent Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/EXPONENT_CALCULATOR.md`
**Status:** Pending
**Slug:** `exponent-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Exponent Calculator — Calculate Powers (b^n) | ToolForge`
- **Description:** `Calculate exponents and powers instantly with our free exponent calculator. Compute b^n for any base and exponent with step-by-step solutions.`
- **Primary Keyword:** exponent calculator
- **Secondary Keywords:** power calculator, calculate exponent, b^n calculator, exponentiation

---

## Functional Requirements

- [ ] Input field for base (b)
- [ ] Input field for exponent (n)
- [ ] Support for decimal numbers
- [ ] Support for negative exponents
- [ ] Support for fractional exponents
- [ ] Real-time calculation as user types
- [ ] Display the result
- [ ] Display the calculation in expanded form
- [ ] Display scientific notation for large results
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in Math.pow()

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Exponent Calculator                   │
├─────────────────────────────────────────┤
│  Base (b): [2]                         │
│  Exponent (n): [10]                     │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Result: 1024                           │
│                                         │
│  Calculation: 2^10 = 1024              │
│                                         │
│  Expanded: 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 1024
│                                         │
│  Scientific Notation: 1.024 × 10^3     │
│                                         │
│  Step-by-step:                          │
│  1. Base: 2                            │
│  2. Exponent: 10                       │
│  3. Multiply base by itself 10 times   │
│  4. Result: 1024                       │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  base: number;
  exponent: number;
  result: number;
  expandedForm: string;
  scientificNotation: string;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Calculate exponent
function calculateExponent(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

// Generate expanded form (for small exponents)
function generateExpandedForm(base: number, exponent: number): string {
  if (!Number.isInteger(exponent) || exponent < 0 || exponent > 10) {
    return "Not available for this exponent";
  }
  if (exponent === 0) return "1";
  const parts = Array(Math.abs(exponent)).fill(base.toString());
  return parts.join(" × ");
}

// Convert to scientific notation
function toScientificNotation(num: number): string {
  if (num === 0) return "0";
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = (num / Math.pow(10, exponent)).toFixed(3);
  return `${mantissa} × 10^${exponent}`;
}
```

---

## How to Use Content (for SEO section)

1. Enter the base number
2. Enter the exponent (power)
3. Click calculate to compute b^n
4. View the result, expanded form, and scientific notation
5. Check the step-by-step explanation
6. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free exponent calculator instantly computes powers and exponents for any base and exponent combination. Simply enter your base (b) and exponent (n) to calculate b^n. The calculator handles positive, negative, and fractional exponents, displaying results in standard form, expanded form (for small exponents), and scientific notation for very large or small numbers. Perfect for students learning exponents, engineers doing calculations, or anyone needing to compute powers quickly. The step-by-step explanations help you understand the exponentiation process. All calculations happen in your browser with complete privacy.
