# SPEC: Grade Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/GRADE_CALCULATOR.md`
**Status:** Pending
**Slug:** `grade-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Grade Calculator — Calculate Weighted Average Grade | ToolForge`
- **Description:** `Calculate your final grade with our free grade calculator. Supports weighted averages, point systems, and what-if scenarios.`
- **Primary Keyword:** grade calculator
- **Secondary Keywords:** weighted grade calculator, final grade calculator, average grade calculator, class grade calculator

---

## Functional Requirements

- [ ] Add/remove assignment rows
- [ ] Assignment name input (optional)
- [ ] Grade input (percentage or points)
- [ ] Weight input (percentage)
- [ ] Points earned/total input mode
- [ ] Category weighting (tests, homework, etc.)
- [ ] Drop lowest grade option
- [ ] What-if grade calculator
- [ ] Letter grade conversion
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in grade calculation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Grade Calculator                       │
├─────────────────────────────────────────┤
│  Mode: [Weighted Average] [Points]      │
│                                         │
│  Category: Tests (Weight: 40%)          │
│  Assignment 1:                          │
│  Name: [Midterm Exam         ]          │
│  Grade: [85]%  Weight: [20]%            │
│                                         │
│  Assignment 2:                          │
│  Name: [Final Exam           ]          │
│  Grade: [92]%  Weight: [20]%            │
│                                         │
│  [+ Add Assignment]                     │
│                                         │
│  Category: Homework (Weight: 30%)       │
│  Assignment 1:                          │
│  Name: [HW 1                 ]          │
│  Grade: [95]%  Weight: [10]%            │
│                                         │
│  [+ Add Category] [+ Add Assignment]    │
│                                         │
│  [Calculate Grade]                      │
├─────────────────────────────────────────┤
│  Results:                               │
│  Current Grade: 89.5%                   │
│  Letter Grade: A-                       │
│  Points Earned: 447.5 / 500             │
│                                         │
│  Category Breakdown:                    │
│  Tests: 88.5% (40% weight)              │
│  Homework: 95.0% (30% weight)           │
│                                         │
│  What-If:                               │
│  Need: 90% on final to get A            │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: 'weighted' | 'points';
  categories: {
    name: string;
    weight: number;
    assignments: {
      name: string;
      grade: number;
      weight: number;
      pointsEarned?: number;
      pointsTotal?: number;
    }[];
    dropLowest: boolean;
  }[];
  gradingScale: { [letter: string]: { min: number; max: number } };
  results: {
    currentGrade: number;
    letterGrade: string;
    pointsEarned: number;
    pointsTotal: number;
    categoryBreakdown: { [category: string]: { grade: number; weight: number } };
  };
}
```

---

## Formulas

```typescript
// Standard grading scale
const STANDARD_GRADING_SCALE: { [letter: string]: { min: number; max: number } } = {
  'A+': { min: 97, max: 100 },
  'A': { min: 93, max: 96.99 },
  'A-': { min: 90, max: 92.99 },
  'B+': { min: 87, max: 89.99 },
  'B': { min: 83, max: 86.99 },
  'B-': { min: 80, max: 82.99 },
  'C+': { min: 77, max: 79.99 },
  'C': { min: 73, max: 76.99 },
  'C-': { min: 70, max: 72.99 },
  'D+': { min: 67, max: 69.99 },
  'D': { min: 63, max: 66.99 },
  'D-': { min: 60, max: 62.99 },
  'F': { min: 0, max: 59.99 }
};

// Calculate weighted average for a category
function calculateCategoryWeightedAverage(
  assignments: { grade: number; weight: number }[],
  dropLowest: boolean = false
): { average: number; totalWeight: number } {
  
  if (assignments.length === 0) {
    return { average: 0, totalWeight: 0 };
  }
  
  let sortedAssignments = [...assignments];
  
  if (dropLowest && assignments.length > 1) {
    sortedAssignments.sort((a, b) => a.grade - b.grade);
    sortedAssignments = sortedAssignments.slice(1);
  }
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  sortedAssignments.forEach(assignment => {
    weightedSum += assignment.grade * assignment.weight;
    totalWeight += assignment.weight;
  });
  
  const average = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  return { average, totalWeight };
}

