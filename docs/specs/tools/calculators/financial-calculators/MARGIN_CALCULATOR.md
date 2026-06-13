# SPEC: Margin Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/MARGIN_CALCULATOR.md`
**Status:** Pending
**Slug:** `margin-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Margin Calculator — Calculate Profit Margin Percentage | ToolForge`
- **Description:** `Calculate profit margin, gross margin, and markup percentages instantly. Free margin calculator for pricing, cost analysis, and business profitability.`
- **Primary Keyword:** margin calculator
- **Secondary Keywords:** profit margin calculator, gross margin calculator, markup calculator, business margin calculator

---

## Functional Requirements

- [ ] Cost price input
- [ ] Selling price input
- [ ] Real-time margin calculation
- [ ] Display profit margin as percentage
- [ ] Display profit amount
- [ ] Calculate markup percentage
- [ ] Support for gross margin vs net margin
- [ ] Multiple products calculation
- [ ] Reverse calculation (find selling price from target margin)
- [ ] Margin vs Markup comparison
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in margin formulas)

---

## Library

No external library needed — use built-in margin calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Margin Calculator                     │
├─────────────────────────────────────────┤
│  Cost Price: [$50.00       ]          │
│  Selling Price: [$75.00       ]       │
│                                         │
│  [Calculate Margin]                     │
├─────────────────────────────────────────┤
│  Results:                               │
│  Cost Price: $50.00                    │
│  Selling Price: $75.00                  │
│  Profit: $25.00                        │
│                                         │
│  Profit Margin: 33.33%                 │
│  Markup: 50.00%                        │
│                                         │
│  [Calculate Reverse (Target Margin)]     │
│  [Compare Margin vs Markup]             │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  costPrice: number;
  sellingPrice: number;
  marginType: 'gross' | 'net';
  profitAmount: number;
  profitMargin: number; // percentage
  markupPercentage: number;
  targetMargin: number;
  reverseMode: boolean;
  showComparison: boolean;
}
```

---

## Formulas

```typescript
// Profit Margin Formula: Profit Margin = (Profit / Revenue) × 100
// Where: Profit = Revenue - Cost, Revenue = Selling Price

function calculateProfitMargin(costPrice: number, sellingPrice: number): {
  profitAmount: number;
  profitMargin: number;
  markupPercentage: number;
} {
  
  const profitAmount = sellingPrice - costPrice;
  
  if (sellingPrice === 0) {
    return {
      profitAmount,
      profitMargin: 0,
      markupPercentage: costPrice === 0 ? 0 : (profitAmount / costPrice) * 100
    };
  }
  
  const profitMargin = (profitAmount / sellingPrice) * 100;
  const markupPercentage = costPrice === 0 ? 0 : (profitAmount / costPrice) * 100;
  
  return {
    profitAmount,
    profitMargin,
    markupPercentage
  };
}

// Markup Formula: Markup = (Profit / Cost) × 100
// This is already calculated in the above function

// Reverse Calculation: Find Selling Price from Target Margin
// Selling Price = Cost / (1 - Target Margin/100)

function calculateSellingPriceFromMargin(costPrice: number, targetMargin: number): {
  sellingPrice: number;
  profitAmount: number;
  actualMargin: number;
} {
  
  if (targetMargin >= 100) {
    // Invalid margin (cannot have 100%+ margin)
    return {
      sellingPrice: costPrice * 2, // fallback
      profitAmount: costPrice,
      actualMargin: 50
    };
  }
  
  const sellingPrice = costPrice / (1 - targetMargin / 100);
  const profitAmount = sellingPrice - costPrice;
  const actualMargin = (profitAmount / sellingPrice) * 100;
  
  return {
    sellingPrice,
    profitAmount,
    actualMargin
  };
}

// Find Cost Price from Target Margin and Selling Price
function calculateCostFromMargin(sellingPrice: number, targetMargin: number): {
  costPrice: number;
  profitAmount: number;
  actualMargin: number;
} {
  
  const costPrice = sellingPrice * (1 - targetMargin / 100);
  const profitAmount = sellingPrice - costPrice;
  const actualMargin = (profitAmount / sellingPrice) * 100;
  
  return {
    costPrice,
    profitAmount,
    actualMargin
  };
}

