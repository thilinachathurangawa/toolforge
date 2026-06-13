# SPEC: EMI Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/EMI_CALCULATOR.md`
**Status:** Pending
**Slug:** `emi-calculator`
**Category:** calculator
**Subcategory:** financial-calculators

---

## SEO

- **Title:** `EMI Calculator — Calculate Equated Monthly Installment | ToolForge`
- **Description:** `Calculate your EMI (Equated Monthly Installment) for home loans, car loans, personal loans, and more. Free EMI calculator with detailed payment schedule.`
- **Primary Keyword:** EMI calculator
- **Secondary Keywords:** equated monthly installment, loan EMI calculator, home loan EMI, car loan EMI

---

## Functional Requirements

- [ ] Principal amount input (loan amount)
- [ ] Interest rate input (annual percentage rate)
- [ ] Loan tenure input (years/months)
- [ ] Real-time EMI calculation
- [ ] Display total payment amount
- [ ] Display total interest payable
- [ ] Amortization schedule with monthly breakdown
- [ ] Pie chart showing principal vs interest ratio
- [ ] Prepayment option (extra payment calculation)
- [ ] Support for different loan types (home, car, personal)
- [ ] Export schedule to PDF/CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in EMI formula)

---

## Library

No external library needed — use built-in EMI calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  EMI Calculator                         │
├─────────────────────────────────────────┤
│  Loan Type: [Home Loan ▼]               │
│                                         │
│  Loan Amount: [₹5,000,000      ]       │
│  Interest Rate: [%8.5          ]         │
│  Loan Tenure: [20] years [▼]           │
│                                         │
│  [Calculate EMI]                        │
├─────────────────────────────────────────┤
│  Results:                               │
│  Monthly EMI: ₹43,391.06               │
│  Total Interest: ₹5,413,854.41        │
│  Total Payment: ₹10,413,854.41         │
│                                         │
│  [Principal vs Interest Chart]          │
│  [View Amortization Schedule]           │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  loanType: 'home' | 'car' | 'personal' | 'education' | 'other';
  principal: number;
  interestRate: number; // annual percentage rate
  tenure: number; // in years
  tenureUnit: 'years' | 'months';
  emi: number;
  totalInterest: number;
  totalPayment: number;
  showAmortization: boolean;
  showChart: boolean;
}
```

---

## Formulas

```typescript
// Standard EMI Formula
// EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
// Where: P = Principal, R = Monthly Interest Rate, N = Number of Monthly Installments

function calculateEMI(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfInstallments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfInstallments;
  }
  
  const emi = principal * 
    monthlyRate * Math.pow(1 + monthlyRate, numberOfInstallments) / 
    (Math.pow(1 + monthlyRate, numberOfInstallments) - 1);
  
  return emi;
}

// Total Payment = EMI × Number of Installments
function calculateTotalPayment(emi: number, numberOfInstallments: number): number {
  return emi * numberOfInstallments;
}

// Total Interest = Total Payment - Principal
function calculateTotalInterest(totalPayment: number, principal: number): number {
  return totalPayment - principal;
}

// Prepayment Calculation
function calculatePrepaymentSavings(principal: number, emi: number, monthlyRate: number, prepaymentAmount: number, prepaymentMonth: number) {
  // Calculate remaining balance after prepayment
  // Calculate new EMI or reduced tenure
  // Calculate interest savings
}
```

---

## How to Use Content (for SEO section)

1. Select the loan type (home loan, car loan, personal loan, etc.)
2. Enter the loan amount you want to borrow
3. Input the annual interest rate offered by the lender
4. Set the loan tenure in years or months
5. Click calculate to see your monthly EMI
6. View the amortization schedule for detailed payment breakdown
7. Use the prepayment option to calculate savings from extra payments

---

## About Content (for SEO section)

Our free EMI (Equated Monthly Installment) calculator helps you plan your loan repayments effectively. Whether you're taking a home loan, car loan, or personal loan, calculate your monthly EMI instantly along with the total interest payable over the loan tenure. The interactive pie chart shows the ratio between principal and interest, helping you understand the true cost of borrowing. The detailed amortization schedule breaks down each payment into principal and interest components. Perfect for comparing loan offers from different lenders and planning your budget before committing to a loan. All calculations happen locally in your browser with complete privacy.