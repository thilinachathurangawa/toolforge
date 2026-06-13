# SPEC: Percent Off Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/PERCENT_OFF_CALCULATOR.md`
**Status:** Pending
**Slug:** `percent-off-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Percent Off Calculator — Calculate Sale Price from % Discount | ToolForge`
- **Description:** `Calculate sale prices from percent discounts instantly. Free percent off calculator for shopping deals, sales, and discount calculations.`
- **Primary Keyword:** percent off calculator
- **Secondary Keywords:** sale price calculator, percentage discount calculator, shopping discount calculator, percent off deal calculator

---

## Functional Requirements

- [ ] Original price input
- [ ] Percent off input (1-100%)
- [ ] Real-time sale price calculation
- [ ] Display amount saved
- [ ] Quick percent buttons (10%, 20%, 25%, 50%, 75%)
- [ ] Multiple item calculation (quantity × price)
- [ ] Comparison table for different discounts
- [ ] Fractional percent support (e.g., 33.33%)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in percent formulas)

---

## Library

No external library needed — use built-in percent formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Percent Off Calculator                 │
├─────────────────────────────────────────┤
│  Original Price: [$50.00       ]       │
│  Quantity: [1]                          │
│                                         │
│  Percent Off: [%25        ]             │
│  Quick: [10%] [20%] [25%] [50%] [75%]  │
│                                         │
│  [Calculate Sale Price]                 │
├─────────────────────────────────────────┤
│  Results:                               │
│  Original Price: $50.00               │
│  Percent Off: 25%                      │
│  Amount Saved: $12.50                  │
│  Sale Price: $37.50                     │
│                                         │
│  Total for 1 item: $37.50              │
│                                         │
│  [Compare Different Discounts]         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  originalPrice: number;
  quantity: number;
  percentOff: number;
  salePrice: number;
  amountSaved: number;
  amountSavedPerItem: number;
  totalOriginalPrice: number;
  totalSalePrice: number;
  totalAmountSaved: number;
  quickPercentages: number[];
  showComparison: boolean;
}
```

---

## Formulas

```typescript
// Percent Off Formula: Sale Price = Original Price × (1 - Percent Off/100)
// Amount Saved = Original Price × (Percent Off/100)

function calculatePercentOff(originalPrice: number, percentOff: number, quantity: number = 1): {
  salePrice: number;
  amountSavedPerItem: number;
  totalOriginalPrice: number;
  totalSalePrice: number;
  totalAmountSaved: number;
} {
  
  const amountSavedPerItem = originalPrice * (percentOff / 100);
  const salePrice = originalPrice - amountSavedPerItem;
  
  const totalOriginalPrice = originalPrice * quantity;
  const totalSalePrice = salePrice * quantity;
  const totalAmountSaved = amountSavedPerItem * quantity;
  
  return {
    salePrice,
    amountSavedPerItem,
    totalOriginalPrice,
    totalSalePrice,
    totalAmountSaved
  };
}

// Generate Comparison Table for Different Percent Off Values
function generateDiscountComparison(originalPrice: number, quantity: number = 1) {
  const commonDiscounts = [10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
  
  return commonDiscounts.map(percentOff => {
    const result = calculatePercentOff(originalPrice, percentOff, quantity);
    return {
      percentOff,
      salePrice: result.salePrice,
      amountSaved: result.amountSavedPerItem,
      totalSalePrice: result.totalSalePrice,
      totalAmountSaved: result.totalAmountSaved
    };
  });
}

// Find Percent Off from Original and Sale Price
function calculatePercentFromPrices(originalPrice: number, salePrice: number): number {
  if (originalPrice === 0) return 0;
  
  const discountAmount = originalPrice - salePrice;
  const percentOff = (discountAmount / originalPrice) * 100;
  
  return Math.max(0, Math.min(100, percentOff));
}

// Find Original Price from Sale Price and Percent Off
function calculateOriginalFromSale(salePrice: number, percentOff: number): number {
  if (percentOff >= 100) return salePrice;
  
  const originalPrice = salePrice / (1 - percentOff / 100);
  return originalPrice;
}

// Bulk Discount Calculator (Tiered Pricing)
function calculateBulkDiscount(
  originalPrice: number,
  quantity: number,
  tiers: Array<{minQty: number, percentOff: number}>
): {
  totalSalePrice: number;
  totalAmountSaved: number;
  appliedPercent: number;
} {
  
  // Find applicable tier
  let appliedPercent = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (quantity >= tiers[i].minQty) {
      appliedPercent = tiers[i].percentOff;
      break;
    }
  }
  
  const result = calculatePercentOff(originalPrice, appliedPercent, quantity);
  
  return {
    totalSalePrice: result.totalSalePrice,
    totalAmountSaved: result.totalAmountSaved,
    appliedPercent
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter the original price of the item
2. Set the quantity (if buying multiple items)
3. Input the percent off or use quick percentage buttons
4. Click calculate to see the sale price and amount saved
5. View the total savings for your quantity
6. Compare different percentage discounts using the comparison table
7. Copy the results for your shopping planning

---

## About Content (for SEO section)

Our free percent off calculator helps you quickly calculate sale prices and savings from percentage discounts. Enter the original price and percentage off to instantly see the sale price and how much you'll save. The calculator includes quick percentage buttons (10%, 20%, 25%, 50%, 75%) for common discounts and supports fractional percentages for precise calculations. Calculate savings for single or multiple items with the quantity feature. Use the comparison table to see how different discount percentages affect the final price. Perfect for Black Friday sales, holiday shopping, clearance events, and everyday discount calculations. Whether you're shopping for clothes, electronics, groceries, or any other items, this calculator ensures you always know the real savings. All calculations happen in your browser with complete privacy.