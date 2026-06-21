# SPEC: pH Calculator Tool
**File:** `docs/specs/tools/calculators/science-calculators/PH_CALCULATOR.md`
**Status:** Pending
**Slug:** `ph-calculator`
**Category:** calculator
**Subcategory:** science-calculators

---

## SEO

- **Title:** `pH Calculator — Calculate pH from [H⁺] Concentration | ToolForge`
- **Description:** `Calculate pH from hydrogen ion concentration or vice versa. Our free pH calculator handles strong acids, weak acids, and bases. Perfect for chemistry.`
- **Primary Keyword:** pH calculator
- **Secondary Keywords:** hydrogen ion concentration calculator, acid base calculator, chemistry pH calculator, pOH calculator, acidity calculator

---

## Functional Requirements

- [ ] Hydrogen ion concentration [H⁺] input
- [ ] Hydroxide ion concentration [OH⁻] input
- [ ] pH input (to calculate concentration)
- [ ] pOH input (to calculate concentration)
- [ ] Real-time bidirectional calculation
- [ ] Support for scientific notation
- [ ] Display both pH and pOH
- [ ] Show acid/base classification
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in chemistry formulas)

---

## Library

No external library needed — use built-in pH formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  pH Calculator                          │
├─────────────────────────────────────────┤
│  Calculate from: [H⁺ Concentration ▼]    │
│                                         │
│  [H⁺]: [1e-7        ] [M ▼]             │
│  pH: 7.00                               │
│  pOH: 7.00                              │
│                                         │
│  Classification: Neutral                │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  pH: 7.00                               │
│  pOH: 7.00                              │
│  [H⁺]: 1.00 × 10⁻⁷ M                    │
│  [OH⁻]: 1.00 × 10⁻⁷ M                   │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculateFrom: 'h_concentration' | 'oh_concentration' | 'ph' | 'poh';
  hConcentration: string;
  ohConcentration: string;
  ph: string;
  poh: string;
  phResult: number | null;
  pohResult: number | null;
  hConcResult: number | null;
  ohConcResult: number | null;
  classification: string;
  copied: boolean;
}
```

---

## Formulas

```typescript
// pH = -log₁₀[H⁺]
// pOH = -log₁₀[OH⁻]
// pH + pOH = 14 (at 25°C)
// [H⁺] = 10^(-pH)
// [OH⁻] = 10^(-pOH)
// Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴ (at 25°C)

function calculatePHFromHConcentration(hConcentration: number): number {
  if (hConcentration <= 0) return 0;
  return -Math.log10(hConcentration);
}

function calculatePOHFromOHConcentration(ohConcentration: number): number {
  if (ohConcentration <= 0) return 0;
  return -Math.log10(ohConcentration);
}

function calculateHConcentrationFromPH(ph: number): number {
  return Math.pow(10, -ph);
}

function calculateOHConcentrationFromPOH(poh: number): number {
  return Math.pow(10, -poh);
}

function calculatePOHFromPH(ph: number): number {
  return 14 - ph;
}

function calculatePHFromPOH(poh: number): number {
  return 14 - poh;
}

function calculateOHConcentrationFromHConcentration(hConcentration: number): number {
  const Kw = 1.0e-14;
  if (hConcentration <= 0) return 0;
  return Kw / hConcentration;
}

function classifyPH(ph: number): string {
  if (ph < 0) return 'Invalid (pH cannot be negative)';
  if (ph < 3) return 'Strongly Acidic';
  if (ph < 6) return 'Weakly Acidic';
  if (ph < 7) return 'Slightly Acidic';
  if (ph === 7) return 'Neutral';
  if (ph < 8) return 'Slightly Basic';
  if (ph < 11) return 'Weakly Basic';
  if (ph < 14) return 'Strongly Basic';
  return 'Invalid (pH cannot exceed 14)';
}

function formatScientificNotation(value: number): string {
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  return `${mantissa.toFixed(2)} × 10${exponent >= 0 ? '+' : ''}${exponent}`;
}
```

---

## How to Use Content (for SEO section)

1. Select what you want to calculate from (H⁺ concentration, OH⁻ concentration, pH, or pOH)
2. Enter the known value in the input field
3. Click calculate to get all related values
4. View pH, pOH, ion concentrations, and acid/base classification
5. Copy the results to your clipboard for later use

---

## About Content (for SEO section)

Our free pH calculator helps you calculate pH from hydrogen ion concentration or vice versa. Using the fundamental chemistry formula pH = -log₁₀[H⁺], you can convert between pH and ion concentrations instantly. The calculator also calculates pOH and shows the acid/base classification (strongly acidic, weakly acidic, neutral, weakly basic, strongly basic). Perfect for students, chemists, and anyone working with acid-base chemistry. The calculator supports scientific notation for very small concentrations and automatically calculates the complementary values (pH ↔ pOH, [H⁺] ↔ [OH⁻]). All calculations happen instantly in your browser with complete privacy.
