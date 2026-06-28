# SPEC: Reorder Point Calculator Tool
**File:** `docs/specs/tools/workplace/REORDER_POINT_CALCULATOR.md`
**Status:** Pending
**Slug:** `reorder-point-calculator`
**Category:** workplace
**Subcategory**: inventory-calculators

---

## SEO

- **Title:** `Reorder Point Calculator — Optimize Inventory Levels | ToolForge`
- **Description:** `Calculate optimal reorder points for inventory management. Factor in daily usage, lead time, and safety stock. Free online calculator.`
- **Primary Keyword:** reorder point calculator
- **Secondary Keywords:** inventory reorder point, safety stock calculator, lead time calculation, inventory management

---

## Functional Requirements

- [ ] Input for average daily usage (units per day)
- [ ] Input for lead time (days)
- [ ] Input for safety stock (units)
- [ ] Real-time reorder point calculation
- [ ] Display formula and calculation breakdown
- [ ] Show when to reorder based on current inventory
- [ ] Input for current inventory level (optional)
- [ ] Alert if current inventory is below reorder point
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
│  Reorder Point Calculator               │
├─────────────────────────────────────────┤
│  Average Daily Usage (units/day):       │
│  [50                     ]              │
│                                         │
│  Lead Time (days):                      │
│  [10                     ]              │
│                                         │
│  Safety Stock (units):                  │
│  [100                    ]              │
│                                         │
│  Current Inventory (optional):          │
│  [300                    ]              │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│                                         │
│  Reorder Point: 600 units               │
│                                         │
│  Formula:                               │
│  Reorder Point = (50 × 10) + 100        │
│  = 500 + 100                            │
│  = 600 units                           │
│                                         │
│  Breakdown:                             │
│  • Demand during lead time: 500 units  │
│  • Safety stock buffer: 100 units      │
│  • Total reorder point: 600 units     │
│                                         │
│  ⚠️ Current inventory (300) is below     │
│     reorder point (600) - ORDER NOW!    │
│                                         │
│  [Copy Results]  [Clear]                │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  dailyUsage: number;
  leadTime: number;
  safetyStock: number;
  currentInventory: number;
  reorderPoint: number;
  isBelowReorderPoint: boolean;
}
```

---

## Formula

```typescript
// Reorder Point Formula
// Reorder Point = (Average Daily Usage × Lead Time) + Safety Stock

function calculateReorderPoint(
  dailyUsage: number,
  leadTime: number,
  safetyStock: number
): number {
  return (dailyUsage * leadTime) + safetyStock;
}

// Check if current inventory is below reorder point
function isBelowReorderPoint(
  currentInventory: number,
  reorderPoint: number
): boolean {
  return currentInventory < reorderPoint;
}

// Calculate days until stockout (if below reorder point)
function daysUntilStockout(
  currentInventory: number,
  dailyUsage: number
): number {
  return Math.floor(currentInventory / dailyUsage);
}
```

---

## How to Use Content (for SEO section)

1. Enter your average daily usage in units per day
2. Input the lead time in days (time between ordering and receiving)
3. Specify your safety stock buffer in units
4. Optionally enter your current inventory level
5. Click calculate to see your reorder point
6. Review the formula breakdown and calculation details
7. Check if your current inventory is below the reorder point
8. Copy the results for your inventory management records

---

## About Content (for SEO section)

Our Reorder Point Calculator helps businesses determine when to reorder inventory to avoid stockouts. Using the standard formula (Daily Usage × Lead Time + Safety Stock), this tool calculates the optimal inventory level that triggers a new order. By factoring in your average daily usage, supplier lead time, and desired safety stock buffer, you can maintain optimal inventory levels and prevent both stockouts and overstocking. The calculator also alerts you when current inventory falls below the reorder point, so you know exactly when to place orders. Perfect for inventory managers, small business owners, and supply chain professionals. All calculations happen instantly in your browser.
