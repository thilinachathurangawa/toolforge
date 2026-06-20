# SPEC: Scientific Notation Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/SCIENTIFIC_NOTATION.md`
**Status:** Pending
**Slug:** `scientific-notation-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Scientific Notation Calculator — Convert & Operate | ToolForge`
- **Description:** `Convert to and from scientific notation instantly with our free calculator. Perform operations with scientific notation and standard form.`
- **Primary Keyword:** scientific notation calculator
- **Secondary Keywords:** convert to scientific notation, standard form calculator, scientific notation converter

---

## Functional Requirements

- [ ] Convert standard form to scientific notation
- [ ] Convert scientific notation to standard form
- [ ] Support for very large and very small numbers
- [ ] Perform operations:
  - Addition
  - Subtraction
  - Multiplication
  - Division
- [ ] Display result in both scientific notation and standard form
- [ ] Display mantissa and exponent separately
- [ ] Support for decimal numbers
- [ ] Real-time conversion as user types
- [ ] Step-by-step conversion explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in number conversion

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Scientific Notation Calculator        │
├─────────────────────────────────────────┤
│  Mode: [Convert ▼] [Operate]           │
│                                         │
│  Convert Mode:                          │
│  Standard Form: [1234567]               │
│  Scientific Notation: [1.234567 × 10⁶] │
│                                         │
│  Operate Mode:                          │
│  Number 1: [2.5 × 10³]                 │
│  Operation: [× ▼]                       │
│  Number 2: [4 × 10²]                   │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Scientific Notation: 1.0 × 10⁶        │
│  Standard Form: 1,000,000               │
│                                         │
│  Mantissa: 1.0                          │
│  Exponent: 6                            │
│                                         │
│  Step-by-step:                          │
│  1. Convert to standard:                │
│     2.5 × 10³ = 2,500                 │
│     4 × 10² = 400                      │
│  2. Perform operation:                  │
│     2,500 × 400 = 1,000,000           │
│  3. Convert to scientific notation:     │
│     1,000,000 = 1.0 × 10⁶             │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: 'convert' | 'operate';
  standardForm: string;
  scientificNotation: string;
  mantissa: number;
  exponent: number;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  number1: { mantissa: number; exponent: number };
  number2: { mantissa: number; exponent: number };
  result: { mantissa: number; exponent: number };
  resultStandard: string;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Convert standard form to scientific notation
function toScientificNotation(num: number): { mantissa: number; exponent: number; string: string } {
  if (num === 0) return { mantissa: 0, exponent: 0, string: '0 × 10⁰' };
  
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);
  
  // Normalize mantissa to 1-10 range
  const normalizedMantissa = mantissa;
  const normalizedExponent = exponent;
  
  return {
    mantissa: normalizedMantissa,
    exponent: normalizedExponent,
    string: `${normalizedMantissa.toFixed(6)} × 10^${normalizedExponent}`
  };
}

// Convert scientific notation to standard form
function toStandardForm(mantissa: number, exponent: number): number {
  return mantissa * Math.pow(10, exponent);
}

// Format number with commas
function formatWithCommas(num: number): string {
  return num.toLocaleString();
}

// Multiply scientific notation numbers
function multiplyScientific(
  n1: { mantissa: number; exponent: number },
  n2: { mantissa: number; exponent: number }
): { mantissa: number; exponent: number } {
  const resultMantissa = n1.mantissa * n2.mantissa;
  const resultExponent = n1.exponent + n2.exponent;
  
  // Normalize
  if (Math.abs(resultMantissa) >= 10) {
    return {
      mantissa: resultMantissa / 10,
      exponent: resultExponent + 1
    };
  }
  
  return { mantissa: resultMantissa, exponent: resultExponent };
}

// Divide scientific notation numbers
function divideScientific(
  n1: { mantissa: number; exponent: number },
  n2: { mantissa: number; exponent: number }
): { mantissa: number; exponent: number } {
  const resultMantissa = n1.mantissa / n2.mantissa;
  const resultExponent = n1.exponent - n2.exponent;
  
  // Normalize
  if (Math.abs(resultMantissa) < 1 && resultMantissa !== 0) {
    return {
      mantissa: resultMantissa * 10,
      exponent: resultExponent - 1
    };
  }
  
  return { mantissa: resultMantissa, exponent: resultExponent };
}
```

---

## How to Use Content (for SEO section)

1. Select Convert mode to change between standard form and scientific notation
2. Select Operate mode to perform calculations with scientific notation
3. For Convert: Enter a number in either format to see the conversion
4. For Operate: Enter two numbers in scientific notation and select an operation
5. View the result in both scientific notation and standard form
6. Check the step-by-step conversion or calculation
7. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free scientific notation calculator instantly converts numbers between standard form and scientific notation, and performs operations with scientific notation. Enter any number to see it in scientific notation format (a × 10^b), or perform addition, subtraction, multiplication, and division with numbers already in scientific notation. The calculator displays results in both formats, shows the mantissa and exponent separately, and provides step-by-step explanations. Perfect for students learning scientific notation, scientists, engineers, or anyone working with very large or very small numbers. All calculations happen in your browser with complete privacy.
