# SPEC: EOQ Calculator Tool
**File:** `docs/specs/tools/workplace/EOQ_CALCULATOR.md`
**Status:** Pending
**Slug:** `eoq-calculator`
**Category:** workplace
**Subcategory**: inventory-calculators

---

## SEO

- **Title:** `EOQ Calculator — Economic Order Quantity | ToolForge`
- **Description:** `Calculate Economic Order Quantity to minimize inventory costs. Shows orders per year and total annual cost. Free online EOQ calculator.`
- **Primary Keyword:** EOQ calculator
- **Secondary Keywords:** economic order quantity, inventory cost calculator, optimal order quantity, EOQ formula

---

## Functional Requirements

- [ ] Input for annual demand (units per year)
- [ ] Input for ordering cost per order ($)
- [ ] Input for holding cost per unit per year ($)
- [ ] Real-time EOQ calculation
- [ ] Display formula and calculation breakdown
- [ ] Show orders per year at EOQ
- [ ] Show total annual cost at EOQ
- [ ] Display cost breakdown (ordering vs holding)
- [ ] Copy results to clipboard
- [ ] Clear/reset button
- [ ] No external library needed

---

## Library

No external library needed — use built-in formula

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  EOQ Calculator                         │
├─────────────────────────────────────────┤
│  Annual Demand (units/year):            │
│  [1000                   ]              │
│                                         │
│  Ordering Cost per Order ($):           │
│  [50                     ]              │
│                                         │
│  Holding Cost per Unit/Year ($):        │
│  [2                      ]              │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│                                         │
│  Economic Order Quantity: 224 units     │
│                                         │
│  Formula:                               │
│  EOQ = √((2 × 1000 × 50) / 2)          │
│  = √(100000 / 2)                        │
│  = √50000                               │
│  = 223.6 ≈ 224 units                   │
│                                         │
│  Additional Metrics:                     │
│  • Orders per year: 4.47                │
│  • Total ordering cost: $223.61         │
│  • Total holding cost: $223.61          │
│  • Total annual cost: $447.21           │
│                                         │
│  Cost Breakdown:                        │
│  ████████████████████████████████████   │
│  Ordering: 50%  Holding: 50%            │
│                                         │
│  [Copy Results]  [Clear]                │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  annualDemand: number;
  orderingCost: number;
  holdingCost: number;
  eoq: number;
  ordersPerYear: number;
  totalOrderingCost: number;
  totalHoldingCost: number;
  totalAnnualCost: number;
}
```

---

## Formula

```typescript
// EOQ Formula: Economic Order Quantity
// EOQ = √((2 × Annual Demand × Ordering Cost) / Holding Cost)

function calculateEOQ(
  annualDemand: number,
  orderingCost: number,
  holdingCost: number
): number {
  if (holdingCost <= 0) return 0;
  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  return Math.round(eoq);
}

// Orders per year at EOQ
function calculateOrdersPerYear(
  annualDemand: number,
  eoq: number
): number {
  if (eoq <= 0) return 0;
  return annualDemand / eoq;
}

// Total ordering cost at EOQ
function calculateTotalOrderingCost(
  ordersPerYear: number,
  orderingCost: number
): number {
  return ordersPerYear * orderingCost;
}

// Total holding cost at EOQ
function calculateTotalHoldingCost(
  eoq: number,
  holdingCost: number
): number {
  return (eoq / 2) * holdingCost;
}

// Total annual cost at EOQ
function calculateTotalAnnualCost(
  totalOrderingCost: number,
  totalHoldingCost: number
): number {
  return totalOrderingCost + totalHoldingCost;
}
```

---

## How to Use Content (for SEO section)

1. Enter your annual demand in units per year
2. Input the ordering cost per order in dollars
3. Specify the holding cost per unit per year in dollars
4. Click calculate to see your Economic Order Quantity
5. Review the formula breakdown and calculation steps
6. Check the additional metrics: orders per year and total costs
7. Analyze the cost breakdown between ordering and holding costs
8. Copy the results for your inventory planning

---

## About Content (for SEO section)

Our EOQ (Economic Order Quantity) Calculator helps businesses determine the optimal order quantity that minimizes total inventory costs. Using the classic EOQ formula, this tool balances ordering costs against holding costs to find the sweet spot where total costs are minimized. The calculator shows not just the EOQ but also the number of orders per year and the breakdown of ordering versus holding costs at that optimal quantity. At EOQ, ordering and holding costs are equal, representing the most cost-effective inventory strategy. Perfect for inventory managers, procurement professionals, and business owners optimizing supply chain operations. All calculations happen instantly in your browser.
