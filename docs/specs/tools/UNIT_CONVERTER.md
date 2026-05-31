# SPEC: Unit Converter Tool
**File:** `docs/specs/tools/UNIT_CONVERTER.md`
**Status:** Completed
**Slug:** `unit-converter`
**Category:** converter

---

## SEO

- **Title:** `Unit Converter — Convert Length, Weight, Temperature Online Free | ToolForge`
- **Description:** `Convert between units of length, weight, temperature, area, speed, and more. Free online unit converter with instant results.`
- **Primary Keyword:** unit converter online
- **Secondary Keywords:** length converter, weight converter, temperature converter, metric conversion

---

## Functional Requirements

- [ ] Category selector: Length, Weight, Temperature, Area, Speed, Volume, Time
- [ ] From unit dropdown (based on category)
- [ ] To unit dropdown (based on category)
- [ ] Input field for value
- [ ] Real-time conversion (no button needed)
- [ ] Display result with proper formatting
- [ ] Swap units button (↔)
- [ ] Common quick conversions (e.g., 1 inch = 2.54 cm)
- [ ] Copy result to clipboard
- [ ] Support decimal precision (2-6 decimal places)
- [ ] No library needed (built-in conversion formulas)

---

## Library

No external library needed — use built-in conversion formulas

---

## UI Layout

```
┌─────────────────────────────────┐
│  Category: [Length ▼]          │
├─────────────────────────────────┤
│  From: [Meter ▼]  To: [Foot ▼]│
│                                 │
│  [  100  ]  ↔  [  328.084  ]   │
│                                 │
│  100 Meter = 328.084 Foot       │
│                                 │
│  [Copy Result]                  │
├─────────────────────────────────┤
│  Common Conversions:            │
│  • 1 inch = 2.54 cm            │
│  • 1 km = 0.621 miles          │
│  • 1 kg = 2.205 lbs            │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  category: 'length' | 'weight' | 'temperature' | 'area' | 'speed' | 'volume' | 'time';
  fromUnit: string;
  toUnit: string;
  inputValue: number;
  outputValue: number;
  precision: number;
}
```

---

## Conversion Formulas

```typescript
const conversionRates = {
  length: {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  },
  weight: {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
  },
  temperature: {
    // Special handling for Celsius, Fahrenheit, Kelvin
  },
  // ... other categories
};
```

---

## How to Use Content (for SEO section)

1. Select the unit category (Length, Weight, Temperature, etc.)
2. Choose the "From" unit and "To" unit from the dropdowns
3. Enter your value in the input field
4. View the converted result instantly
5. Click the swap button (↔) to reverse the conversion
6. Copy the result to your clipboard

---

## About Content (for SEO section)

Our free unit converter handles conversions between length, weight, temperature, area, speed, volume, and time units. All calculations happen instantly in your browser with no data sent to any server. Perfect for students, engineers, and anyone needing quick metric and imperial conversions.
