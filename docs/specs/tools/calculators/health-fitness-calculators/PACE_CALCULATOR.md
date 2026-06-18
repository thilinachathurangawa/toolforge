# SPEC: Pace Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/PACE_CALCULATOR.md`
**Status:** Pending
**Slug:** `pace-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Pace Calculator — Calculate running/walking pace, time, or distance. | ToolForge`
- **Description:** `Calculate running/walking pace, time, or distance.`
- **Primary Keyword:** `pace calculator`
- **Secondary Keywords:** `running pace calculator, calculate split times, running speed, marathon pace planner`

---

## Functional Requirements

- [ ] Input: Mode selector (Calculate Pace, Calculate Time, Calculate Distance)
- [ ] Input: Distance (km, miles, or preset event like 5K, 10K, Half Marathon, Marathon)
- [ ] Input: Time (hours, minutes, seconds)
- [ ] Output: Calculated metric (Pace, Time, or Distance)
- [ ] Output: Split times table (per km / per mile)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
Pace = Time / Distance
Time = Pace * Distance
Distance = Time / Pace
```
