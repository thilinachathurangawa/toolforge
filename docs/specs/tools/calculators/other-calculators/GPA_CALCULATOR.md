# SPEC: GPA Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/GPA_CALCULATOR.md`
**Status:** Pending
**Slug:** `gpa-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `GPA Calculator — Calculate Grade Point Average | ToolForge`
- **Description:** `Calculate your GPA instantly with our free GPA calculator. Supports 4.0 scale, weighted GPA, and custom grading scales.`
- **Primary Keyword:** gpa calculator
- **Secondary Keywords:** grade point average calculator, weighted gpa calculator, cumulative gpa calculator, college gpa calculator

---

## Functional Requirements

- [ ] Add/remove course rows
- [ ] Course name input (optional)
- [ ] Grade selection (A, B, C, D, F, +/-)
- [ ] Credit hours input
- [ ] Course type (regular, honors, AP, IB)
- [ ] GPA scale selection (4.0, 5.0, custom)
- [ ] Weighted GPA calculation
- [ ] Unweighted GPA calculation
- [ ] Cumulative GPA with previous GPA
- [ ] Semester/term grouping
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in GPA calculation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  GPA Calculator                         │
├─────────────────────────────────────────┤
│  GPA Scale: [4.0 Scale ▼]               │
│                                         │
│  Course 1:                              │
│  Name: [Mathematics          ]          │
│  Grade: [A ▼]  Credits: [3]            │
│  Type: [Regular ▼]                      │
│                                         │
│  Course 2:                              │
│  Name: [English               ]          │
│  Grade: [B+ ▼] Credits: [4]            │
│  Type: [Honors ▼]                       │
│                                         │
│  [+ Add Course]                         │
│                                         │
│  Previous GPA (optional):               │
│  GPA: [3.5]  Credits: [30]              │
│                                         │
│  [Calculate GPA]                        │
├─────────────────────────────────────────┤
│  Results:                               │
│  Current Semester GPA: 3.67            │
│  Cumulative GPA: 3.58                   │
│  Total Credits: 37                      │
│  Quality Points: 132.46                │
│                                         │
│  Grade Breakdown:                       │
│  A: 2 courses (6 credits)               │
│  B+: 1 course (4 credits)               │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  gpaScale: '4.0' | '5.0' | 'custom';
  customScale: { [grade: string]: number };
  courses: {
    name: string;
    grade: string;
    credits: number;
    type: 'regular' | 'honors' | 'ap' | 'ib';
  }[];
  previousGPA: {
    gpa: number;
    credits: number;
  };
  results: {
    semesterGPA: number;
    cumulativeGPA: number;
    totalCredits: number;
    qualityPoints: number;
    gradeBreakdown: { [grade: string]: { count: number; credits: number } };
  };
}
```

---

## Formulas

