# SPEC: BAC Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/BAC_CALCULATOR.md`
**Status:** Pending
**Slug:** `bac-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `BAC Calculator — Estimate Blood Alcohol Concentration (BAC) using the Widmark formula. | ToolForge`
- **Description:** `Estimate Blood Alcohol Concentration (BAC) using the Widmark formula.`
- **Primary Keyword:** `BAC calculator`
- **Secondary Keywords:** `blood alcohol concentration, calculate BAC, Widmark formula, alcohol limit calculator`

---

## Functional Requirements

- [ ] Input: Gender (Male / Female)
- [ ] Input: Weight (kg or lbs)
- [ ] Input: Drinks consumed (number of standard drinks)
- [ ] Input: Alcohol percentage per drink (%) - optional
- [ ] Input: Time elapsed since first drink (hours)
- [ ] Output: Estimated BAC (%)
- [ ] Output: Time until sober (BAC reaches 0.00%)
- [ ] Output: Current sobriety/impairment status description
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
BAC % = [ (Alcohol_grams / (Weight_grams * r)) * 100 ] - (beta * Hours)

Where:
- Standard drink = 14 grams of pure alcohol
- r (gender constant) = Men: 0.68, Women: 0.55
- beta (elimination rate) = 0.015% per hour
```
