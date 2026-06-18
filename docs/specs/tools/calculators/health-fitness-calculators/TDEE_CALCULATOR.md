# SPEC: TDEE Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/TDEE_CALCULATOR.md`
**Status:** Pending
**Slug:** `tdee-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `TDEE Calculator — Calculate Total Daily Energy Expenditure (TDEE) based on BMR and activity level. | ToolForge`
- **Description:** `Calculate Total Daily Energy Expenditure (TDEE) based on BMR and activity level.`
- **Primary Keyword:** `TDEE calculator`
- **Secondary Keywords:** `total daily energy expenditure, calculate TDEE, active calorie burn, daily calorie expenditure`

---

## Functional Requirements

- [ ] Input: BMR (or auto-calculate using age, gender, weight, height)
- [ ] Input: Activity level (Sedentary, Light, Moderate, Active, Very Active)
- [ ] Output: TDEE (calories/day)
- [ ] Output: Weekly calorie target summary
- [ ] Output: Macronutrient breakdown estimates for TDEE
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
TDEE = BMR * Activity_Multiplier

Where Activity_Multiplier is:
- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
- Extra Active: 1.9
```
