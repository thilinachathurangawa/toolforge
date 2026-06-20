# SPEC: Probability Calculator Tool
**File:** `docs/specs/tools/calculators/math-calculators/PROBABILITY_CALCULATOR.md`
**Status:** Pending
**Slug:** `probability-calculator`
**Category:** calculator
**Subcategory:** math-calculators

---

## SEO

- **Title:** `Probability Calculator — P(A), P(A∩B) | ToolForge`
- **Description:** `Calculate probability instantly with our free calculator. Find P(A), P(A∩B), and solve probability problems with step-by-step solutions.`
- **Primary Keyword:** probability calculator
- **Secondary Keywords:** calculate probability, P(A) calculator, intersection probability, probability of events

---

## Functional Requirements

- [ ] Support for single event probability P(A)
- [ ] Support for intersection probability P(A∩B)
- [ ] Support for union probability P(A∪B)
- [ ] Support for conditional probability P(A|B)
- [ ] Input for total outcomes
- [ ] Input for favorable outcomes
- [ ] Display probability as fraction
- [ ] Display probability as decimal
- [ ] Display probability as percentage
- [ ] Display odds in favor and against
- [ ] Step-by-step calculation explanation
- [ ] Copy result to clipboard
- [ ] Reset button
- [ ] Mobile responsive design
- [ ] No external library needed (built-in formulas)

---

## Library

No external library needed — use built-in probability formulas

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Probability Calculator                 │
├─────────────────────────────────────────┤
│  Calculation Type:                      │
│  [P(A)] [P(A∩B)] [P(A∪B)] [P(A|B)]     │
│                                         │
│  Total Outcomes: [52]                   │
│  Favorable Outcomes (A): [13]           │
│  Favorable Outcomes (B): [4] (optional)│
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  P(A) = 13/52 = 0.25 = 25%             │
│                                         │
│  Odds in Favor: 13:39 = 1:3            │
│  Odds Against: 39:13 = 3:1             │
│                                         │
│  Step-by-step:                          │
│  1. Total outcomes: 52                  │
│  2. Favorable outcomes: 13              │
│  3. P(A) = 13/52                       │
│  4. Simplify: 1/4                      │
│  5. Decimal: 0.25                      │
│  6. Percentage: 25%                     │
│                                         │
│  [Copy Result] [Reset]                  │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  calculationType: 'single' | 'intersection' | 'union' | 'conditional';
  totalOutcomes: number;
  favorableA: number;
  favorableB: number;
  probability: number;
  fraction: string;
  percentage: number;
  oddsInFavor: string;
  oddsAgainst: string;
  showSteps: boolean;
}
```

---

## Formulas

```typescript
// Calculate probability P(A)
function calculateProbability(favorable: number, total: number): number {
  if (total === 0) return 0;
  return favorable / total;
}

// Calculate intersection P(A∩B) for independent events
function calculateIntersection(pA: number, pB: number): number {
  return pA * pB;
}

// Calculate union P(A∪B)
function calculateUnion(pA: number, pB: number, pIntersection: number): number {
  return pA + pB - pIntersection;
}

// Calculate conditional probability P(A|B)
function calculateConditional(pIntersection: number, pB: number): number {
  if (pB === 0) return 0;
  return pIntersection / pB;
}

// Simplify fraction
function simplifyFraction(numerator: number, denominator: number): string {
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };
  
  const divisor = gcd(numerator, denominator);
  const simplifiedNum = numerator / divisor;
  const simplifiedDen = denominator / divisor;
  
  return `${simplifiedNum}/${simplifiedDen}`;
}

// Calculate odds
function calculateOdds(favorable: number, total: number): { inFavor: string; against: string } {
  const unfavorable = total - favorable;
  const gcd = (a: number, b: number): number => {
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };
  
  const divisor = gcd(favorable, unfavorable);
  return {
    inFavor: `${favorable / divisor}:${unfavorable / divisor}`,
    against: `${unfavorable / divisor}:${favorable / divisor}`
  };
}
```

---

## How to Use Content (for SEO section)

1. Select the probability calculation type
2. Enter the total number of possible outcomes
3. Enter the number of favorable outcomes for event A (and B if needed)
4. Click calculate to find the probability
5. View the result as fraction, decimal, and percentage
6. See the odds in favor and against
7. Check the step-by-step explanation
8. Copy the result or reset to try another calculation

---

## About Content (for SEO section)

Our free probability calculator instantly computes probabilities for single events, intersections, unions, and conditional probabilities. Enter the total outcomes and favorable outcomes to calculate P(A), P(A∩B), P(A∪B), or P(A|B). The calculator displays results as fractions, decimals, and percentages, along with odds in favor and against. Perfect for students learning probability, statisticians, or anyone needing to calculate the likelihood of events. The step-by-step explanations help you understand the probability calculations. All calculations happen in your browser with complete privacy.
