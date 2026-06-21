# SPEC: Force Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/FORCE_CALCULATOR.md`
**Status:** Pending
**Slug:** `force-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Force Calculator — Calculate Force with F = ma | ToolForge`
- **Description:** `Calculate force using Newton's Second Law F = ma. Find force, mass, or acceleration with our free physics calculator. Perfect for mechanics problems.`
- **Primary Keyword:** force calculator
- **Secondary Keywords:** newton's second law calculator, mass acceleration calculator, physics force calculator, F=ma calculator, mechanics calculator

---

## Functional Requirements

- [ ] Mass input (kg, grams, pounds, ounces)
- [ ] Acceleration input (m/s², ft/s², g-force)
- [ ] Real-time force calculation
- [ ] Unit conversion support
- [ ] Display result in multiple units (Newtons, pound-force, dynes)
- [ ] Solve for mass (given force and acceleration)
- [ ] Solve for acceleration (given force and mass)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in physics formulas)

---

## Library

No external library needed — use built-in force formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Force Calculator (F = ma)              │
├─────────────────────────────────────────┤
│  Calculate: [Force ▼]                   │
│                                         │
│  Mass: [10        ] [kg ▼]              │
│  Acceleration: [9.8        ] [m/s² ▼]    │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Force: 98 N                            │
│  22.03 lbf                              │
│  9,800,000 dynes                        │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFor: 'force' | 'mass' | 'acceleration';
  mass: number;
  massUnit: 'kg' | 'g' | 'lb' | 'oz';
  acceleration: number;
  accelerationUnit: 'm/s²' | 'ft/s²' | 'g';
  force: number;
  forceUnit: 'N' | 'lbf' | 'dyn';
  result: number | null;
  resultsInAllUnits: {[key: string]: number};
  copied: boolean;
}
```

---

## Formulas

```typescript
// Newton's Second Law: F = m × a
// Mass: m = F / a
// Acceleration: a = F / m

function calculateForce(mass: number, acceleration: number): number {
  return mass * acceleration;
}

function calculateMass(force: number, acceleration: number): number {
  if (acceleration === 0) return 0;
  return force / acceleration;
}

function calculateAcceleration(force: number, mass: number): number {
  if (mass === 0) return 0;
  return force / mass;
}

// Unit Conversions
function convertToKilograms(value: number, from: string): number {
  switch(from) {
    case 'kg': return value;
    case 'g': return value / 1000;
    case 'lb': return value * 0.453592;
    case 'oz': return value * 0.0283495;
    default: return value;
  }
}

function convertFromKilograms(value: number, to: string): number {
  switch(to) {
    case 'kg': return value;
    case 'g': return value * 1000;
    case 'lb': return value / 0.453592;
    case 'oz': return value / 0.0283495;
    default: return value;
  }
}

function convertToMetersPerSecondSquared(value: number, from: string): number {
  switch(from) {
    case 'm/s²': return value;
    case 'ft/s²': return value * 0.3048;
    case 'g': return value * 9.80665;
    default: return value;
  }
}

function convertFromMetersPerSecondSquared(value: number, to: string): number {
  switch(to) {
    case 'm/s²': return value;
    case 'ft/s²': return value / 0.3048;
    case 'g': return value / 9.80665;
    default: return value;
  }
}

// Convert force to all units
function convertForceToAllUnits(forceInNewtons: number): {[key: string]: number} {
  return {
    'N': forceInNewtons,
    'lbf': forceInNewtons * 0.224809,
    'dyn': forceInNewtons * 100000
  };
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate (force, mass, or acceleration)
2. Enter the known values in the input fields
3. Choose the appropriate units for each value
4. Click calculate to get your result
5. View the result in multiple units for convenience
6. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free force calculator uses Newton's Second Law of Motion (F = ma) to solve physics problems involving force, mass, and acceleration. Whether you need to calculate the force required to accelerate an object, find the mass given force and acceleration, or determine acceleration from force and mass, this calculator handles it all. Perfect for students, engineers, and anyone working with mechanics problems. The calculator supports multiple units including kilograms, grams, pounds, ounces for mass; meters per second squared, feet per second squared, and g-force for acceleration; and Newtons, pound-force, and dynes for force. All calculations happen instantly in your browser with complete privacy.