// Calculate overall weighted grade
function calculateOverallWeightedGrade(
  categories: {
    name: string;
    weight: number;
    assignments: { grade: number; weight: number }[];
    dropLowest: boolean;
  }[]
): {
  overallGrade: number;
  categoryBreakdown: { [category: string]: { grade: number; weight: number } };
} {
  
  let overallWeightedSum = 0;
  let totalWeight = 0;
  const categoryBreakdown: { [category: string]: { grade: number; weight: number } } = {};
  
  categories.forEach(category => {
    const { average } = calculateCategoryWeightedAverage(
      category.assignments,
      category.dropLowest
    );
    
    overallWeightedSum += average * category.weight;
    totalWeight += category.weight;
    
    categoryBreakdown[category.name] = {
      grade: average,
      weight: category.weight
    };
  });
  
  const overallGrade = totalWeight > 0 ? overallWeightedSum / totalWeight : 0;
  
  return { overallGrade, categoryBreakdown };
}

// Calculate grade using points system
function calculatePointsGrade(
  assignments: { pointsEarned: number; pointsTotal: number }[]
): {
  overallGrade: number;
  pointsEarned: number;
  pointsTotal: number;
} {
  
  let totalPointsEarned = 0;
  let totalPointsPossible = 0;
  
  assignments.forEach(assignment => {
    totalPointsEarned += assignment.pointsEarned;
    totalPointsPossible += assignment.pointsTotal;
  });
  
  const overallGrade = totalPointsPossible > 0 
    ? (totalPointsEarned / totalPointsPossible) * 100 
    : 0;
  
  return {
    overallGrade,
    pointsEarned: totalPointsEarned,
    pointsTotal: totalPointsPossible
  };
}

// Convert percentage to letter grade
function percentageToLetterGrade(
  percentage: number,
  gradingScale: { [letter: string]: { min: number; max: number } }
): string {
  
  for (const [letter, range] of Object.entries(gradingScale)) {
    if (percentage >= range.min && percentage <= range.max) {
      return letter;
    }
  }
  
  return 'F';
}

// Calculate what-if grade needed
function calculateWhatIfGrade(
  currentGrade: number,
  currentWeight: number,
  targetGrade: number,
  remainingWeight: number
): number {
  
  const currentWeighted = currentGrade * (currentWeight / 100);
  const targetWeighted = targetGrade;
  const neededWeighted = targetWeighted - currentWeighted;
  const neededGrade = neededWeighted / (remainingWeight / 100);
  
  return Math.min(100, Math.max(0, neededGrade));
}

// Drop lowest grade from category
function dropLowestGrade(
  assignments: { grade: number; weight: number }[]
): { grade: number; weight: number }[] {
  
  if (assignments.length <= 1) {
    return assignments;
  }
  
  const sorted = [...assignments].sort((a, b) => a.grade - b.grade);
  return sorted.slice(1);
}

// Calculate grade needed on final exam
function calculateFinalExamGrade(
  currentGrade: number,
  finalWeight: number,
  targetGrade: number
): number {
  
  const currentWeight = 100 - finalWeight;
  const currentWeighted = currentGrade * (currentWeight / 100);
  const targetWeighted = targetGrade;
  const neededWeighted = targetWeighted - currentWeighted;
  const neededGrade = neededWeighted / (finalWeight / 100);
  
  return Math.min(100, Math.max(0, neededGrade));
}
```

---

## How to Use Content (for SEO section)

1. Choose calculation mode (weighted average or points)
2. Create categories (tests, homework, quizzes, etc.)
3. Add assignments with grades and weights
4. Set category weights (must total 100%)
5. Optionally drop lowest grades in categories
6. Click calculate to see current grade and letter grade
7. Use what-if calculator to see what you need on remaining assignments

---

## About Content (for SEO section)

Our free grade calculator helps you calculate your final grade with weighted averages or point systems. Organize your assignments by category (tests, homework, quizzes, etc.) and set weights for each category. The calculator automatically computes your current grade and converts it to a letter grade. Use the what-if feature to determine what grade you need on remaining assignments to achieve your target. Supports dropping lowest grades in categories and both percentage and points-based grading systems. Perfect for students tracking their grades throughout the semester. All calculations happen in your browser with complete privacy and instant results.
