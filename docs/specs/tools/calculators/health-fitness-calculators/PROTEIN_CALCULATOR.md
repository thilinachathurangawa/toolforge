# SPEC: Protein Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/PROTEIN_CALCULATOR.md`
**Status:** Pending
**Slug:** `protein-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Protein Calculator — Calculate daily protein requirements based on body weight, activity level, and fitness goals. | ToolForge`
- **Description:** `Calculate daily protein requirements based on body weight, activity level, and fitness goals.`
- **Primary Keyword:** `protein calculator`
- **Secondary Keywords:** `daily protein requirement, calculate protein intake, how much protein, protein for muscle growth`

---

## Functional Requirements

- [ ] Input: Weight (kg or lbs)
- [ ] Input: Activity level / Goal combination (Sedentary, Active, Muscle Growth, Weight Loss athlete)
- [ ] Output: Recommended daily protein range (grams/day)
- [ ] Output: Protein source examples table
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// Multiplier per kg of body weight
- Sedentary / General Health: 0.8g to 1.0g per kg
- Active / Endurance training: 1.2g to 1.4g per kg
- Strength training / Muscle gain: 1.6g to 2.2g per kg
- Calorie deficit preservation: 2.0g to 2.4g per kg
```
