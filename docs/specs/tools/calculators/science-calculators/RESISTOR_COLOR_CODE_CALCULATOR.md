# SPEC: Resistor Color Code Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/RESISTOR_COLOR_CODE_CALCULATOR.md`
**Status:** Pending
**Slug:** `resistor-color-code-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `Resistor Color Code Calculator — Decode 4-Band & 5-Band Resistors | ToolForge`
- **Description:** `Calculate resistor value from color codes or find colors from resistance. Our free calculator handles 4-band, 5-band, and SMD resistors. Perfect for electronics.`
- **Primary Keyword:** resistor color code calculator
- **Secondary Keywords:** resistor value calculator, 4 band resistor calculator, 5 band resistor calculator, electronics resistor calculator, ohm color code calculator

---

## Functional Requirements

- [ ] 4-band resistor color selection
- [ ] 5-band resistor color selection
- [ ] SMD resistor code input
- [ ] Real-time resistance calculation
- [ ] Tolerance band calculation
- [ ] Display resistance in ohms, kilohms, megohms
- [ ] Reverse calculator (resistance to colors)
- [ ] Color band visual display
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in resistor color codes)

---

## Library

No external library needed — use built-in resistor color code tables

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Resistor Color Code Calculator         │
├─────────────────────────────────────────┤
│  Mode: [4-Band ▼]                       │
│                                         │
│  Band 1: [Brown ▼]  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  Band 2: [Black ▼]  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  Band 3: [Red ▼]    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  Band 4: [Gold ▼]   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Resistance: 1 kΩ ± 5%                  │
│  Min: 950 Ω                             │
│  Max: 1.05 kΩ                           │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: '4-band' | '5-band' | 'smd';
  band1: string;
  band2: string;
  band3: string;
  band4: string;
  band5: string;
  smdCode: string;
  resistance: number | null;
  tolerance: number | null;
  minResistance: number | null;
  maxResistance: number | null;
  formattedResistance: string;
  copied: boolean;
}
```

---

## Formulas

```typescript
// Resistor Color Codes
// Digit colors: Black(0), Brown(1), Red(2), Orange(3), Yellow(4), 
//               Green(5), Blue(6), Violet(7), Grey(8), White(9)
// Multiplier colors: Black(×1), Brown(×10), Red(×100), Orange(×1K), 
//                    Yellow(×10K), Green(×100K), Blue(×1M), 
//                    Violet(×10M), Gold(×0.1), Silver(×0.01)
// Tolerance colors: Brown(±1%), Red(±2%), Green(±0.5%), Blue(±0.25%), 
//                    Violet(±0.1%), Grey(±0.05%), Gold(±5%), Silver(±10%)

interface ColorCode {
  name: string;
  digit?: number;
  multiplier?: number;
  tolerance?: number;
  color: string;
}

const COLOR_CODES: ColorCode[] = [
  { name: 'Black', digit: 0, multiplier: 1, color: '#000000' },
  { name: 'Brown', digit: 1, multiplier: 10, tolerance: 1, color: '#8B4513' },
  { name: 'Red', digit: 2, multiplier: 100, tolerance: 2, color: '#FF0000' },
  { name: 'Orange', digit: 3, multiplier: 1000, color: '#FFA500' },
  { name: 'Yellow', digit: 4, multiplier: 10000, color: '#FFFF00' },
  { name: 'Green', digit: 5, multiplier: 100000, tolerance: 0.5, color: '#008000' },
  { name: 'Blue', digit: 6, multiplier: 1000000, tolerance: 0.25, color: '#0000FF' },
  { name: 'Violet', digit: 7, multiplier: 10000000, tolerance: 0.1, color: '#EE82EE' },
  { name: 'Grey', digit: 8, tolerance: 0.05, color: '#808080' },
  { name: 'White', digit: 9, color: '#FFFFFF' },
  { name: 'Gold', multiplier: 0.1, tolerance: 5, color: '#FFD700' },
  { name: 'Silver', multiplier: 0.01, tolerance: 10, color: '#C0C0C0' },
];

function calculate4BandResistance(band1: string, band2: string, band3: string, band4: string): {
  resistance: number;
  tolerance: number;
} {
  const digit1 = COLOR_CODES.find(c => c.name === band1)?.digit ?? 0;
  const digit2 = COLOR_CODES.find(c => c.name === band2)?.digit ?? 0;
  const multiplier = COLOR_CODES.find(c => c.name === band3)?.multiplier ?? 1;
  const tolerance = COLOR_CODES.find(c => c.name === band4)?.tolerance ?? 20;
  
  const resistance = (digit1 * 10 + digit2) * multiplier;
  
  return { resistance, tolerance };
}

function calculate5BandResistance(band1: string, band2: string, band3: string, band4: string, band5: string): {
  resistance: number;
  tolerance: number;
} {
  const digit1 = COLOR_CODES.find(c => c.name === band1)?.digit ?? 0;
  const digit2 = COLOR_CODES.find(c => c.name === band2)?.digit ?? 0;
  const digit3 = COLOR_CODES.find(c => c.name === band3)?.digit ?? 0;
  const multiplier = COLOR_CODES.find(c => c.name === band4)?.multiplier ?? 1;
  const tolerance = COLOR_CODES.find(c => c.name === band5)?.tolerance ?? 20;
  
  const resistance = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
  
  return { resistance, tolerance };
}

function formatResistance(ohms: number): string {
  if (ohms >= 1000000) {
    return `${(ohms / 1000000).toFixed(2)} MΩ`;
  } else if (ohms >= 1000) {
    return `${(ohms / 1000).toFixed(2)} kΩ`;
  } else {
    return `${ohms.toFixed(2)} Ω`;
  }
}

function calculateMinMax(resistance: number, tolerance: number): {
  min: number;
  max: number;
} {
  const toleranceDecimal = tolerance / 100;
  return {
    min: resistance * (1 - toleranceDecimal),
    max: resistance * (1 + toleranceDecimal)
  };
}
```

---

## How to Use Content (for SEO section)

1. Select the resistor mode (4-band, 5-band, or SMD)
2. Choose the color for each band from the dropdown
3. Click calculate to get the resistance value
4. View the resistance in ohms, kilohms, or megohms
5. See the tolerance range (min and max values)
6. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free resistor color code calculator helps you decode resistor values from color bands or find the correct colors for a desired resistance. Support for 4-band and 5-band resistors covers most through-hole resistors, while SMD code support handles surface-mount devices. The calculator displays the resistance value in appropriate units (ohms, kilohms, megohms) along with the tolerance range. Perfect for electronics hobbyists, students, engineers, and anyone working with circuits. The visual color display helps you verify the correct band colors. All calculations happen instantly in your browser with complete privacy.
