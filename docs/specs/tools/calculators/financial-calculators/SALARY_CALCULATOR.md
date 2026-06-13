# SPEC: Salary Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/SALARY_CALCULATOR.md`
**Status:** Pending
**Slug:** `salary-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Salary Calculator — Convert Annual, Hourly, Monthly Pay | ToolForge`
- **Description:** `Convert salary between annual, hourly, monthly, and weekly pay rates instantly. Free salary calculator with tax deductions and overtime calculations.`
- **Primary Keyword:** salary calculator
- **Secondary Keywords:** hourly wage calculator, annual to monthly salary converter, salary to hourly calculator, paycheck calculator

---

## Functional Requirements

- [ ] Input for different salary types (annual, hourly, monthly, weekly)
- [ ] Real-time conversion between all salary types
- [ ] Hours per week input
- [ ] Weeks per year input
- [ ] Overtime rate calculation
- [ ] Tax deduction estimation
- [ ] Take-home pay calculation
- [ ] Comparison between gross and net pay
- [ ] Support for different pay periods (weekly, bi-weekly, monthly)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in salary formulas)

---

## Library

No external library needed — use built-in salary calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Salary Calculator                     │
├─────────────────────────────────────────┤
│  Input Type: [Annual Salary ▼]         │
│  Amount: [$50,000       ]             │
│                                         │
│  Hours per Week: [40]                  │
│  Weeks per Year: [52]                   │
│                                         │
│  [Calculate Salary]                     │
├─────────────────────────────────────────┤
│  Results:                               │
│  Annual Salary: $50,000.00            │
│  Monthly Salary: $4,166.67             │
│  Bi-Weekly: $1,923.08                  │
│  Weekly Salary: $961.54                │
│  Hourly Wage: $24.04                   │
│                                         │
│  [Calculate Tax Deductions]             │
│  [Overtime Calculator]                  │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  inputType: 'annual' | 'hourly' | 'monthly' | 'weekly';
  amount: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  annualSalary: number;
  monthlySalary: number;
  weeklySalary: number;
  hourlyWage: number;
  biWeeklyPay: number;
  taxRate: number;
  takeHomePay: number;
  showTaxCalculation: boolean;
  showOvertime: boolean;
}
```

---

## Formulas

```typescript
// Annual to Hourly: Hourly = Annual / (Hours per Week × Weeks per Year)

function calculateSalaryConversions(
  amount: number,
  inputType: 'annual' | 'hourly' | 'monthly' | 'weekly',
  hoursPerWeek: number = 40,
  weeksPerYear: number = 52
): {
  annualSalary: number;
  monthlySalary: number;
  weeklySalary: number;
  hourlyWage: number;
  biWeeklyPay: number;
  dailySalary: number;
} {
  
  let annualSalary: number;
  
  // Convert input to annual first
  switch(inputType) {
    case 'annual':
      annualSalary = amount;
      break;
    case 'hourly':
      annualSalary = amount * hoursPerWeek * weeksPerYear;
      break;
    case 'monthly':
      annualSalary = amount * 12;
      break;
    case 'weekly':
      annualSalary = amount * weeksPerYear;
      break;
  }
  
  // Calculate all other rates from annual
  const monthlySalary = annualSalary / 12;
  const weeklySalary = annualSalary / weeksPerYear;
  const hourlyWage = annualSalary / (hoursPerWeek * weeksPerYear);
  const biWeeklyPay = weeklySalary * 2;
  const dailySalary = weeklySalary / 5; // Assuming 5-day work week
  
  return {
    annualSalary,
    monthlySalary,
    weeklySalary,
    hourlyWage,
    biWeeklyPay,
    dailySalary
  };
}

// Overtime Calculation
// Overtime Pay = Hourly Rate × Overtime Hours × Overtime Multiplier

function calculateOvertimePay(
  hourlyWage: number,
  regularHours: number,
  overtimeHours: number,
  overtimeMultiplier: number = 1.5
): {
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  effectiveHourlyRate: number;
} {
  
  const regularPay = hourlyWage * regularHours;
  const overtimeHourlyRate = hourlyWage * overtimeMultiplier;
  const overtimePay = overtimeHourlyRate * overtimeHours;
  const totalPay = regularPay + overtimePay;
  const totalHours = regularHours + overtimeHours;
  const effectiveHourlyRate = totalPay / totalHours;
  
  return {
    regularPay,
    overtimePay,
    totalPay,
    effectiveHourlyRate
  };
}

// Tax Calculation (Simplified - would need location-specific tax tables)
function calculateTaxDeductions(
  annualSalary: number,
  taxRate: number,
  otherDeductions: number = 0
): {
  grossAnnual: number;
  annualTax: number;
  annualOtherDeductions: number;
  netAnnual: number;
  monthlyNet: number;
  biWeeklyNet: number;
  weeklyNet: number;
  hourlyNet: number;
  effectiveTaxRate: number;
} {
  
  const annualTax = annualSalary * (taxRate / 100);
  const netAnnual = annualSalary - annualTax - otherDeductions;
  
  const monthlyNet = netAnnual / 12;
  const biWeeklyNet = netAnnual / 26;
  const weeklyNet = netAnnual / 52;
  const hourlyNet = weeklyNet / 40; // Assuming 40-hour week
  
  const effectiveTaxRate = ((annualTax + otherDeductions) / annualSalary) * 100;
  
  return {
    grossAnnual: annualSalary,
    annualTax,
    annualOtherDeductions: otherDeductions,
    netAnnual,
    monthlyNet,
    biWeeklyNet,
    weeklyNet,
    hourlyNet,
    effectiveTaxRate
  };
}

