# SPEC: Compound Interest Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/COMPOUND_INTEREST_CALCULATOR.md`
**Status:** Pending
**Slug:** `compound-interest-calculator`
**Category:** calculator
**Subcategory:** financial-calculators

---

## SEO

- **Title:** `Compound Interest Calculator — Calculate Growth with A = P(1+r/n)^nt | ToolForge`
- **Description:** `Calculate compound interest on investments and savings with our free calculator. See how your money grows over time with different compounding frequencies.`
- **Primary Keyword:** compound interest calculator
- **Secondary Keywords:** investment growth calculator, savings compound interest, compound interest formula, investment calculator

---

## Functional Requirements

- [ ] Principal amount input (initial investment)
- [ ] Annual interest rate input
- [ ] Time period input (years)
- [ ] Compounding frequency selector (daily, monthly, quarterly, annually)
- [ ] Real-time calculation of final amount
- [ ] Display total interest earned
- [ ] Show year-by-year growth table
- [ ] Comparison chart (simple vs compound interest)
- [ ] Support for regular additional deposits
- [ ] Export results to CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in compound interest formula)

---

## Library

No external library needed — use built-in compound interest formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Compound Interest Calculator           │
├─────────────────────────────────────────┤
│  Principal: [$10,000        ]            │
│  Interest Rate: [%5          ]           │
│  Time Period: [10] years                 │
│  Compound: [Annually ▼]                 │
│  Additional Deposit: [$0/month  ]        │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Final Amount: $16,288.95               │
│  Total Interest: $6,288.95             │
│  Total Deposits: $10,000.00             │
│                                         │
│  [Year-by-Year Growth Table]            │
│  [Comparison Chart]                     │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  principal: number;
  interestRate: number; // annual rate
  timePeriod: number; // in years
  compoundingFrequency: 'daily' | 'monthly' | 'quarterly' | 'annually';
  additionalDeposit: number; // monthly additional deposit
  finalAmount: number;
  totalInterest: number;
  totalDeposits: number;
  showGrowthTable: boolean;
  showChart: boolean;
  yearlyData: Array<{year: number, amount: number, interest: number}>;
}
```

---

## Formulas

```typescript
// Compound Interest Formula: A = P(1 + r/n)^(nt)
// Where: A = Final Amount, P = Principal, r = Annual Interest Rate, 
//        n = Compounding Frequency, t = Time in Years

function calculateCompoundInterest(principal: number, annualRate: number, years: number, compounding: string): {amount: number, interest: number} {
  const rate = annualRate / 100;
  
  let n: number;
  switch(compounding) {
    case 'daily': n = 365; break;
    case 'monthly': n = 12; break;
    case 'quarterly': n = 4; break;
    case 'annually': n = 1; break;
    default: n = 1;
  }
  
  const amount = principal * Math.pow((1 + rate/n), n * years);
  const interest = amount - principal;
  
  return { amount, interest };
}

// With Regular Monthly Deposits (Future Value of Annuity)
function calculateWithDeposits(principal: number, annualRate: number, years: number, monthlyDeposit: number) {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;
  
  // Future value of initial principal
  const principalFV = principal * Math.pow(1 + monthlyRate, totalMonths);
  
  // Future value of monthly deposits
  const depositFV = monthlyDeposit * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  
  const totalAmount = principalFV + depositFV;
  const totalDeposits = principal + (monthlyDeposit * totalMonths);
  const totalInterest = totalAmount - totalDeposits;
  
  return { amount: totalAmount, interest: totalInterest, totalDeposits };
}

// Generate Year-by-Year Growth Data
function generateYearlyData(principal: number, annualRate: number, years: number, compounding: string, monthlyDeposit: number = 0) {
  const data = [];
  let currentAmount = principal;
  let totalDeposits = principal;
  
  for (let year = 1; year <= years; year++) {
    if (monthlyDeposit > 0) {
      const result = calculateWithDeposits(principal, annualRate, year, monthlyDeposit);
      data.push({
        year: year,
        amount: result.amount,
        interest: result.interest,
        deposits: result.totalDeposits
      });
    } else {
      const result = calculateCompoundInterest(principal, annualRate, year, compounding);
      data.push({
        year: year,
        amount: result.amount,
        interest: result.interest,
        deposits: principal
      });
    }
  }
  
  return data;
}
```

---

## How to Use Content (for SEO section)

1. Enter your initial investment amount (principal)
2. Input the annual interest rate (as a percentage)
3. Set the time period in years
4. Choose the compounding frequency (daily, monthly, quarterly, or annually)
5. Optionally add monthly deposits for regular investments
6. Click calculate to see your final amount and interest earned
7. View the year-by-year growth table and comparison chart
8. Export or copy the results for your records

---

## About Content (for SEO section)

Our free compound interest calculator helps you understand how your investments can grow over time through the power of compound interest. Enter your principal amount, interest rate, and time period to instantly calculate the final amount and total interest earned. The calculator supports different compounding frequencies (daily, monthly, quarterly, annually) to show how compounding frequency affects your returns. You can also include regular monthly deposits to calculate the growth of systematic investment plans. The year-by-year breakdown and comparison charts help visualize the difference between simple and compound interest. Perfect for planning investments, savings goals, and understanding the long-term impact of compound interest. All calculations happen in your browser with complete privacy.