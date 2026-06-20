# SPEC: Volume Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/VOLUME_CALCULATOR.md`
**Status:** Pending
**Slug:** `volume-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Volume Calculator — Sphere, Cube, Cylinder | ToolForge`
- **Description:** `Calculate volume of 3D shapes instantly with our free volume calculator. Find volume for sphere, cube, cylinder, and more with formulas.`
- **Primary Keyword:** volume calculator
- **Secondary Keywords:** calculate volume, sphere volume, cube volume, cylinder volume, volume formulas

---

## Functional Requirements

- [ ] Support for multiple 3D shapes:
  - Sphere
  - Cube
  - Cylinder
  - Rectangular Prism
  - Cone
  - Pyramid
- [ ] Shape selector dropdown
- [ ] Dynamic input fields based on selected shape
- [ ] Display volume result
- [ ] Display formula used
- [ ] Display surface area (where applicable)
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
│  Volume Calculator                     │
├─────────────────────────────────────────┤
│  Shape: [Sphere ▼]                     │
│                                         │
│  Sphere Inputs:                         │
│  Radius: [5]                            │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Volume: 523.6 cubic units              │
│  Surface Area: 314.16 square units     │
│                                         │
│  Formula:                               │
│  Volume = (4/3) × π × r³               │
│  Volume = (4/3) × π × 5³ = 523.6      │
│                                         │
│  Surface Area = 4 × π × r²            │
│  Surface Area = 4 × π × 5² = 314.16   │
│                                         │
│  Step-by-step:                          │
│  1. Radius: 5                          │
│  2. r³ = 5 × 5 × 5 = 125              │
│  3. Volume = (4/3) × π × 125 = 523.6 │
│  4. r² = 5 × 5 = 25                   │
│  5. Surface Area = 4 × π × 25 = 314.16│
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  shape: 'sphere' | 'cube' | 'cylinder' | 'rectangularPrism' | 'cone' | 'pyramid';
  inputs: { [key: string]: number };
  volume: number;
  surfaceArea: number;
  formula: string;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Sphere
function sphereVolume(radius: number): number {
  return (4/3) * Math.PI * Math.pow(radius, 3);
}

function sphereSurfaceArea(radius: number): number {
  return 4 * Math.PI * Math.pow(radius, 2);
}

// Cube
function cubeVolume(side: number): number {
  return Math.pow(side, 3);
}

function cubeSurfaceArea(side: number): number {
  return 6 * Math.pow(side, 2);
}

// Cylinder
function cylinderVolume(radius: number, height: number): number {
  return Math.PI * Math.pow(radius, 2) * height;
}

function cylinderSurfaceArea(radius: number, height: number): number {
  return 2 * Math.PI * radius * (radius + height);
}

// Rectangular Prism
function rectangularPrismVolume(length: number, width: number, height: number): number {
  return length * width * height;
}

function rectangularPrismSurfaceArea(length: number, width: number, height: number): number {
  return 2 * (length * width + width * height + height * length);
}

// Cone
function coneVolume(radius: number, height: number): number {
  return (1/3) * Math.PI * Math.pow(radius, 2) * height;
}

function coneSurfaceArea(radius: number, height: number): number {
  const slantHeight = Math.sqrt(Math.pow(radius, 2) + Math.pow(height, 2));
  return Math.PI * radius * (radius + slantHeight);
}

// Pyramid (square base)
function pyramidVolume(base: number, height: number): number {
  return (1/3) * Math.pow(base, 2) * height;
}

function pyramidSurfaceArea(base: number, height: number): number {
  const slantHeight = Math.sqrt(Math.pow(base/2, 2) + Math.pow(height, 2));
  return Math.pow(base, 2) + 2 * base * slantHeight;
}
```

---

## How to Use Content (for SEO section)

1. Select the 3D shape you want to calculate volume for
2. Enter the required dimensions (inputs change based on shape)
3. Click calculate to find the volume
4. View the volume, surface area, and formula used
5. Check the step-by-step calculation explanation
6. Copy the result or reset to try another shape

---

## About Content (for SEO section)

Our free volume calculator instantly calculates the volume of 3D shapes including spheres, cubes, cylinders, rectangular prisms, cones, and pyramids. Simply select your shape and enter the required dimensions to get instant results. The calculator displays the volume, surface area, the formula used, and step-by-step calculations. Perfect for students learning geometry, engineers, architects, or anyone needing to calculate volumes quickly. All calculations happen in your browser with complete privacy.
