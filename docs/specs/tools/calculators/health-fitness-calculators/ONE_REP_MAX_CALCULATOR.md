# SPEC: One Rep Max Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/ONE_REP_MAX_CALCULATOR.md`
**Status:** Pending
**Slug:** `one-rep-max-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `One Rep Max Calculator — Estimate one-rep max (1RM) using Epley and Brzycki formulas. | ToolForge`
- **Description:** `Estimate one-rep max (1RM) using Epley and Brzycki formulas.`
- **Primary Keyword:** `one rep max calculator`
- **Secondary Keywords:** `1RM calculator, estimate one rep max, Epley formula, Brzycki formula, weightlifting calculator`

---

## Functional Requirements

- [ ] Input: Weight lifted
- [ ] Input: Reps performed (1 to 10 recommended)
- [ ] Output: Estimated One Rep Max (1RM)
- [ ] Output: Percentages of 1RM table (50% to 95% for training zone calculations)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// Epley Formula
1RM = Weight * (1 + Reps / 30)

// Brzycki Formula
1RM = Weight / (1.0278 - 0.0278 * Reps)
```
