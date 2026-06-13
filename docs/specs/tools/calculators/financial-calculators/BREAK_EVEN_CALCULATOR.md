# SPEC: Break-Even Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/BREAK_EVEN_CALCULATOR.md`
**Status:** Pending
**Slug:** `break-even-calculator`
**Category:** calculator
**Subcategory`: financial-calculators

---

## SEO

- **Title:** `Break-Even Calculator — Fixed/Variable Costs Analysis | ToolForge`
- **Description:** `Calculate break-even point for your business with our free calculator. Analyze fixed costs, variable costs, and pricing to find profitability.`
- **Primary Keyword:** break-even calculator
- **Secondary Keywords:** break-even analysis calculator, fixed variable cost calculator, business break-even point, profit calculator

---

## Functional Requirements

- [ ] Fixed costs input
- [ ] Variable cost per unit input
- [ ] Selling price per unit input
- [ ] Real-time break-even point calculation
- [ ] Display break-even units and revenue
- [ ] Profit/loss analysis at different sales levels
- [ ] Margin of safety calculation
- [ ] Contribution margin calculation
- [ ] Target profit analysis
- [ ] Multiple product break-even analysis
- [ ] Break-even chart visualization
- [ ] Sensitivity analysis for price/cost changes
- [ ] Export results to CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in break-even formulas)

---

## Library

No external library needed — use built-in break-even analysis formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Break-Even Calculator                  │
├─────────────────────────────────────────┤
│  Fixed Costs: [$10,000      ]         │
│  Variable Cost per Unit: [$5     ]    │
│  Selling Price per Unit: [$15    ]    │
│                                         │
│  [Calculate Break-Even]                │
├─────────────────────────────────────────┤
│  Results:                               │
│  Break-Even Units: 1,000 units         │
│  Break-Even Revenue: $15,000          │
│  Contribution Margin: $10/unit         │
│  Contribution Margin Ratio: 66.67%     │
│                                         │
│  Profit Analysis:                       │
│  At 500 units: -$5,000 (loss)         │
│  At 1,000 units: $0 (break-even)      │
│  At 1,500 units: $5,000 (profit)      │
│                                         │
│  [Margin of Safety]                     │
│  [Target Profit Analysis]               │
│  [View Break-Even Chart]                │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  currentSales: number;
  currentProfit: number;
  targetProfit: number;
  requiredUnitsForTarget: number;
  marginOfSafety: number;
  marginOfSafetyRatio: number;
}
```

---

## Formulas

