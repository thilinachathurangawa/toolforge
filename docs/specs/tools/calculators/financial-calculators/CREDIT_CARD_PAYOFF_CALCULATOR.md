# SPEC: Credit Card Payoff Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/CREDIT_CARD_PAYOFF_CALCULATOR.md`
**Status:** Pending
**Slug:** `credit-card-payoff-calculator`
**Category:** calculator
**Subcategory`: financial-calculators

---

## SEO

- **Title:** `Credit Card Payoff Calculator — Minimum Payment & Interest | ToolForge`
- **Description:** `Calculate credit card payoff time and interest with our free calculator. See how minimum payments affect your debt and find faster payoff strategies.`
- **Primary Keyword:** credit card payoff calculator
- **Secondary Keywords:** credit card interest calculator, minimum payment calculator, credit card debt calculator, payoff timeline calculator

---

## Functional Requirements

- [ ] Credit card balance input
- [ ] Annual Percentage Rate (APR) input
- [ ] Minimum payment input or automatic calculation
- [ ] Monthly payment amount input
- [ ] Real-time payoff time calculation
- [ ] Display total interest paid
- [ ] Show minimum payment vs fixed payment comparison
- [ ] Amortization schedule
- [ ] Impact of extra payments calculator
- [ ] Multiple credit card support
- [ ] Balance transfer cost calculator
- [ ] Debt-free date projection
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in credit card formulas)

---

## Library

No external library needed — use built-in credit card payoff formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Credit Card Payoff Calculator         │
├─────────────────────────────────────────┤
│  Card Balance: [$5,000       ]        │
│  APR: [%18.99          ]               │
│                                         │
│  Minimum Payment: [$150       ]       │
│  Or calculate as [%2 of balance]       │
│                                         │
│  Your Monthly Payment: [$250     ]    │
│                                         │
│  [Calculate Payoff]                     │
├─────────────────────────────────────────┤
│  Results:                               │
│  Payoff Time: 24 months                 │
│  Total Interest: $1,200                │
│  Total Amount: $6,200                  │
│  Debt-Free Date: December 2026          │
│                                         │
│  Minimum vs Your Payment:               │
│  Min Payment: 48 months, $2,400 interest │
│  Your Payment: 24 months, $1,200 interest │
│  You Save: $1,200 + 24 months          │
│                                         │
│  [View Amortization Schedule]           │
│  [Extra Payment Calculator]              │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  cardBalance: number;
  apr: number;
  minimumPayment: number;
  minimumPaymentMethod: 'fixed' | 'percentage';
  minimumPaymentPercentage: number;
  monthlyPayment: number;
  payoffResult: {
    monthsToPayoff: number;
    totalInterest: number;
    totalAmount: number;
    debtFreeDate: Date;
  };
  minimumPaymentResult: {
    monthsToPayoff: number;
    totalInterest: number;
    totalAmount: number;
  };
  comparison: {
    monthsSaved: number;
    interestSaved: number;
  };
  amortizationSchedule: Array<{
    month: number;
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
// Credit Card Payoff Calculation
function calculateCreditCardPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number
): {
  monthsToPayoff: number;
  totalInterest: number;
  totalAmount: number;
  debtFreeDate: Date;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
} {
  
  const monthlyRate = apr / 100 / 12;
  let currentBalance = balance;
  let months = 0;
  let totalInterest = 0;
  const amortizationSchedule = [];
  
  while (currentBalance > 0.01 && months < 1000) { // Safety limit
    months++;
    const interestPayment = currentBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    if (principalPayment <= 0) {
      // Payment doesn't cover interest - debt will never be paid off
      return {
        monthsToPayoff: Infinity,
        totalInterest: Infinity,
        totalAmount: Infinity,
        debtFreeDate: new Date(2099, 11, 31),
        amortizationSchedule: []
      };
    }
    
    totalInterest += interestPayment;
    currentBalance -= principalPayment;
    
    amortizationSchedule.push({
      month: months,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, currentBalance)
    });
  }
  
  const totalAmount = balance + totalInterest;
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months);
  
  return {
    monthsToPayoff: months,
    totalInterest,
    totalAmount,
    debtFreeDate,
    amortizationSchedule
  };
}

// Minimum Payment Calculation
function calculateMinimumPayment(
  balance: number,
  apr: number,
  method: 'fixed' | 'percentage',
  fixedAmount: number = 0,
  percentage: number = 2
): number {
  
  if (method === 'fixed') {
    return Math.max(fixedAmount, balance * 0.01); // At least 1% of balance
  } else {
    return Math.max(balance * (percentage / 100), balance * 0.01); // At least 1% of balance
  }
}

// Minimum Payment Payoff (usually takes much longer)
function calculateMinimumPaymentPayoff(
  balance: number,
  apr: number,
  minimumPayment: number,
  paymentMethod: 'fixed' | 'percentage',
  percentage: number = 2
): {
  monthsToPayoff: number;
  totalInterest: number;
  totalAmount: number;
  warning: string;
} {
  
  if (paymentMethod === 'percentage') {
    // Percentage minimum payment is complex to calculate exactly
    // For simplicity, we'll use a fixed approximation
    const avgMinimumPayment = balance * (percentage / 100);
    return calculateCreditCardPayoff(balance, apr, avgMinimumPayment);
  }
  
  const result = calculateCreditCardPayoff(balance, apr, minimumPayment);
  
  return {
    ...result,
    warning: result.monthsToPayoff > 60 ? 
      'Warning: Making minimum payments will take over 5 years to pay off this debt' : ''
  };
}

// Compare Payment Strategies
function comparePaymentStrategies(
  balance: number,
  apr: number,
  minimumPayment: number,
  yourPayment: number
): {
  minimumPayoff: {months: number, interest: number};
  yourPayoff: {months: number, interest: number};
  monthsSaved: number;
  interestSaved: number;
  percentageSaved: number;
} {
  
  const minimumResult = calculateCreditCardPayoff(balance, apr, minimumPayment);
  const yourResult = calculateCreditCardPayoff(balance, apr, yourPayment);
  
  const monthsSaved = minimumResult.monthsToPayoff - yourResult.monthsToPayoff;
  const interestSaved = minimumResult.totalInterest - yourResult.totalInterest;
  const percentageSaved = (interestSaved / minimumResult.totalInterest) * 100;
  
  return {
    minimumPayoff: {
      months: minimumResult.monthsToPayoff,
      interest: minimumResult.totalInterest
    },
    yourPayoff: {
      months: yourResult.monthsToPayoff,
      interest: yourResult.totalInterest
    },
    monthsSaved,
    interestSaved,
    percentageSaved
  };
}

// Extra Payment Impact
function calculateExtraPaymentImpact(
  balance: number,
  apr: number,
  currentPayment: number,
  extraPayment: number
): {
  originalPayoff: {months: number, interest: number};
  newPayoff: {months: number, interest: number};
  monthsSaved: number;
  interestSaved: number;
  recommendedExtraPayment: number;
} {
  
  const originalPayoff = calculateCreditCardPayoff(balance, apr, currentPayment);
  const newPayoff = calculateCreditCardPayoff(balance, apr, currentPayment + extraPayment);
  
  const monthsSaved = originalPayoff.monthsToPayoff - newPayoff.monthsToPayoff;
  const interestSaved = originalPayoff.totalInterest - newPayoff.totalInterest;
  
  // Calculate recommended extra payment to payoff in 12 months
  const targetMonths = 12;
  let testPayment = currentPayment;
  let recommendedExtraPayment = 0;
  
  for (let i = 0; i < 100; i++) {
    const testResult = calculateCreditCardPayoff(balance, apr, testPayment);
    if (testResult.monthsToPayoff <= targetMonths) {
      recommendedExtraPayment = testPayment - currentPayment;
      break;
    }
    testPayment += 50;
  }
  
  return {
    originalPayoff: {
      months: originalPayoff.monthsToPayoff,
      interest: originalPayoff.totalInterest
    },
    newPayoff: {
      months: newPayoff.monthsToPayoff,
      interest: newPayoff.totalInterest
    },
    monthsSaved,
    interestSaved,
    recommendedExtraPayment
  };
}

// Balance Transfer Calculator
function calculateBalanceTransfer(
  currentBalance: number,
  currentAPR: number,
  transferAPR: number,
  transferFee: number,
  transferPeriod: number // months
): {
  transferFeeAmount: number;
  totalTransferCost: number;
  currentAPRPayoff: {interest: number};
  transferAPRPayoff: {interest: number};
  savings: number;
  breakEvenPoint: number;
  worthwhile: boolean;
} {
  
  const transferFeeAmount = currentBalance * (transferFee / 100);
  const totalTransferCost = currentBalance + transferFeeAmount;
  
  // Calculate interest with current APR over transfer period
  const currentAPRResult = calculateCreditCardPayoff(currentBalance, currentAPR, currentBalance * 0.03);
  const transferAPRResult = calculateCreditCardPayoff(totalTransferCost, transferAPR, totalTransferCost * 0.03);
  
  // Simplified comparison - would need more complex calculation for accuracy
  const currentInterest = currentBalance * (currentAPR / 100) * (transferPeriod / 12);
  const transferInterest = totalTransferCost * (transferAPR / 100) * (transferPeriod / 12);
  
  const savings = currentInterest - transferInterest - transferFeeAmount;
  const worthwhile = savings > 0;
  
  // Break-even point (when savings exceed transfer fee)
  const breakEvenPoint = transferFeeAmount / ((currentAPR - transferAPR) / 100 / 12 * currentBalance);
  
  return {
    transferFeeAmount,
    totalTransferCost,
    currentAPRPayoff: {interest: currentInterest},
    transferAPRPayoff: {interest: transferInterest},
    savings,
    breakEvenPoint,
    worthwhile
  };
}

// Multiple Credit Cards Payoff Strategy
function calculateMultipleCardsPayoff(
  cards: Array<{balance: number, apr: number, minimumPayment: number}>,
  totalMonthlyPayment: number
): {
  recommendedMethod: 'avalanche' | 'snowball';
  monthsToPayoff: number;
  totalInterest: number;
  totalAmount: number;
  paymentSchedule: Array<{
    month: number;
    cardPayments: Array<{cardIndex: number, payment: number}>;
  }>;
} {
  
  // For simplicity, use avalanche method (highest APR first)
  const sortedCards = [...cards].sort((a, b) => b.apr - a.apr);
  
  let currentCards = sortedCards.map(card => ({...card}));
  let months = 0;
  let totalInterest = 0;
  const paymentSchedule = [];
  
  while (currentCards.some(card => card.balance > 0) && months < 1000) {
    months++;
    let remainingPayment = totalMonthlyPayment;
    const cardPayments = [];
    
    // Make minimum payments on all cards
    currentCards.forEach((card, index) => {
      if (card.balance > 0) {
        const monthlyRate = card.apr / 100 / 12;
        const interestPayment = card.balance * monthlyRate;
        const minPayment = Math.min(card.minimumPayment, card.balance);
        const principalPayment = minPayment - interestPayment;
        
        card.balance -= principalPayment;
        totalInterest += interestPayment;
        remainingPayment -= minPayment;
        
        cardPayments.push({
          cardIndex: index,
          payment: minPayment
        });
      }
    });
    
    // Apply extra payment to highest APR card
    if (remainingPayment > 0) {
      for (let i = 0; i < currentCards.length && remainingPayment > 0; i++) {
        if (currentCards[i].balance > 0) {
          const monthlyRate = currentCards[i].apr / 100 / 12;
          const extraPayment = Math.min(remainingPayment, currentCards[i].balance);
          const interestPayment = currentCards[i].balance * monthlyRate;
          const principalPayment = extraPayment - interestPayment;
          
          currentCards[i].balance -= principalPayment;
          totalInterest += interestPayment;
          remainingPayment -= extraPayment;
          
          cardPayments.push({
            cardIndex: i,
            payment: extraPayment
          });
        }
      }
    }
    
    paymentSchedule.push({
      month: months,
      cardPayments
    });
  }
  
  const totalAmount = cards.reduce((sum, card) => sum + card.balance, 0) + totalInterest;
  
  return {
    recommendedMethod: 'avalanche',
    monthsToPayoff: months,
    totalInterest,
    totalAmount,
    paymentSchedule
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter your credit card balance
2. Input the Annual Percentage Rate (APR)
3. Set your minimum payment or let us calculate it
4. Enter your planned monthly payment amount
5. Click calculate to see your payoff timeline
6. Compare minimum payments vs your chosen payment
7. View the amortization schedule for detailed breakdown
8. Calculate the impact of extra payments to save time and money

---

## About Content (for SEO section)

Our free credit card payoff calculator helps you understand and plan your credit card debt repayment. Enter your balance, APR, and payment amount to see exactly how long it will take to become debt-free and how much interest you'll pay. Compare minimum payments against higher payments to see the dramatic difference in both time and interest savings. View detailed amortization schedules showing how each payment is split between principal and interest. Calculate the impact of extra payments to accelerate your payoff timeline. Use the balance transfer calculator to determine if transferring your balance to a lower-rate card makes sense. Perfect for anyone looking to escape credit card debt and save money on interest payments. All calculations happen in your browser with complete privacy.