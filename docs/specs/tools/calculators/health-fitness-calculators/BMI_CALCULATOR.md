# SPEC: BMI Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/BMI_CALCULATOR.md`
**Status:** Pending
**Slug:** `bmi-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `BMI Calculator — Calculate Body Mass Index (BMI) using metric (kg/m²) or imperial (lb/in²) units. | ToolForge`
- **Description:** `Calculate Body Mass Index (BMI) using metric (kg/m²) or imperial (lb/in²) units.`
- **Primary Keyword:** `BMI calculator`
- **Secondary Keywords:** `body mass index calculator, calculate BMI, BMI formula, metric BMI, imperial BMI`

---

## Functional Requirements

- [ ] Input: Weight (kg or lbs)
- [ ] Input: Height (cm or inches)
- [ ] Input: Unit system toggle (Metric / Imperial)
- [ ] Output: BMI score
- [ ] Output: Weight status category (Underweight, Normal weight, Overweight, Obese)
- [ ] Output: Healthy weight range for height
- [ ] Output: Ponderal Index
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// Metric
BMI = weight_kg / (height_m * height_m)

// Imperial
BMI = (weight_lbs / (height_in * height_in)) * 703
```
