# SPEC: Water Intake Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/WATER_INTAKE_CALCULATOR.md`
**Status:** Pending
**Slug:** `water-intake-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Water Intake Calculator — Calculate daily water intake recommendations based on weight and activity duration. | ToolForge`
- **Description:** `Calculate daily water intake recommendations based on weight and activity duration.`
- **Primary Keyword:** `water intake calculator`
- **Secondary Keywords:** `calculate water intake, daily hydration calculator, water goal, hydration requirement`

---

## Functional Requirements

- [ ] Input: Weight (kg or lbs)
- [ ] Input: Daily exercise/active time (minutes)
- [ ] Input: Climate / Environment (Cold, Moderate, Hot)
- [ ] Output: Daily recommended water intake (ml / oz / cups)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// Baseline intake
Baseline (ml) = Weight_kg * 35

// Activity adjustment
Exercise_Add (ml) = Exercise_mins * 11.8

// Climate Adjustment
Moderate = Baseline + Exercise_Add
Cold = (Baseline + Exercise_Add) * 0.9
Hot = (Baseline + Exercise_Add) * 1.2
```
