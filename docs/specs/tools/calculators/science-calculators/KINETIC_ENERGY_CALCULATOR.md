# SPEC: Kinetic Energy Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/KINETIC_ENERGY_CALCULATOR.md`
**Status:** Pending
**Slug:** `kinetic-energy-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Kinetic Energy Calculator — Calculate KE with KE = ½mv² | ToolForge`
- **Description:** `Calculate kinetic energy using the formula KE = ½mv². Find kinetic energy, mass, or velocity with our free physics calculator. Perfect for energy problems.`
- **Primary Keyword:** kinetic energy calculator
- **Secondary Keywords:** KE calculator, mass velocity calculator, physics energy calculator, kinetic energy formula, motion energy calculator

---

## Functional Requirements

- [ ] Mass input (kg, grams, pounds, ounces)
- [ ] Velocity input (m/s, km/h, mph, ft/s)
- [ ] Real-time kinetic energy calculation
- [ ] Unit conversion support
- [ ] Display result in multiple units (Joules, kJ, calories, BTU)
- [ ] Solve for mass (given KE and velocity)
- [ ] Solve for velocity (given KE and mass)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in physics formulas)

---

## Library

No external library needed — use built-in kinetic energy formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Kinetic Energy Calculator              │
├─────────────────────────────────────────┤
│  Calculate: [Kinetic Energy ▼]          │
│                                         │
│  Mass: [10        ] [kg ▼]              │
│  Velocity: [20        ] [m/s ▼]         │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Kinetic Energy: 2000 J                │
│  2 kJ                                   │
│  478.01 cal                             │
│  1.896 BTU                              │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFor: 'kineticEnergy' | 'mass' | 'velocity';
  mass: number;
  massUnit: 'kg' | 'g' | 'lb' | 'oz';
  velocity: number;
  velocityUnit: 'm/s' | 'km/h' | 'mph' | 'ft/s';
  kineticEnergy: number;
  energyUnit: 'J' | 'kJ' | 'cal' | 'BTU';
  result: number | null;
  resultsInAllUnits: {[key: string]: number};
  copied: boolean;
}
```

---

## Formulas

```typescript
// Kinetic Energy: KE = ½ × m × v²
// Mass: m = 2 × KE / v²
// Velocity: v = √(2 × KE / m)

function calculateKineticEnergy(mass: number, velocity: number): number {
  return 0.5 * mass * Math.pow(velocity, 2);
}

function calculateMass(kineticEnergy: number, velocity: number): number {
  if (velocity === 0) return 0;
  return (2 * kineticEnergy) / Math.pow(velocity, 2);
}

function calculateVelocity(kineticEnergy: number, mass: number): number {
  if (mass === 0) return 0;
  return Math.sqrt((2 * kineticEnergy) / mass);
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

function convertToMetersPerSecond(value: number, from: string): number {
  switch(from) {
    case 'm/s': return value;
    case 'km/h': return value / 3.6;
    case 'mph': return value / 2.23694;
    case 'ft/s': return value / 3.28084;
    default: return value;
  }
}

function convertFromMetersPerSecond(value: number, to: string): number {
  switch(to) {
    case 'm/s': return value;
    case 'km/h': return value * 3.6;
    case 'mph': return value * 2.23694;
    case 'ft/s': return value * 3.28084;
    default: return value;
  }
}

// Convert energy to all units
function convertEnergyToAllUnits(energyInJoules: number): {[key: string]: number} {
  return {
    'J': energyInJoules,
    'kJ': energyInJoules / 1000,
    'cal': energyInJoules / 4.184,
    'BTU': energyInJoules / 1055.06
  };
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate (kinetic energy, mass, or velocity)
2. Enter the known values in the input fields
3. Choose the appropriate units for each value
4. Click calculate to get your result
5. View the result in multiple units for convenience
6. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free kinetic energy calculator uses the fundamental physics formula KE = ½mv² to solve problems involving the energy of moving objects. Whether you need to calculate the kinetic energy of a moving object, find the mass given kinetic energy and velocity, or determine velocity from kinetic energy and mass, this calculator handles it all. Perfect for students, physicists, engineers, and anyone working with energy and motion problems. The calculator supports multiple units including kilograms, grams, pounds, ounces for mass; meters per second, kilometers per hour, miles per hour, feet per second for velocity; and Joules, kilojoules, calories, and BTU for energy. All calculations happen instantly in your browser with complete privacy.
