# SPEC: Time Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/TIME_CALCULATOR.md`
**Status:** Pending
**Slug:** `time-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Time Calculator — Add or Subtract Time | ToolForge`
- **Description:** `Add or subtract time easily with our free time calculator. Calculate time differences, add hours and minutes, or subtract time periods.`
- **Primary Keyword:** time calculator
- **Secondary Keywords:** add time calculator, subtract time calculator, time difference calculator, add hours and minutes

---

## Functional Requirements

- [ ] Time input (hours, minutes, seconds)
- [ ] Add time mode
- [ ] Subtract time mode
- [ ] Time difference between two times
- [ ] Convert between time units (hours to minutes, etc.)
- [ ] 12-hour and 24-hour format support
- [ ] AM/PM toggle for 12-hour format
- [ ] Real-time calculation
- [ ] Copy results to clipboard
- [ ] No external library needed (built-in time math)

---

## Library

No external library needed — use built-in time calculation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Time Calculator                        │
├─────────────────────────────────────────┤
│  Mode: [Add Time] [Subtract] [Difference] │
│                                         │
│  Time 1:                                │
│  Hours: [02] Minutes: [30] Seconds: [45] │
│  [12-hour] [24-hour]  [AM] [PM]         │
│                                         │
│  Time 2:                                │
│  Hours: [01] Minutes: [15] Seconds: [30] │
│  [12-hour] [24-hour]  [AM] [PM]         │
│                                         │
│  [Calculate]                            │
├─────────────────────────────────────────┤
│  Results:                               │
│  Total: 03:46:15                        │
│  Total Hours: 3.77                      │
│  Total Minutes: 226.25                 │
│  Total Seconds: 13575                   │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  mode: 'add' | 'subtract' | 'difference';
  time1: { hours: number; minutes: number; seconds: number; isPM: boolean };
  time2: { hours: number; minutes: number; seconds: number; isPM: boolean };
  format: '12hour' | '24hour';
  result: {
    hours: number;
    minutes: number;
    seconds: number;
    totalHours: number;
    totalMinutes: number;
    totalSeconds: number;
  };
}
```

---

## Formulas

```typescript
// Convert time to total seconds
function timeToSeconds(hours: number, minutes: number, seconds: number): number {
  return (hours * 3600) + (minutes * 60) + seconds;
}

// Convert seconds to time components
function secondsToTime(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  return { hours, minutes, seconds };
}

// Add two times
function addTimes(
  time1: { hours: number; minutes: number; seconds: number },
  time2: { hours: number; minutes: number; seconds: number }
): {
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
} {
  
  const seconds1 = timeToSeconds(time1.hours, time1.minutes, time1.seconds);
  const seconds2 = timeToSeconds(time2.hours, time2.minutes, time2.seconds);
  const totalSeconds = seconds1 + seconds2;
  
  const time = secondsToTime(totalSeconds);
  const totalHours = totalSeconds / 3600;
  const totalMinutes = totalSeconds / 60;
  
  return {
    ...time,
    totalHours,
    totalMinutes,
    totalSeconds
  };
}

// Subtract two times
function subtractTimes(
  time1: { hours: number; minutes: number; seconds: number },
  time2: { hours: number; minutes: number; seconds: number }
): {
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
} {
  
  const seconds1 = timeToSeconds(time1.hours, time1.minutes, time1.seconds);
  const seconds2 = timeToSeconds(time2.hours, time2.minutes, time2.seconds);
  const totalSeconds = Math.abs(seconds1 - seconds2);
  
  const time = secondsToTime(totalSeconds);
  const totalHours = totalSeconds / 3600;
  const totalMinutes = totalSeconds / 60;
  
  return {
    ...time,
    totalHours,
    totalMinutes,
    totalSeconds
  };
}

// Time difference between two times
function timeDifference(
  time1: { hours: number; minutes: number; seconds: number; isPM: boolean },
  time2: { hours: number; minutes: number; seconds: number; isPM: boolean },
  format: '12hour' | '24hour'
): {
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
} {
  
  let hours1 = time1.hours;
  let hours2 = time2.hours;
  
  // Convert 12-hour to 24-hour
  if (format === '12hour') {
    if (time1.isPM && hours1 !== 12) hours1 += 12;
    if (!time1.isPM && hours1 === 12) hours1 = 0;
    if (time2.isPM && hours2 !== 12) hours2 += 12;
    if (!time2.isPM && hours2 === 12) hours2 = 0;
  }
  
  const seconds1 = timeToSeconds(hours1, time1.minutes, time1.seconds);
  const seconds2 = timeToSeconds(hours2, time2.minutes, time2.seconds);
  const totalSeconds = Math.abs(seconds1 - seconds2);
  
  const time = secondsToTime(totalSeconds);
  const totalHours = totalSeconds / 3600;
  const totalMinutes = totalSeconds / 60;
  
  return {
    ...time,
    totalHours,
    totalMinutes,
    totalSeconds
  };
}

// Convert time units
function convertTimeUnits(
  value: number,
  from: 'hours' | 'minutes' | 'seconds',
  to: 'hours' | 'minutes' | 'seconds'
): number {
  
  const toSeconds = {
    hours: (v: number) => v * 3600,
    minutes: (v: number) => v * 60,
    seconds: (v: number) => v
  };
  
  const fromSeconds = {
    hours: (v: number) => v / 3600,
    minutes: (v: number) => v / 60,
    seconds: (v: number) => v
  };
  
  const inSeconds = toSeconds[from](value);
  return fromSeconds[to](inSeconds);
}

// Format time as HH:MM:SS
function formatTime(hours: number, minutes: number, seconds: number): string {
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Format time as 12-hour with AM/PM
function formatTime12Hour(hours: number, minutes: number, seconds: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');
  return `${displayHours}:${m}:${s} ${period}`;
}
```

---

## How to Use Content (for SEO section)

1. Select the calculation mode (add, subtract, or difference)
2. Enter the first time in hours, minutes, and seconds
3. Enter the second time in hours, minutes, and seconds
4. Choose between 12-hour or 24-hour format
5. For 12-hour format, select AM or PM for each time
6. Click calculate to see the result
7. View the result in multiple time formats

---

## About Content (for SEO section)

Our free time calculator helps you add, subtract, or find the difference between two times. Enter time values in hours, minutes, and seconds to instantly calculate the result. The calculator supports both 12-hour (AM/PM) and 24-hour formats, making it easy to work with any time format. You can convert time between different units (hours to minutes, minutes to seconds, etc.) and see results in multiple formats simultaneously. Perfect for calculating work hours, cooking times, travel durations, or any situation where you need to perform time calculations. All calculations happen in your browser with complete privacy and instant results.
