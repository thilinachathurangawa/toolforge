# SPEC: Dice Roller Tool
**File:** `docs/specs/tools/calculators/other-calculators/DICE_ROLLER.md`
**Status:** Pending
**Slug:** `dice-roller`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Dice Roller — Roll D4, D6, D8, D10, D12, D20 Dice | ToolForge`
- **Description:** `Roll virtual dice instantly with our free dice roller. Supports D4, D6, D8, D10, D12, D20, and custom dice with multiple dice.`
- **Primary Keyword:** dice roller
- **Secondary Keywords:** virtual dice, online dice roller, d20 roller, random dice, dice simulator

---

## Functional Requirements

- [ ] Standard dice selection (D4, D6, D8, D10, D12, D20)
- [ ] Custom dice sides input
- [ ] Number of dice to roll
- [ ] Roll multiple dice types simultaneously
- [ ] Sum of rolls
- [ ] Individual roll results
- [ ] Roll history
- [ ] Sound effects (optional)
- [ ] Animation for rolling
- [ ] Copy results to clipboard
- [ ] No external library needed (use crypto.getRandomValues)

---

## Library

Use built-in `crypto.getRandomValues()` for cryptographically secure random dice rolls

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Dice Roller                            │
├─────────────────────────────────────────┤
│  Standard Dice:                         │
│  [D4] [D6] [D8] [D10] [D12] [D20]       │
│                                         │
│  Custom Dice:                           │
│  Sides: [100]  Count: [5]               │
│                                         │
│  Selected Dice:                         │
│  D6 x2, D20 x1                          │
│                                         │
│  [Roll Dice]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  D6: 4, 3                               │
│  D20: 17                                │
│                                         │
│  Total: 24                              │
│  Average: 8                             │
│                                         │
│  [Roll Again] [Copy Results]            │
│                                         │
│  History:                               │
│  [10:30 AM] D6: 4,3 D20: 17 (Total: 24)│
│  [10:28 AM] D20: 12 (Total: 12)        │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  selectedDice: {
    type: 'D4' | 'D6' | 'D8' | 'D10' | 'D12' | 'D20' | 'custom';
    sides: number;
    count: number;
  }[];
  customDice: {
    sides: number;
    count: number;
  };
  results: {
    type: string;
    sides: number;
    rolls: number[];
    sum: number;
  }[];
  history: {
    timestamp: Date;
    results: { type: string; rolls: number[]; sum: number }[];
  }[];
  isRolling: boolean;
}
```

---

## Formulas

```typescript
// Roll a single die
function rollDie(sides: number): number {
  
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % sides) + 1;
}

// Roll multiple dice of the same type
function rollDice(sides: number, count: number): number[] {
  
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }
  return rolls;
}

// Calculate sum of rolls
function calculateSum(rolls: number[]): number {
  
  return rolls.reduce((sum, roll) => sum + roll, 0);
}

// Calculate average of rolls
function calculateAverage(rolls: number[]): number {
  
  if (rolls.length === 0) return 0;
  return calculateSum(rolls) / rolls.length;
}

// Roll multiple dice types
function rollMultipleDice(
  diceConfig: { sides: number; count: number }[]
): { sides: number; rolls: number[]; sum: number }[] {
  
  return diceConfig.map(config => {
    const rolls = rollDice(config.sides, config.count);
    const sum = calculateSum(rolls);
    return { sides: config.sides, rolls, sum };
  });
}

// Calculate probability of rolling a specific value
function calculateProbability(sides: number, targetValue: number): number {
  
  if (targetValue < 1 || targetValue > sides) return 0;
  return 1 / sides;
}

// Calculate probability of rolling at least a value
function calculateProbabilityAtLeast(sides: number, minValue: number): number {
  
  if (minValue < 1) return 1;
  if (minValue > sides) return 0;
  return (sides - minValue + 1) / sides;
}

// Calculate expected value for a die
function calculateExpectedValue(sides: number): number {
  
  return (sides + 1) / 2;
}

// Calculate probability of sum for multiple dice
function calculateSumProbability(
  sides: number,
  diceCount: number,
  targetSum: number
): number {
  
  // This is a simplified version - full implementation would use convolution
  const minSum = diceCount;
  const maxSum = diceCount * sides;
  
  if (targetSum < minSum || targetSum > maxSum) return 0;
  
  // For 2d6, we can use exact probabilities
  if (sides === 6 && diceCount === 2) {
    const probabilities: { [sum: number]: number } = {
      2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36,
      7: 6/36, 8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36
    };
    return probabilities[targetSum] || 0;
  }
  
  // Approximation for other cases
  const totalOutcomes = Math.pow(sides, diceCount);
  return 1 / totalOutcomes; // Simplified
}

// Critical hit detection (for D20)
function isCriticalHit(roll: number, critRange: number = 20): boolean {
  
  return roll >= critRange;
}

// Critical fumble detection (for D20)
function isCriticalFumble(roll: number, fumbleRange: number = 1): boolean {
  
  return roll <= fumbleRange;
}

// Advantage roll (roll twice, take higher)
function rollAdvantage(sides: number): { roll1: number; roll2: number; result: number } {
  
  const roll1 = rollDie(sides);
  const roll2 = rollDie(sides);
  const result = Math.max(roll1, roll2);
  
  return { roll1, roll2, result };
}

// Disadvantage roll (roll twice, take lower)
function rollDisadvantage(sides: number): { roll1: number; roll2: number; result: number } {
  
  const roll1 = rollDie(sides);
  const roll2 = rollDie(sides);
  const result = Math.min(roll1, roll2);
  
  return { roll1, roll2, result };
}
```

---

## How to Use Content (for SEO section)

1. Select standard dice (D4, D6, D8, D10, D12, D20) or specify custom dice
2. Set the number of dice to roll for each type
3. Click roll to generate random results
4. View individual rolls and total sum
5. Use roll again to generate new results
6. View history of previous rolls
7. Copy results for sharing

---

## About Content (for SEO section)

Our free dice roller lets you roll virtual dice for tabletop games, board games, or any situation requiring random dice rolls. Choose from standard dice (D4, D6, D8, D10, D12, D20) or create custom dice with any number of sides. Roll multiple dice simultaneously and see individual results plus the total sum. The roller includes a history feature to track previous rolls and supports advantage/disadvantage mechanics for D20 games. Perfect for D&D, Pathfinder, board games, or random number generation. Uses cryptographically secure random number generation for fair rolls. All calculations happen in your browser with complete privacy and instant results.
