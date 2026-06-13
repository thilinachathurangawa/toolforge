# SPEC: Future Value Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/FUTURE_VALUE_CALCULATOR.md`
**Status:** Pending
**Slug:** `future-value-calculator`
**Category:** calculator
**Subcategory`: financial-calculators

---

## SEO

- **Title:** `Future Value Calculator — Calculate FV = PV(1+r)^n | ToolForge`
- **Description:** `Calculate future value of money with our free FV calculator. Project investment growth using FV = PV(1+r)^n formula for financial planning.`
- **Primary Keyword:** future value calculator
- **Secondary Keywords:** FV calculator, investment growth calculator, compound interest calculator, time value of money calculator

---

## Functional Requirements

- [ ] Present value (initial amount) input
- [ ] Interest rate input
- [ ] Time period input (years)
- [ ] Real-time future value calculation
- [ ] Display total interest earned
- [ ] Support for compound frequency (annually, monthly, daily)
- [ ] Future value of annuity calculation
- [ ] Future value of growing annuity calculation
- [ ] Regular contribution support
- [ ] Comparison of different interest rates
- [ ] Future value timeline visualization
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in FV formulas)

---

## Library

No external library needed — use built-in future value formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Future Value Calculator               │
├─────────────────────────────────────────┤
│  Present Value: [$5,000       ]       │
│  Interest Rate: [%7          ]          │
│  Time Period: [10] years                │
│  Compound: [Annually ▼]                 │
│                                         │
│  [Calculate Future Value]               │
├─────────────────────────────────────────┤
│  Results:                               │
│  Present Value: $5,000.00             │
│  Future Value: $9,835.76              │
│  Interest Earned: $4,835.76            │
│                                         │
│  Formula: FV = PV × (1 + r)^n         │
│  FV = 5000 × (1.07)^10 = $9,835.76   │
│                                         │
│  [Calculate FV of Annuity]             │
│  [With Regular Contributions]           │
│  [Compare Interest Rates]               │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  presentValue: number;
  interestRate: number;
  timePeriod: number;
  compoundFrequency: 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily';
  futureValue: number;
  interestEarned: number;
  calculationMode: 'single' | 'annuity' | 'growingAnnuity';
  annuityPayment: number;
  regularContribution: number;
  contributionFrequency: 'monthly' | 'yearly';
  showComparison: boolean;
}
```

---

## Formulas

