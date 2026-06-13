# SPEC: Commission Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/COMMISSION_CALCULATOR.md`
**Status:** Pending
**Slug:** `commission-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Commission Calculator — Calculate Sales Commission | ToolForge`
- **Description:** `Calculate sales commissions instantly with our free commission calculator. Support for flat rates, tiered commissions, and base salary plus commission structures.`
- **Primary Keyword:** commission calculator
- **Secondary Keywords:** sales commission calculator, tiered commission calculator, commission rate calculator, sales rep calculator

---

## Functional Requirements

- [ ] Sales amount input
- [ ] Commission rate input (percentage)
- [ ] Real-time commission calculation
- [ ] Display commission amount
- [ ] Support for flat rate commission
- [ ] Support for tiered commission structure
- [ ] Base salary plus commission calculation
- [ ] Multiple sales/calculation support
- [ ] Reverse calculation (find sales from target commission)
- [ ] Commission vs salary comparison
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in commission formulas)

---

## Library

No external library needed — use built-in commission calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Commission Calculator                 │
├─────────────────────────────────────────┤
│  Sales Amount: [$10,000     ]        │
│                                         │
│  Commission Structure: [Flat Rate ▼]   │
│                                         │
│  Commission Rate: [%10          ]      │
│  Base Salary: [$0          ]            │
│                                         │
│  [Calculate Commission]                │
├─────────────────────────────────────────┤
│  Results:                               │
│  Sales Amount: $10,000.00             │
│  Commission Rate: 10%                  │
│  Commission: $1,000.00                │
│  Base Salary: $0.00                   │
│  Total Earnings: $1,000.00             │
│                                         │
│  [Tiered Commission Structure]          │
│  [Reverse Calculation]                 │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  salesAmount: number;
  commissionStructure: 'flat' | 'tiered' | 'graduated';
  commissionRate: number;
  baseSalary: number;
  commissionAmount: number;
  totalEarnings: number;
  tieredRates: Array<{minSales: number, maxSales: number | null, rate: number}>;
  reverseMode: boolean;
  targetCommission: number;
  requiredSales: number;
}
```

---

## Formulas

```typescript
// Flat Rate Commission: Commission = Sales Amount × (Commission Rate/100)

function calculateFlatCommission(salesAmount: number, commissionRate: number, baseSalary: number = 0): {
  commissionAmount: number;
  totalEarnings: number;
  effectiveRate: number;
} {
  
  const commissionAmount = salesAmount * (commissionRate / 100);
  const totalEarnings = baseSalary + commissionAmount;
  const effectiveRate = (commissionAmount / salesAmount) * 100;
  
  return {
    commissionAmount,
    totalEarnings,
    effectiveRate
  };
}

// Tiered Commission Structure
// Different commission rates for different sales ranges

function calculateTieredCommission(
  salesAmount: number,
  tiers: Array<{minSales: number, maxSales: number | null, rate: number}>,
  baseSalary: number = 0
): {
  commissionAmount: number;
  totalEarnings: number;
  effectiveRate: number;
  tierBreakdown: Array<{tier: number, salesInTier: number, rate: number, commission: number}>;
} {
  
  let commissionAmount = 0;
  let remainingSales = salesAmount;
  const tierBreakdown = [];
  
  // Sort tiers by minimum sales
  const sortedTiers = [...tiers].sort((a, b) => a.minSales - b.minSales);
  
  sortedTiers.forEach((tier, index) => {
    if (remainingSales <= 0) return;
    
    const tierRange = tier.maxSales === null ? Infinity : tier.maxSales - tier.minSales;
    const salesInThisTier = Math.min(remainingSales, tierRange);
    
    if (salesInThisTier > 0) {
      const tierCommission = salesInThisTier * (tier.rate / 100);
      commissionAmount += tierCommission;
      remainingSales -= salesInThisTier;
      
      tierBreakdown.push({
        tier: index + 1,
        salesInTier: salesInThisTier,
        rate: tier.rate,
        commission: tierCommission
      });
    }
  });
  
  const totalEarnings = baseSalary + commissionAmount;
  const effectiveRate = (commissionAmount / salesAmount) * 100;
  
  return {
    commissionAmount,
    totalEarnings,
    effectiveRate,
    tierBreakdown
  };
}

