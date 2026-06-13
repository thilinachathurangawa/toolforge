# SPEC: Present Value Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/PRESENT_VALUE_CALCULATOR.md`
**Status:** Pending
**Slug:** `present-value-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Present Value Calculator — Calculate PV = FV/(1+r)^n | ToolForge`
- **Description:** `Calculate present value of future money with our free PV calculator. Discount future cash flows to today's dollars using PV = FV/(1+r)^n formula.`
- **Primary Keyword:** present value calculator
- **Secondary Keywords:** PV calculator, discount rate calculator, time value of money calculator, net present value calculator

---

## Functional Requirements

- [ ] Future value input
- [ ] Discount rate (interest rate) input
- [ ] Time period input (years)
- [ ] Real-time present value calculation
- [ ] Display discount amount
- [ ] Support for multiple time periods
- [ ] Present value of annuity calculation
- [ ] Present value of perpetuity calculation
- [ ] NPV (Net Present Value) for multiple cash flows
- [ ] Comparison of different discount rates
- [ ] Present value timeline visualization
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in PV formulas)

---

## Library

No external library needed — use built-in present value formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Present Value Calculator              │
├─────────────────────────────────────────┤
│  Future Value: [$10,000      ]         │
│  Discount Rate: [%5          ]          │
│  Time Period: [5] years                 │
│                                         │
│  [Calculate Present Value]              │
├─────────────────────────────────────────┤
│  Results:                               │
│  Future Value: $10,000.00              │
│  Present Value: $7,835.26              │
│  Discount Amount: $2,164.74             │
│                                         │
│  Formula: PV = FV / (1 + r)^n          │
│  PV = 10000 / (1.05)^5 = $7,835.26    │
│                                         │
│  [Calculate PV of Annuity]             │
│  [Calculate NPV]                        │
│  [Compare Discount Rates]               │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  futureValue: number;
  discountRate: number;
  timePeriod: number;
  presentValue: number;
  discountAmount: number;
  calculationMode: 'single' | 'annuity' | 'perpetuity' | 'npv';
  annuityPayment: number;
  annuityPeriods: number;
  cashFlows: Array<{period: number, amount: number}>;
  npv: number;
  showComparison: boolean;
}
```

---

## Formulas

```typescript
// Present Value Formula: PV = FV / (1 + r)^n
// Where: PV = Present Value, FV = Future Value, r = Discount Rate, n = Time Periods

function calculatePresentValue(
  futureValue: number,
  discountRate: number,
  timePeriod: number
): {
  presentValue: number;
  discountAmount: number;
  formula: string;
} {
  
  const rate = discountRate / 100;
  const presentValue = futureValue / Math.pow(1 + rate, timePeriod);
  const discountAmount = futureValue - presentValue;
  const formula = `PV = ${futureValue} / (1 + ${rate})^${timePeriod} = ${presentValue.toFixed(2)}`;
  
  return {
    presentValue,
    discountAmount,
    formula
  };
}

// Present Value of Annuity: PV = PMT × [(1 - (1 + r)^-n) / r]
// Where: PMT = Payment per period, r = Discount Rate, n = Number of periods

function calculatePresentValueOfAnnuity(
  payment: number,
  discountRate: number,
  periods: number
): {
  presentValue: number;
  totalPayments: number;
  discountAmount: number;
  formula: string;
} {
  
  const rate = discountRate / 100;
  
  if (rate === 0) {
    const presentValue = payment * periods;
    return {
      presentValue,
      totalPayments: payment * periods,
      discountAmount: 0,
      formula: `PV = ${payment} × ${periods} = ${presentValue.toFixed(2)}`
    };
  }
  
  const presentValue = payment * ((1 - Math.pow(1 + rate, -periods)) / rate);
  const totalPayments = payment * periods;
  const discountAmount = totalPayments - presentValue;
  const formula = `PV = ${payment} × [(1 - (1 + ${rate})^-${periods}) / ${rate}] = ${presentValue.toFixed(2)}`;
  
  return {
    presentValue,
    totalPayments,
    discountAmount,
    formula
  };
}

// Present Value of Perpetuity: PV = PMT / r
// Where: PMT = Payment per period, r = Discount Rate

function calculatePresentValueOfPerpetuity(
  payment: number,
  discountRate: number
): {
  presentValue: number;
  formula: string;
} {
  
  const rate = discountRate / 100;
  
  if (rate === 0) {
    return {
      presentValue: Infinity,
      formula: 'PV = Infinity when discount rate is 0%'
    };
  }
  
  const presentValue = payment / rate;
  const formula = `PV = ${payment} / ${rate} = ${presentValue.toFixed(2)}`;
  
  return {
    presentValue,
    formula
  };
}

// Net Present Value (NPV) for Multiple Cash Flows
// NPV = Σ [CFt / (1 + r)^t] - Initial Investment

function calculateNPV(
  cashFlows: Array<{period: number, amount: number}>,
  discountRate: number,
  initialInvestment: number = 0
): {
  npv: number;
  presentValueOfCashFlows: number;
  cashFlowBreakdown: Array<{
    period: number;
    amount: number;
    presentValue: number;
  }>;
  profitable: boolean;
} {
  
  const rate = discountRate / 100;
  let presentValueOfCashFlows = 0;
  const cashFlowBreakdown = [];
  
  cashFlows.forEach(cashFlow => {
    const presentValue = cashFlow.amount / Math.pow(1 + rate, cashFlow.period);
    presentValueOfCashFlows += presentValue;
    
    cashFlowBreakdown.push({
      period: cashFlow.period,
      amount: cashFlow.amount,
      presentValue
    });
  });
  
  const npv = presentValueOfCashFlows - initialInvestment;
  const profitable = npv > 0;
  
  return {
    npv,
    presentValueOfCashFlows,
    cashFlowBreakdown,
    profitable
  };
}

