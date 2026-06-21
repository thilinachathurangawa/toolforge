# SPEC: Density Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/DENSITY_CALCULATOR.md`
**Status:** Pending
**Slug:** `density-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Density Calculator — Calculate ρ = m/V | ToolForge`
- **Description:** `Calculate density, mass, or volume using ρ = m/V. Our free density calculator handles solids, liquids, and gases. Perfect for physics and chemistry.`
- **Primary Keyword:** density calculator
- **Secondary Keywords:** mass volume calculator, density formula calculator, physics density calculator, material density calculator, specific gravity calculator

---

## Functional Requirements

- [ ] Mass input (kg, g, lb, oz)
- [ ] Volume input (m³, L, mL, ft³, in³)
- [ ] Density input (kg/m³, g/cm³, g/mL, lb/ft³)
- [ ] Real-time calculation of the third variable
- [ ] Unit conversion support
- [ ] Calculate specific gravity (relative to water)
- [ ] Display results in multiple units
- [ ] Solve for any variable (ρ, m, or V)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in density formulas)

---

## Library

No external library needed — use built-in density formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Density Calculator (ρ = m/V)            │
├─────────────────────────────────────────┤
│  Calculate: [Density ▼]                 │
│                                         │
│  Mass (m): [1000        ] [g ▼]         │
│  Volume (V): [1000        ] [mL ▼]       │
│  Density (ρ): [1        ] [g/mL ▼]      │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Density: 1 g/mL                        │
│  1000 kg/m³                             │
│  62.43 lb/ft³                           │
│                                         │
│  Specific Gravity: 1.00                 │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFor: 'density' | 'mass' | 'volume';
  mass: number;
  massUnit: 'kg' | 'g' | 'lb' | 'oz';
  volume: number;
  volumeUnit: 'm³' | 'L' | 'mL' | 'ft³' | 'in³';
  density: number;
  densityUnit: 'kg/m³' | 'g/cm³' | 'g/mL' | 'lb/ft³';
  specificGravity: number | null;
  result: number | null;
  resultsInAllUnits: {[key: string]: number};
  copied: boolean;
}
```

---

## Formulas

```typescript
// Density: ρ = m / V
// Mass: m = ρ × V
// Volume: V = m / ρ
// Specific Gravity: SG = ρ_substance / ρ_water (at 4°C)
// ρ_water = 1000 kg/m³ = 1 g/cm³ = 1 g/mL

const WATER_DENSITY = 1000; // kg/m³

function calculateDensity(mass: number, volume: number): number {
  if (volume === 0) return 0;
  return mass / volume;
}

function calculateMass(density: number, volume: number): number {
  return density * volume;
}

function calculateVolume(mass: number, density: number): number {
  if (density === 0) return 0;
  return mass / density;
}

function calculateSpecificGravity(density: number): number {
  return density / WATER_DENSITY;
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

function convertToCubicMeters(value: number, from: string): number {
  switch(from) {
    case 'm³': return value;
    case 'L': return value / 1000;
    case 'mL': return value / 1000000;
    case 'ft³': return value * 0.0283168;
    case 'in³': return value * 0.0000163871;
    default: return value;
  }
}

function convertFromCubicMeters(value: number, to: string): number {
  switch(to) {
    case 'm³': return value;
    case 'L': return value * 1000;
    case 'mL': return value * 1000000;
    case 'ft³': return value / 0.0283168;
    case 'in³': return value / 0.0000163871;
    default: return value;
  }
}

function convertToKgPerCubicMeter(value: number, from: string): number {
  switch(from) {
    case 'kg/m³': return value;
    case 'g/cm³': return value * 1000;
    case 'g/mL': return value * 1000;
    case 'lb/ft³': return value * 16.0185;
    default: return value;
  }
}

function convertFromKgPerCubicMeter(value: number, to: string): number {
  switch(to) {
    case 'kg/m³': return value;
    case 'g/cm³': return value / 1000;
    case 'g/mL': return value / 1000;
    case 'lb/ft³': return value / 16.0185;
    default: return value;
  }
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate (density, mass, or volume)
2. Enter the two known values in the input fields
3. Choose the appropriate units for each value
4. Click calculate to get the third value and specific gravity
5. View the results in multiple units for convenience
6. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free density calculator uses the fundamental formula ρ = m/V (density equals mass divided by volume) to solve problems involving material density. Whether you need to calculate density, mass, or volume, this calculator handles it all. It also calculates specific gravity (relative to water) for easy comparison with known materials. Perfect for students, engineers, scientists, and anyone working with materials or fluids. The calculator supports multiple units including kilograms, grams, pounds, ounces for mass; cubic meters, liters, milliliters, cubic feet, cubic inches for volume; and kg/m³, g/cm³, g/mL, lb/ft³ for density. All calculations happen instantly in your browser with complete privacy.