// Graduated Commission (Entire amount at highest tier reached)
function calculateGraduatedCommission(
  salesAmount: number,
  tiers: Array<{minSales: number, rate: number}>,
  baseSalary: number = 0
): {
  commissionAmount: number;
  totalEarnings: number;
  effectiveRate: number;
  appliedTier: number;
} {
  
  // Find the highest tier reached
  let appliedTier = 0;
  let appliedRate = 0;
  
  const sortedTiers = [...tiers].sort((a, b) => a.minSales - b.minSales);
  
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (salesAmount >= sortedTiers[i].minSales) {
      appliedTier = i;
      appliedRate = sortedTiers[i].rate;
      break;
    }
  }
  
  const commissionAmount = salesAmount * (appliedRate / 100);
  const totalEarnings = baseSalary + commissionAmount;
  const effectiveRate = appliedRate;
  
  return {
    commissionAmount,
    totalEarnings,
    effectiveRate,
    appliedTier: appliedTier + 1
  };
}

// Reverse Calculation: Find Sales Required for Target Commission
// Sales = Target Commission / (Commission Rate/100)

function calculateSalesForTargetCommission(
  targetCommission: number,
  commissionRate: number,
  baseSalary: number = 0
): {
  requiredSales: number;
  totalEarnings: number;
} {
  
  const commissionNeeded = targetCommission;
  const requiredSales = commissionNeeded / (commissionRate / 100);
  const totalEarnings = baseSalary + targetCommission;
  
  return {
    requiredSales,
    totalEarnings
  };
}

// Multiple Sales Commission Calculation
function calculateMultipleCommission(
  sales: Array<{amount: number, rate: number}>,
  baseSalary: number = 0
): {
  totalSales: number;
  totalCommission: number;
  totalEarnings: number;
  salesBreakdown: Array<{amount: number, rate: number, commission: number}>;
} {
  
  let totalSales = 0;
  let totalCommission = 0;
  const salesBreakdown = [];
  
  sales.forEach(sale => {
    const commission = sale.amount * (sale.rate / 100);
    totalSales += sale.amount;
    totalCommission += commission;
    
    salesBreakdown.push({
      amount: sale.amount,
      rate: sale.rate,
      commission: commission
    });
  });
  
  const totalEarnings = baseSalary + totalCommission;
  
  return {
    totalSales,
    totalCommission,
    totalEarnings,
    salesBreakdown
  };
}

// Commission vs Salary Comparison
function compareCommissionVsSalary(
  salesAmount: number,
  commissionRate: number,
  alternativeSalary: number
): {
  commissionEarnings: number;
  salaryAlternative: number;
  difference: number;
  betterOption: 'commission' | 'salary' | 'equal';
  breakEvenSales: number;
} {
  
  const commissionEarnings = salesAmount * (commissionRate / 100);
  const difference = commissionEarnings - alternativeSalary;
  
  let betterOption: 'commission' | 'salary' | 'equal';
  if (difference > 0) {
    betterOption = 'commission';
  } else if (difference < 0) {
    betterOption = 'salary';
  } else {
    betterOption = 'equal';
  }
  
  // Calculate break-even point
  const breakEvenSales = alternativeSalary / (commissionRate / 100);
  
  return {
    commissionEarnings,
    salaryAlternative: alternativeSalary,
    difference,
    betterOption,
    breakEvenSales
  };
}

// Common Commission Structure Templates
const COMMISSION_TEMPLATES = {
  realEstate: [
    {minSales: 0, maxSales: 100000, rate: 6},
    {minSales: 100001, maxSales: 500000, rate: 5},
    {minSales: 500001, maxSales: null, rate: 4}
  ],
  softwareSales: [
    {minSales: 0, maxSales: 50000, rate: 10},
    {minSales: 50001, maxSales: 100000, rate: 12},
    {minSales: 100001, maxSales: null, rate: 15}
  ],
  retail: [
    {minSales: 0, maxSales: 10000, rate: 5},
    {minSales: 10001, maxSales: 25000, rate: 7},
    {minSales: 25001, maxSales: null, rate: 10}
  ]
};
```

---

## How to Use Content (for SEO section)

1. Enter your total sales amount
2. Select commission structure (flat rate, tiered, or graduated)
3. Input the commission rate percentage
4. Add base salary if applicable
5. Click calculate to see commission amount and total earnings
6. Use tiered structures for more complex commission plans
7. Calculate required sales for target commission
8. Compare commission earnings vs salary alternatives

---

## About Content (for SEO section)

Our free commission calculator helps sales professionals, businesses, and employers calculate sales commissions accurately. Calculate flat-rate commissions, tiered commission structures, and graduated commission plans with ease. Enter your sales amount and commission rate to instantly see your commission earnings. Include base salary for total compensation calculation. The tiered commission feature supports complex commission structures where different rates apply to different sales ranges. Use reverse calculation to determine how much you need to sell to achieve a target commission. Compare commission earnings against salary alternatives to make informed career decisions. Perfect for sales representatives, real estate agents, business owners, and anyone involved in commission-based compensation. All calculations happen in your browser with complete privacy.