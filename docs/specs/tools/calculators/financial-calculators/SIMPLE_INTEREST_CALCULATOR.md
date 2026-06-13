# SPEC: Simple Interest Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/SIMPLE_INTEREST_CALCULATOR.md`
**Status:** Pending
**Slug:** `simple-interest-calculator`
**Category:** calculator
**Subcategory:** financial-calculators

---

## SEO

- **Title:** `Simple Interest Calculator — Calculate I = PRT | ToolForge`
- **Description:** `Calculate simple interest on loans and investments using the I = PRT formula. Free calculator with detailed breakdown of principal, rate, and time.`
- **Primary Keyword:** simple interest calculator
- **Secondary Keywords:** simple interest formula, loan interest calculator, basic interest calculation, PRT formula

---

## Functional Requirements

- [ ] Principal amount input (P)
- [ ] Annual interest rate input (R)
- [ ] Time period input (T) in years/months/days
- [ ] Time unit selector (years, months, days)
- [ ] Real-time calculation of simple interest
- [ ] Display total amount (principal + interest)
- [ ] Show calculation formula and breakdown
- [ ] Support for different time units
- [ ] Comparison with compound interest
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in simple interest formula)

---

## Library

No external library needed — use built-in simple interest formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Simple Interest Calculator            │
├─────────────────────────────────────────┤
│  Principal (P): [$5,000       ]         │
│  Rate (R): [%6          ]                │
│  Time (T): [3] years [▼]               │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Simple Interest: $900.00              │
│  Total Amount: $5,900.00               │
│                                         │
│  Formula: I = P × R × T                │
│  I = 5000 × 0.06 × 3 = 900             │
│                                         │
│  [Compare with Compound Interest]       │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  principal: number; // P
  rate: number; // R (annual percentage rate)
  time: number; // T
  timeUnit: 'years' | 'months' | 'days';
  interest: number; // I
  totalAmount: number; // A = P + I
  showComparison: boolean;
}
```

---

## Formulas

```typescript
// Simple Interest Formula: I = P × R × T
// Where: I = Interest, P = Principal, R = Annual Interest Rate, T = Time in Years

function calculateSimpleInterest(principal: number, annualRate: number, time: number, timeUnit: string): {interest: number, totalAmount: number} {
  const rate = annualRate / 100;
  let timeInYears: number;
  
  // Convert time to years based on unit
  switch(timeUnit) {
    case 'years':
      timeInYears = time;
      break;
    case 'months':
      timeInYears = time / 12;
      break;
    case 'days':
      timeInYears = time / 365;
      break;
    default:
      timeInYears = time;
  }
  
  const interest = principal * rate * timeInYears;
  const totalAmount = principal + interest;
  
  return { interest, totalAmount };
}

// Calculate Principal from Interest, Rate, and Time
function calculatePrincipal(interest: number, annualRate: number, time: number, timeUnit: string): number {
  const rate = annualRate / 100;
  let timeInYears: number;
  
  switch(timeUnit) {
    case 'years':
      timeInYears = time;
      break;
    case 'months':
      timeInYears = time / 12;
      break;
    case 'days':
      timeInYears = time / 365;
      break;
    default:
      timeInYears = time;
  }
  
  return interest / (rate * timeInYears);
}

// Calculate Rate from Principal, Interest, and Time
function calculateRate(principal: number, interest: number, time: number, timeUnit: string): number {
  let timeInYears: number;
  
  switch(timeUnit) {
    case 'years':
      timeInYears = time;
      break;
    case 'months':
      timeInYears = time / 12;
      break;
    case 'days':
      timeInYears = time / 365;
      break;
    default:
      timeInYears = time;
  }
  
  return (interest / (principal * timeInYears)) * 100;
}

// Calculate Time from Principal, Interest, and Rate
function calculateTime(principal: number, interest: number, annualRate: number, timeUnit: string): number {
  const rate = annualRate / 100;
  const timeInYears = interest / (principal * rate);
  
  switch(timeUnit) {
    case 'years':
      return timeInYears;
    case 'months':
      return timeInYears * 12;
    case 'days':
      return timeInYears * 365;
    default:
      return timeInYears;
  }
}
```

---

## How to Use Content (for SEO section)

1. Enter the principal amount (the initial amount of money)
2. Input the annual interest rate as a percentage
3. Set the time period and select the unit (years, months, or days)
4. Click calculate to see the simple interest and total amount
5. Review the formula breakdown showing the calculation
6. Compare with compound interest to see the difference
7. Copy the results for your records

---

## About Content (for SEO section)

Our free simple interest calculator uses the basic I = PRT formula to calculate interest on loans and investments. Simple interest is calculated only on the original principal amount, making it different from compound interest. This calculator is perfect for understanding basic interest calculations, comparing loan options, or estimating investment returns with simple interest. Enter the principal amount, annual interest rate, and time period to instantly calculate the interest earned and total amount. The tool shows the exact formula breakdown and offers a comparison with compound interest to help you understand the impact of different interest calculation methods. All calculations happen in your browser with complete privacy.