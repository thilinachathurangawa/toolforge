# SPEC: VAT Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/VAT_CALCULATOR.md`
**Status:** Pending
**Slug:** `vat-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `VAT Calculator — Add or Remove VAT from Price | ToolForge`
- **Description:** `Calculate VAT (Value Added Tax) instantly. Add or remove VAT from prices with support for multiple countries and VAT rates. Free VAT calculator.`
- **Primary Keyword:** VAT calculator
- **Secondary Keywords:** VAT add remove calculator, value added tax calculator, VAT inclusive exclusive calculator, European VAT calculator

---

## Functional Requirements

- [ ] Price input
- [ ] VAT rate input (percentage)
- [ ] Mode selector (Add VAT / Remove VAT)
- [ ] Real-time VAT calculation
- [ ] Display price before and after VAT
- [ ] Show VAT amount separately
- [ ] Pre-set VAT rates for EU countries
- [ ] Pre-set VAT rates for other countries
- [ ] Support for multiple items
- [ ] Reverse calculation (VAT exclusive to inclusive and vice versa)
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in VAT formulas)

---

## Library

No external library needed — use built-in VAT calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  VAT Calculator                         │
├─────────────────────────────────────────┤
│  Mode: [Add VAT ▼]                      │
│  Price: [$100.00       ]               │
│  Quantity: [1]                          │
│                                         │
│  VAT Rate: [%20          ]              │
│  Quick Rates:                           │
│  [UK 20%] [Germany 19%] [France 20%]    │
│  [Italy 22%] [Spain 21%] [Netherlands 21%] │
│                                         │
│  [Calculate VAT]                        │
├─────────────────────────────────────────┤
│  Results:                               │
│  Price (Excl. VAT): $100.00            │
│  VAT Amount: $20.00                     │
│  Price (Incl. VAT): $120.00             │
│                                         │
│  [Switch Mode (Remove VAT)]             │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: 'add' | 'remove';
  price: number;
  quantity: number;
  vatRate: number; // percentage
  priceExcludingVAT: number;
  vatAmount: number;
  priceIncludingVAT: number;
  selectedCountry: string;
  quickVATRates: number[];
}
```

---

## Formulas

