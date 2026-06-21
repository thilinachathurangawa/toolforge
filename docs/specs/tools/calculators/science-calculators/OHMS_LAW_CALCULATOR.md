# SPEC: Ohm's Law Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/OHMS_LAW_CALCULATOR.md`
**Status:** Pending
**Slug:** `ohms-law-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Ohm's Law Calculator — Calculate V, I, R with V = IR | ToolForge`
- **Description:** `Calculate voltage, current, and resistance using Ohm's Law V = IR. Solve for any electrical variable with our free calculator. Perfect for electronics.`
- **Primary Keyword:** ohm's law calculator
- **Secondary Keywords:** voltage calculator, current calculator, resistance calculator, electrical calculator, electronics calculator, V=IR calculator

---

## Functional Requirements

- [ ] Voltage input (V, mV, kV)
- [ ] Current input (A, mA, kA)
- [ ] Resistance input (Ω, kΩ, MΩ)
- [ ] Real-time calculation of the third variable
- [ ] Unit conversion support
- [ ] Calculate power (P = VI)
- [ ] Display results in multiple units
- [ ] Solve for any variable (V, I, or R)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in electrical formulas)

---

## Library

No external library needed — use built-in Ohm's Law formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Ohm's Law Calculator (V = IR)          │
├─────────────────────────────────────────┤
│  Calculate: [Voltage ▼]                 │
│                                         │
│  Voltage: [12        ] [V ▼]            │
│  Current: [2        ] [A ▼]             │
│  Resistance: [6        ] [Ω ▼]          │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Voltage: 12 V                         │
│  Current: 2 A                          │
│  Resistance: 6 Ω                       │
│  Power: 24 W                           │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFor: 'voltage' | 'current' | 'resistance';
  voltage: number;
  voltageUnit: 'V' | 'mV' | 'kV';
  current: number;
  currentUnit: 'A' | 'mA' | 'kA';
  resistance: number;
  resistanceUnit: 'Ω' | 'kΩ' | 'MΩ';
  power: number | null;
  result: number | null;
  resultsInAllUnits: {[key: string]: number};
  copied: boolean;
}
```

---

## Formulas

```typescript
// Ohm's Law: V = I × R
// Current: I = V / R
// Resistance: R = V / I
// Power: P = V × I = I²R = V²/R

function calculateVoltage(current: number, resistance: number): number {
  return current * resistance;
}

function calculateCurrent(voltage: number, resistance: number): number {
  if (resistance === 0) return 0;
  return voltage / resistance;
}

function calculateResistance(voltage: number, current: number): number {
  if (current === 0) return 0;
  return voltage / current;
}

function calculatePower(voltage: number, current: number): number {
  return voltage * current;
}

// Unit Conversions
function convertToVolts(value: number, from: string): number {
  switch(from) {
    case 'V': return value;
    case 'mV': return value / 1000;
    case 'kV': return value * 1000;
    default: return value;
  }
}

function convertFromVolts(value: number, to: string): number {
  switch(to) {
    case 'V': return value;
    case 'mV': return value * 1000;
    case 'kV': return value / 1000;
    default: return value;
  }
}

function convertToAmperes(value: number, from: string): number {
  switch(from) {
    case 'A': return value;
    case 'mA': return value / 1000;
    case 'kA': return value * 1000;
    default: return value;
  }
}

function convertFromAmperes(value: number, to: string): number {
  switch(to) {
    case 'A': return value;
    case 'mA': return value * 1000;
    case 'kA': return value / 1000;
    default: return value;
  }
}

function convertToOhms(value: number, from: string): number {
  switch(from) {
    case 'Ω': return value;
    case 'kΩ': return value * 1000;
    case 'MΩ': return value * 1000000;
    default: return value;
  }
}

function convertFromOhms(value: number, to: string): number {
  switch(to) {
    case 'Ω': return value;
    case 'kΩ': return value / 1000;
    case 'MΩ': return value / 1000000;
    default: return value;
  }
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate (voltage, current, or resistance)
2. Enter the two known values in the input fields
3. Choose the appropriate units for each value
4. Click calculate to get the third value and power
5. View the results in multiple units for convenience
6. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free Ohm's Law calculator uses the fundamental electrical formula V = IR (voltage equals current times resistance) to solve circuit problems. Whether you need to calculate voltage, current, or resistance, this calculator handles it all. It also calculates power (P = VI) automatically, giving you a complete picture of your circuit. Perfect for students, electricians, engineers, and hobbyists working with electronics. The calculator supports multiple units including volts, millivolts, kilovots; amperes, milliamperes, kiloamperes; and ohms, kilohms, megohms. All calculations happen instantly in your browser with complete privacy.
