# SPEC: Student Loan Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/STUDENT_LOAN_CALCULATOR.md`
**Status:** Pending
**Slug:** `student-loan-calculator`
**Category:** calculator
**Subcategory`: financial-calculators

---

## SEO

- **Title:** `Student Loan Calculator — Repayment Schedule & Plans | ToolForge`
- **Description:** `Calculate student loan payments with different repayment plans. Free calculator with amortization schedules, income-driven options, and payoff strategies.`
- **Primary Keyword:** student loan calculator
- **Secondary Keywords:** student loan repayment calculator, loan amortization calculator, income-driven repayment calculator, education loan calculator

---

## Functional Requirements

- [ ] Loan amount input
- [ ] Interest rate input
- [ ] Loan term input (years)
- [ ] Multiple repayment plan options (Standard, Graduated, Extended)
- [ ] Income-driven repayment plans (REPAYE, PAYE, IBR, ICR)
- [ ] Real-time monthly payment calculation
- [ ] Display total interest paid
- [ ] Amortization schedule by year
- [ ] Grace period calculation
- [ ] Extra payment impact calculator
- [ ] Loan forgiveness estimation
- [ ] Refinance comparison calculator
- [ ] Export repayment schedule to CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in student loan formulas)

---

## Library

No external library needed — use built-in student loan calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Student Loan Calculator                │
├─────────────────────────────────────────┤
│  Loan Amount: [$30,000      ]         │
│  Interest Rate: [%4.5         ]        │
│  Loan Term: [10] years                  │
│                                         │
│  Repayment Plan: [Standard 10-Year ▼] │
│  [Compare All Plans]                    │
│                                         │
│  [Calculate Repayment]                  │
├─────────────────────────────────────────┤
│  Results:                               │
│  Monthly Payment: $311.38              │
│  Total Interest: $7,365.77            │
│  Total Amount: $37,365.77             │
│  Payoff Date: June 2034                 │
│                                         │
│  Repayment Schedule Summary:            │
│  Year 1: Pay $3,736, Balance $27,406   │
│  Year 5: Pay $3,736, Balance $15,296   │
│  Year 10: Pay $3,736, Balance $0       │
│                                         │
│  [View Full Schedule]                   │
│  [Extra Payments]                       │
│  [Refinance Comparison]                 │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  repaymentPlan: 'standard' | 'graduated' | 'extended' | 'incomeDriven';
  incomeDrivenPlan: 'repaye' | 'paye' | 'ibr' | 'icr';
  annualIncome: number;
  familySize: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  payoffDate: Date;
  gracePeriod: number; // months
  amortizationSchedule: Array<{
    year: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}
```

---

## Formulas