```typescript
// Add VAT: Price Including VAT = Price Excluding VAT × (1 + VAT Rate/100)
// VAT Amount = Price Excluding VAT × (VAT Rate/100)

function addVAT(priceExcludingVAT: number, vatRate: number, quantity: number = 1): {
  vatAmount: number;
  priceIncludingVAT: number;
  vatPerItem: number;
  totalExcludingVAT: number;
  totalIncludingVAT: number;
} {
  
  const vatPerItem = priceExcludingVAT * (vatRate / 100);
  const vatAmount = vatPerItem * quantity;
  const totalExcludingVAT = priceExcludingVAT * quantity;
  const totalIncludingVAT = totalExcludingVAT + vatAmount;
  
  return {
    vatAmount,
    priceIncludingVAT: priceExcludingVAT + vatPerItem,
    vatPerItem,
    totalExcludingVAT,
    totalIncludingVAT
  };
}

// Remove VAT: Price Excluding VAT = Price Including VAT / (1 + VAT Rate/100)
// VAT Amount = Price Including VAT - Price Excluding VAT

function removeVAT(priceIncludingVAT: number, vatRate: number, quantity: number = 1): {
  vatAmount: number;
  priceExcludingVAT: number;
  vatPerItem: number;
  totalIncludingVAT: number;
  totalExcludingVAT: number;
} {
  
  const priceExcludingVAT = priceIncludingVAT / (1 + vatRate / 100);
  const vatPerItem = priceIncludingVAT - priceExcludingVAT;
  const vatAmount = vatPerItem * quantity;
  const totalIncludingVAT = priceIncludingVAT * quantity;
  const totalExcludingVAT = priceExcludingVAT * quantity;
  
  return {
    vatAmount,
    priceExcludingVAT,
    vatPerItem,
    totalIncludingVAT,
    totalExcludingVAT
  };
}

// EU VAT Rates (simplified - rates may change)
const EU_VAT_RATES: { [key: string]: {standard: number, reduced: number} } = {
  'Austria': {standard: 20, reduced: 10},
  'Belgium': {standard: 21, reduced: 6},
  'Bulgaria': {standard: 20, reduced: 9},
  'Croatia': {standard: 25, reduced: 13},
  'Cyprus': {standard: 19, reduced: 5},
  'Czech Republic': {standard: 21, reduced: 10},
  'Denmark': {standard: 25, reduced: 0}, // No reduced rate
  'Estonia': {standard: 20, reduced: 9},
  'Finland': {standard: 25.5, reduced: 10},
  'France': {standard: 20, reduced: 5.5},
  'Germany': {standard: 19, reduced: 7},
  'Greece': {standard: 24, reduced: 13},
  'Hungary': {standard: 27, reduced: 18},
  'Ireland': {standard: 23, reduced: 13.5},
  'Italy': {standard: 22, reduced: 10},
  'Latvia': {standard: 21, reduced: 12},
  'Lithuania': {standard: 21, reduced: 9},
  'Luxembourg': {standard: 17, reduced: 8},
  'Malta': {standard: 18, reduced: 5},
  'Netherlands': {standard: 21, reduced: 9},
  'Poland': {standard: 23, reduced: 8},
  'Portugal': {standard: 23, reduced: 13},
  'Romania': {standard: 19, reduced: 9},
  'Slovakia': {standard: 20, reduced: 10},
  'Slovenia': {standard: 22, reduced: 9.5},
  'Spain': {standard: 21, reduced: 10},
  'Sweden': {standard: 25, reduced: 12},
  'UK': {standard: 20, reduced: 5} // UK left EU but still uses VAT
};

// International VAT/GST Rates
const INTERNATIONAL_VAT_RATES: { [key: string]: number } = {
  'Australia': 10, // GST
  'Canada': 5, // GST (provincial taxes vary)
  'India': 18, // GST
  'Japan': 10, // Consumption Tax
  'New Zealand': 15, // GST
  'Singapore': 8, // GST
  'South Africa': 15, // VAT
  'Switzerland': 7.7, // VAT
  'Norway': 25, // VAT
  'Mexico': 16, // VAT
  'Brazil': 17, // ICMS (varies by state)
  'South Korea': 10, // VAT
  'China': 13, // VAT
  'Russia': 20, // VAT
  'Turkey': 20, // VAT
  'Israel': 17, // VAT
  'Thailand': 7, // VAT
  'Philippines': 12, // VAT
  'Indonesia': 11, // VAT
  'Malaysia': 6, // SST
  'Vietnam': 10, // VAT
  'Argentina': 21, // VAT
  'Colombia': 19, // VAT
  'Chile': 19, // VAT
  'Peru': 18, // IGV
};

// Calculate VAT for Multiple Items with Different Rates
function calculateMixedVAT(items: Array<{price: number, quantity: number, vatRate: number}>): {
  totalExcludingVAT: number;
  totalVATAmount: number;
  totalIncludingVAT: number;
  itemBreakdown: Array<{
    price: number, 
    quantity: number, 
    vatRate: number, 
    vatAmount: number, 
    totalIncludingVAT: number
  }>;
} {
  
  let totalExcludingVAT = 0;
  let totalVATAmount = 0;
  const itemBreakdown = [];
  
  items.forEach(item => {
    const result = addVAT(item.price, item.vatRate, item.quantity);
    totalExcludingVAT += result.totalExcludingVAT;
    totalVATAmount += result.vatAmount;
    
    itemBreakdown.push({
      price: item.price,
      quantity: item.quantity,
      vatRate: item.vatRate,
      vatAmount: result.vatAmount,
      totalIncludingVAT: result.totalIncludingVAT
    });
  });
  
  return {
    totalExcludingVAT,
    totalVATAmount,
    totalIncludingVAT: totalExcludingVAT + totalVATAmount,
    itemBreakdown
  };
}

// VAT Inclusive vs Exclusive Comparison
function compareVATMethods(price: number, vatRate: number) {
  const addResult = addVAT(price, vatRate, 1);
  const removeResult = removeVAT(price, vatRate, 1);
  
  return {
    addVAT: addResult,
    removeVAT: removeResult,
    note: "Add VAT assumes price is exclusive, Remove VAT assumes price is inclusive"
  };
}
```

---

## How to Use Content (for SEO section)

1. Select the calculation mode (Add VAT or Remove VAT)
2. Enter the price (exclusive for Add VAT, inclusive for Remove VAT)
3. Set the quantity if calculating for multiple items
4. Input the VAT rate or select from pre-set country rates
5. Click calculate to see the VAT amount and final price
6. Switch between Add/Remove VAT modes for different calculations
7. Copy the results for invoicing or price verification

---

## About Content (for SEO section)

Our free VAT (Value Added Tax) calculator helps you instantly add or remove VAT from prices. Calculate VAT-inclusive and VAT-exclusive amounts with support for multiple countries and their specific VAT rates. The calculator includes pre-set VAT rates for all EU countries and many other nations with VAT/GST systems. Perfect for businesses that need to calculate VAT for invoices, consumers who want to understand VAT-inclusive prices, and anyone dealing with international transactions. Switch between Add VAT (exclusive to inclusive) and Remove VAT (inclusive to exclusive) modes for flexible calculations. Support for multiple items with different VAT rates makes it ideal for complex business calculations. All calculations happen in your browser with complete privacy.