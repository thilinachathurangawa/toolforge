# SPEC: Tip Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/TIP_CALCULATOR.md`
**Status:** Pending
**Slug:** `tip-calculator`
**Category:** calculator
**Subcategory**: financial-calculators

---

## SEO

- **Title:** `Tip Calculator — Split Bill & Calculate Tip Percentage | ToolForge`
- **Description:** `Calculate tips and split bills instantly with our free tip calculator. Support for percentage tips, custom amounts, and bill splitting among friends.`
- **Primary Keyword:** tip calculator
- **Secondary Keywords:** bill split calculator, tip percentage calculator, restaurant tip calculator, split bill calculator

---

## Functional Requirements

- [ ] Bill amount input
- [ ] Tip percentage input
- [ ] Real-time tip amount calculation
- [ ] Display total amount (bill + tip)
- [ ] Bill splitting among number of people
- [ ] Per-person calculation (bill + tip per person)
- [ ] Quick tip percentage buttons (10%, 15%, 18%, 20%, 25%)
- [ ] Custom tip amount input
- [ ] Tax calculation (include/exclude tax from tip base)
- [ ] Round up/down options
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in tip formulas)

---

## Library

No external library needed — use built-in tip calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Tip Calculator                        │
├─────────────────────────────────────────┤
│  Bill Amount: [$50.00       ]         │
│                                         │
│  Tip: [%15          ]                   │
│  Quick: [10%] [15%] [18%] [20%] [25%]  │
│                                         │
│  Split Bill Between: [2] people         │
│                                         │
│  [Calculate Tip]                        │
├─────────────────────────────────────────┤
│  Results:                               │
│  Bill Amount: $50.00                  │
│  Tip Amount: $7.50                     │
│  Total Amount: $57.50                  │
│                                         │
│  Per Person:                           │
│  Bill per person: $25.00               │
│  Tip per person: $3.75                 │
│  Total per person: $28.75              │
│                                         │
│  [Round Up to Nearest Dollar]           │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  billAmount: number;
  tipPercentage: number;
  tipMode: 'percentage' | 'fixed';
  fixedTipAmount: number;
  numberOfPeople: number;
  tipAmount: number;
  totalAmount: number;
  perPersonBill: number;
  perPersonTip: number;
  perPersonTotal: number;
  includeTaxInTip: boolean;
  taxAmount: number;
  roundingMode: 'none' | 'up' | 'down' | 'nearest';
  quickPercentages: number[];
}
```

---

## Formulas

```typescript
// Tip Calculation: Tip Amount = Bill Amount × (Tip Percentage/100)
// Total Amount = Bill Amount + Tip Amount

function calculateTip(
  billAmount: number,
  tipPercentage: number,
  numberOfPeople: number = 1,
  includeTax: boolean = false,
  taxAmount: number = 0
): {
  tipAmount: number;
  totalAmount: number;
  perPersonBill: number;
  perPersonTip: number;
  perPersonTotal: number;
  effectiveBillForTip: number;
} {
  
  const effectiveBill = includeTax ? (billAmount + taxAmount) : billAmount;
  const tipAmount = effectiveBill * (tipPercentage / 100);
  const totalAmount = billAmount + tipAmount;
  
  const perPersonBill = billAmount / numberOfPeople;
  const perPersonTip = tipAmount / numberOfPeople;
  const perPersonTotal = perPersonBill + perPersonTip;
  
  return {
    tipAmount,
    totalAmount,
    perPersonBill,
    perPersonTip,
    perPersonTotal,
    effectiveBillForTip: effectiveBill
  };
}

// Fixed Tip Amount
function calculateFixedTip(
  billAmount: number,
  fixedTipAmount: number,
  numberOfPeople: number = 1
): {
  tipAmount: number;
  totalAmount: number;
  perPersonBill: number;
  perPersonTip: number;
  perPersonTotal: number;
  tipPercentage: number;
} {
  
  const totalAmount = billAmount + fixedTipAmount;
  const tipPercentage = (fixedTipAmount / billAmount) * 100;
  
  const perPersonBill = billAmount / numberOfPeople;
  const perPersonTip = fixedTipAmount / numberOfPeople;
  const perPersonTotal = perPersonBill + perPersonTip;
  
  return {
    tipAmount: fixedTipAmount,
    totalAmount,
    perPersonBill,
    perPersonTip,
    perPersonTotal,
    tipPercentage
  };
}

