# SPEC: Calorie Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/CALORIE_CALCULATOR.md`
**Status:** Pending
**Slug:** `calorie-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Calorie Calculator — Calculate goal-based daily calorie intake for weight loss, maintenance, or gain. | ToolForge`
- **Description:** `Calculate goal-based daily calorie intake for weight loss, maintenance, or gain.`
- **Primary Keyword:** `calorie calculator`
- **Secondary Keywords:** `daily calorie intake, calculate calories, calorie surplus, calorie deficit, calorie goal`

---

## Functional Requirements

- [ ] Input: TDEE (or auto-calculate)
- [ ] Input: Goal (Lose weight, Maintain weight, Gain weight)
- [ ] Input: Target pace (e.g., lose 0.25kg, 0.5kg, or 1kg per week)
- [ ] Output: Target daily calories
- [ ] Output: Target weekly calories
- [ ] Output: Warning alerts for extremely low calorie targets (<1200 kcal for women, <1500 kcal for men)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// Lose Weight
Target = TDEE - (500 to 1000 calories depending on pace)

// Maintain Weight
Target = TDEE

// Gain Weight
Target = TDEE + (250 to 500 calories depending on pace)
```