```typescript
// Break-Even Point Formula: BE = Fixed Costs / (Price - Variable Cost)
// Where: BE = Break-Even Units, Price = Selling Price, Variable Cost = Cost per unit

function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number
): {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  formula: string;
} {
  
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  
  if (contributionMargin <= 0) {
    return {
      breakEvenUnits: Infinity,
      breakEvenRevenue: Infinity,
      contributionMargin,
      contributionMarginRatio: 0,
      formula: 'Break-even impossible: Contribution margin must be positive'
    };
  }
  
  const breakEvenUnits = fixedCosts / contributionMargin;
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;
  const contributionMarginRatio = (contributionMargin / sellingPricePerUnit) * 100;
  
  const formula = `BE = ${fixedCosts} / (${sellingPricePerUnit} - ${variableCostPerUnit}) = ${breakEvenUnits.toFixed(2)} units`;
  
  return {
    breakEvenUnits,
    breakEvenRevenue,
    contributionMargin,
    contributionMarginRatio,
    formula
  };
}

// Profit/Loss Calculation
// Profit = (Selling Price - Variable Cost) × Units Sold - Fixed Costs

function calculateProfitAtSalesLevel(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  unitsSold: number
): {
  profit: number;
  revenue: number;
  totalVariableCosts: number;
  totalCosts: number;
  contributionMargin: number;
} {
  
  const revenue = unitsSold * sellingPricePerUnit;
  const totalVariableCosts = unitsSold * variableCostPerUnit;
  const contributionMargin = revenue - totalVariableCosts;
  const totalCosts = fixedCosts + totalVariableCosts;
  const profit = contributionMargin - fixedCosts;
  
  return {
    profit,
    revenue,
    totalVariableCosts,
    totalCosts,
    contributionMargin
  };
}

// Margin of Safety
// Margin of Safety = (Current Sales - Break-Even Sales) / Current Sales

function calculateMarginOfSafety(
  currentSalesUnits: number,
  breakEvenUnits: number,
  sellingPricePerUnit: number
): {
  marginOfSafetyUnits: number;
  marginOfSafetyRevenue: number;
  marginOfSafetyRatio: number;
  interpretation: string;
} {
  
  const marginOfSafetyUnits = currentSalesUnits - breakEvenUnits;
  const marginOfSafetyRevenue = marginOfSafetyUnits * sellingPricePerUnit;
  const marginOfSafetyRatio = currentSalesUnits > 0 ? 
    (marginOfSafetyUnits / currentSalesUnits) * 100 : 0;
  
  let interpretation: string;
  if (marginOfSafetyRatio < 10) {
    interpretation = 'Low margin of safety - business is vulnerable to sales decline';
  } else if (marginOfSafetyRatio < 20) {
    interpretation = 'Moderate margin of safety - some cushion against sales decline';
  } else {
    interpretation = 'High margin of safety - good buffer against sales decline';
  }
  
  return {
    marginOfSafetyUnits,
    marginOfSafetyRevenue,
    marginOfSafetyRatio,
    interpretation
  };
}

// Target Profit Analysis
// Required Units = (Fixed Costs + Target Profit) / Contribution Margin

function calculateUnitsForTargetProfit(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  targetProfit: number
): {
  requiredUnits: number;
  requiredRevenue: number;
  formula: string;
} {
  
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
  
  if (contributionMargin <= 0) {
    return {
      requiredUnits: Infinity,
      requiredRevenue: Infinity,
      formula: 'Target profit impossible: Contribution margin must be positive'
    };
  }
  
  const requiredUnits = (fixedCosts + targetProfit) / contributionMargin;
  const requiredRevenue = requiredUnits * sellingPricePerUnit;
  const formula = `Units = (${fixedCosts} + ${targetProfit}) / ${contributionMargin} = ${requiredUnits.toFixed(2)}`;
  
  return {
    requiredUnits,
    requiredRevenue,
    formula
  };
}

// Multiple Product Break-Even Analysis
function calculateMultiProductBreakEven(
  products: Array<{
    name: string;
    sellingPrice: number;
    variableCost: number;
    salesMix: number; // percentage of total sales
  }>,
  totalFixedCosts: number
): {
  weightedContributionMargin: number;
  breakEvenRevenue: number;
  productBreakdown: Array<{
    name: string;
    contributionMargin: number;
    breakEvenUnits: number;
    breakEvenRevenue: number;
  }>;
} {
  
  // Calculate weighted average contribution margin
  let weightedContributionMargin = 0;
  const productBreakdown = [];
  
  products.forEach(product => {
    const contributionMargin = product.sellingPrice - product.variableCost;
    const weightedCM = contributionMargin * (product.salesMix / 100);
    weightedContributionMargin += weightedCM;
  });
  
  // Calculate total break-even revenue
  const breakEvenRevenue = totalFixedCosts / (weightedContributionMargin / 100);
  
  // Calculate break-even for each product
  products.forEach(product => {
    const contributionMargin = product.sellingPrice - product.variableCost;
    const productRevenue = breakEvenRevenue * (product.salesMix / 100);
    const breakEvenUnits = productRevenue / product.sellingPrice;
    
    productBreakdown.push({
      name: product.name,
      contributionMargin,
      breakEvenUnits,
      breakEvenRevenue: productRevenue
    });
  });
  
  return {
    weightedContributionMargin,
    breakEvenRevenue,
    productBreakdown
  };
}

// Sensitivity Analysis
function performSensitivityAnalysis(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  priceChangePercent: number,
  variableCostChangePercent: number,
  fixedCostChangePercent: number
): {
  originalBreakEven: {units: number, revenue: number};
  newBreakEven: {units: number, revenue: number};
  changeInUnits: number;
  changeInRevenue: number;
  impact: string;
} {
  
  const originalResult = calculateBreakEven(fixedCosts, variableCostPerUnit, sellingPricePerUnit);
  
  const newFixedCosts = fixedCosts * (1 + fixedCostChangePercent / 100);
  const newVariableCost = variableCostPerUnit * (1 + variableCostChangePercent / 100);
  const newSellingPrice = sellingPricePerUnit * (1 + priceChangePercent / 100);
  
  const newResult = calculateBreakEven(newFixedCosts, newVariableCost, newSellingPrice);
  
  const changeInUnits = newResult.breakEvenUnits - originalResult.breakEvenUnits;
  const changeInRevenue = newResult.breakEvenRevenue - originalResult.breakEvenRevenue;
  
  let impact: string;
  if (changeInUnits > 0) {
    impact = `Break-even point increases by ${changeInUnits.toFixed(2)} units (${changeInRevenue.toFixed(2)} revenue)`;
  } else if (changeInUnits < 0) {
    impact = `Break-even point decreases by ${Math.abs(changeInUnits).toFixed(2)} units (${Math.abs(changeInRevenue).toFixed(2)} revenue)`;
  } else {
    impact = 'No change in break-even point';
  }
  
  return {
    originalBreakEven: {
      units: originalResult.breakEvenUnits,
      revenue: originalResult.breakEvenRevenue
    },
    newBreakEven: {
      units: newResult.breakEvenUnits,
      revenue: newResult.breakEvenRevenue
    },
    changeInUnits,
    changeInRevenue,
    impact
  };
}

// Cost-Volume-Profit (CVP) Analysis
function generateCVPAnalysis(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  maxUnits: number
): Array<{
  units: number;
  revenue: number;
  totalCosts: number;
  profit: number;
  cumulativeProfit: number;
}> {
  
  const cvpData = [];
  
  for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits / 10)) {
    const result = calculateProfitAtSalesLevel(
      fixedCosts,
      variableCostPerUnit,
      sellingPricePerUnit,
      units
    );
    
    cvpData.push({
      units,
      revenue: result.revenue,
      totalCosts: result.totalCosts,
      profit: result.profit,
      cumulativeProfit: result.profit
    });
  }
  
  return cvpData;
}

// Degree of Operating Leverage
// DOL = Contribution Margin / Profit
function calculateOperatingLeverage(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number,
  currentSalesUnits: number
): {
  degreeOfOperatingLeverage: number;
  interpretation: string;
  profitChangePercent: number;
  salesChangePercent: number;
} {
  
  const profitResult = calculateProfitAtSalesLevel(
    fixedCosts,
    variableCostPerUnit,
    sellingPricePerUnit,
    currentSalesUnits
  );
  
  if (profitResult.profit <= 0) {
    return {
      degreeOfOperatingLeverage: Infinity,
      interpretation: 'Operating leverage undefined at break-even or loss',
      profitChangePercent: 0,
      salesChangePercent: 0
    };
  }
  
  const degreeOfOperatingLeverage = profitResult.contributionMargin / profitResult.profit;
  
  let interpretation: string;
  if (degreeOfOperatingLeverage > 4) {
    interpretation = 'High operating leverage - profits will change significantly with sales changes';
  } else if (degreeOfOperatingLeverage > 2) {
    interpretation = 'Moderate operating leverage - moderate profit sensitivity to sales changes';
  } else {
    interpretation = 'Low operating leverage - profits relatively stable with sales changes';
  }
  
  // Calculate impact of 10% sales increase
  const salesChangePercent = 10;
  const profitChangePercent = degreeOfOperatingLeverage * salesChangePercent;
  
  return {
    degreeOfOperatingLeverage,
    interpretation,
    profitChangePercent,
    salesChangePercent
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter your fixed costs (rent, salaries, insurance, etc.)
2. Input variable cost per unit (materials, labor, etc.)
3. Set your selling price per unit
4. Click calculate to see your break-even point
5. Review profit/loss at different sales levels
6. Calculate margin of safety for current sales
7. Determine units needed for target profit
8. Analyze sensitivity to price and cost changes

---

## About Content (for SEO section)

Our free break-even calculator helps businesses determine the exact point where total revenue equals total costs. Enter your fixed costs, variable costs per unit, and selling price to instantly calculate your break-even point in units and revenue. Understand your contribution margin and how it affects profitability. Analyze profit and loss at different sales levels to see how volume impacts your bottom line. Calculate margin of safety to measure your risk buffer against sales declines. Perform target profit analysis to determine how many units you need to sell to achieve specific profit goals. Conduct sensitivity analysis to see how changes in price, costs, or fixed expenses affect your break-even point. Perfect for startups, small businesses, and entrepreneurs planning new ventures or analyzing existing operations. All calculations happen in your browser with complete privacy.