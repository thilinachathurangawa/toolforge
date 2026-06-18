# SPEC: Ideal Weight Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/IDEAL_WEIGHT_CALCULATOR.md`
**Status:** Pending
**Slug:** `ideal-weight-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Ideal Weight Calculator — Estimate ideal body weight using Robinson, Miller, Devine, and Hamwi formula methods. | ToolForge`
- **Description:** `Estimate ideal body weight using Robinson, Miller, Devine, and Hamwi formula methods.`
- **Primary Keyword:** `ideal weight calculator`
- **Secondary Keywords:** `calculate ideal weight, ideal body weight formula, Devine formula, Robinson formula, ideal weight for height`

---

## Functional Requirements

- [ ] Input: Gender (Male / Female)
- [ ] Input: Height (cm or inches)
- [ ] Output: Devine Formula result
- [ ] Output: Robinson Formula result
- [ ] Output: Miller Formula result
- [ ] Output: Hamwi Formula result
- [ ] Output: Average Recommended weight
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
All formulas calculate for height above 5 feet (60 inches).
For every inch over 60 inches:

// Devine Formula
Men: 50.0 + 2.3 * (height_inches - 60)
Women: 45.5 + 2.3 * (height_inches - 60)

// Robinson Formula
Men: 52.0 + 1.9 * (height_inches - 60)
Women: 49.0 + 1.7 * (height_inches - 60)

// Miller Formula
Men: 56.2 + 1.41 * (height_inches - 60)
Women: 53.1 + 1.36 * (height_inches - 60)

// Hamwi Formula
Men: 48.0 + 2.7 * (height_inches - 60)
Women: 45.5 + 2.2 * (height_inches - 60)
```
