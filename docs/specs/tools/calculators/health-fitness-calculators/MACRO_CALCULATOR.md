# SPEC: Macro Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/MACRO_CALCULATOR.md`
**Status:** Pending
**Slug:** `macro-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Macro Calculator — Calculate daily macronutrient distribution (carbs, protein, fat) based on calorie targets and dietary preferences. | ToolForge`
- **Description:** `Calculate daily macronutrient distribution (carbs, protein, fat) based on calorie targets and dietary preferences.`
- **Primary Keyword:** `macro calculator`
- **Secondary Keywords:** `macronutrient calculator, calculate macros, carb protein fat split, keto macros, flexible dieting`

---

## Functional Requirements

- [ ] Input: Daily Calorie Target (kcal)
- [ ] Input: Diet type (Balanced, High Protein, Low Carb, Keto, Custom)
- [ ] Input: Protein / Fat / Carb custom percentages (if custom)
- [ ] Output: Grams of Protein (4 kcal/g)
- [ ] Output: Grams of Carbohydrates (4 kcal/g)
- [ ] Output: Grams of Fat (9 kcal/g)
- [ ] Output: Visual breakdown chart (Donut / Pie chart)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Protein (g) = (Calories * Protein_Percentage) / 4
Carbs (g) = (Calories * Carb_Percentage) / 4
Fat (g) = (Calories * Fat_Percentage) / 9
```
