# SPEC: Pythagorean Theorem Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/PYTHAGOREAN_THEOREM.md`
**Status:** Pending
**Slug:** `pythagorean-theorem-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Pythagorean Theorem Calculator — a²+b²=c² | ToolForge`
- **Description:** `Calculate Pythagorean theorem instantly with our free calculator. Find missing side of right triangle using a²+b²=c².`
- **Primary Keyword:** pythagorean theorem calculator
**Secondary Keywords:** right triangle calculator, find hypotenuse, pythagorean formula, triangle side calculator

---

## Functional Requirements

- [ ] Input fields for two sides of right triangle
- [ ] Select which side to calculate (a, b, or c/hypotenuse)
- [ ] Calculate missing side using a² + b² = c²
- [ ] Display the result
- [ ] Display the formula used
- [ ] Display the calculation steps
- [ ] Display triangle visualization
- [ ] Support for decimal numbers
- [ ] Real-time calculation as user types
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in Pythagorean theorem formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Pythagorean Theorem Calculator        │
├─────────────────────────────────────────┤
│  Find: [Hypotenuse (c) ▼]              │
│  Options: [a] [b] [c]                   │
│                                         │
│  Side a: [3]                            │
│  Side b: [4]                            │
│  Side c: [ ] (to calculate)             │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Hypotenuse (c): 5                      │
│                                         │
│  Formula:                               │
│  a² + b² = c²                          │
│  3² + 4² = c²                          │
│  9 + 16 = c²                           │
│  25 = c²                               │
│  c = √25 = 5                           │
│                                         │
│  Triangle Visualization:                │
│        │\                               │
│        │ \                              │
│      b │  \ c                           │
│        │   \                            │
│        └────┘                           │
│           a                             │
│                                         │
│  Step-by-step:                          │
│  1. a = 3, b = 4                       │
│  2. a² = 3² = 9                        │
│  3. b² = 4² = 16                       │
│  4. a² + b² = 9 + 16 = 25              │
│  5. c = √25 = 5                        │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  solveFor: 'a' | 'b' | 'c';
  sideA: number;
  sideB: number;
  sideC: number;
  result: number;
  formula: string;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Calculate hypotenuse (c) from a and b
function calculateHypotenuse(a: number, b: number): number {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

// Calculate side a from b and c
function calculateSideA(b: number, c: number): number {
  return Math.sqrt(Math.pow(c, 2) - Math.pow(b, 2));
}

// Calculate side b from a and c
function calculateSideB(a: number, c: number): number {
  return Math.sqrt(Math.pow(c, 2) - Math.pow(a, 2));
}

// Validate triangle (c must be largest)
function validateTriangle(a: number, b: number, c: number): boolean {
  const sides = [a, b, c].sort((x, y) => x - y);
  return Math.pow(sides[0], 2) + Math.pow(sides[1], 2) === Math.pow(sides[2], 2);
}
```

---

## How to Use Content (for SEO section)

1. Select which side you want to calculate (a, b, or hypotenuse c)
2. Enter the two known side lengths
3. Click calculate to find the missing side
4. View the result, formula, and triangle visualization
5. Check the step-by-step calculation
6. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free Pythagorean theorem calculator instantly finds the missing side of a right triangle using the formula a² + b² = c². Simply select which side you need to calculate and enter the two known side lengths. The calculator displays the result, shows the formula with your values plugged in, provides a triangle visualization, and includes step-by-step calculations. Perfect for students learning geometry, carpenters, engineers, or anyone working with right triangles. All calculations happen in your browser with complete privacy.
