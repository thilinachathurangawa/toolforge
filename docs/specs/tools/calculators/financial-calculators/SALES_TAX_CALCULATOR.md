# SPEC: Sales Tax Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/SALES_TAX_CALCULATOR.md`
**Status:** Pending
**Slug:** `sales-tax-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Sales Tax Calculator — Calculate Tax on Purchase Price | ToolForge`
- **Description:** `Calculate sales tax on any purchase with our free calculator. Support for multiple tax rates, US states, and countries with accurate tax calculations.`
- **Primary Keyword:** sales tax calculator
- **Secondary Keywords:** purchase tax calculator, tax rate calculator, sales tax by state, calculate tax on price

---

## Functional Requirements

- [ ] Purchase price input
- [ ] Tax rate input (percentage)
- [ ] Real-time tax amount calculation
- [ ] Display total price including tax
- [ ] Pre-set tax rates for US states
- [ ] Pre-set tax rates for common countries
- [ ] Multiple items support (quantity calculation)
- [ ] Reverse calculation (price before tax)
- [ ] Tax-exempt calculation
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in tax formulas)

---

## Library

No external library needed — use built-in tax calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Sales Tax Calculator                  │
├─────────────────────────────────────────┤
│  Price Before Tax: [$100.00    ]      │
│  Quantity: [1]                          │
│                                         │
│  Tax Rate: [%8.25        ]              │
│  Quick Rates:                           │
│  [CA 8.25%] [NY 8%] [TX 6.25%] [FL 6%] │
│                                         │
│  [Calculate Tax]                        │
├─────────────────────────────────────────┤
│  Results:                               │
│  Price Before Tax: $100.00             │
│  Tax Amount: $8.25                     │
│  Total Price: $108.25                  │
│                                         │
│  [Calculate Reverse (Price After Tax)]  │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  priceBeforeTax: number;
  quantity: number;
  taxRate: number; // percentage
  taxAmount: number;
  totalPrice: number;
  mode: 'forward' | 'reverse';
  priceAfterTax: number;
  selectedState: string;
  selectedCountry: string;
  taxExempt: boolean;
}
```

---

## Formulas

```typescript
// Sales Tax Formula: Tax Amount = Price × Tax Rate
// Total Price = Price + Tax Amount

function calculateSalesTax(priceBeforeTax: number, taxRate: number, quantity: number = 1): {
  taxAmount: number;
  totalPrice: number;
  taxPerItem: number;
  priceBeforeTaxTotal: number;
} {
  
  const taxPerItem = priceBeforeTax * (taxRate / 100);
  const taxAmount = taxPerItem * quantity;
  const priceBeforeTaxTotal = priceBeforeTax * quantity;
  const totalPrice = priceBeforeTaxTotal + taxAmount;
  
  return {
    taxAmount,
    totalPrice,
    taxPerItem,
    priceBeforeTaxTotal
  };
}

// Reverse Calculation: Find Price Before Tax from Price After Tax
// Price Before Tax = Price After Tax / (1 + Tax Rate/100)

function calculatePriceBeforeTax(priceAfterTax: number, taxRate: number): {
  priceBeforeTax: number;
  taxAmount: number;
} {
  
  const priceBeforeTax = priceAfterTax / (1 + taxRate / 100);
  const taxAmount = priceAfterTax - priceBeforeTax;
  
  return {
    priceBeforeTax,
    taxAmount
  };
}