// Rounding Functions
function roundTipCalculation(
  result: any,
  roundingMode: 'none' | 'up' | 'down' | 'nearest'
): any {
  
  switch(roundingMode {
    case 'up':
      return {
        ...result,
        totalAmount: Math.ceil(result.totalAmount),
        perPersonTotal: Math.ceil(result.perPersonTotal),
        tipAmount: Math.ceil(result.totalAmount) - result.billAmount,
        perPersonTip: Math.ceil(result.perPersonTotal) - result.perPersonBill
      };
      
    case 'down':
      return {
        ...result,
        totalAmount: Math.floor(result.totalAmount),
        perPersonTotal: Math.floor(result.perPersonTotal),
        tipAmount: Math.floor(result.totalAmount) - result.billAmount,
        perPersonTip: Math.floor(result.perPersonTotal) - result.perPersonBill
      };
      
    case 'nearest':
      return {
        ...result,
        totalAmount: Math.round(result.totalAmount),
        perPersonTotal: Math.round(result.perPersonTotal),
        tipAmount: Math.round(result.totalAmount) - result.billAmount,
        perPersonTip: Math.round(result.perPersonTotal) - result.perPersonBill
      };
      
    default:
      return result;
  }
}

// Reverse Calculation: Find Tip Percentage from Total
function calculateTipPercentage(billAmount: number, totalAmount: number): number {
  const tipAmount = totalAmount - billAmount;
  return (tipAmount / billAmount) * 100;
}

// Service Quality Guide
const TIP_GUIDELINES = {
  excellent: {percentage: 20, description: 'Excellent service'},
  veryGood: {percentage: 18, description: 'Very good service'},
  good: {percentage: 15, description: 'Good service'},
  average: {percentage: 12, description: 'Average service'},
  poor: {percentage: 10, description: 'Poor service'}
};

// Calculate with Service Quality
function calculateTipWithQuality(billAmount: number, quality: keyof typeof TIP_GUIDELINES, numberOfPeople: number = 1) {
  const guideline = TIP_GUIDELINES[quality];
  return calculateTip(billAmount, guideline.percentage, numberOfPeople);
}

// International Tipping Customs (simplified guide)
const INTERNATIONAL_TIPPING = {
  'USA': {range: '15-20%', notes: 'Customary for good service'},
  'Canada': {range: '15-20%', notes: 'Similar to USA'},
  'UK': {range: '10-15%', notes: 'Optional but appreciated'},
  'France': {range: '5-10%', notes: 'Service included in bill'},
  'Germany': {range: '5-10%', notes: 'Rounding up is common'},
  'Italy': {range: '5-10%', notes: 'Optional, small amounts'},
  'Japan': {range: '0%', notes: 'Tipping not customary'},
  'Australia': {range: '10%', notes: 'Optional but appreciated'},
  'Brazil': {range: '10%', notes: 'Customary in restaurants'},
  'Mexico': {range: '10-15%', notes: 'Expected in tourist areas'},
  'India': {range: '10%', notes: 'Customary in restaurants'}
};
```

---

## How to Use Content (for SEO section)

1. Enter your total bill amount
2. Set the tip percentage or use quick percentage buttons
3. Specify how many people to split the bill between
4. Optionally include/exclude tax from the tip calculation
5. Choose rounding mode for clean amounts
6. Click calculate to see tip amount and per-person totals
7. Copy the results for easy bill splitting

---

## About Content (for SEO section)

Our free tip calculator helps you quickly calculate tips and split bills among friends or family. Enter the bill amount and tip percentage to instantly see the tip amount and total. Split the bill between any number of people to see exactly what each person owes (both bill portion and tip portion). Quick percentage buttons (10%, 15%, 18%, 20%, 25%) make it easy to calculate common tip amounts. The calculator supports custom tip amounts, tax inclusion options, and rounding for clean payments. Perfect for restaurants, bars, taxis, or any situation where you need to calculate tips and split bills fairly. Whether you're dining alone or with a large group, this calculator ensures accurate and fair tip calculations. All calculations happen in your browser with complete privacy.