```typescript
// Standard Repayment Plan (Fixed payments over 10 years)
function calculateStandardRepayment(
  loanAmount: number,
  interestRate: number,
  loanTerm: number
): {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  amortizationSchedule: Array<{
    year: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
} {
  
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  
  // Standard amortization formula
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  let currentBalance = loanAmount;
  let totalInterest = 0;
  const amortizationSchedule = [];
  
  for (let year = 1; year <= loanTerm; year++) {
    let yearlyPayment = 0;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    
    for (let month = 1; month <= 12; month++) {
      const interestPayment = currentBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      yearlyPayment += monthlyPayment;
      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;
      totalInterest += interestPayment;
      currentBalance -= principalPayment;
      
      if (currentBalance <= 0) break;
    }
    
    amortizationSchedule.push({
      year,
      payment: yearlyPayment,
      principal: yearlyPrincipal,
      interest: yearlyInterest,
      balance: Math.max(0, currentBalance)
    });
  }
  
  return {
    monthlyPayment,
    totalInterest,
    totalAmount: loanAmount + totalInterest,
    amortizationSchedule
  };
}

// Graduated Repayment Plan (Payments start low and increase)
function calculateGraduatedRepayment(
  loanAmount: number,
  interestRate: number,
  loanTerm: number = 10
): {
  monthlyPayments: Array<{period: number, payment: number}>;
  totalInterest: number;
  totalAmount: number;
} {
  
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  
  // Graduated plan typically has 2-year periods with increasing payments
  const periods = Math.ceil(loanTerm / 2);
  const monthlyPayments = [];
  let remainingBalance = loanAmount;
  let totalInterest = 0;
  
  for (let period = 1; period <= periods; period++) {
    // Calculate payment for this 2-year period
    const remainingPayments = (loanTerm * 12) - ((period - 1) * 24);
    const periodPayment = remainingBalance * 
      (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments)) / 
      (Math.pow(1 + monthlyRate, remainingPayments) - 1);
    
    // Calculate interest for this period
    let periodInterest = 0;
    for (let month = 1; month <= 24 && remainingPayments > 0; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = periodPayment - interestPayment;
      periodInterest += interestPayment;
      totalInterest += interestPayment;
      remainingBalance -= principalPayment;
      
      if (remainingBalance <= 0) break;
    }
    
    monthlyPayments.push({
      period,
      payment: periodPayment
    });
  }
  
  return {
    monthlyPayments,
    totalInterest,
    totalAmount: loanAmount + totalInterest
  };
}

// Extended Repayment Plan (25 years for loans over $30,000)
function calculateExtendedRepayment(
  loanAmount: number,
  interestRate: number
): {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  loanTerm: number;
} {
  
  const loanTerm = loanAmount > 30000 ? 25 : 10;
  const standardResult = calculateStandardRepayment(loanAmount, interestRate, loanTerm);
  
  return {
    ...standardResult,
    loanTerm
  };
}

// Income-Driven Repayment Plans (REPAYE, PAYE, IBR, ICR)
function calculateIncomeDrivenRepayment(
  loanAmount: number,
  interestRate: number,
  annualIncome: number,
  familySize: number,
  plan: 'repaye' | 'paye' | 'ibr' | 'icr',
  povertyLine: number = 13590 // 2023 federal poverty line for 48 states
): {
  monthlyPayment: number;
  discretionaryIncome: number;
  paymentPercentage: number;
  estimatedForgiveness: number;
  repaymentPeriod: number;
} {
  
  // Calculate discretionary income based on plan
  let discretionaryIncome: number;
  let paymentPercentage: number;
  let repaymentPeriod: number;
  
  switch(plan) {
    case 'repaye':
      discretionaryIncome = Math.max(0, annualIncome - (povertyLine * 1.5));
      paymentPercentage = 0.10; // 10% of discretionary income
      repaymentPeriod = 20; // 20 years for undergrad, 25 for grad
      break;
    case 'paye':
      discretionaryIncome = Math.max(0, annualIncome - (povertyLine * 1.5));
      paymentPercentage = 0.10; // 10% of discretionary income
      repaymentPeriod = 20;
      break;
    case 'ibr':
      discretionaryIncome = Math.max(0, annualIncome - (povertyLine * 1.5));
      paymentPercentage = 0.15; // 15% of discretionary income
      repaymentPeriod = 25;
      break;
    case 'icr':
      discretionaryIncome = Math.max(0, annualIncome - (povertyLine * 1.0));
      paymentPercentage = 0.20; // 20% of discretionary income
      repaymentPeriod = 25;
      break;
  }
  
  const monthlyPayment = (discretionaryIncome * paymentPercentage) / 12;
  const standardPayment = calculateStandardRepayment(loanAmount, interestRate, 10).monthlyPayment;
  
  // Income-driven payment can't be more than 10-year standard payment (except REPAYE)
  const finalPayment = plan === 'repaye' ? monthlyPayment : Math.min(monthlyPayment, standardPayment);
  
  // Estimate forgiveness (very rough approximation)
  const totalPayments = finalPayment * 12 * repaymentPeriod;
  const estimatedForgiveness = Math.max(0, loanAmount - totalPayments);
  
  return {
    monthlyPayment: finalPayment,
    discretionaryIncome,
    paymentPercentage: paymentPercentage * 100,
    estimatedForgiveness,
    repaymentPeriod
  };
}

// Grace Period Calculation
function calculateGracePeriodImpact(
  loanAmount: number,
  interestRate: number,
  gracePeriodMonths: number,
  postGraceMonthlyPayment: number
): {
  interestDuringGrace: number;
  newBalance: number;
  newMonthlyPayment: number;
  additionalCost: number;
} {
  
  const monthlyRate = interestRate / 100 / 12;
  const interestDuringGrace = loanAmount * monthlyRate * gracePeriodMonths;
  const newBalance = loanAmount + interestDuringGrace;
  
  // Recalculate payment with new balance (assuming same term)
  const loanTerm = 10; // Standard 10-year term
  const numberOfPayments = loanTerm * 12;
  const newMonthlyPayment = newBalance * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const additionalCost = (newMonthlyPayment * numberOfPayments) - (postGraceMonthlyPayment * numberOfPayments);
  
  return {
    interestDuringGrace,
    newBalance,
    newMonthlyPayment,
    additionalCost
  };
}

// Extra Payment Impact
function calculateStudentLoanExtraPayment(
  loanAmount: number,
  interestRate: number,
  standardPayment: number,
  extraPayment: number
): {
  originalPayoff: {months: number, totalInterest: number};
  newPayoff: {months: number, totalInterest: number};
  monthsSaved: number;
  interestSaved: number;
} {
  
  const originalPayoff = calculateStandardRepayment(loanAmount, interestRate, 10);
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate with extra payment
  let currentBalance = loanAmount;
  let months = 0;
  let totalInterest = 0;
  
  while (currentBalance > 0 && months < 1000) {
    months++;
    const interestPayment = currentBalance * monthlyRate;
    const principalPayment = (standardPayment + extraPayment) - interestPayment;
    
    if (principalPayment <= 0) {
      return {
        originalPayoff: {months: 120, totalInterest: originalPayoff.totalInterest},
        newPayoff: {months: Infinity, totalInterest: Infinity},
        monthsSaved: 0,
        interestSaved: 0
      };
    }
    
    totalInterest += interestPayment;
    currentBalance -= principalPayment;
  }
  
  return {
    originalPayoff: {months: 120, totalInterest: originalPayoff.totalInterest},
    newPayoff: {months, totalInterest},
    monthsSaved: 120 - months,
    interestSaved: originalPayoff.totalInterest - totalInterest
  };
}

// Refinance Comparison
function calculateRefinancingBenefit(
  currentBalance: number,
  currentRate: number,
  remainingTerm: number,
  newRate: number,
  newTerm: number
): {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  monthlySavings: number;
  totalSavings: number;
} {
  
  const currentResult = calculateStandardRepayment(currentBalance, currentRate, remainingTerm);
  const newResult = calculateStandardRepayment(currentBalance, newRate, newTerm);
  
  return {
    currentMonthlyPayment: currentResult.monthlyPayment,
    newMonthlyPayment: newResult.monthlyPayment,
    currentTotalInterest: currentResult.totalInterest,
    newTotalInterest: newResult.totalInterest,
    monthlySavings: currentResult.monthlyPayment - newResult.monthlyPayment,
    totalSavings: currentResult.totalInterest - newResult.totalInterest
  };
}

// Compare All Repayment Plans
function compareRepaymentPlans(
  loanAmount: number,
  interestRate: number
): {
  standard: {monthlyPayment: number, totalInterest: number, totalAmount: number};
  graduated: {monthlyPayment: number, totalInterest: number, totalAmount: number};
  extended: {monthlyPayment: number, totalInterest: number, totalAmount: number};
  recommendation: string;
} {
  
  const standard = calculateStandardRepayment(loanAmount, interestRate, 10);
  const graduated = calculateGraduatedRepayment(loanAmount, interestRate, 10);
  const extended = calculateExtendedRepayment(loanAmount, interestRate);
  
  // Simple recommendation logic
  let recommendation: string;
  if (loanAmount < 20000) {
    recommendation = 'Standard 10-year plan recommended for lowest total cost';
  } else if (loanAmount < 50000) {
    recommendation = 'Consider Graduated plan if starting income is low, otherwise Standard';
  } else {
    recommendation = 'Extended or Graduated plan may provide needed flexibility';
  }
  
  return {
    standard: {
      monthlyPayment: standard.monthlyPayment,
      totalInterest: standard.totalInterest,
      totalAmount: standard.totalAmount
    },
    graduated: {
      monthlyPayment: graduated.monthlyPayments[0]?.payment || 0,
      totalInterest: graduated.totalInterest,
      totalAmount: graduated.totalAmount
    },
    extended: {
      monthlyPayment: extended.monthlyPayment,
      totalInterest: extended.totalInterest,
      totalAmount: extended.totalAmount
    },
    recommendation
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter your total student loan amount
2. Input the interest rate on your loans
3. Set your loan term or choose a repayment plan
4. For income-driven plans, enter your annual income and family size
5. Click calculate to see your monthly payment and total costs
6. Compare different repayment plans to find the best option
7. View the amortization schedule for detailed payment breakdown
8. Calculate the impact of extra payments to save money

---

## About Content (for SEO section)

Our free student loan calculator helps you understand and plan your student loan repayment with multiple options. Calculate payments under Standard, Graduated, and Extended repayment plans. Explore income-driven repayment options (REPAYE, PAYE, IBR, ICR) with inputs for income and family size. See how grace period interest affects your total loan cost and monthly payments. Calculate the impact of extra payments to accelerate your payoff timeline and reduce interest. Compare refinancing options to see if a lower rate could save you money. View detailed amortization schedules showing how each payment is split between principal and interest. Perfect for recent graduates, current students, and anyone managing student loan debt. All calculations happen in your browser with complete privacy.