# SPEC: Investment Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/INVESTMENT_CALCULATOR.md`
**Status:** Pending
**Slug:** `investment-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Investment Calculator — ROI & Growth Projections | ToolForge`
- **Description:** `Calculate investment returns, ROI, and growth projections with our free investment calculator. Plan your portfolio growth with compound interest analysis.`
- **Primary Keyword:** investment calculator
- **Secondary Keywords:** ROI calculator, investment growth calculator, portfolio return calculator, compound interest investment

---

## Functional Requirements

- [ ] Initial investment amount input
- [ ] Regular contribution amount input (monthly/yearly)
- [ ] Expected annual return rate input
- [ ] Investment time period input (years)
- [ ] Real-time ROI calculation
- [ ] Final value projection
- [ ] Total profit/loss calculation
- [ ] Year-by-year growth projection table
- [ ] Investment growth chart
- [ ] Comparison with benchmark (S&P 500, etc.)
- [ ] Risk-adjusted return analysis
- [ ] Export results to CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in investment formulas)

---

## Library

No external library needed — use built-in investment calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Investment Calculator                  │
├─────────────────────────────────────────┤
│  Initial Investment: [$10,000     ]   │
│  Monthly Contribution: [$500       ]   │
│  Expected Return: [%8          ]        │
│  Investment Period: [10] years          │
│                                         │
│  [Calculate Returns]                    │
├─────────────────────────────────────────┤
│  Results:                               │
│  Final Value: $95,423.45               │
│  Total Invested: $70,000.00           │
│  Total Profit: $25,423.45             │
│  ROI: 36.32%                           │
│  Annualized Return: 3.14%              │
│                                         │
│  [Year-by-Year Projection]              │
│  [Growth Chart]                         │
│  [Benchmark Comparison]                 │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  initialInvestment: number;
  monthlyContribution: number;
  expectedReturn: number; // annual percentage
  investmentPeriod: number; // years
  finalValue: number;
  totalInvested: number;
  totalProfit: number;
  roi: number; // return on investment percentage
  annualizedReturn: number; // CAGR
  benchmark: 'sp500' | 'bonds' | 'custom' | 'none';
  benchmarkReturn: number;
  showProjection: boolean;
  showChart: boolean;
  yearlyData: Array<{year: number, value: number, invested: number, profit: number}>;
}
```

---

## Formulas

```typescript
// Investment Growth with Regular Contributions
// FV = P(1 + r)^t + PMT × [(1 + r)^t - 1] / r
// Where: P = Initial Investment, PMT = Monthly Contribution, r = Annual Return, t = Time in Years

function calculateInvestmentGrowth(
  initialInvestment: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number
): {
  finalValue: number;
  totalInvested: number;
  totalProfit: number;
  roi: number;
  annualizedReturn: number;
} {
  
  const rate = annualReturn / 100;
  const monthlyRate = rate / 12;
  const totalMonths = years * 12;
  
  // Future value of initial investment
  const initialFV = initialInvestment * Math.pow(1 + rate, years);
  
  // Future value of monthly contributions
  if (monthlyRate === 0) {
    var contributionFV = monthlyContribution * totalMonths;
  } else {
    var contributionFV = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  }
  
  const finalValue = initialFV + contributionFV;
  const totalInvested = initialInvestment + (monthlyContribution * totalMonths);
  const totalProfit = finalValue - totalInvested;
  const roi = (totalProfit / totalInvested) * 100;
  
  // Compound Annual Growth Rate (CAGR)
  const annualizedReturn = (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100;
  
  return { finalValue, totalInvested, totalProfit, roi, annualizedReturn };
}

// Generate Year-by-Year Projection
function generateInvestmentProjection(
  initialInvestment: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number
) {
  const data = [];
  
  for (let year = 1; year <= years; year++) {
    const result = calculateInvestmentGrowth(initialInvestment, monthlyContribution, annualReturn, year);
    data.push({
      year: year,
      value: result.finalValue,
      invested: result.totalInvested,
      profit: result.totalProfit
    });
  }
  
  return data;
}

// Benchmark Comparison
function compareWithBenchmark(
  investmentResult: any,
  benchmarkReturn: number,
  years: number
) {
  const benchmarkGrowth = calculateInvestmentGrowth(
    investmentResult.totalInvested,
    0,
    benchmarkReturn,
    years
  );
  
  return {
    investmentValue: investmentResult.finalValue,
    benchmarkValue: benchmarkGrowth.finalValue,
    difference: investmentResult.finalValue - benchmarkGrowth.finalValue,
    outperformance: ((investmentResult.finalValue - benchmarkGrowth.finalValue) / benchmarkGrowth.finalValue) * 100
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter your initial investment amount
2. Set your regular monthly contribution amount
3. Input your expected annual return rate
4. Specify the investment time period in years
5. Click calculate to see your investment projections
6. Review ROI, annualized returns, and profit projections
7. View year-by-year growth projections and charts
8. Compare your expected returns with market benchmarks

---

## About Content (for SEO section)

Our free investment calculator helps you project and analyze your investment returns with compound interest. Calculate your ROI, final value, and profit projections based on your initial investment, regular contributions, and expected returns. The calculator provides detailed year-by-year projections, growth charts, and benchmark comparisons to help you make informed investment decisions. Understand the power of compound interest and regular contributions in building wealth over time. Compare your expected returns with market benchmarks like the S&P 500 to gauge potential performance. Perfect for retirement planning, portfolio projection, and investment strategy analysis. All calculations happen in your browser with complete privacy and no data transmission to external servers.