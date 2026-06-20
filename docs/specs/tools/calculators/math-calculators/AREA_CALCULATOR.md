# SPEC: Area Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/AREA_CALCULATOR.md`
**Status:** Pending
**Slug:** `area-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Area Calculator — Calculate Area of 6+ Shapes | ToolForge`
- **Description:** `Calculate area of shapes instantly with our free area calculator. Find area for rectangle, circle, triangle, trapezoid, parallelogram, and more.`
- **Primary Keyword:** area calculator
- **Secondary Keywords:** calculate area, rectangle area, circle area, triangle area, area formulas

---

## Functional Requirements

- [ ] Support for multiple shapes:
  - Rectangle/Square
  - Circle
  - Triangle
  - Trapezoid
  - Parallelogram
  - Ellipse
- [ ] Shape selector dropdown
- [ ] Dynamic input fields based on selected shape
- [ ] Display area result
- [ ] Display formula used
- [ ] Display perimeter/circumference (where applicable)
- [ ] Support for decimal numbers
- [ ] Real-time calculation as user types
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in geometry formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Area Calculator                       │
├─────────────────────────────────────────┤
│  Shape: [Rectangle ▼]                  │
│                                         │
│  Rectangle Inputs:                      │
│  Length: [10]                           │
│  Width: [5]                             │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Area: 50 square units                  │
│  Perimeter: 30 units                    │
│                                         │
│  Formula:                               │
│  Area = length × width                  │
│  Area = 10 × 5 = 50                    │
│                                         │
│  Perimeter = 2 × (length + width)       │
│  Perimeter = 2 × (10 + 5) = 30         │
│                                         │
│  Step-by-step:                          │
│  1. Length: 10                         │
│  2. Width: 5                           │
│  3. Area = 10 × 5 = 50                 │
│  4. Perimeter = 2 × (10 + 5) = 30     │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  shape: 'rectangle' | 'square' | 'circle' | 'triangle' | 'trapezoid' | 'parallelogram' | 'ellipse';
  inputs: { [key: string]: number };
  area: number;
  perimeter: number;
  formula: string;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Rectangle/Square
function rectangleArea(length: number, width: number): number {
  return length * width;
}

function rectanglePerimeter(length: number, width: number): number {
  return 2 * (length + width);
}

// Circle
function circleArea(radius: number): number {
  return Math.PI * radius * radius;
}

function circleCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}

// Triangle
function triangleArea(base: number, height: number): number {
  return 0.5 * base * height;
}

function trianglePerimeter(a: number, b: number, c: number): number {
  return a + b + c;
}

// Trapezoid
function trapezoidArea(base1: number, base2: number, height: number): number {
  return 0.5 * (base1 + base2) * height;
}

function trapezoidPerimeter(base1: number, base2: number, side1: number, side2: number): number {
  return base1 + base2 + side1 + side2;
}

// Parallelogram
function parallelogramArea(base: number, height: number): number {
  return base * height;
}

function parallelogramPerimeter(base: number, side: number): number {
  return 2 * (base + side);
}

// Ellipse
function ellipseArea(majorAxis: number, minorAxis: number): number {
  return Math.PI * majorAxis * minorAxis;
}

function ellipseCircumference(majorAxis: number, minorAxis: number): number {
  // Approximation using Ramanujan's formula
  const h = Math.pow((majorAxis - minorAxis), 2) / Math.pow((majorAxis + minorAxis), 2);
  return Math.PI * (majorAxis + minorAxis) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}
```

---

## How to Use Content (for SEO section)

1. Select the shape you want to calculate area for
2. Enter the required dimensions (inputs change based on shape)
3. Click calculate to find the area
4. View the area, perimeter/circumference, and formula used
5. Check the step-by-step calculation explanation
6. Copy the result or reset to try another shape

---

## About Content (for SEO section)

Our free area calculator instantly calculates the area of multiple shapes including rectangles, squares, circles, triangles, trapezoids, parallelograms, and ellipses. Simply select your shape and enter the required dimensions to get instant results. The calculator displays the area, perimeter or circumference, the formula used, and step-by-step calculations. Perfect for students learning geometry, architects, engineers, or anyone needing to calculate areas quickly. All calculations happen in your browser with complete privacy.
