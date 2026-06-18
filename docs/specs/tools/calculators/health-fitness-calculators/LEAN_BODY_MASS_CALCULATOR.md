# SPEC: Lean Body Mass Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/LEAN_BODY_MASS_CALCULATOR.md`
**Status:** Pending
**Slug:** `lean-body-mass-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Lean Body Mass Calculator — Calculate lean body mass (LBM) using total body weight and body fat percentage. | ToolForge`
- **Description:** `Calculate lean body mass (LBM) using total body weight and body fat percentage.`
- **Primary Keyword:** `lean body mass calculator`
- **Secondary Keywords:** `calculate LBM, lean body mass formula, lean muscle mass, body fat to LBM`

---

## Functional Requirements

- [ ] Input: Total Weight (kg or lbs)
- [ ] Input: Body Fat Percentage (%)
- [ ] Output: Lean Body Mass (kg or lbs)
- [ ] Output: Total Fat Mass (kg or lbs)
- [ ] Output: Lean Mass Percentage (%)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Lean Body Mass (LBM) = Total Weight * (1 - (Body Fat % / 100))
Fat Mass = Total Weight - LBM
```
