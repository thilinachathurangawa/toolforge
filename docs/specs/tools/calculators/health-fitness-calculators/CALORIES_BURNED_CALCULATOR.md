# SPEC: Calories Burned Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/CALORIES_BURNED_CALCULATOR.md`
**Status:** Pending
**Slug:** `calories-burned-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Calories Burned Calculator — Estimate calories burned during activities using MET (Metabolic Equivalent of Task) values. | ToolForge`
- **Description:** `Estimate calories burned during activities using MET (Metabolic Equivalent of Task) values.`
- **Primary Keyword:** `calories burned calculator`
- **Secondary Keywords:** `MET calculator, activity calorie burner, calculate calories burned, fitness tracker`

---

## Functional Requirements

- [ ] Input: Activity selector (with corresponding MET index)
- [ ] Input: Duration (minutes)
- [ ] Input: Body Weight (kg or lbs)
- [ ] Output: Calories burned (kcal)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Calories Burned = MET * Weight_kg * (Duration_minutes / 60) * 1.05
```
