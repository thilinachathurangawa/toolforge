# SPEC: Budget Calculator Tool
**File:** `docs/specs/tools/calculators/financial-calculators/BUDGET_CALCULATOR.md`
**Status:** Pending
**Slug:** `budget-calculator`
**Category:** calculator
**Subcategory`: financial-calculators

---

## SEO

- **Title:** `Budget Calculator — 50/30/20 Rule & Budget Planning | ToolForge`
- **Description:** `Create a personal budget with the 50/30/20 rule. Calculate needs, wants, and savings allocations. Free budget calculator for financial planning.`
- **Primary Keyword:** budget calculator
- **Secondary Keywords:** 50/30/20 rule calculator, personal budget calculator, budget planning tool, monthly budget calculator

---

## Functional Requirements

- [ ] Monthly income input
- [ ] 50/30/20 rule budget allocation
- [ ] Custom budget percentage options
- [ ] Needs category calculation (50%)
- [ ] Wants category calculation (30%)
- [ ] Savings/debt category calculation (20%)
- [ ] Expense input by category
- [ ] Budget vs actual comparison
- [ ] Visual breakdown (pie chart)
- [ ] Multiple income sources support
- [ ] Savings goal tracking
- [ ] Export budget to CSV
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in budget formulas)

---

## Library

No external library needed — use built-in budget calculation formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Budget Calculator (50/30/20 Rule)    │
├─────────────────────────────────────────┤
│  Monthly Income: [$5,000       ]       │
│                                         │
│  Budget Rule: [50/30/20 ▼]             │
│  [Custom Percentages]                   │
│                                         │
│  [Calculate Budget]                     │
├─────────────────────────────────────────┤
│  Budget Allocation:                     │
│  ┌─────────────────────────────────┐   │
│  │ Needs (50%): $2,500            │   │
│  │ Wants (30%): $1,500            │   │
│  │ Savings/Debt (20%): $1,000     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Add Actual Expenses]                  │
│  [Budget vs Actual]                     │
│  [Savings Goals]                        │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  monthlyIncome: number;
  budgetRule: '503020' | '702010' | 'custom';
  customPercentages: {needs: number, wants: number, savings: number};
  budgetAllocation: {
    needs: number;
    wants: number;
    savings: number;
  };
  actualExpenses: {
    needs: number;
    wants: number;
    savings: number;
  };
  variance: {
    needs: number;
    wants: number;
    savings: number;
  };
  savingsGoals: Array<{name: string, target: number, current: number}>;
  showComparison: boolean;
}
```

---

## Formulas