```typescript
// Standard 4.0 GPA Scale
const STANDARD_4_0_SCALE: { [grade: string]: number } = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0
};

// Course type weights
const COURSE_WEIGHTS: { [type: string]: number } = {
  'regular': 1.0,
  'honors': 1.05,
  'ap': 1.1,
  'ib': 1.1
};

// Get grade points for a grade
function getGradePoints(
  grade: string,
  scale: '4.0' | '5.0' | 'custom',
  customScale?: { [grade: string]: number }
): number {
  
  if (scale === 'custom' && customScale) {
    return customScale[grade] || 0;
  }
  
  const gradePoints = STANDARD_4_0_SCALE[grade] || 0;
  
  if (scale === '5.0') {
    // Convert to 5.0 scale (A = 5.0)
    return gradePoints * 1.25;
  }
  
  return gradePoints;
}

// Calculate quality points for a course
function calculateQualityPoints(
  grade: string,
  credits: number,
  type: string,
  scale: '4.0' | '5.0' | 'custom',
  customScale?: { [grade: string]: number }
): number {
  
  const gradePoints = getGradePoints(grade, scale, customScale);
  const weight = COURSE_WEIGHTS[type] || 1.0;
  return gradePoints * credits * weight;
}

// Calculate semester GPA
function calculateSemesterGPA(
  courses: { grade: string; credits: number; type: string }[],
  scale: '4.0' | '5.0' | 'custom',
  customScale?: { [grade: string]: number }
): {
  gpa: number;
  totalCredits: number;
  qualityPoints: number;
} {
  
  let totalCredits = 0;
  let qualityPoints = 0;
  
  courses.forEach(course => {
    const qp = calculateQualityPoints(
      course.grade,
      course.credits,
      course.type,
      scale,
      customScale
    );
    qualityPoints += qp;
    totalCredits += course.credits;
  });
  
  const gpa = totalCredits > 0 ? qualityPoints / totalCredits : 0;
  
  return { gpa, totalCredits, qualityPoints };
}

// Calculate cumulative GPA with previous GPA
function calculateCumulativeGPA(
  currentSemester: { gpa: number; totalCredits: number; qualityPoints: number },
  previousGPA: { gpa: number; credits: number }
): {
  cumulativeGPA: number;
  totalCredits: number;
  totalQualityPoints: number;
} {
  
  const totalCredits = currentSemester.totalCredits + previousGPA.credits;
  const previousQualityPoints = previousGPA.gpa * previousGPA.credits;
  const totalQualityPoints = currentSemester.qualityPoints + previousQualityPoints;
  const cumulativeGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  
  return { cumulativeGPA, totalCredits, totalQualityPoints };
}

// Calculate unweighted GPA (no course type weights)
function calculateUnweightedGPA(
  courses: { grade: string; credits: number }[],
  scale: '4.0' | '5.0' | 'custom',
  customScale?: { [grade: string]: number }
): {
  gpa: number;
  totalCredits: number;
  qualityPoints: number;
} {
  
  let totalCredits = 0;
  let qualityPoints = 0;
  
  courses.forEach(course => {
    const gradePoints = getGradePoints(course.grade, scale, customScale);
    qualityPoints += gradePoints * course.credits;
    totalCredits += course.credits;
  });
  
  const gpa = totalCredits > 0 ? qualityPoints / totalCredits : 0;
  
  return { gpa, totalCredits, qualityPoints };
}

// Calculate grade breakdown
function calculateGradeBreakdown(
  courses: { grade: string; credits: number }[]
): { [grade: string]: { count: number; credits: number } } {
  
  const breakdown: { [grade: string]: { count: number; credits: number } } = {};
  
  courses.forEach(course => {
    if (!breakdown[course.grade]) {
      breakdown[course.grade] = { count: 0, credits: 0 };
    }
    breakdown[course.grade].count++;
    breakdown[course.grade].credits += course.credits;
  });
  
  return breakdown;
}

// Calculate GPA needed to reach target
function calculateGPANeeded(
  currentGPA: number,
  currentCredits: number,
  targetGPA: number,
  remainingCredits: number
): number {
  
  const currentQualityPoints = currentGPA * currentCredits;
  const targetQualityPoints = targetGPA * (currentCredits + remainingCredits);
  const neededQualityPoints = targetQualityPoints - currentQualityPoints;
  return neededQualityPoints / remainingCredits;
}
```

---

## How to Use Content (for SEO section)

1. Select your GPA scale (4.0, 5.0, or custom)
2. Add courses by entering name, grade, and credits
3. Select course type (regular, honors, AP, IB) for weighted calculation
4. Optionally enter previous GPA and credits for cumulative calculation
5. Click calculate to see semester and cumulative GPA
6. View grade breakdown and quality points

---

## About Content (for SEO section)

Our free GPA calculator helps you calculate your grade point average instantly. Enter your courses, grades, and credit hours to automatically calculate your semester GPA. The calculator supports weighted GPA calculations for honors, AP, and IB courses, and can compute cumulative GPA when you include previous semester data. Choose from standard 4.0 scale, 5.0 scale, or create a custom grading scale. Perfect for high school and college students tracking their academic progress. The calculator also shows grade breakdowns and quality points, and can help you determine what GPA you need to reach your target. All calculations happen in your browser with complete privacy and instant results.