// Compare Different Discount Rates
function compareDiscountRates(
  futureValue: number,
  timePeriod: number,
  rates: number[]
): Array<{
  rate: number;
  presentValue: number;
  discountAmount: number;
}> {
  
  return rates.map(rate => {
    const result = calculatePresentValue(futureValue, rate, timePeriod);
    return {
      rate,
      presentValue: result.presentValue,
      discountAmount: result.discountAmount
    };
  }).sort((a, b) => a.rate - b.rate);
}

// Present Value Timeline
function generatePresentValueTimeline(
  futureValue: number,
  discountRate: number,
  timePeriod: number
): Array<{
  year: number;
  futureValue: number;
  presentValue: number;
  cumulativeDiscount: number;
}> {
  
  const timeline = [];
  
  for (let year = 1; year <= timePeriod; year++) {
    const result = calculatePresentValue(futureValue, discountRate, year);
    timeline.push({
      year,
      futureValue,
      presentValue: result.presentValue,
      cumulativeDiscount: result.discountAmount
    });
  }
  
  return timeline;
}

// Reverse Calculation: Find Future Value from Present Value
// FV = PV × (1 + r)^n

function calculateFutureValueFromPresent(
  presentValue: number,
  discountRate: number,
  timePeriod: number
): {
  futureValue: number;
  growthAmount: number;
  formula: string;
} {
  
  const rate = discountRate / 100;
  const futureValue = presentValue * Math.pow(1 + rate, timePeriod);
  const growthAmount = futureValue - presentValue;
  const formula = `FV = ${presentValue} × (1 + ${rate})^${timePeriod} = ${futureValue.toFixed(2)}`;
  
  return {
    futureValue,
    growthAmount,
    formula
  };
}

// Calculate Required Discount Rate for Target Present Value
function calculateRequiredDiscountRate(
  futureValue: number,
  targetPresentValue: number,
  timePeriod: number
): {
  requiredRate: number;
  formula: string;
} {
  
  // Rearranging PV = FV / (1 + r)^n to solve for r:
  // (1 + r)^n = FV / PV
  // 1 + r = (FV / PV)^(1/n)
  // r = (FV / PV)^(1/n) - 1
  
  const ratio = futureValue / targetPresentValue;
  const rate = Math.pow(ratio, 1 / timePeriod) - 1;
  const requiredRate = rate * 100;
  
  return {
    requiredRate,
    formula: `r = (${futureValue} / ${targetPresentValue})^(1/${timePeriod}) - 1 = ${(requiredRate).toFixed(2)}%`
  };
}

// Present Value of Growing Annuity
// PV = PMT × [(1 - ((1 + g) / (1 + r))^n) / (r - g)]
// Where: g = Growth rate, r = Discount rate

function calculatePresentValueOfGrowingAnnuity(
  initialPayment: number,
  discountRate: number,
  growthRate: number,
  periods: number
): {
  presentValue: number;
  totalPayments: number;
  formula: string;
} {
  
  const rate = discountRate / 100;
  const growth = growthRate / 100;
  
  if (rate === growth) {
    // Special case when discount rate equals growth rate
    const presentValue = initialPayment * periods / (1 + rate);
    return {
      presentValue,
      totalPayments: initialPayment * periods,
      formula: `PV = ${initialPayment} × ${periods} / (1 + ${rate}) = ${presentValue.toFixed(2)}`
    };
  }
  
  const presentValue = initialPayment * 
    ((1 - Math.pow((1 + growth) / (1 + rate), periods)) / (rate - growth));
  
  // Calculate total payments with growth
  let totalPayments = 0;
  for (let i = 0; i < periods; i++) {
    totalPayments += initialPayment * Math.pow(1 + growth, i);
  }
  
  const formula = `PV = ${initialPayment} × [(1 - ((1 + ${growth}) / (1 + ${rate}))^${periods}) / (${rate} - ${growth})] = ${presentValue.toFixed(2)}`;
  
  return {
    presentValue,
    totalPayments,
    formula
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter the future value amount you expect to receive
2. Input the discount rate (required rate of return)
3. Set the time period in years
4. Click calculate to see the present value today
5. Review the discount amount (loss of value over time)
6. Calculate PV of annuities for regular payments
7. Use NPV calculation for multiple cash flows
8. Compare different discount rates to see their impact

---

## About Content (for SEO section)

Our free present value calculator helps you determine the current worth of future money using the fundamental finance formula PV = FV/(1+r)^n. Calculate how much a future sum of money is worth in today's dollars, accounting for the time value of money and discount rates. Perfect for investment analysis, retirement planning, business valuation, and understanding the impact of inflation and opportunity costs. The calculator supports single cash flows, annuities, perpetuities, and complex net present value (NPV) calculations for multiple cash flows. Compare different discount rates to see how required returns affect present value. Whether you're evaluating investment opportunities, planning retirement income, or making business decisions, this calculator provides essential time value of money insights. All calculations happen in your browser with complete privacy.