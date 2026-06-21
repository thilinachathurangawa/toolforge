# SPEC: Date Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/DATE_CALCULATOR.md`
**Status:** Pending
**Slug:** `date-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Date Calculator — Calculate Days Between Dates | ToolForge`
- **Description:** `Calculate the difference between two dates instantly. Find days, weeks, months, and years between dates with our free date calculator.`
- **Primary Keyword:** date calculator
- **Secondary Keywords:** days between dates, date difference calculator, calculate days between two dates, date duration calculator

---

## Functional Requirements

- [ ] Start date input (date picker)
- [ ] End date input (date picker)
- [ ] Swap dates button
- [ ] Calculate difference in days, weeks, months, years
- [ ] Include/exclude end date option
- [ ] Working days only calculation (exclude weekends)
- [ ] Business days calculation (exclude weekends + holidays)
- [ ] Add/subtract days from a date
- [ ] Display results in multiple formats
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in Date object)

---

## Library

No external library needed — use built-in JavaScript Date object

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Date Calculator                        │
├─────────────────────────────────────────┤
│  Mode: [Calculate Difference] [Add/Subtract] │
│                                         │
│  Start Date: [01/01/2024       ]       │
│  End Date:   [01/15/2024       ]       │
│  [Swap Dates]                          │
│                                         │
│  Options:                               │
│  [ ] Include end date                  │
│  [ ] Weekends only                      │
│  [ ] Business days (excl. holidays)     │
│                                         │
│  [Calculate]                           │
├─────────────────────────────────────────┤
│  Results:                               │
│  Days: 14                              │
│  Weeks: 2                              │
│  Months: 0.46                          │
│  Years: 0.04                           │
│  Working Days: 10                      │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: 'difference' | 'addSubtract';
  startDate: Date | null;
  endDate: Date | null;
  includeEndDate: boolean;
  weekendsOnly: boolean;
  businessDays: boolean;
  addSubtractMode: 'add' | 'subtract';
  addSubtractDays: number;
  addSubtractMonths: number;
  addSubtractYears: number;
  result: {
    days: number;
    weeks: number;
    months: number;
    years: number;
    workingDays: number;
    businessDays: number;
  };
}
```

---

## Formulas

```typescript
// Date Difference Calculation
function calculateDateDifference(
  startDate: Date,
  endDate: Date,
  includeEndDate: boolean = false
): {
  days: number;
  weeks: number;
  months: number;
  years: number;
} {
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time components to midnight
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const adjustedDays = includeEndDate ? diffDays + 1 : diffDays;
  const weeks = adjustedDays / 7;
  const years = adjustedDays / 365.25;
  const months = years * 12;
  
  return {
    days: adjustedDays,
    weeks: Math.floor(weeks),
    months: Math.floor(months),
    years: Math.floor(years)
  };
}

// Working Days Calculation (exclude weekends)
function calculateWorkingDays(startDate: Date, endDate: Date): number {
  
  let count = 0;
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday (6) or Sunday (0)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

// Business Days Calculation (exclude weekends + holidays)
function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  holidays: Date[] = []
): number {
  
  let count = 0;
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  const holidaySet = new Set(
    holidays.map(h => h.toDateString())
  );
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isHoliday = holidaySet.has(current.toDateString());
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

// Add/Subtract Days from Date
function addSubtractFromDate(
  date: Date,
  days: number,
  months: number = 0,
  years: number = 0,
  mode: 'add' | 'subtract' = 'add'
): Date {
  
  const result = new Date(date);
  const multiplier = mode === 'add' ? 1 : -1;
  
  result.setDate(result.getDate() + (days * multiplier));
  result.setMonth(result.getMonth() + (months * multiplier));
  result.setFullYear(result.getFullYear() + (years * multiplier));
  
  return result;
}

// Calculate Age from Birthdate
function calculateAge(birthdate: Date): {
  years: number;
  months: number;
  days: number;
} {
  
  const today = new Date();
  const birth = new Date(birthdate);
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months, days };
}

// Common US Holidays (simplified)
function getUSHolidays(year: number): Date[] {
  const holidays: Date[] = [];
  
  // New Year's Day
  holidays.push(new Date(year, 0, 1));
  
  // Martin Luther King Jr. Day (3rd Monday in January)
  const mlkDay = new Date(year, 0, 1);
  while (mlkDay.getDay() !== 1) {
    mlkDay.setDate(mlkDay.getDate() + 1);
  }
  mlkDay.setDate(mlkDay.getDate() + 14);
  holidays.push(mlkDay);
  
  // Presidents Day (3rd Monday in February)
  const presidentsDay = new Date(year, 1, 1);
  while (presidentsDay.getDay() !== 1) {
    presidentsDay.setDate(presidentsDay.getDate() + 1);
  }
  presidentsDay.setDate(presidentsDay.getDate() + 14);
  holidays.push(presidentsDay);
  
  // Memorial Day (last Monday in May)
  const memorialDay = new Date(year, 4, 31);
  while (memorialDay.getDay() !== 1) {
    memorialDay.setDate(memorialDay.getDate() - 1);
  }
  holidays.push(memorialDay);
  
  // Independence Day
  holidays.push(new Date(year, 6, 4));
  
  // Labor Day (1st Monday in September)
  const laborDay = new Date(year, 8, 1);
  while (laborDay.getDay() !== 1) {
    laborDay.setDate(laborDay.getDate() + 1);
  }
  holidays.push(laborDay);
  
  // Columbus Day (2nd Monday in October)
  const columbusDay = new Date(year, 9, 1);
  while (columbusDay.getDay() !== 1) {
    columbusDay.setDate(columbusDay.getDate() + 1);
  }
  columbusDay.setDate(columbusDay.getDate() + 7);
  holidays.push(columbusDay);
  
  // Veterans Day
  holidays.push(new Date(year, 10, 11));
  
  // Thanksgiving (4th Thursday in November)
  const thanksgiving = new Date(year, 10, 1);
  while (thanksgiving.getDay() !== 4) {
    thanksgiving.setDate(thanksgiving.getDate() + 1);
  }
  thanksgiving.setDate(thanksgiving.getDate() + 21);
  holidays.push(thanksgiving);
  
  // Christmas Day
  holidays.push(new Date(year, 11, 25));
  
  return holidays;
}
```

---

## How to Use Content (for SEO section)

1. Select the start date using the date picker
2. Select the end date using the date picker
3. Choose calculation options (include end date, weekends only, business days)
4. Click calculate to see the difference in days, weeks, months, and years
5. Use the swap button to quickly reverse the dates
6. Copy the results for easy sharing

---

## About Content (for SEO section)

Our free date calculator helps you quickly calculate the difference between two dates. Simply select a start date and end date to instantly see the number of days, weeks, months, and years between them. The calculator supports working days calculation (excluding weekends) and business days calculation (excluding weekends and holidays). Perfect for project planning, calculating age, determining contract durations, or any situation where you need to know the time between two dates. You can also add or subtract days, months, or years from a specific date. All calculations happen in your browser with complete privacy and instant results.