// Margin vs Markup Comparison
function compareMarginAndMarkup(costPrice: number, sellingPrice: number) {
  const result = calculateProfitMargin(costPrice, sellingPrice);
  
  return {
    margin: result.profitMargin,
    markup: result.markupPercentage,
    relationship: `Markup is ${((result.markupPercentage / result.profitMargin) * 100).toFixed(1)}% of margin`,
    note: "Markup is calculated on cost, Margin is calculated on selling price"
  };
}

// Gross Margin vs Net Margin
function calculateGrossVsNetMargin(
  costPrice: number,
  sellingPrice: number,
  operatingExpenses: number = 0,
  taxes: number = 0
): {
  grossMargin: number;
  netMargin: number;
  grossProfit: number;
  netProfit: number;
} {
  
  const grossProfit = sellingPrice - costPrice;
  const grossMargin = (grossProfit / sellingPrice) * 100;
  
  const netProfit = grossProfit - operatingExpenses - taxes;
  const netMargin = (netProfit / sellingPrice) * 100;
  
  return {
    grossMargin,
    netMargin,
    grossProfit,
    netProfit
  };
}

// Multiple Products Margin Calculation
function calculateMultipleProductMargin(products: Array<{cost: number, sellingPrice: number, quantity: number}>): {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  overallMargin: number;
  productBreakdown: Array<{
    cost: number,
    sellingPrice: number,
    quantity: number,
    profit: number,
    margin: number,
    totalRevenue: number,
    totalCost: number
  }>;
} {
  
  let totalRevenue = 0;
  let totalCost = 0;
  const productBreakdown = [];
  
  products.forEach(product => {
    const productTotalRevenue = product.sellingPrice * product.quantity;
    const productTotalCost = product.cost * product.quantity;
    const productProfit = productTotalRevenue - productTotalCost;
    const productMargin = (productProfit / productTotalRevenue) * 100;
    
    totalRevenue += productTotalRevenue;
    totalCost += productTotalCost;
    
    productBreakdown.push({
      cost: product.cost,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      profit: productProfit,
      margin: productMargin,
      totalRevenue: productTotalRevenue,
      totalCost: productTotalCost
    });
  });
  
  const totalProfit = totalRevenue - totalCost;
  const overallMargin = (totalProfit / totalRevenue) * 100;
  
  return {
    totalRevenue,
    totalCost,
    totalProfit,
    overallMargin,
    productBreakdown
  };
}

// Break-Even Price (No profit, no loss)
function calculateBreakEvenPrice(costPrice: number): number {
  return costPrice; // Break-even price equals cost
}

// Target Profit Price
function calculateTargetProfitPrice(costPrice: number, targetProfit: number): {
  sellingPrice: number;
  profitMargin: number;
} {
  
  const sellingPrice = costPrice + targetProfit;
  const profitMargin = (targetProfit / sellingPrice) * 100;
  
  return {
    sellingPrice,
    profitMargin
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter your cost price (what you paid to produce/acquire)
2. Input your selling price (what you charge customers)
3. Click calculate to see your profit margin and markup
4. Review the profit amount and percentages
5. Use reverse calculation to find selling price for target margin
6. Compare margin vs markup to understand the difference
7. Calculate gross vs net margin for more detailed analysis

---

## About Content (for SEO section)

Our free margin calculator helps businesses and individuals calculate profit margins, markups, and pricing strategies. Enter the cost price and selling price to instantly see your profit margin percentage, markup percentage, and absolute profit amount. The calculator explains the difference between margin (calculated on selling price) and markup (calculated on cost), helping you understand pricing strategies. Use reverse calculation to determine the selling price needed to achieve a specific profit margin. Calculate gross margin vs net margin by including operating expenses and taxes for more accurate business analysis. Perfect for retailers, manufacturers, service providers, and anyone who needs to understand pricing and profitability. All calculations happen in your browser with complete privacy.