// US State Tax Rates (simplified - would need API for accurate current rates)
const US_STATE_TAX_RATES: { [key: string]: number } = {
  'AL': 4.00, 'AK': 0.00, 'AZ': 5.60, 'AR': 6.50, 'CA': 7.25,
  'CO': 2.90, 'CT': 6.35, 'DE': 0.00, 'FL': 6.00, 'GA': 4.00,
  'HI': 4.00, 'ID': 6.00, 'IL': 6.25, 'IN': 7.00, 'IA': 6.00,
  'KS': 6.50, 'KY': 6.00, 'LA': 4.45, 'ME': 5.50, 'MD': 6.00,
  'MA': 6.25, 'MI': 6.00, 'MN': 6.88, 'MS': 7.00, 'MO': 4.23,
  'MT': 0.00, 'NE': 5.50, 'NV': 6.85, 'NH': 0.00, 'NJ': 6.63,
  'NM': 5.13, 'NY': 8.00, 'NC': 4.75, 'ND': 5.00, 'OH': 5.75,
  'OK': 4.50, 'OR': 0.00, 'PA': 6.00, 'RI': 7.00, 'SC': 6.00,
  'SD': 4.50, 'TN': 7.00, 'TX': 6.25, 'UT': 5.95, 'VT': 6.00,
  'VA': 5.30, 'WA': 6.50, 'WV': 6.00, 'WI': 5.00, 'WY': 4.00
};

// International VAT/GST Rates (simplified)
const INTERNATIONAL_TAX_RATES: { [key: string]: number } = {
  'UK': 20.00, // VAT
  'Canada': 5.00, // GST
  'Australia': 10.00, // GST
  'Germany': 19.00, // VAT
  'France': 20.00, // VAT
  'Japan': 10.00, // Consumption Tax
  'India': 18.00, // GST
  'Singapore': 8.00, // GST
  'Mexico': 16.00, // VAT
  'Brazil': 17.00 // ICMS
};

// Multiple Items with Different Tax Rates
function calculateMixedTax(items: Array<{price: number, quantity: number, taxRate: number}>): {
  totalPriceBeforeTax: number;
  totalTaxAmount: number;
  totalPrice: number;
  itemBreakdown: Array<{price: number, quantity: number, taxRate: number, taxAmount: number, totalPrice: number}>;
} {
  
  let totalPriceBeforeTax = 0;
  let totalTaxAmount = 0;
  const itemBreakdown = [];
  
  items.forEach(item => {
    const result = calculateSalesTax(item.price, item.taxRate, item.quantity);
    totalPriceBeforeTax += result.priceBeforeTaxTotal;
    totalTaxAmount += result.taxAmount;
    
    itemBreakdown.push({
      price: item.price,
      quantity: item.quantity,
      taxRate: item.taxRate,
      taxAmount: result.taxAmount,
      totalPrice: result.totalPrice
    });
  });
  
  return {
    totalPriceBeforeTax,
    totalTaxAmount,
    totalPrice: totalPriceBeforeTax + totalTaxAmount,
    itemBreakdown
  };
}

// Tax-Exempt Calculation
function calculateTaxExempt(priceBeforeTax: number, taxRate: number, isExempt: boolean): {
  priceBeforeTax: number;
  taxAmount: number;
  totalPrice: number;
  savings: number;
} {
  
  if (isExempt) {
    return {
      priceBeforeTax,
      taxAmount: 0,
      totalPrice: priceBeforeTax,
      savings: priceBeforeTax * (taxRate / 100)
    };
  }
  
  const taxAmount = priceBeforeTax * (taxRate / 100);
  return {
    priceBeforeTax,
    taxAmount,
    totalPrice: priceBeforeTax + taxAmount,
    savings: 0
  };
}
```

---

## How to Use Content (for SEO section)

1. Enter the purchase price before tax
2. Set the quantity if buying multiple items
3. Input the tax rate percentage or select from pre-set rates
4. Click calculate to see the tax amount and total price
5. Use reverse calculation to find the pre-tax price from after-tax price
6. Calculate tax-exempt purchases to see potential savings
7. Copy the results for your records or receipt verification

---

## About Content (for SEO section)

Our free sales tax calculator helps you quickly calculate the tax amount and total price for any purchase. Enter the price before tax and tax rate to instantly see the tax amount and final total. The calculator includes pre-set tax rates for US states and common countries with VAT/GST systems, making it easy to calculate taxes for different locations. Support for multiple items and quantity calculations ensures accurate totals for shopping carts. Use the reverse calculation feature when you only know the after-tax price to find the pre-tax amount. Perfect for budgeting, verifying receipts, comparing prices across different tax jurisdictions, and understanding the true cost of purchases. All calculations happen in your browser with complete privacy.