```typescript
// 50/30/20 Rule Budget Allocation
// Needs: 50% of income, Wants: 30% of income, Savings/Debt: 20% of income

function calculate503020Budget(monthlyIncome: number): {
  needs: number;
  wants: number;
  savings: number;
  total: number;
} {
  
  const needs = monthlyIncome * 0.50;
  const wants = monthlyIncome * 0.30;
  const savings = monthlyIncome * 0.20;
  const total = needs + wants + savings;
  
  return {
    needs,
    wants,
    savings,
    total
  };
}

// Custom Percentage Budget
function calculateCustomBudget(
  monthlyIncome: number,
  needsPercentage: number,
  wantsPercentage: number,
  savingsPercentage: number
): {
  needs: number;
  wants: number;
  savings: number;
  total: number;
} {
  
  const needs = monthlyIncome * (needsPercentage / 100);
  const wants = monthlyIncome * (wantsPercentage / 100);
  const savings = monthlyIncome * (savingsPercentage / 100);
  const total = needs + wants + savings;
  
  return {
    needs,
    wants,
    savings,
    total
  };
}

// Budget vs Actual Comparison
function calculateBudgetVariance(
  budgetAllocation: {needs: number, wants: number, savings: number},
  actualExpenses: {needs: number, wants: number, savings: number}
): {
  needsVariance: number;
  wantsVariance: number;
  savingsVariance: number;
  totalVariance: number;
  needsStatus: 'under' | 'over' | 'on';
  wantsStatus: 'under' | 'over' | 'on';
  savingsStatus: 'under' | 'over' | 'on';
} {
  
  const needsVariance = actualExpenses.needs - budgetAllocation.needs;
  const wantsVariance = actualExpenses.wants - budgetAllocation.wants;
  const savingsVariance = actualExpenses.savings - budgetAllocation.savings;
  const totalVariance = needsVariance + wantsVariance + savingsVariance;
  
  const needsStatus = needsVariance > 0 ? 'over' : needsVariance < 0 ? 'under' : 'on';
  const wantsStatus = wantsVariance > 0 ? 'over' : wantsVariance < 0 ? 'under' : 'on';
  const savingsStatus = savingsVariance > 0 ? 'over' : savingsVariance < 0 ? 'under' : 'on';
  
  return {
    needsVariance,
    wantsVariance,
    savingsVariance,
    totalVariance,
    needsStatus,
    wantsStatus,
    savingsStatus
  };
}

// Savings Goal Tracking
function calculateSavingsProgress(
  savingsGoals: Array<{name: string, target: number, current: number}>,
  monthlySavingsAllocation: number
): {
  goals: Array<{
    name: string;
    target: number;
    current: number;
    remaining: number;
    percentageComplete: number;
    monthsToComplete: number;
  }>;
  totalTarget: number;
  totalCurrent: number;
  totalRemaining: number;
  overallPercentage: number;
  canCompleteAllGoals: boolean;
  monthsToCompleteAll: number;
} {
  
  let totalTarget = 0;
  let totalCurrent = 0;
  
  const processedGoals = savingsGoals.map(goal => {
    const remaining = goal.target - goal.current;
    const percentageComplete = (goal.current / goal.target) * 100;
    const monthsToComplete = remaining / monthlySavingsAllocation;
    
    totalTarget += goal.target;
    totalCurrent += goal.current;
    
    return {
      name: goal.name,
      target: goal.target,
      current: goal.current,
      remaining,
      percentageComplete,
      monthsToComplete
    };
  });
  
  const totalRemaining = totalTarget - totalCurrent;
  const overallPercentage = (totalCurrent / totalTarget) * 100;
  const monthsToCompleteAll = totalRemaining / monthlySavingsAllocation;
  const canCompleteAllGoals = monthlySavingsAllocation > 0 && monthsToCompleteAll !== Infinity;
  
  return {
    goals: processedGoals,
    totalTarget,
    totalCurrent,
    totalRemaining,
    overallPercentage,
    canCompleteAllGoals,
    monthsToCompleteAll
  };
}

// Income After Fixed Expenses
function calculateDisposableIncome(
  monthlyIncome: number,
  fixedExpenses: number // Rent/mortgage, utilities, insurance, etc.
): {
  disposableIncome: number;
  disposablePercentage: number;
  remainingForWantsAndSavings: number;
} {
  
  const disposableIncome = monthlyIncome - fixedExpenses;
  const disposablePercentage = (disposableIncome / monthlyIncome) * 100;
  const remainingForWantsAndSavings = disposableIncome; // This is what's left for wants + savings
  
  return {
    disposableIncome,
    disposablePercentage,
    remainingForWantsAndSavings
  };
}

// Emergency Fund Calculator
function calculateEmergencyFund(
  monthlyExpenses: number,
  monthsToCover: number = 6
): {
  targetEmergencyFund: number;
  currentEmergencyFund: number;
  remainingToGoal: number;
  percentageComplete: number;
  monthsToGoal: number;
  monthlySavingsNeeded: number;
} {
  
  const targetEmergencyFund = monthlyExpenses * monthsToCover;
  const currentEmergencyFund = 0; // Would be user input
  const remainingToGoal = targetEmergencyFund - currentEmergencyFund;
  const percentageComplete = (currentEmergencyFund / targetEmergencyFund) * 100;
  const monthlySavingsNeeded = targetEmergencyFund / 12; // 12 months to build
  const monthsToGoal = remainingToGoal / monthlySavingsNeeded;
  
  return {
    targetEmergencyFund,
    currentEmergencyFund,
    remainingToGoal,
    percentageComplete,
    monthsToGoal,
    monthlySavingsNeeded
  };
}

// Alternative Budget Rules
const BUDGET_RULES = {
  '503020': {name: '50/30/20 Rule', needs: 50, wants: 30, savings: 20, description: 'Balanced approach for most people'},
  '702010': {name: '70/20/10 Rule', needs: 70, wants: 20, savings: 10, description: 'Conservative approach for tight budgets'},
  '403030': {name: '40/30/30 Rule', needs: 40, wants: 30, savings: 30, description: 'Aggressive savings approach'},
  '602020': {name: '60/20/20 Rule', needs: 60, wants: 20, savings: 20, description: 'Moderate approach with higher needs allocation'},
  'zeroBased': {name: 'Zero-Based Budget', needs: 100, wants: 0, savings: 0, description: 'Every dollar assigned a purpose'}
};

// Detailed Expense Categories for Needs
const NEEDS_CATEGORIES = [
  'Housing (Rent/Mortgage)',
  'Utilities',
  'Groceries',
  'Transportation',
  'Insurance',
  'Minimum Debt Payments',
  'Healthcare',
  'Education'
];

// Detailed Expense Categories for Wants
const WANTS_CATEGORIES = [
  'Dining Out',
  'Entertainment',
  'Shopping',
  'Travel',
  'Hobbies',
  'Subscriptions',
  'Luxury Items'
];

// Detailed Expense Categories for Savings/Debt
const SAVINGS_CATEGORIES = [
  'Emergency Fund',
  'Retirement Contributions',
  'Investment Accounts',
  'Extra Debt Payments',
  'Savings Goals'
];
```

---

## How to Use Content (for SEO section)

1. Enter your monthly after-tax income
2. Select a budget rule (50/30/20 is recommended)
3. Click calculate to see your budget allocation
4. Review the breakdown for needs, wants, and savings
5. Add your actual expenses to compare against budget
6. Set savings goals and track your progress
7. Use alternative budget rules for different financial situations
8. Export or copy your budget for reference

---

## About Content (for SEO section)

Our free budget calculator helps you create a personalized budget using the proven 50/30/20 rule. This popular budgeting method allocates 50% of income to needs (essentials), 30% to wants (discretionary spending), and 20% to savings and debt repayment. Enter your monthly income to instantly see your recommended budget allocation. Compare your actual spending against your budget to identify areas for improvement. Track savings goals and see how long it will take to reach them. Use alternative budget rules like the conservative 70/20/10 or aggressive 40/30/30 approaches based on your financial situation. Perfect for anyone looking to take control of their finances, reduce debt, and build savings. All calculations happen in your browser with complete privacy.