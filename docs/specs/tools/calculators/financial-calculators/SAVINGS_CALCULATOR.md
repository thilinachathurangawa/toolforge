# SPEC: Savings Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/SAVINGS_CALCULATOR.md`
**Status:** Pending
**Slug:** `savings-calculator`
**Category:** calculator
**Subcategory:** financial-calculators

---

## SEO

- **Title:** `Savings Calculator — Future Value with Regular Deposits | ToolForge`
- **Description:** `Calculate your savings growth with regular deposits. See how much you'll save over time with our free savings calculator featuring compound interest.`
- **Primary Keyword:** savings calculator
- **Secondary Keywords:** savings growth calculator, future value calculator, regular deposit savings, compound interest savings

---

## Functional Requirements

- [ ] Initial savings amount input
- [ ] Monthly deposit amount input
- [ ] Annual interest rate input
- [ ] Time period input (years)
- [ ] Compound frequency selector (daily, monthly, quarterly, annually)
- [ ] Real-time calculation of future value
- [ ] Display total contributions
- [ ] Display total interest earned
- [ ] Year-by-year growth breakdown table
- [ ] Growth chart visualization
- [ ] Goal setting (target amount with reverse calculation)
- [ ] Export results to CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in FV formulas)

---

## Library

No external library needed — use built-in future value formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Savings Calculator                     │
├─────────────────────────────────────────┤
│  Initial Amount: [$1,000       ]       │
│  Monthly Deposit: [$200        ]       │
│  Interest Rate: [%5          ]          │
│  Years: [10]                            │
│  Compound: [Monthly ▼]                 │
│                                         │
│  [Calculate Growth]                     │
├─────────────────────────────────────────┤
│  Results:                               │
│  Future Value: $32,577.89              │
│  Total Contributions: $25,000.00       │
│  Total Interest: $7,577.89             │
│                                         │
│  [Year-by-Year Breakdown]               │
│  [Growth Chart]                         │
│  [Set Savings Goal]                     │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  initialAmount: number;
  monthlyDeposit: number;
  interestRate: number; // annual rate
  years: number;
  compoundingFrequency: 'daily' | 'monthly' | 'quarterly' | 'annually';
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  showBreakdown: boolean;
  showChart: boolean;
  goalMode: boolean;
  targetAmount: number;
  yearlyData: Array<{year: number, balance: number, contributions: number, interest: number}>;
}
```

---

## Formulas

```typescript
// Future Value with Regular Deposits
// FV = P(1 + r/n)^(nt) + PMT × [(1 + r/n)^(nt) - 1] / (r/n)
// Where: P = Initial Amount, PMT = Monthly Deposit, r = Annual Rate, 
//        n = Compounding Frequency, t = Time in Years

function calculateFutureValueWithDeposits(
  initialAmount: number, 
  monthlyDeposit: number, 
  annualRate: number, 
  years: number, 
  compounding: string
): {futureValue: number, totalContributions: number, totalInterest: number} {
  
  const rate = annualRate / 100;
  let n: number;
  switch(compounding) {
    case 'daily': n = 365; break;
    case 'monthly': n = 12; break;
    case 'quarterly': n = 4; break;
    case 'annually': n = 1; break;
    default: n = 12;
  }
  
  const totalPeriods = n * years;
  const periodicRate = rate / n;
  
  // Future value of initial amount
  const initialFV = initialAmount * Math.pow(1 + periodicRate, totalPeriods);
  
  // Future value of regular deposits (convert monthly to same frequency)
  const depositsPerPeriod = monthlyDeposit * (12 / n);
  const depositFV = depositsPerPeriod * ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate);
  
  const futureValue = initialFV + depositFV;
  const totalContributions = initialAmount + (monthlyDeposit * 12 * years);
  const totalInterest = futureValue - totalContributions;
  
  return { futureValue, totalContributions, totalInterest };
}

// Reverse Calculation: Time needed to reach goal
function calculateTimeToGoal(
  initialAmount: number,
  monthlyDeposit: number,
  annualRate: number,
  targetAmount: number,
  compounding: string
): number {
  
  const rate = annualRate / 100;
  let n: number;
  switch(compounding) {
    case 'daily': n = 365; break;
    case 'monthly': n = 12; break;
    case 'quarterly': n = 4; break;
    case 'annually': n = 1; break;
    default: n = 12;
  }
  
  const periodicRate = rate / n;
  const depositsPerPeriod = monthlyDeposit * (12 / n);
  
  // Iterative approximation for time
  let periods = 0;
  let currentFV = initialAmount;
  
  while (currentFV < targetAmount && periods < 1000) {
    currentFV = (currentFV + depositsPerPeriod) * (1 + periodicRate);
    periods++;
  }
  
  return periods / n; // Convert back to years
}

// Generate Year-by-Year Data
function generateYearlyData(
  initialAmount: number,
  monthlyDeposit: number,
  annualRate: number,
  years: number,
  compounding: string
) {
  const data = [];
  
  for (let year = 1; year <= years; year++) {
    const result = calculateFutureValueWithDeposits(initialAmount, monthlyDeposit, annualRate, year, compounding);
    data.push({
      year: year,
      balance: result.futureValue,
      contributions: result.totalContributions,
      interest: result.totalInterest
    });
  }
  
  return data;
}
```

---

## How to Use Content (for SEO section)

1. Enter your initial savings amount (starting balance)
2. Set your monthly deposit amount (regular contributions)
3. Input the annual interest rate you expect to earn
4. Specify the time period in years
5. Choose the compounding frequency
6. Click calculate to see your future savings value
7. View the year-by-year breakdown and growth chart
8. Use the goal setting feature to calculate time needed to reach a target

---

## About Content (for SEO section)

Our free savings calculator helps you plan and track your savings growth over time. Calculate how much your savings will grow with regular deposits and compound interest. Enter your initial balance, monthly contributions, interest rate, and time period to instantly see your future savings value. The calculator shows the breakdown between your total contributions and interest earned, helping you understand the power of compound interest. The year-by-year breakdown and growth visualization help you track progress toward your financial goals. Use the goal setting feature to calculate how long it will take to reach a specific savings target. Perfect for planning retirement savings, emergency funds, education funds, or any other savings goals. All calculations happen in your browser with complete privacy.