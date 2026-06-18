# SPEC: Target Heart Rate Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/TARGET_HEART_RATE_CALCULATOR.md`
**Status:** Pending
**Slug:** `target-heart-rate-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Target Heart Rate Calculator — Calculate target and maximum heart rates for exercise using the 220 - age formula and Karvonen method. | ToolForge`
- **Description:** `Calculate target and maximum heart rates for exercise using the 220 - age formula and Karvonen method.`
- **Primary Keyword:** `target heart rate calculator`
- **Secondary Keywords:** `calculate target heart rate, maximum heart rate formula, Karvonen method, heart rate zones, aerobic zone`

---

## Functional Requirements

- [ ] Input: Age (years)
- [ ] Input: Resting Heart Rate (bpm) - optional for Karvonen method
- [ ] Input: Method (220 - age or Karvonen)
- [ ] Output: Maximum Heart Rate (MHR)
- [ ] Output: Zone 1 (Warm up): 50-60%
- [ ] Output: Zone 2 (Fat burn): 60-70%
- [ ] Output: Zone 3 (Aerobic): 70-80%
- [ ] Output: Zone 4 (Anaerobic): 80-90%
- [ ] Output: Zone 5 (Red line): 90-100%
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
MaxHR = 220 - Age

// Basic Zone Calculation
Target HR = MaxHR * Intensity%

// Karvonen Method
HR Reserve = MaxHR - RestingHR
Target HR = (HR Reserve * Intensity%) + RestingHR
```
