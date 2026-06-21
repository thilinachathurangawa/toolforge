# SPEC: Random Number Generator Tool
**File:** `docs/specs/tools/calculators/other-calculators/RANDOM_NUMBER_GENERATOR.md`
**Status:** Pending
**Slug:** `random-number-generator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Random Number Generator — Generate Random Numbers | ToolForge`
- **Description:** `Generate random numbers instantly with our free random number generator. Customizable range, count, and unique number options.`
- **Primary Keyword:** random number generator
- **Secondary Keywords:** random number picker, number generator, random integers, random number list

---

## Functional Requirements

- [ ] Minimum value input
- [ ] Maximum value input
- [ ] Count input (how many numbers to generate)
- [ ] Unique numbers only option
- [ ] Sort results option
- [ ] Decimal precision option
- [ ] Generate button
- [ ] Copy results to clipboard
- [ ] Download results as text/CSV
- [ ] History of generated numbers
- [ ] No external library needed (use crypto.getRandomValues)

---

## Library

Use built-in `crypto.getRandomValues()` for cryptographically secure random numbers

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Random Number Generator                │
├─────────────────────────────────────────┤
│  Range:                                 │
│  Min: [1]  Max: [100]                   │
│                                         │
│  Options:                               │
│  Count: [10] numbers                    │
│  [ ] Unique numbers only                │
│  [ ] Sort results                       │
│  Decimal places: [0]                    │
│                                         │
│  [Generate]                             │
├─────────────────────────────────────────┤
│  Results:                               │
│  42, 17, 89, 3, 56, 91, 28, 65, 12, 74 │
│                                         │
│  Statistics:                            │
│  Min: 3  Max: 91                       │
│  Average: 47.7                          │
│  Sum: 477                               │
│                                         │
│  [Copy] [Download CSV] [Clear]          │
│                                         │
│  History:                               │
│  [10:30 AM] 42, 17, 89, 3, 56, 91...   │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  min: number;
  max: number;
  count: number;
  uniqueOnly: boolean;
  sortResults: boolean;
  decimalPlaces: number;
  results: number[];
  history: { timestamp: Date; numbers: number[] }[];
  statistics: {
    min: number;
    max: number;
    average: number;
    sum: number;
  };
}
```

---

## Formulas

```typescript
// Generate cryptographically secure random number
function generateSecureRandomNumber(min: number, max: number): number {
  
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  
  const random = array[0] / (0xFFFFFFFF + 1);
  return Math.floor(random * (max - min + 1)) + min;
}

// Generate random number with decimal precision
function generateRandomDecimal(
  min: number,
  max: number,
  decimalPlaces: number
): number {
  
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  
  const random = array[0] / (0xFFFFFFFF + 1);
  const value = random * (max - min) + min;
  
  return Number(value.toFixed(decimalPlaces));
}

// Generate multiple random numbers
function generateRandomNumbers(
  min: number,
  max: number,
  count: number,
  uniqueOnly: boolean = false,
  decimalPlaces: number = 0
): number[] {
  
  const results: number[] = [];
  const maxAttempts = count * 100; // Prevent infinite loop
  let attempts = 0;
  
  while (results.length < count && attempts < maxAttempts) {
    let number: number;
    
    if (decimalPlaces === 0) {
      number = generateSecureRandomNumber(min, max);
    } else {
      number = generateRandomDecimal(min, max, decimalPlaces);
    }
    
    if (!uniqueOnly || !results.includes(number)) {
      results.push(number);
    }
    
    attempts++;
  }
  
  return results;
}

// Sort results
function sortResults(numbers: number[], order: 'asc' | 'desc' = 'asc'): number[] {
  
  return [...numbers].sort((a, b) => order === 'asc' ? a - b : b - a);
}

// Calculate statistics
function calculateStatistics(numbers: number[]): {
  min: number;
  max: number;
  average: number;
  sum: number;
  median: number;
  mode: number[];
} {
  
  if (numbers.length === 0) {
    return { min: 0, max: 0, average: 0, sum: 0, median: 0, mode: [] };
  }
  
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  
  // Median
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
  
  // Mode
  const frequency: { [key: number]: number } = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  const maxFreq = Math.max(...Object.values(frequency));
  const mode = Object.keys(frequency)
    .map(Number)
    .filter(key => frequency[key] === maxFreq);
  
  return { min, max, average, sum, median, mode };
}

// Generate random boolean
function generateRandomBoolean(): boolean {
  
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % 2 === 0;
}

// Generate random item from array
function generateRandomItem<T>(items: T[]): T {
  
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const index = array[0] % items.length;
  return items[index];
}

// Generate random string
function generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  
  let result = '';
  for (let i = 0; i < length; i++) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    result += charset[array[0] % charset.length];
  }
  return result;
}

// Generate random color (hex)
function generateRandomColor(): string {
  
  const array = new Uint8Array(3);
  crypto.getRandomValues(array);
  return '#' + Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Shuffle array
function shuffleArray<T>(array: T[]): T[] {
  
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

---

## How to Use Content (for SEO section)

1. Set the minimum and maximum values for the range
2. Specify how many numbers to generate
3. Choose options: unique numbers only, sort results, decimal precision
4. Click generate to create random numbers
5. View statistics (min, max, average, sum)
6. Copy results or download as CSV
7. View history of previously generated numbers

---

## About Content (for SEO section)

Our free random number generator creates cryptographically secure random numbers for any purpose. Set your desired range and count to generate random integers or decimals. Options include generating unique numbers only, sorting results, and setting decimal precision. The calculator shows statistics including minimum, maximum, average, and sum of generated numbers. Perfect for lottery number picking, random sampling, game development, statistical analysis, or any situation requiring random numbers. Uses browser's built-in cryptographic random number generator for true randomness. All calculations happen in your browser with complete privacy and instant results.
