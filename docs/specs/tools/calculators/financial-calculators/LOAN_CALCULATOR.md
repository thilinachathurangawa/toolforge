# SPEC: Loan Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/LOAN_CALCULATOR.md`
**Status:** Pending
**Slug:** `loan-calculator`
**Category:** calculator
**Subcategory:** financial-calculators

---

## SEO

- **Title:** `Loan Calculator — Calculate Monthly Payments, Interest & Total Cost | ToolForge`
- **Description:** `Calculate loan payments, total interest, and total cost with our free loan calculator. Works for mortgages, auto loans, personal loans, and more.`
- **Primary Keyword:** loan calculator
- **Secondary Keywords:** monthly payment calculator, loan interest calculator, mortgage calculator, auto loan calculator

---

## Functional Requirements

- [ ] Principal amount input (loan amount)
- [ ] Interest rate input (annual percentage rate)
- [ ] Loan term input (years/months)
- [ ] Real-time calculation of monthly payment
- [ ] Display total interest paid
- [ ] Display total cost of loan (principal + interest)
- [ ] Amortization schedule table
- [ ] Monthly breakdown of principal vs interest
- [ ] Support for different loan types (mortgage, auto, personal)
- [ ] Export amortization schedule
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in loan calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Loan Calculator                        │
├─────────────────────────────────────────┤
│  Loan Type: [Personal Loan ▼]           │
│                                         │
│  Loan Amount: [$10,000        ]         │
│  Interest Rate: [%5.5          ]        │
│  Loan Term: [5] years [▼]               │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Monthly Payment: $191.01              │
│  Total Interest: $1,460.57             │
│  Total Cost: $11,460.57                │
│                                         │
│  [View Amortization Schedule]           │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  loanType: 'mortgage' | 'auto' | 'personal' | 'other';
  principal: number;
  interestRate: number; // annual percentage rate
  loanTerm: number; // in years
  loanTermUnit: 'years' | 'months';
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  showAmortization: boolean;
}
```

---

## Formulas

```typescript
// Monthly Payment Formula (P, R, N)
// M = P * [r(1+r)^n] / [(1+r)^n - 1]

function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return monthlyPayment;
}

// Total Interest = (Monthly Payment × Number of Payments) - Principal
function calculateTotalInterest(monthlyPayment: number, numberOfPayments: number, principal: number): number {
  return (monthlyPayment * numberOfPayments) - principal;
}

// Total Cost = Principal + Total Interest
function calculateTotalCost(principal: number, totalInterest: number): number {
  return principal + totalInterest;
}

// Amortization Schedule
function generateAmortizationSchedule(principal: number, monthlyRate: number, monthlyPayment: number, numberOfPayments: number) {
  const schedule = [];
  let balance = principal;
  
  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    schedule.push({
      paymentNumber: i,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance)
    });
  }
  
  return schedule;
}
```

---

## How to Use Content (for SEO section)

1. Select the loan type (mortgage, auto, personal, or other)
2. Enter the loan amount you want to borrow
3. Input the annual interest rate (as a percentage)
4. Set the loan term in years or months
5. Click calculate to see your monthly payment
6. View the amortization schedule for detailed payment breakdown
7. Copy or export the results for your records

---

## About Content (for SEO section)

Our free loan calculator helps you estimate monthly payments for any type of loan including mortgages, auto loans, personal loans, and more. Simply enter the loan amount, interest rate, and term to instantly calculate your monthly payment, total interest, and total cost of the loan. The detailed amortization schedule shows how each payment is split between principal and interest over the life of the loan. Perfect for planning your finances and comparing loan options before committing to a loan. All calculations happen in your browser with no data sent to any server.