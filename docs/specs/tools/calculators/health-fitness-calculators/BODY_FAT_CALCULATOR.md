# SPEC: Body Fat Calculator Tool
**File:** `docs/specs/tools/calculators/health-fitness-calculators/BODY_FAT_CALCULATOR.md`
**Status:** Pending
**Slug:** `body-fat-calculator`
**Category:** calculator
**Subcategory:** health-fitness-calculators

---

## SEO

- **Title:** `Body Fat Calculator — Calculate body fat percentage using the US Navy Circumference Method. | ToolForge`
- **Description:** `Calculate body fat percentage using the US Navy Circumference Method.`
- **Primary Keyword:** `body fat calculator`
- **Secondary Keywords:** `calculate body fat percentage, US Navy method, body fat formula, waist measurement, body fat tracker`

---

## Functional Requirements

- [ ] Input: Gender (Male / Female)
- [ ] Input: Height (cm or inches)
- [ ] Input: Neck circumference (cm or inches)
- [ ] Input: Waist circumference (cm or inches)
- [ ] Input: Hip circumference (cm or inches) - required for females only
- [ ] Output: Body fat percentage
- [ ] Output: Body fat category (Essential Fat, Athletes, Fitness, Average, Obese)
- [ ] Output: Fat mass (weight)
- [ ] Output: Lean mass (weight)
- [ ] Responsive UI supporting both desktop and mobile layouts
- [ ] Instant real-time updates upon input adjustments
- [ ] Standard presets, reset button, and quick-copy options

---

## Formulas

```typescript
// US Navy Method (using metric measurements - cm)
For Men:
Body Fat % = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76

For Women:
Body Fat % = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
```
