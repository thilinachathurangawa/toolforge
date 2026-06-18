# SPEC: BMR Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/BMR_CALCULATOR.md`
**Status:** Pending
**Slug:** `bmr-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `BMR Calculator — Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation. | ToolForge`
- **Description:** `Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.`
- **Primary Keyword:** `BMR calculator`
- **Secondary Keywords:** `basal metabolic rate, calculate BMR, Mifflin-St Jeor equation, BMR formula, calorie needs`

---

## Functional Requirements

- [ ] Input: Age (years)
- [ ] Input: Gender (Male / Female)
- [ ] Input: Weight (kg or lbs)
- [ ] Input: Height (cm or inches)
- [ ] Input: Formula selector (Mifflin-St Jeor, Harris-Benedict)
- [ ] Output: BMR (calories/day)
- [ ] Output: Daily calorie requirement table based on different activity levels
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// Mifflin-St Jeor Equation
For Men:
BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age_years + 5

For Women:
BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age_years - 161
```
