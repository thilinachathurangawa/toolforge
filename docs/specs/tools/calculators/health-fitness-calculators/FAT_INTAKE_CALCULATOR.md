# SPEC: Fat Intake Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/FAT_INTAKE_CALCULATOR.md`
**Status:** Pending
**Slug:** `fat-intake-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Fat Intake Calculator — Calculate recommended daily fat intake limits based on calorie goals. | ToolForge`
- **Description:** `Calculate recommended daily fat intake limits based on calorie goals.`
- **Primary Keyword:** `fat intake calculator`
- **Secondary Keywords:** `daily fat intake limit, fat grams calculator, healthy fats proportion, saturated fat limits`

---

## Functional Requirements

- [ ] Input: Daily Calorie Target (kcal)
- [ ] Input: Dietary preference (Standard, Low Fat, Keto/High Fat)
- [ ] Output: Recommended total fat range (grams/day)
- [ ] Output: Recommended saturated fat limit (grams/day)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// Standard fat intake range (20% to 35% of total calories)
Min_Fat_Grams = (Calorie_Target * 0.20) / 9
Max_Fat_Grams = (Calorie_Target * 0.35) / 9

// Saturated fat limit (<10% of total calories)
Saturated_Fat_Limit_Grams = (Calorie_Target * 0.10) / 9
```
