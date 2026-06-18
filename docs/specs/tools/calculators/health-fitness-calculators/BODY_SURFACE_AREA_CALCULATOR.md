# SPEC: Body Surface Area Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/BODY_SURFACE_AREA_CALCULATOR.md`
**Status:** Pending
**Slug:** `body-surface-area-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Body Surface Area Calculator — Calculate body surface area (BSA) using the DuBois formula. | ToolForge`
- **Description:** `Calculate body surface area (BSA) using the DuBois formula.`
- **Primary Keyword:** `body surface area calculator`
- **Secondary Keywords:** `BSA calculator, calculate body surface area, DuBois formula, medical BSA calculator`

---

## Functional Requirements

- [ ] Input: Weight (kg or lbs)
- [ ] Input: Height (cm or inches)
- [ ] Input: Formula method (DuBois, Mosteller, Haycock, Boyd)
- [ ] Output: BSA (m²)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// DuBois Formula
BSA (m²) = 0.007184 * Weight_kg^0.425 * Height_cm^0.725

// Mosteller Formula
BSA (m²) = sqrt( (Weight_kg * Height_cm) / 3600 )
```
