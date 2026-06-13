# SPEC: Discount Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/DISCOUNT_CALCULATOR.md`
**Status:** Pending
**Slug:** `discount-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Discount Calculator — Calculate % Off Sale Price | ToolForge`
- **Description:** `Calculate discount amounts and final sale prices instantly. Free discount calculator for shopping, sales, and percentage off calculations.`
- **Primary Keyword:** discount calculator
- **Secondary Keywords:** percent off calculator, sale price calculator, discount percentage calculator, shopping calculator

---

## Functional Requirements

- [ ] Original price input
- [ ] Discount percentage input
- [ ] Real-time discount amount calculation
- [ ] Display final sale price
- [ ] Show savings amount
- [ ] Support for fixed amount discount
- [ ] Multiple discount calculation (stacked discounts)
- [ ] Reverse calculation (find original price from sale price)
- [ ] Comparison with original price
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in discount formulas)

---

## Library

No external library needed — use built-in discount formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Discount Calculator                    │
├─────────────────────────────────────────┤
│  Original Price: [$100.00      ]      │
│  Discount: [%20          ]              │
│                                         │
│  [Calculate Discount]                   │
├─────────────────────────────────────────┤
│  Results:                               │
│  Original Price: $100.00               │
│  Discount Amount: $20.00               │
│  Final Price: $80.00                   │
│  You Save: $20.00 (20%)                │
│                                         │
│  [Calculate Reverse Discount]           │
│  [Stack Multiple Discounts]             │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  originalPrice: number;
  discountPercentage: number;
  discountMode: 'percentage' | 'fixed';
  fixedDiscountAmount: number;
  finalPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  reverseMode: boolean;
  salePrice: number;
  originalFromSale: number;
  stackedDiscounts: Array<{type: 'percentage' | 'fixed', value: number}>;
}
```

---

## Formulas

```typescript
// Discount Formula: Final Price = Original Price × (1 - Discount%)
// Discount Amount = Original Price × Discount%

function calculateDiscount(originalPrice: number, discountPercentage: number): {
  discountAmount: number;
  finalPrice: number;
  savingsPercentage: number;
} {
  const discountAmount = originalPrice * (discountPercentage / 100);
  const finalPrice = originalPrice - discountAmount;
  
  return {
    discountAmount,
    finalPrice,
    savingsPercentage: discountPercentage
  };
}

// Fixed Amount Discount
function calculateFixedDiscount(originalPrice: number, discountAmount: number): {
  discountPercentage: number;
  finalPrice: number;
} {
  const discountPercentage = (discountAmount / originalPrice) * 100;
  const finalPrice = originalPrice - discountAmount;
  
  return {
    discountPercentage,
    finalPrice: Math.max(0, finalPrice)
  };
}

// Reverse Calculation: Find Original Price from Sale Price
// Original Price = Sale Price / (1 - Discount%)

function calculateOriginalPrice(salePrice: number, discountPercentage: number): number {
  if (discountPercentage >= 100) {
    return salePrice; // Edge case: 100% discount
  }
  
  const originalPrice = salePrice / (1 - discountPercentage / 100);
  return originalPrice;
}

// Stacked Discounts (Multiple discounts applied sequentially)
function calculateStackedDiscounts(
  originalPrice: number,
  discounts: Array<{type: 'percentage' | 'fixed', value: number}>
): {
  finalPrice: number;
  totalDiscount: number;
  totalSavingsPercentage: number;
  breakdown: Array<{description: string, price: number, discount: number}>;
} {
  
  let currentPrice = originalPrice;
  const breakdown = [];
  
  discounts.forEach((discount, index) => {
    const previousPrice = currentPrice;
    
    if (discount.type === 'percentage') {
      const discountAmount = currentPrice * (discount.value / 100);
      currentPrice -= discountAmount;
      breakdown.push({
        description: `Discount ${index + 1} (${discount.value}%)`,
        price: previousPrice,
        discount: discountAmount
      });
    } else {
      // Fixed amount discount
      currentPrice -= discount.value;
      breakdown.push({
        description: `Discount ${index + 1} ($${discount.value})`,
        price: previousPrice,
        discount: discount.value
      });
    }
    
    currentPrice = Math.max(0, currentPrice);
  });
  
  const totalDiscount = originalPrice - currentPrice;
  const totalSavingsPercentage = (totalDiscount / originalPrice) * 100;
  
  return {
    finalPrice: currentPrice,
    totalDiscount,
    totalSavingsPercentage,
    breakdown
  };
}

// Buy One Get One (BOGO) and Special Deals
function calculateSpecialDeal(originalPrice: number, dealType: string, quantity: number): {
  finalPrice: number;
  savings: number;
  effectiveDiscount: number;
} {
  
  switch(dealType {
    case 'bogo':
      // Buy one get one free
      const pairs = Math.floor(quantity / 2);
      const paidItems = pairs + (quantity % 2);
      const finalPrice = paidItems * originalPrice;
      const savings = (quantity * originalPrice) - finalPrice;
      return {
        finalPrice,
        savings,
        effectiveDiscount: (savings / (quantity * originalPrice)) * 100
      };
      
    case 'buy2get1':
      // Buy 2 get 1 free
      const groups = Math.floor(quantity / 3);
      const paidItems = (groups * 2) + (quantity % 3);
      const finalPrice = paidItems * originalPrice;
      const savings = (quantity * originalPrice) - finalPrice;
      return {
        finalPrice,
        savings,
        effectiveDiscount: (savings / (quantity * originalPrice)) * 100
      };
      
    default:
      return {
        finalPrice: quantity * originalPrice,
        savings: 0,
        effectiveDiscount: 0
      };
  }
}
```

---

## How to Use Content (for SEO section)

1. Enter the original price of the item
2. Input the discount percentage offered
3. Click calculate to see the discount amount and final price
4. View your savings in both amount and percentage
5. Use reverse calculation to find original price from sale price
6. Stack multiple discounts for complex sale scenarios
7. Copy the results for your shopping records

---

## About Content (for SEO section)

Our free discount calculator helps you quickly calculate sale prices and savings. Enter the original price and discount percentage to instantly see the discounted price and how much you'll save. Perfect for shopping during sales, comparing deals, and understanding the true value of discounts. The calculator supports percentage discounts, fixed amount discounts, and even stacked discounts for complex sales scenarios. Use the reverse calculation feature to determine the original price when you only know the sale price and discount percentage. Whether you're shopping for clothes, electronics, or any other items, this calculator ensures you always know the real cost and savings. All calculations happen in your browser with complete privacy.