// Take-Home Pay Calculation with Multiple Deductions
function calculateTakeHomePay(
  annualSalary: number,
  federalTaxRate: number,
  stateTaxRate: number,
  localTaxRate: number,
  socialSecurityRate: number = 6.2,
  medicareRate: number = 1.45,
  insuranceDeductions: number = 0,
  retirementContribution: number = 0,
  otherDeductions: number = 0
): {
  grossPay: number;
  federalTax: number;
  stateTax: number;
  localTax: number;
  socialSecurity: number;
  medicare: number;
  insurance: number;
  retirement: number;
  other: number;
  totalDeductions: number;
  netPay: number;
  netPercentage: number;
  monthlyNet: number;
  biWeeklyNet: number;
} {
  
  const federalTax = annualSalary * (federalTaxRate / 100);
  const stateTax = annualSalary * (stateTaxRate / 100);
  const localTax = annualSalary * (localTaxRate / 100);
  const socialSecurity = annualSalary * (socialSecurityRate / 100);
  const medicare = annualSalary * (medicareRate / 100);
  
  const totalDeductions = federalTax + stateTax + localTax + socialSecurity + medicare + 
                        insuranceDeductions + retirementContribution + otherDeductions;
  
  const netPay = annualSalary - totalDeductions;
  const netPercentage = (netPay / annualSalary) * 100;
  const monthlyNet = netPay / 12;
  const biWeeklyNet = netPay / 26;
  
  return {
    grossPay: annualSalary,
    federalTax,
    stateTax,
    localTax,
    socialSecurity,
    medicare,
    insurance: insuranceDeductions,
    retirement: retirementContribution,
    other: otherDeductions,
    totalDeductions,
    netPay,
    netPercentage,
    monthlyNet,
    biWeeklyNet
  };
}

// Salary Comparison
function compareSalaries(
  salary1: number,
  salary2: number,
  inputType: 'annual' | 'hourly' | 'monthly' | 'weekly'
): {
  salary1Annual: number;
  salary2Annual: number;
  difference: number;
  differencePercentage: number;
  betterOption: 'salary1' | 'salary2' | 'equal';
} {
  
  const conversions1 = calculateSalaryConversions(salary1, inputType);
  const conversions2 = calculateSalaryConversions(salary2, inputType);
  
  const difference = conversions1.annualSalary - conversions2.annualSalary;
  const differencePercentage = (difference / conversions2.annualSalary) * 100;
  
  let betterOption: 'salary1' | 'salary2' | 'equal';
  if (difference > 0) {
    betterOption = 'salary1';
  } else if (difference < 0) {
    betterOption = 'salary2';
  } else {
    betterOption = 'equal';
  }
  
  return {
    salary1Annual: conversions1.annualSalary,
    salary2Annual: conversions2.annualSalary,
    difference,
    differencePercentage,
    betterOption
  };
}

// Cost of Living Adjustment
function calculateCostOfLivingAdjustment(
  currentSalary: number,
  currentLocationCOL: number,
  newLocationCOL: number
): {
  adjustedSalary: number;
  salaryDifference: number;
  percentageChange: number;
  purchasingPowerChange: number;
} {
  
  const adjustedSalary = currentSalary * (newLocationCOL / currentLocationCOL);
  const salaryDifference = adjustedSalary - currentSalary;
  const percentageChange = ((adjustedSalary - currentSalary) / currentSalary) * 100;
  const purchasingPowerChange = ((currentLocationCOL - newLocationCOL) / currentLocationCOL) * 100;
  
  return {
    adjustedSalary,
    salaryDifference,
    percentageChange,
    purchasingPowerChange
  };
}
```

---

## How to Use Content (for SEO section)

1. Select your input type (annual, hourly, monthly, or weekly)
2. Enter the amount for that type
3. Set your hours per week (default 40)
4. Adjust weeks per year if needed (default 52)
5. Click calculate to see conversions to all salary types
6. Calculate tax deductions for take-home pay
7. Use overtime calculator for extra pay calculations
8. Copy results for salary negotiations or job comparisons

---

## About Content (for SEO section)

Our free salary calculator helps you instantly convert between annual, hourly, monthly, and weekly pay rates. Enter your salary in any format and see the equivalent in all other pay periods. Calculate overtime pay with different multipliers for time-and-a-half, double-time, or custom rates. Estimate your take-home pay with tax deductions including federal, state, local taxes, Social Security, Medicare, insurance, and retirement contributions. Compare different salary offers to see which provides better compensation. Calculate cost of living adjustments when moving to different cities. Perfect for job seekers comparing offers, employers determining compensation, and anyone wanting to understand their complete salary breakdown. All calculations happen in your browser with complete privacy.