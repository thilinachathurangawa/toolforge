# SPEC: Due Date Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/DUE_DATE_CALCULATOR.md`
**Status:** Pending
**Slug:** `due-date-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Due Date Calculator — Estimate pregnancy due date using Naegele's rule (LMP + 280 days). | ToolForge`
- **Description:** `Estimate pregnancy due date using Naegele's rule (LMP + 280 days).`
- **Primary Keyword:** `due date calculator`
- **Secondary Keywords:** `calculate due date, Naegele's rule, pregnancy calculator, baby due date planner`

---

## Functional Requirements

- [ ] Input: First day of Last Menstrual Period (LMP)
- [ ] Input: Average Cycle Length (default: 28 days)
- [ ] Output: Estimated Due Date (EDD)
- [ ] Output: Current gestational age (weeks and days)
- [ ] Output: Trimester status progress indicator
- [ ] Output: Days remaining
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Estimated Due Date (EDD) = LMP + 280 days + (Cycle_Length - 28 days)
```
