# SPEC: ROI Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/ROI_CALCULATOR.md`
**Status:** Pending
**Slug:** `roi-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `ROI Calculator — Calculate Return on Investment | ToolForge`
- **Description:** `Calculate ROI (Return on Investment) instantly with our free calculator. Simple formula to measure investment profitability and compare returns.`
- **Primary Keyword:** ROI calculator
- **Secondary Keywords:** return on investment calculator, investment profitability, ROI formula, investment return calculator

---

## Functional Requirements

- [ ] Initial investment amount input
- [ ] Final value/return amount input
- [ ] Investment period input (optional)
- [ ] Real-time ROI calculation
- [ ] Display ROI as percentage
- [ ] Display absolute profit/loss
- [ ] Support for multiple ROI calculations
- [ ] Investment comparison feature
- [ ] Annualized ROI calculation (if period provided)
- [ ] Break-even point calculation
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in ROI formula)

---

## Library

No external library needed — use built-in ROI formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  ROI Calculator                         │
├─────────────────────────────────────────┤
│  Initial Investment: [$1,000     ]     │
│  Final Value: [$1,500       ]          │
│  Investment Period: [6] months [▼]    │
│                                         │
│  [Calculate ROI]                        │
├─────────────────────────────────────────┤
│  Results:                               │
│  ROI: 50.00%                           │
│  Profit: $500.00                       │
│  Annualized ROI: 100.00%               │
│                                         │
│  Investment Summary:                    │
│  • Initial: $1,000.00                  │
│  • Final: $1,500.00                    │
│  • Return: +$500.00                    │
│                                         │
│  [Add to Comparison]                    │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  initialInvestment: number;
  finalValue: number;
  investmentPeriod: number;
  periodUnit: 'days' | 'months' | 'years';
  roi: number; // percentage
  profit: number;
  annualizedRoi: number;
  showComparison: boolean;
  investments: Array<{name: string, initial: number, final: number, roi: number}>;
}
```

---

## Formulas

```typescript
// ROI Formula: ROI = [(Final Value - Initial Investment) / Initial Investment] × 100
// Where: ROI = Return on Investment as percentage

function calculateROI(initialInvestment: number, finalValue: number): {roi: number, profit: number} {
  if (initialInvestment === 0) {
    return { roi: 0, profit: finalValue - initialInvestment };
  }
  
  const profit = finalValue - initialInvestment;
  const roi = (profit / initialInvestment) * 100;
  
  return { roi, profit };
}

// Annualized ROI (CAGR - Compound Annual Growth Rate)
// Annualized ROI = [(Final / Initial)^(1/t) - 1] × 100
// Where: t = time period in years

function calculateAnnualizedROI(
  initialInvestment: number, 
  finalValue: number, 
  period: number, 
  periodUnit: string
): number {
  
  let years: number;
  switch(periodUnit) {
    case 'days':
      years = period / 365;
      break;
    case 'months':
      years = period / 12;
      break;
    case 'years':
      years = period;
      break;
    default:
      years = period;
  }
  
  if (years === 0 || initialInvestment === 0) {
    return 0;
  }
  
  const annualizedROI = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;
  return annualizedROI;
}

// Break-Even Point (when investment returns to initial value)
function calculateBreakEven(
  initialInvestment: number,
  monthlyReturn: number,
  annualReturn: number
): {months: number, years: number} {
  
  if (annualReturn <= 0) {
    return { months: Infinity, years: Infinity };
  }
  
  const monthlyRate = annualReturn / 100 / 12;
  const monthlyGain = initialInvestment * monthlyRate;
  const additionalMonthly = monthlyReturn;
  
  const totalMonthlyGain = monthlyGain + additionalMonthly;
  
  if (totalMonthlyGain <= 0) {
    return { months: Infinity, years: Infinity };
  }
  
  const monthsToBreakEven = initialInvestment / totalMonthlyGain;
  
  return {
    months: monthsToBreakEven,
    years: monthsToBreakEven / 12
  };
}

// Investment Comparison
function compareInvestments(investments: Array<{initial: number, final: number}>) {
  return investments.map(inv => {
    const result = calculateROI(inv.initial, inv.final);
    return {
      ...inv,
      roi: result.roi,
      profit: result.profit,
      efficiency: result.roi / inv.initial // ROI per dollar invested
    };
  }).sort((a, b) => b.roi - a.roi);
}
```

---

## How to Use Content (for SEO section)

1. Enter your initial investment amount
2. Input the final value or current value of your investment
3. Optionally specify the investment period (days, months, or years)
4. Click calculate to see your ROI percentage and absolute profit/loss
5. View the annualized ROI if you provided a time period
6. Add investments to the comparison table to compare multiple investments
7. Copy the results for your records or analysis

---

## About Content (for SEO section)

Our free ROI (Return on Investment) calculator helps you quickly measure the profitability of any investment. Simply enter your initial investment and final value to instantly calculate the ROI percentage and absolute profit or loss. The calculator also provides annualized ROI when you specify the investment period, allowing for accurate comparison of investments with different time horizons. Use the comparison feature to evaluate multiple investments side by side and identify the most profitable options. Perfect for analyzing stock returns, real estate investments, business ventures, marketing campaigns, or any investment where you need to measure return on investment. All calculations happen in your browser with complete privacy.