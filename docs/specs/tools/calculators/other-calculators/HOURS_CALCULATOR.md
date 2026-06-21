# SPEC: Hours Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/HOURS_CALCULATOR.md`
**Status:** Pending
**Slug:** `hours-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Hours Calculator — Calculate Work Hours & Time Cards | ToolForge`
- **Description:** `Calculate total work hours easily with our free hours calculator. Track time cards, calculate weekly hours, and compute overtime pay.`
- **Primary Keyword:** hours calculator
- **Secondary Keywords:** work hours calculator, time card calculator, weekly hours calculator, overtime calculator

---

## Functional Requirements

- [ ] Multiple time entry rows (start time, end time, break)
- [ ] Add/remove time entry rows
- [ ] Calculate daily hours
- [ ] Calculate total weekly hours
- [ ] Overtime calculation (customizable threshold)
- [ ] Break time deduction
- [ ] 12-hour and 24-hour format support
- [ ] AM/PM toggle
- [ ] Export/Import time entries
- [ ] Copy results to clipboard
- [ ] No external library needed

---

## Library

No external library needed — use built-in time calculation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Hours Calculator                        │
├─────────────────────────────────────────┤
│  Monday:                                │
│  Start: [09:00 AM] End: [05:00 PM]      │
│  Break: [00:30]                         │
│  Hours: 7.5                             │
│                                         │
│  Tuesday:                               │
│  Start: [09:00 AM] End: [05:00 PM]      │
│  Break: [00:30]                         │
│  Hours: 7.5                             │
│                                         │
│  [+ Add Day]                            │
│                                         │
│  Overtime Threshold: [40] hours/week    │
│  Hourly Rate: [$15.00] (optional)       │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Total Regular Hours: 40.00            │
│  Total Overtime Hours: 5.00             │
│  Total Hours: 45.00                     │
│                                         │
│  Regular Pay: $600.00                   │
│  Overtime Pay: $112.50                  │
│  Total Pay: $712.50                     │
│                                         │
│  [Copy Results] [Export CSV]            │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  timeEntries: {
    day: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
  }[];
  overtimeThreshold: number;
  hourlyRate: number;
  format: '12hour' | '24hour';
  results: {
    totalRegularHours: number;
    totalOvertimeHours: number;
    totalHours: number;
    regularPay: number;
    overtimePay: number;
    totalPay: number;
  };
}
```

---

## Formulas

```typescript
// Calculate hours worked in a day
function calculateDailyHours(
  startTime: string,
  endTime: string,
  breakMinutes: number,
  format: '12hour' | '24hour'
): number {
  
  const start = parseTime(startTime, format);
  const end = parseTime(endTime, format);
  
  let hours = end.hours - start.hours;
  let minutes = end.minutes - start.minutes;
  
  // Handle overnight shifts
  if (hours < 0 || (hours === 0 && minutes < 0)) {
    hours += 24;
  }
  
  const totalMinutes = (hours * 60) + minutes - breakMinutes;
  return totalMinutes / 60;
}

// Parse time string to hours and minutes
function parseTime(timeStr: string, format: '12hour' | '24hour'): {
  hours: number;
  minutes: number;
} {
  
  const [time, period] = timeStr.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  
  let hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  
  if (format === '12hour' && period) {
    const isPM = period.toUpperCase() === 'PM';
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  }
  
  return { hours, minutes };
}

// Calculate total weekly hours
function calculateWeeklyHours(
  timeEntries: { startTime: string; endTime: string; breakMinutes: number }[],
  format: '12hour' | '24hour'
): number {
  
  return timeEntries.reduce((total, entry) => {
    return total + calculateDailyHours(
      entry.startTime,
      entry.endTime,
      entry.breakMinutes,
      format
    );
  }, 0);
}

// Calculate overtime hours
function calculateOvertimeHours(
  totalHours: number,
  threshold: number
): number {
  
  return Math.max(0, totalHours - threshold);
}

// Calculate regular hours
function calculateRegularHours(
  totalHours: number,
  overtimeHours: number
): number {
  
  return totalHours - overtimeHours;
}

// Calculate pay
function calculatePay(
  regularHours: number,
  overtimeHours: number,
  hourlyRate: number,
  overtimeMultiplier: number = 1.5
): {
  regularPay: number;
  overtimePay: number;
  totalPay: number;
} {
  
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
  const totalPay = regularPay + overtimePay;
  
  return { regularPay, overtimePay, totalPay };
}

// Format decimal hours to HH:MM
function formatDecimalHours(decimalHours: number): string {
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// Calculate hours between two time strings
function hoursBetween(
  startTime: string,
  endTime: string,
  format: '12hour' | '24hour'
): number {
  
  const start = parseTime(startTime, format);
  const end = parseTime(endTime, format);
  
  let hours = end.hours - start.hours;
  let minutes = end.minutes - start.minutes;
  
  // Handle overnight
  if (hours < 0 || (hours === 0 && minutes < 0)) {
    hours += 24;
  }
  
  return hours + (minutes / 60);
}

// Weekly summary by day
function calculateDailySummary(
  timeEntries: { day: string; startTime: string; endTime: string; breakMinutes: number }[],
  format: '12hour' | '24hour'
): { day: string; hours: number }[] {
  
  return timeEntries.map(entry => ({
    day: entry.day,
    hours: calculateDailyHours(entry.startTime, entry.endTime, entry.breakMinutes, format)
  }));
}
```

---

## How to Use Content (for SEO section)

1. Add time entries for each day worked
2. Enter start time, end time, and break duration for each day
3. Set the overtime threshold (default 40 hours/week)
4. Optionally enter hourly rate for pay calculation
5. Click calculate to see total hours, overtime, and pay
6. Export results to CSV or copy to clipboard

---

## About Content (for SEO section)

Our free hours calculator helps you track work hours and calculate time cards with ease. Enter your start time, end time, and break duration for each day to automatically calculate daily and weekly hours. The calculator identifies overtime hours based on a customizable threshold and can calculate pay including overtime at 1.5x rate. Perfect for employees tracking time, freelancers billing clients, or employers managing payroll. Supports both 12-hour (AM/PM) and 24-hour formats, and allows you to export your time entries to CSV. All calculations happen in your browser with complete privacy and instant results.
