# SPEC: Temperature Converter Tool
**File:** `docs/specs/tools/converter/TEMPERATURE_CONVERTER.md`
**Status:** Completed
**Slug:** `temperature-converter`
**Category:** converter

---

## SEO

- **Title:** `Temperature Converter — Celsius to Fahrenheit, Kelvin Online Free | ToolForge`
- **Description:** `Convert temperature between Celsius, Fahrenheit, and Kelvin instantly. Quick presets for absolute zero, freezing, body temp, and boiling. Free online temperature converter.`
- **Primary Keyword:** Celsius to Fahrenheit converter
- **Secondary Keywords:** convert C to F, Fahrenheit to Celsius conversion, Kelvin converter, temperature formula

---

## Functional Requirements

- [ ] Three inputs: Celsius, Fahrenheit, Kelvin — any change updates all others
- [ ] Formulas: F = C × 9/5 + 32; C = (F - 32) × 5/9; K = C + 273.15
- [ ] Quick-preset buttons: Absolute Zero (−273.15°C), Water Freezing (0°C), Room Temp (20°C), Body Temp (37°C), Water Boiling (100°C)
- [ ] Responsive comparison table showing common conversions

---

## Formulas

```
F = C × 9/5 + 32
C = (F − 32) × 5/9
K = C + 273.15
C = K − 273.15
```

---

## Preset Reference Points

| Label            | °C       | °F       | K      |
|-----------------|---------|---------|--------|
| Absolute Zero   | −273.15 | −459.67 | 0      |
| Water Freezing  | 0       | 32      | 273.15 |
| Room Temp       | 20      | 68      | 293.15 |
| Body Temp       | 37      | 98.6    | 310.15 |
| Water Boiling   | 100     | 212     | 373.15 |
