# SPEC: Period Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/PERIOD_CALCULATOR.md`
**Status:** Pending
**Slug:** `period-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Period Calculator — Predict next period dates and cycle history. | ToolForge`
- **Description:** `Predict next period dates and cycle history.`
- **Primary Keyword:** `period calculator`
- **Secondary Keywords:** `period tracker, predict next period, menstrual cycle calculator, ovulation tracker`

---

## Functional Requirements

- [ ] Input: First day of Last Period
- [ ] Input: Average Cycle Length (days)
- [ ] Input: Average Period Duration (days)
- [ ] Output: Next Period Start Date
- [ ] Output: Next 3 cycle predictions
- [ ] Output: Ovulation and fertile windows for the next 3 cycles
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Next_Period_Start = Last_Period_Start + Cycle_Length
```
