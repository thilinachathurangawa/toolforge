# SPEC: Debt Payoff Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/DEBT_PAYOFF_CALCULATOR.md`
**Status:** Pending
**Slug:** `debt-payoff-calculator`
**Category:** calculator
**Subcategory`: financial-calculators

---

## SEO

- **Title:** `Debt Payoff Calculator — Avalanche vs Snowball Method | ToolForge`
- **Description:** `Calculate your debt payoff timeline with avalanche and snowball methods. Free debt payoff calculator with payment strategies and interest savings.`
- **Primary Keyword:** debt payoff calculator
- **Secondary Keywords:** debt avalanche calculator, debt snowball calculator, debt payoff timeline, debt reduction calculator

---

## Functional Requirements

- [ ] Multiple debt input (balance, interest rate, minimum payment)
- [ ] Monthly payment amount input
- [ ] Avalanche method calculation (highest interest first)
- [ ] Snowball method calculation (lowest balance first)
- [ ] Payoff timeline for each method
- [ ] Total interest paid comparison
- [ ] Total time to debt-free comparison
- [ ] Payment schedule for chosen method
- [ ] Extra payment allocation calculator
- [ ] Debt-free date projection
- [ ] Interest savings visualization
- [ ] Export payment schedule to CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in debt payoff formulas)

---

## Library

No external library needed — use built-in debt payoff formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Debt Payoff Calculator                │
├─────────────────────────────────────────┤
│  Monthly Payment: [$500       ]       │
│                                         │
│  Add Debt:                              │
│  ┌─────────────────────────────────┐   │
│  │ Balance: [$5,000] Rate: [%18] │   │
│  │ Min Pay: [$150]  [Remove]     │   │
│  └─────────────────────────────────┘   │
│  [+ Add Another Debt]                   │
│                                         │
│  [Calculate Payoff Plan]                │
├─────────────────────────────────────────┤
│  Payoff Method Comparison:              │
│  ┌───────────────────┬───────────────┐ │
│  │ Avalanche         │ Snowball      │ │
│  ├───────────────────┼───────────────┤ │
│  │ Time: 24 months   │ Time: 28 mo   │ │
│  │ Interest: $1,200  │ Interest: $1.4K│ │
│  └───────────────────┴───────────────┘ │
│                                         │
│  [View Payment Schedule]                │
│  [Choose Method]                        │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  monthlyPayment: number;
  debts: Array<{
    id: string;
    name: string;
    balance: number;
    interestRate: number;
    minimumPayment: number;
  }>;
  selectedMethod: 'avalanche' | 'snowball';
  avalancheResult: {
    monthsToPayoff: number;
    totalInterest: number;
    totalPaid: number;
    paymentSchedule: Array<{}>;
  };
  snowballResult: {
    monthsToPayoff: number;
    totalInterest: number;
    totalPaid: number;
    paymentSchedule: Array<{}>;
  };
  comparison: {
    monthsDifference: number;
    interestSavings: number;
    recommendedMethod: string;
  };
}
```

---

## Formulas

