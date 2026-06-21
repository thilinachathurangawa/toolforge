# SPEC: Molarity Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/MOLARITY_CALCULATOR.md`
**Status:** Pending
**Slug:** `molarity-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Molarity Calculator — Calculate M = n/V | ToolForge`
- **Description:** `Calculate molarity, moles, or volume using M = n/V. Our free molarity calculator handles solution concentration problems. Perfect for chemistry.`
- **Primary Keyword:** molarity calculator
- **Secondary Keywords:** concentration calculator, moles calculator, solution calculator, chemistry molarity, molar concentration calculator

---

## Functional Requirements

- [ ] Moles of solute input
- [ ] Volume of solution input (L, mL)
- [ ] Molarity input (M)
- [ ] Real-time calculation of the third variable
- [ ] Unit conversion support
- [ ] Calculate mass from moles (with molar mass)
- [ ] Display results in multiple units
- [ ] Solve for any variable (M, n, or V)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in chemistry formulas)

---

## Library

No external library needed — use built-in molarity formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Molarity Calculator (M = n/V)          │
├─────────────────────────────────────────┤
│  Calculate: [Molarity ▼]                │
│                                         │
│  Moles (n): [0.5        ] [mol ▼]       │
│  Volume (V): [0.5        ] [L ▼]         │
│  Molarity (M): [1        ] [M ▼]         │
│                                         │
│  Molar Mass (optional): [58.44  ] [g/mol]
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Molarity: 1 M                         │
│  Moles: 0.5 mol                        │
│  Volume: 0.5 L                         │
│  Mass: 29.22 g                         │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFor: 'molarity' | 'moles' | 'volume';
  moles: number;
  molesUnit: 'mol' | 'mmol';
  volume: number;
  volumeUnit: 'L' | 'mL';
  molarity: number;
  molarityUnit: 'M' | 'mM';
  molarMass: number;
  molarMassUnit: 'g/mol';
  mass: number | null;
  result: number | null;
  resultsInAllUnits: {[key: string]: number};
  copied: boolean;
}
```

---

## Formulas

```typescript
// Molarity: M = n / V
// Moles: n = M × V
// Volume: V = n / M
// Mass: m = n × Molar Mass

function calculateMolarity(moles: number, volume: number): number {
  if (volume === 0) return 0;
  return moles / volume;
}

function calculateMoles(molarity: number, volume: number): number {
  return molarity * volume;
}

function calculateVolume(moles: number, molarity: number): number {
  if (molarity === 0) return 0;
  return moles / molarity;
}

function calculateMass(moles: number, molarMass: number): number {
  return moles * molarMass;
}

// Unit Conversions
function convertToMoles(value: number, from: string): number {
  switch(from) {
    case 'mol': return value;
    case 'mmol': return value / 1000;
    default: return value;
  }
}

function convertFromMoles(value: number, to: string): number {
  switch(to) {
    case 'mol': return value;
    case 'mmol': return value * 1000;
    default: return value;
  }
}

function convertToLiters(value: number, from: string): number {
  switch(from) {
    case 'L': return value;
    case 'mL': return value / 1000;
    default: return value;
  }
}

function convertFromLiters(value: number, to: string): number {
  switch(to) {
    case 'L': return value;
    case 'mL': return value * 1000;
    default: return value;
  }
}

function convertToMolarity(value: number, from: string): number {
  switch(from) {
    case 'M': return value;
    case 'mM': return value / 1000;
    default: return value;
  }
}

function convertFromMolarity(value: number, to: string): number {
  switch(to) {
    case 'M': return value;
    case 'mM': return value * 1000;
    default: return value;
  }
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate (molarity, moles, or volume)
2. Enter the two known values in the input fields
3. Optionally enter molar mass to calculate mass
4. Choose the appropriate units for each value
5. Click calculate to get the third value and mass
6. View the results in multiple units for convenience
7. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free molarity calculator uses the fundamental chemistry formula M = n/V (molarity equals moles divided by volume) to solve solution concentration problems. Whether you need to calculate molarity, moles of solute, or volume of solution, this calculator handles it all. It can also calculate the mass of solute when you provide the molar mass. Perfect for students, chemists, and anyone working with solution chemistry. The calculator supports multiple units including moles, millimoles; liters, milliliters; and molar (M), millimolar (mM). All calculations happen instantly in your browser with complete privacy.
