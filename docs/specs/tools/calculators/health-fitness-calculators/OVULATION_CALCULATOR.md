# SPEC: Ovulation Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/OVULATION_CALCULATOR.md`
**Status:** Pending
**Slug:** `ovulation-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Ovulation Calculator — Estimate fertile window and ovulation dates based on menstrual cycle length. | ToolForge`
- **Description:** `Estimate fertile window and ovulation dates based on menstrual cycle length.`
- **Primary Keyword:** `ovulation calculator`
- **Secondary Keywords:** `calculate ovulation, fertile window calendar, ovulation cycle planner, conceive calculator`

---

## Functional Requirements

- [ ] Input: First day of Last Period
- [ ] Input: Average Cycle Length (days)
- [ ] Output: Estimated Ovulation Date
- [ ] Output: Fertile window range (5 days before ovulation to 1 day after)
- [ ] Output: Due date estimate if conception occurs during cycle
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Ovulation Date = Last_Period_Date + Cycle_Length - 14 days
Fertile Window = [Ovulation_Date - 5 days, Ovulation_Date + 1 day]
```
