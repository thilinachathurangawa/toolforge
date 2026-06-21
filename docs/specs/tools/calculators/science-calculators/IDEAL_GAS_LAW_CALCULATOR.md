# SPEC: Ideal Gas Law Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/IDEAL_GAS_LAW_CALCULATOR.md`
**Status:** Pending
**Slug:** `ideal-gas-law-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Ideal Gas Law Calculator — Calculate PV = nRT | ToolForge`
- **Description:** `Calculate pressure, volume, moles, or temperature using PV = nRT. Our free ideal gas law calculator handles all gas law problems. Perfect for chemistry.`
- **Primary Keyword:** ideal gas law calculator
- **Secondary Keywords:** PV=nRT calculator, gas law calculator, pressure volume calculator, chemistry gas calculator, boyle's law calculator

---

## Functional Requirements

- [ ] Pressure input (atm, kPa, mmHg, torr, bar)
- [ ] Volume input (L, mL, m³)
- [ ] Moles input (mol)
- [ ] Temperature input (K, °C, °F)
- [ ] Real-time calculation of any variable
- [ ] Unit conversion support
- [ ] Gas constant R value display
- [ ] Solve for any variable (P, V, n, or T)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in gas law formulas)

---

## Library

No external library needed — use built-in ideal gas law formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Ideal Gas Law Calculator (PV = nRT)    │
├─────────────────────────────────────────┤
│  Calculate: [Pressure ▼]                │
│                                         │
│  Pressure (P): [1        ] [atm ▼]      │
│  Volume (V): [22.4        ] [L ▼]       │
│  Moles (n): [1        ] [mol ▼]         │
│  Temperature (T): [273.15        ] [K ▼] │
│                                         │
│  R = 0.0821 L·atm/(mol·K)               │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Pressure: 1 atm                       │
│  Volume: 22.4 L                        │
│  Moles: 1 mol                          │
│  Temperature: 273.15 K (0°C)            │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFor: 'pressure' | 'volume' | 'moles' | 'temperature';
  pressure: number;
  pressureUnit: 'atm' | 'kPa' | 'mmHg' | 'torr' | 'bar';
  volume: number;
  volumeUnit: 'L' | 'mL' | 'm³';
  moles: number;
  temperature: number;
  temperatureUnit: 'K' | '°C' | '°F';
  gasConstant: number;
  gasConstantUnit: 'L·atm/(mol·K)';
  result: number | null;
  resultsInAllUnits: {[key: string]: number};
  copied: boolean;
}
```

---

## Formulas

```typescript
// Ideal Gas Law: PV = nRT
// Pressure: P = nRT / V
// Volume: V = nRT / P
// Moles: n = PV / RT
// Temperature: T = PV / nR

// Gas Constants (R):
// 0.0821 L·atm/(mol·K)
// 8.314 J/(mol·K)
// 62.36 L·mmHg/(mol·K)
// 8.314 kPa·L/(mol·K)

const R_ATM = 0.0821; // L·atm/(mol·K)

function calculatePressure(moles: number, temperature: number, volume: number): number {
  if (volume === 0) return 0;
  return (moles * R_ATM * temperature) / volume;
}

function calculateVolume(moles: number, temperature: number, pressure: number): number {
  if (pressure === 0) return 0;
  return (moles * R_ATM * temperature) / pressure;
}

function calculateMoles(pressure: number, volume: number, temperature: number): number {
  if (temperature === 0) return 0;
  return (pressure * volume) / (R_ATM * temperature);
}

function calculateTemperature(pressure: number, volume: number, moles: number): number {
  if (moles === 0) return 0;
  return (pressure * volume) / (moles * R_ATM);
}

// Unit Conversions
function convertToAtm(value: number, from: string): number {
  switch(from) {
    case 'atm': return value;
    case 'kPa': return value / 101.325;
    case 'mmHg': return value / 760;
    case 'torr': return value / 760;
    case 'bar': return value / 1.01325;
    default: return value;
  }
}

function convertFromAtm(value: number, to: string): number {
  switch(to) {
    case 'atm': return value;
    case 'kPa': return value * 101.325;
    case 'mmHg': return value * 760;
    case 'torr': return value * 760;
    case 'bar': return value * 1.01325;
    default: return value;
  }
}

function convertToLiters(value: number, from: string): number {
  switch(from) {
    case 'L': return value;
    case 'mL': return value / 1000;
    case 'm³': return value * 1000;
    default: return value;
  }
}

function convertFromLiters(value: number, to: string): number {
  switch(to) {
    case 'L': return value;
    case 'mL': return value * 1000;
    case 'm³': return value / 1000;
    default: return value;
  }
}

function convertToKelvin(value: number, from: string): number {
  switch(from) {
    case 'K': return value;
    case '°C': return value + 273.15;
    case '°F': return (value - 32) * 5/9 + 273.15;
    default: return value;
  }
}

function convertFromKelvin(value: number, to: string): number {
  switch(to) {
    case 'K': return value;
    case '°C': return value - 273.15;
    case '°F': return (value - 273.15) * 9/5 + 32;
    default: return value;
  }
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate (pressure, volume, moles, or temperature)
2. Enter the three known values in the input fields
3. Choose the appropriate units for each value
4. Click calculate to get the fourth value
5. View the results in multiple units for convenience
6. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free ideal gas law calculator uses the fundamental chemistry formula PV = nRT to solve gas law problems. Whether you need to calculate pressure, volume, moles, or temperature, this calculator handles it all. The ideal gas law relates pressure, volume, amount of gas (moles), and temperature using the gas constant R. Perfect for students, chemists, and anyone working with gas chemistry. The calculator supports multiple units including atmospheres, kilopascals, mmHg, torr, bar for pressure; liters, milliliters, cubic meters for volume; and Kelvin, Celsius, Fahrenheit for temperature. All calculations happen instantly in your browser with complete privacy.