```typescript
// Debt Payment Calculation
function calculateDebtPayment(
  balance: number,
  interestRate: number,
  monthlyPayment: number
): {
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
} {
  
  const monthlyRate = interestRate / 100 / 12;
  
  if (monthlyRate === 0) {
    const monthsToPayoff = Math.ceil(balance / monthlyPayment);
    return {
      monthsToPayoff,
      totalInterest: 0,
      totalPaid: balance
    };
  }
  
  // Calculate number of months to pay off
  let currentBalance = balance;
  let months = 0;
  let totalInterest = 0;
  
  while (currentBalance > 0 && months < 1000) { // Safety limit
    const interestPayment = currentBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    if (principalPayment <= 0) {
      // Payment doesn't cover interest
      return {
        monthsToPayoff: Infinity,
        totalInterest: Infinity,
        totalPaid: Infinity
      };
    }
    
    totalInterest += interestPayment;
    currentBalance -= principalPayment;
    months++;
  }
  
  return {
    monthsToPayoff: months,
    totalInterest,
    totalPaid: balance + totalInterest
  };
}

// Avalanche Method: Pay highest interest rate first
function calculateAvalancheMethod(
  debts: Array<{balance: number, interestRate: number, minimumPayment: number}>,
  monthlyPayment: number
): {
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  paymentSchedule: Array<{month: number, payments: Array<{debtIndex: number, amount: number}>}>;
} {
  
  // Sort debts by interest rate (highest first)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  
  let currentDebts = sortedDebts.map(debt => ({...debt}));
  let currentMonth = 0;
  let totalInterest = 0;
  const paymentSchedule = [];
  
  while (currentDebts.some(debt => debt.balance > 0) && currentMonth < 1000) {
    currentMonth++;
    const monthlyPayments = [];
    let remainingPayment = monthlyPayment;
    
    // Make minimum payments on all debts
    currentDebts.forEach((debt, index) => {
      if (debt.balance > 0) {
        const minPayment = Math.min(debt.minimumPayment, debt.balance);
        const monthlyRate = debt.interestRate / 100 / 12;
        const interestPayment = debt.balance * monthlyRate;
        const principalPayment = minPayment - interestPayment;
        
        debt.balance -= principalPayment;
        totalInterest += interestPayment;
        remainingPayment -= minPayment;
        
        monthlyPayments.push({
          debtIndex: index,
          amount: minPayment
        });
      }
    });
    
    // Apply extra payment to highest interest debt
    if (remainingPayment > 0) {
      for (let i = 0; i < currentDebts.length && remainingPayment > 0; i++) {
        if (currentDebts[i].balance > 0) {
          const monthlyRate = currentDebts[i].interestRate / 100 / 12;
          const extraPayment = Math.min(remainingPayment, currentDebts[i].balance);
          const interestPayment = currentDebts[i].balance * monthlyRate;
          const principalPayment = extraPayment - interestPayment;
          
          currentDebts[i].balance -= principalPayment;
          totalInterest += interestPayment;
          remainingPayment -= extraPayment;
          
          monthlyPayments.push({
            debtIndex: i,
            amount: extraPayment
          });
        }
      }
    }
    
    paymentSchedule.push({
      month: currentMonth,
      payments: monthlyPayments
    });
  }
  
  const totalPaid = currentDebts.reduce((sum, debt) => sum + (debt.balance + totalInterest / currentMonth), 0);
  
  return {
    monthsToPayoff: currentMonth,
    totalInterest,
    totalPaid: debts.reduce((sum, debt) => sum + debt.balance, 0) + totalInterest,
    paymentSchedule
  };
}

// Snowball Method: Pay lowest balance first
function calculateSnowballMethod(
  debts: Array<{balance: number, interestRate: number, minimumPayment: number}>,
  monthlyPayment: number
): {
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  paymentSchedule: Array<{month: number, payments: Array<{debtIndex: number, amount: number}>}>;
} {
  
  // Sort debts by balance (lowest first)
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  
  let currentDebts = sortedDebts.map(debt => ({...debt}));
  let currentMonth = 0;
  let totalInterest = 0;
  const paymentSchedule = [];
  
  while (currentDebts.some(debt => debt.balance > 0) && currentMonth < 1000) {
    currentMonth++;
    const monthlyPayments = [];
    let remainingPayment = monthlyPayment;
    
    // Make minimum payments on all debts
    currentDebts.forEach((debt, index) => {
      if (debt.balance > 0) {
        const minPayment = Math.min(debt.minimumPayment, debt.balance);
        const monthlyRate = debt.interestRate / 100 / 12;
        const interestPayment = debt.balance * monthlyRate;
        const principalPayment = minPayment - interestPayment;
        
        debt.balance -= principalPayment;
        totalInterest += interestPayment;
        remainingPayment -= minPayment;
        
        monthlyPayments.push({
          debtIndex: index,
          amount: minPayment
        });
      }
    });
    
    // Apply extra payment to lowest balance debt
    if (remainingPayment > 0) {
      for (let i = 0; i < currentDebts.length && remainingPayment > 0; i++) {
        if (currentDebts[i].balance > 0) {
          const monthlyRate = currentDebts[i].interestRate / 100 / 12;
          const extraPayment = Math.min(remainingPayment, currentDebts[i].balance);
          const interestPayment = currentDebts[i].balance * monthlyRate;
          const principalPayment = extraPayment - interestPayment;
          
          currentDebts[i].balance -= principalPayment;
          totalInterest += interestPayment;
          remainingPayment -= extraPayment;
          
          monthlyPayments.push({
            debtIndex: i,
            amount: extraPayment
          });
        }
      }
    }
    
    paymentSchedule.push({
      month: currentMonth,
      payments: monthlyPayments
    });
  }
  
  return {
    monthsToPayoff: currentMonth,
    totalInterest,
    totalPaid: debts.reduce((sum, debt) => sum + debt.balance, 0) + totalInterest,
    paymentSchedule
  };
}

// Compare Methods
function compareDebtPayoffMethods(
  avalancheResult: any,
  snowballResult: any
): {
  monthsDifference: number;
  interestSavings: number;
  recommendedMethod: string;
  recommendationReason: string;
} {
  
  const monthsDifference = snowballResult.monthsToPayoff - avalancheResult.monthsToPayoff;
  const interestSavings = snowballResult.totalInterest - avalancheResult.totalInterest;
  
  let recommendedMethod: string;
  let recommendationReason: string;
  
  if (interestSavings > 0) {
    recommendedMethod = 'avalanche';
    recommendationReason = `Avalanche saves $${interestSavings.toFixed(2)} in interest and gets you debt-free ${monthsDifference} months sooner`;
  } else if (monthsDifference > 6) {
    // If snowball is significantly faster (rare but possible with psychological factors)
    recommendedMethod = 'snowball';
    recommendationReason = 'Snowball method may provide psychological motivation with quick wins';
  } else {
    recommendedMethod = 'avalanche';
    recommendationReason = 'Avalanche method is mathematically optimal for most situations';
  }
  
  return {
    monthsDifference,
    interestSavings,
    recommendedMethod,
    recommendationReason
  };
}

// Calculate Impact of Extra Payments
function calculateExtraPaymentImpact(
  currentBalance: number,
  interestRate: number,
  currentMonthlyPayment: number,
  extraPayment: number
): {
  originalPayoff: {months: number, interest: number};
  newPayoff: {months: number, interest: number};
  monthsSaved: number;
  interestSaved: number;
} {
  
  const originalPayoff = calculateDebtPayment(currentBalance, interestRate, currentMonthlyPayment);
  const newPayoff = calculateDebtPayment(currentBalance, interestRate, currentMonthlyPayment + extraPayment);
  
  return {
    originalPayoff,
    newPayoff,
    monthsSaved: originalPayoff.monthsToPayoff - newPayoff.monthsToPayoff,
    interestSaved: originalPayoff.totalInterest - newPayoff.totalInterest
  };
}
```

---

## How to Use Content (for SEO section)

1. Add all your debts with balance, interest rate, and minimum payment
2. Enter your total monthly payment amount
3. Click calculate to see both avalanche and snowball methods
4. Compare the results to choose your preferred strategy
5. Review the payment schedule for your chosen method
6. See how much time and interest you can save with extra payments
7. Track your progress as you pay off each debt

---

## About Content (for SEO section)

Our free debt payoff calculator helps you create a strategic plan to become debt-free using two proven methods: the debt avalanche (highest interest first) and debt snowball (lowest balance first). Enter all your debts with balances, interest rates, and minimum payments to see a detailed comparison of both strategies. The avalanche method saves the most money mathematically by focusing on high-interest debt first. The snowball method provides psychological motivation by eliminating small debts quickly. See exactly how long it will take to become debt-free and how much interest you'll pay with each method. Calculate the impact of extra payments to accelerate your payoff timeline. Perfect for anyone serious about eliminating debt and achieving financial freedom. All calculations happen in your browser with complete privacy.