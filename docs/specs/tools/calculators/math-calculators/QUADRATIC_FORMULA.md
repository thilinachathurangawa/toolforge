# SPEC: Quadratic Formula Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/QUADRATIC_FORMULA.md`
**Status:** Pending
**Slug:** `quadratic-formula-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Quadratic Formula Calculator — Discriminant & Roots | ToolForge`
- **Description:** `Calculate quadratic equation roots instantly with our free calculator. Find discriminant and solve ax²+bx+c=0 with step-by-step solutions.`
- **Primary Keyword:** quadratic formula calculator
- **Secondary Keywords:** solve quadratic equation, discriminant calculator, quadratic roots, ax²+bx+c=0

---

## Functional Requirements

- [ ] Input field for a (coefficient of x²)
- [ ] Input field for b (coefficient of x)
- [ ] Input field for c (constant term)
- [ ] Calculate discriminant (b² - 4ac)
- [ ] Determine number of real roots based on discriminant
- [ ] Calculate roots using quadratic formula
- [ ] Display discriminant value
- [ ] Display root(s) with formulas
- [ ] Display vertex coordinates
- [ ] Display axis of symmetry
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in quadratic formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Quadratic Formula Calculator          │
├─────────────────────────────────────────┤
│  ax² + bx + c = 0                       │
│                                         │
│  a: [1]                                 │
│  b: [-5]                                │
│  c: [6]                                 │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Discriminant: 1                        │
│  Type: Two real and distinct roots      │
│                                         │
│  Roots:                                 │
│  x₁ = 3                                │
│  x₂ = 2                                │
│                                         │
│  Vertex: (2.5, -0.25)                   │
│  Axis of Symmetry: x = 2.5              │
│                                         │
│  Formula:                               │
│  x = (-b ± √(b² - 4ac)) / 2a           │
│  x = (5 ± √(25 - 24)) / 2              │
│  x = (5 ± √1) / 2                      │
│  x₁ = (5 + 1) / 2 = 3                  │
│  x₂ = (5 - 1) / 2 = 2                  │
│                                         │
│  Step-by-step:                          │
│  1. Identify coefficients: a=1, b=-5, c=6
│  2. Calculate discriminant: b² - 4ac   │
│  3. Discriminant = (-5)² - 4(1)(6) = 1 │
│  4. Since discriminant > 0: 2 real roots│
│  5. Apply quadratic formula            │
│  6. Calculate both roots                │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  rootType: 'twoReal' | 'oneReal' | 'complex';
  root1: number | string;
  root2: number | string;
  vertex: { x: number; y: number };
  axisOfSymmetry: number;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Calculate discriminant
function calculateDiscriminant(a: number, b: number, c: number): number {
  return Math.pow(b, 2) - 4 * a * c;
}

// Determine root type
function getRootType(discriminant: number): 'twoReal' | 'oneReal' | 'complex' {
  if (discriminant > 0) return 'twoReal';
  if (discriminant === 0) return 'oneReal';
  return 'complex';
}

// Calculate roots
function calculateRoots(a: number, b: number, c: number): { root1: number | string; root2: number | string } {
  const discriminant = calculateDiscriminant(a, b, c);
  const type = getRootType(discriminant);
  
  if (type === 'twoReal') {
    const sqrtD = Math.sqrt(discriminant);
    const root1 = (-b + sqrtD) / (2 * a);
    const root2 = (-b - sqrtD) / (2 * a);
    return { root1, root2 };
  } else if (type === 'oneReal') {
    const root = -b / (2 * a);
    return { root1: root, root2: root };
  } else {
    // Complex roots
    const realPart = (-b / (2 * a)).toFixed(4);
    const imaginaryPart = (Math.sqrt(Math.abs(discriminant)) / (2 * a)).toFixed(4);
    return {
      root1: `${realPart} + ${imaginaryPart}i`,
      root2: `${realPart} - ${imaginaryPart}i`
    };
  }
}

// Calculate vertex
function calculateVertex(a: number, b: number, c: number): { x: number; y: number } {
  const x = -b / (2 * a);
  const y = a * Math.pow(x, 2) + b * x + c;
  return { x, y };
}

// Calculate axis of symmetry
function calculateAxisOfSymmetry(a: number, b: number): number {
  return -b / (2 * a);
}
```

---

## How to Use Content (for SEO section)

1. Enter the coefficient a (for x² term)
2. Enter the coefficient b (for x term)
3. Enter the constant term c
4. Click calculate to solve the quadratic equation
5. View the discriminant, roots, vertex, and axis of symmetry
6. Check the step-by-step calculation with the quadratic formula
7. Copy the result or reset to try another equation

---

## About Content (for SEO section)

Our free quadratic formula calculator instantly solves quadratic equations of the form ax² + bx + c = 0. Enter the coefficients a, b, and c to find the discriminant, roots (solutions), vertex coordinates, and axis of symmetry. The calculator handles all cases: two real and distinct roots, one real repeated root, or complex conjugate roots. Perfect for students learning algebra, solving physics problems, or anyone needing to solve quadratic equations. The step-by-step explanations show the quadratic formula in action. All calculations happen in your browser with complete privacy.