```typescript
// Future Value Formula: FV = PV × (1 + r)^n
// Where: FV = Future Value, PV = Present Value, r = Interest Rate, n = Time Periods

function calculateFutureValue(
  presentValue: number,
  interestRate: number,
  timePeriod: number,
  compoundFrequency: 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily' = 'annually'
): {
  futureValue: number;
  interestEarned: number;
  formula: string;
  effectiveAnnualRate: number;
} {
  
  const rate = interestRate / 100;
  
  // Determine number of compounding periods per year
  let periodsPerYear: number;
  switch(compoundFrequency) {
    case 'annually':
      periodsPerYear = 1;
      break;
    case 'semiannually':
      periodsPerYear = 2;
      break;
    case 'quarterly':
      periodsPerYear = 4;
      break;
    case 'monthly':
      periodsPerYear = 12;
      break;
    case 'daily':
      periodsPerYear = 365;
      break;
  }
  
  const totalPeriods = timePeriod * periodsPerYear;
  const periodicRate = rate / periodsPerYear;
  const futureValue = presentValue * Math.pow(1 + periodicRate, totalPeriods);
  const interestEarned = futureValue - presentValue;
  
  // Calculate effective annual rate
  const effectiveAnnualRate = (Math.pow(1 + periodicRate, periodsPerYear) - 1) * 100;
  
  const formula = `FV = ${presentValue} × (1 + ${periodicRate})^${totalPeriods} = ${futureValue.toFixed(2)}`;
  
  return {
    futureValue,
    interestEarned,
    formula,
    effectiveAnnualRate
  };
}

// Future Value of Annuity: FV = PMT × [(1 + r)^n - 1] / r
// Where: PMT = Payment per period, r = Interest Rate, n = Number of periods

function calculateFutureValueOfAnnuity(
  payment: number,
  interestRate: number,
  periods: number,
  paymentFrequency: 'annual' | 'monthly' = 'annual'
): {
  futureValue: number;
  totalContributions: number;
  interestEarned: number;
  formula: string;
} {
  
  const rate = interestRate / 100;
  
  if (paymentFrequency === 'monthly') {
    // Adjust for monthly payments
    const monthlyRate = rate / 12;
    const totalMonths = periods * 12;
    const monthlyPayment = payment;
    
    if (monthlyRate === 0) {
      const futureValue = monthlyPayment * totalMonths;
      return {
        futureValue,
        totalContributions: futureValue,
        interestEarned: 0,
        formula: `FV = ${monthlyPayment} × ${totalMonths} = ${futureValue.toFixed(2)}`
      };
    }
    
    const futureValue = monthlyPayment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    const totalContributions = monthlyPayment * totalMonths;
    const interestEarned = futureValue - totalContributions;
    const formula = `FV = ${monthlyPayment} × [(1 + ${monthlyRate})^${totalMonths} - 1] / ${monthlyRate} = ${futureValue.toFixed(2)}`;
    
    return {
      futureValue,
      totalContributions,
      interestEarned,
      formula
    };
  } else {
    // Annual payments
    if (rate === 0) {
      const futureValue = payment * periods;
      return {
        futureValue,
        totalContributions: futureValue,
        interestEarned: 0,
        formula: `FV = ${payment} × ${periods} = ${futureValue.toFixed(2)}`
      };
    }
    
    const futureValue = payment * ((Math.pow(1 + rate, periods) - 1) / rate);
    const totalContributions = payment * periods;
    const interestEarned = futureValue - totalContributions;
    const formula = `FV = ${payment} × [(1 + ${rate})^${periods} - 1] / ${rate} = ${futureValue.toFixed(2)}`;
    
    return {
      futureValue,
      totalContributions,
      interestEarned,
      formula
    };
  }
}

// Future Value with Regular Contributions
// FV = PV(1 + r)^n + PMT × [(1 + r)^n - 1] / r

function calculateFutureValueWithContributions(
  presentValue: number,
  regularContribution: number,
  interestRate: number,
  timePeriod: number,
  contributionFrequency: 'monthly' | 'yearly' = 'monthly'
): {
  futureValue: number;
  initialGrowth: number;
  contributionGrowth: number;
  totalContributions: number;
  interestEarned: number;
} {
  
  const baseResult = calculateFutureValue(presentValue, interestRate, timePeriod);
  
  let contributionResult;
  if (contributionFrequency === 'monthly') {
    contributionResult = calculateFutureValueOfAnnuity(
      regularContribution,
      interestRate,
      timePeriod,
      'monthly'
    );
  } else {
    contributionResult = calculateFutureValueOfAnnuity(
      regularContribution,
      interestRate,
      timePeriod,
      'annual'
    );
  }
  
  const futureValue = baseResult.futureValue + contributionResult.futureValue;
  const totalContributions = presentValue + contributionResult.totalContributions;
  const interestEarned = futureValue - totalContributions;
  
  return {
    futureValue,
    initialGrowth: baseResult.futureValue,
    contributionGrowth: contributionResult.futureValue,
    totalContributions,
    interestEarned
  };
}

// Future Value of Growing Annuity
// FV = PMT × [(1 + r)^n - (1 + g)^n] / (r - g)
// Where: g = Growth rate of payments, r = Interest rate

function calculateFutureValueOfGrowingAnnuity(
  initialPayment: number,
  interestRate: number,
  growthRate: number,
  periods: number
): {
  futureValue: number;
  totalPayments: number;
  interestEarned: number;
  formula: string;
} {
  
  const rate = interestRate / 100;
  const growth = growthRate / 100;
  
  if (rate === growth) {
    // Special case when interest rate equals growth rate
    const futureValue = initialPayment * periods * Math.pow(1 + rate, periods - 1);
    return {
      futureValue,
      totalPayments: initialPayment * periods,
      interestEarned: futureValue - (initialPayment * periods),
      formula: `FV = ${initialPayment} × ${periods} × (1 + ${rate})^${periods - 1} = ${futureValue.toFixed(2)}`
    };
  }
  
  if (rate === 0) {
    const futureValue = initialPayment * periods;
    return {
      futureValue,
      totalPayments: initialPayment * periods,
      interestEarned: 0,
      formula: `FV = ${initialPayment} × ${periods} = ${futureValue.toFixed(2)}`
    };
  }
  
  const futureValue = initialPayment * 
    ((Math.pow(1 + rate, periods) - Math.pow(1 + growth, periods)) / (rate - growth));
  
  // Calculate total payments with growth
  let totalPayments = 0;
  for (let i = 0; i < periods; i++) {
    totalPayments += initialPayment * Math.pow(1 + growth, i);
  }
  
  const interestEarned = futureValue - totalPayments;
  const formula = `FV = ${initialPayment} × [(1 + ${rate})^${periods} - (1 + ${growth})^${periods}] / (${rate} - ${growth}) = ${futureValue.toFixed(2)}`;
  
  return {
    futureValue,
    totalPayments,
    interestEarned,
    formula
  };
}

// Compare Different Interest Rates
function compareInterestRates(
  presentValue: number,
  timePeriod: number,
  rates: number[]
): Array<{
  rate: number;
  futureValue: number;
  interestEarned: number;
  effectiveAnnualRate: number;
}> {
  
  return rates.map(rate => {
    const result = calculateFutureValue(presentValue, rate, timePeriod);
    return {
      rate,
      futureValue: result.futureValue,
      interestEarned: result.interestEarned,
      effectiveAnnualRate: result.effectiveAnnualRate
    };
  }).sort((a, b) => a.rate - b.rate);
}

// Future Value Timeline
function generateFutureValueTimeline(
  presentValue: number,
  interestRate: number,
  timePeriod: number,
  compoundFrequency: 'annually' | 'monthly' = 'annually'
): Array<{
  year: number;
  presentValue: number;
  futureValue: number;
  interestEarned: number;
  cumulativeInterest: number;
}> {
  
  const timeline = [];
  let currentValue = presentValue;
  let cumulativeInterest = 0;
  
  for (let year = 1; year <= timePeriod; year++) {
    const result = calculateFutureValue(presentValue, interestRate, year, compoundFrequency);
    const yearInterestEarned = result.futureValue - currentValue;
    cumulativeInterest += yearInterestEarned;
    
    timeline.push({
      year,
      presentValue,
      futureValue: result.futureValue,
      interestEarned: yearInterestEarned,
      cumulativeInterest
    });
    
    currentValue = result.futureValue;
  }
  
  return timeline;
}

// Reverse Calculation: Find Required Present Value for Target Future Value
// PV = FV / (1 + r)^n

function calculateRequiredPresentValue(
  targetFutureValue: number,
  interestRate: number,
  timePeriod: number
): {
  requiredPresentValue: number;
  formula: string;
} {
  
  const rate = interestRate / 100;
  const requiredPresentValue = targetFutureValue / Math.pow(1 + rate, timePeriod);
  const formula = `PV = ${targetFutureValue} / (1 + ${rate})^${timePeriod} = ${requiredPresentValue.toFixed(2)}`;
  
  return {
    requiredPresentValue,
    formula
  };
}

// Calculate Required Interest Rate for Target Future Value
function calculateRequiredInterestRate(
  presentValue: number,
  targetFutureValue: number,
  timePeriod: number
): {
  requiredRate: number;
  formula: string;
} {
  
  // Rearranging FV = PV × (1 + r)^n to solve for r:
  // (1 + r)^n = FV / PV
  // 1 + r = (FV / PV)^(1/n)
  // r = (FV / PV)^(1/n) - 1
  
  const ratio = targetFutureValue / presentValue;
  const rate = Math.pow(ratio, 1 / timePeriod) - 1;
  const requiredRate = rate * 100;
  
  return {
    requiredRate,
    formula: `r = (${targetFutureValue} / ${presentValue})^(1/${timePeriod}) - 1 = ${(requiredRate).toFixed(2)}%`
  };
}

// Rule of 72: Estimate years to double
function calculateDoublingTime(interestRate: number): {
  yearsToDouble: number;
  formula: string;
} {
  
  const yearsToDouble = 72 / interestRate;
  const formula = `Years to double ≈ 72 / ${interestRate} = ${yearsToDouble.toFixed(1)} years`;
  
  return {
    yearsToDouble,
    formula
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter the present value (initial amount you have today)
2. Input the expected interest rate or rate of return
3. Set the time period in years
4. Choose compound frequency (annually, monthly, etc.)
5. Click calculate to see the future value
6. Review the interest earned and effective annual rate
7. Calculate FV of annuities for regular investments
8. Add regular contributions to see compounded growth

---

## About Content (for SEO section)

Our free future value calculator helps you project how much your money will grow over time using the fundamental finance formula FV = PV(1+r)^n. Calculate the future value of investments, savings, and any lump sum amounts with compound interest. Perfect for retirement planning, investment analysis, savings goals, and understanding the power of compound growth. The calculator supports different compounding frequencies (daily, monthly, quarterly, annually) to show how compounding frequency affects your returns. Calculate future value of annuities for regular investment contributions and see how consistent payments grow over time. Compare different interest rates to see the dramatic impact of small rate differences. Use the timeline feature to track year-by-year growth. Whether you're planning for retirement, saving for a major purchase, or evaluating investment opportunities, this calculator provides essential future value projections. All calculations happen in your browser with complete privacy.