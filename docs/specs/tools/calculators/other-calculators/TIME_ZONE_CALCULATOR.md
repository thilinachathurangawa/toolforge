# SPEC: Time Zone Calculator Tool
**File:** `docs/specs/tools/calculators/other-calculators/TIME_ZONE_CALCULATOR.md`
**Status:** Pending
**Slug:** `time-zone-calculator`
**Category:** calculator
**Subcategory:** other-calculators

---

## SEO

- **Title:** `Time Zone Calculator — Convert Time Between Time Zones | ToolForge`
- **Description:** `Convert time between time zones instantly with our free time zone calculator. Supports major world cities and daylight saving time.`
- **Primary Keyword:** time zone calculator
- **Secondary Keywords:** time zone converter, world clock, time difference calculator, convert time zones

---

## Functional Requirements

- [ ] Source time zone selection
- [ ] Target time zone selection
- [ ] Date and time input
- [ ] Real-time conversion
- [ ] Multiple time zones comparison
- [ ] Daylight saving time awareness
- [ ] Major world cities list
- [ ] Time difference display
- [ ] Copy results to clipboard
- [ ] Use Intl.DateTimeFormat API

---

## Library

Use built-in `Intl.DateTimeFormat` and `Intl.DateTimeFormatOptions` for time zone conversion

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Time Zone Calculator                   │
├─────────────────────────────────────────┤
│  Date & Time:                           │
│  [01/15/2024] [02:30 PM]               │
│                                         │
│  From: [New York (EST) ▼]               │
│  To:   [London (GMT) ▼]                 │
│                                         │
│  [Convert]                              │
├─────────────────────────────────────────┤
│  Results:                               │
│  New York: 02:30 PM EST                 │
│  London:  07:30 PM GMT                  │
│                                         │
│  Time Difference: +5 hours              │
│                                         │
│  Add More Cities:                       │
│  [+ Tokyo] [+ Paris] [+ Sydney]         │
│                                         │
│  Tokyo:  04:30 AM JST (+14 hours)       │
│  Paris:  08:30 PM CET (+6 hours)        │
│                                         │
│  [Copy Results]                         │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  dateTime: Date;
  fromTimeZone: string;
  toTimeZone: string;
  additionalTimeZones: string[];
  conversions: {
    timeZone: string;
    time: string;
    offset: string;
  }[];
  timeDifference: number;
}
```

---

## Formulas

```typescript
// Convert time between time zones
function convertTimeZone(
  dateTime: Date,
  fromTimeZone: string,
  toTimeZone: string
): { time: string; offset: string; dateTime: Date } {
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: toTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(dateTime);
  
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  
  const month = parseInt(getPart('month')) - 1;
  const day = parseInt(getPart('day'));
  const year = parseInt(getPart('year'));
  const hour = parseInt(getPart('hour'));
  const minute = parseInt(getPart('minute'));
  const second = parseInt(getPart('second'));
  const ampm = parts.find(p => p.type === 'dayPeriod')?.value || '';
  
  const convertedDate = new Date(year, month, day, hour, minute, second);
  
  // Calculate offset
  const fromOffset = getTimeZoneOffset(dateTime, fromTimeZone);
  const toOffset = getTimeZoneOffset(dateTime, toTimeZone);
  const offsetHours = (toOffset - fromOffset) / (1000 * 60 * 60);
  
  const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  const offsetString = offsetHours >= 0 ? `+${offsetHours} hours` : `${offsetHours} hours`;
  
  return {
    time: timeString,
    offset: offsetString,
    dateTime: convertedDate
  };
}

// Get time zone offset in milliseconds
function getTimeZoneOffset(dateTime: Date, timeZone: string): number {
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(dateTime);
  
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');
  
  const year = getPart('year');
  const month = getPart('month') - 1;
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');
  
  const localDate = new Date(year, month, day, hour, minute, second);
  return localDate.getTime() - dateTime.getTime();
}

// Get current time in time zone
function getCurrentTimeInTimeZone(timeZone: string): string {
  
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(now);
}

// Get time difference between time zones
function getTimeDifference(
  dateTime: Date,
  timeZone1: string,
  timeZone2: string
): { hours: number; minutes: number } {
  
  const offset1 = getTimeZoneOffset(dateTime, timeZone1);
  const offset2 = getTimeZoneOffset(dateTime, timeZone2);
  const diffMs = offset2 - offset1;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes };
}

// List of major time zones
const MAJOR_TIME_ZONES = [
  { id: 'America/New_York', name: 'New York (EST/EDT)' },
  { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)' },
  { id: 'America/Chicago', name: 'Chicago (CST/CDT)' },
  { id: 'Europe/London', name: 'London (GMT/BST)' },
  { id: 'Europe/Paris', name: 'Paris (CET/CEST)' },
  { id: 'Europe/Berlin', name: 'Berlin (CET/CEST)' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST)' },
  { id: 'Asia/Shanghai', name: 'Shanghai (CST)' },
  { id: 'Asia/Dubai', name: 'Dubai (GST)' },
  { id: 'Asia/Singapore', name: 'Singapore (SGT)' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)' },
  { id: 'Pacific/Auckland', name: 'Auckland (NZST/NZDT)' },
  { id: 'America/Toronto', name: 'Toronto (EST/EDT)' },
  { id: 'America/Mexico_City', name: 'Mexico City (CST/CDT)' },
  { id: 'America/Sao_Paulo', name: 'São Paulo (BRT)' },
  { id: 'Asia/Mumbai', name: 'Mumbai (IST)' },
  { id: 'Asia/Seoul', name: 'Seoul (KST)' },
  { id: 'Asia/Hong_Kong', name: 'Hong Kong (HKT)' },
  { id: 'Europe/Moscow', name: 'Moscow (MSK)' }
];

// Convert to multiple time zones
function convertToMultipleTimeZones(
  dateTime: Date,
  fromTimeZone: string,
  toTimeZones: string[]
): { timeZone: string; time: string; offset: string }[] {
  
  return toTimeZones.map(tz => {
    const conversion = convertTimeZone(dateTime, fromTimeZone, tz);
    return {
      timeZone: tz,
      time: conversion.time,
      offset: conversion.offset
    };
  });
}

// Check if daylight saving time is active
function isDST(dateTime: Date, timeZone: string): boolean {
  
  const january = new Date(dateTime.getFullYear(), 0, 1);
  const july = new Date(dateTime.getFullYear(), 6, 1);
  
  const janOffset = getTimeZoneOffset(january, timeZone);
  const julOffset = getTimeZoneOffset(july, timeZone);
  const currentOffset = getTimeZoneOffset(dateTime, timeZone);
  
  // In northern hemisphere, DST is in summer (July offset < January offset)
  // In southern hemisphere, DST is in winter (January offset < July offset)
  const stdOffset = Math.min(janOffset, julOffset);
  
  return currentOffset !== stdOffset;
}
```

---

## How to Use Content (for SEO section)

1. Enter the date and time you want to convert
2. Select the source time zone
3. Select the target time zone
4. Click convert to see the converted time
5. View the time difference between zones
6. Add more cities to compare multiple time zones
7. Copy results for easy sharing

---

## About Content (for SEO section)

Our free time zone calculator helps you convert time between different time zones instantly. Enter a date and time, select the source and target time zones, and see the converted time with the time difference. The calculator supports major world cities and automatically accounts for daylight saving time. Add multiple cities to compare times across different regions simultaneously. Perfect for scheduling meetings across time zones, planning travel, or coordinating with international teams. Uses the browser's built-in Intl.DateTimeFormat API for accurate time zone conversions. All calculations happen in your browser with complete privacy and instant results.
