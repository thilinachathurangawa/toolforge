# SPEC: Sleep Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/SLEEP_CALCULATOR.md`
**Status:** Pending
**Slug:** `sleep-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Sleep Calculator — Plan sleep schedules based on 90-minute sleep cycles. | ToolForge`
- **Description:** `Plan sleep schedules based on 90-minute sleep cycles.`
- **Primary Keyword:** `sleep calculator`
- **Secondary Keywords:** `sleep cycle planner, best time to wake up, sleep tracker, 90 minute sleep cycle`

---

## Functional Requirements

- [ ] Input: Mode (Calculate wake-up time / Calculate bed time)
- [ ] Input: Target time (Bedtime or Wake-up time)
- [ ] Output: Optimal sleep cycles list (showing times corresponding to 3, 4, 5, or 6 sleep cycles)
- [ ] Output: Estimated time to fall asleep adjustment (default 15 minutes)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Cycle_Duration = 90 minutes
Fall_Asleep_Time = 15 minutes

Wake-up Time for Bedtime T:
Wake-up = T + Fall_Asleep_Time + (N * Cycle_Duration)

Bedtime for Wake-up Time W:
Bedtime = W - Fall_Asleep_Time - (N * Cycle_Duration)
```
