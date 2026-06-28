# SPEC: Excel Date Serial Converter Tool
**File:** `docs/specs/tools/workplace/EXCEL_DATE_CONVERTER.md`
**Status:** Pending
**Slug:** `excel-date-converter`
**Category:** workplace
**Subcategory**: excel-tools

---

## SEO

- **Title:** `Excel Date Serial Converter — Serial to Calendar Date | ToolForge`
- Description:** `Convert Excel date serial numbers to calendar dates and vice versa. Includes Google Sheets date system support. Free online converter.`
- **Primary Keyword:** excel date serial converter
- **Secondary Keywords:** excel serial date, excel date number, google sheets date converter, serial date to calendar

---

## Functional Requirements

- [ ] Input for Excel serial number (e.g., 45352)
- [ ] Input for calendar date (date picker)
- [ ] Bidirectional conversion (serial ↔ date)
- [ ] Toggle for Excel date system (default)
- [ ] Toggle for Google Sheets date system (1-day offset)
- [ ] Display formatted date (YYYY-MM-DD, MM/DD/YYYY, etc.)
- [ ] Display day of week
- [ ] Real-time conversion as user types/selects
- [ ] Copy result to clipboard
- [ ] Clear/reset button
- [ ] No external library needed

---

## Library

No external library needed — use built-in Date object

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Excel Date Serial Converter            │
├─────────────────────────────────────────┤
│  Date System:                           │
│  ◉ Excel (1900 system)                  │
│  ○ Google Sheets (1900 system + 1 day)  │
│                                         │
│  Serial Number:                         │
│  [45352                  ]              │
│                                         │
│  Calendar Date:                          │
│  [2024-01-15            ▼]              │
│                                         │
│  Result:                                │
│  Serial 45352 = January 15, 2024        │
│  Day: Monday                            │
│                                         │
│  [Copy Result]  [Clear]                 │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  dateSystem: 'excel' | 'google-sheets';
  serialInput: string;
  dateInput: Date | null;
  result: {
    serial: number | null;
    date: Date | null;
    dayOfWeek: string;
  };
  error: string | null;
}
```

---

## Conversion Logic

```typescript
// Excel date system: Serial 1 = January 1, 1900
// Google Sheets: Serial 1 = December 31, 1899 (1-day offset)

const EXCEL_EPOCH = new Date(1900, 0, 1); // January 1, 1900
const GOOGLE_SHEETS_OFFSET = 1; // Google Sheets is 1 day ahead

// Serial to Date
function serialToDate(serial: number, system: 'excel' | 'google-sheets'): Date {
  let adjustedSerial = serial;
  
  if (system === 'google-sheets') {
    adjustedSerial -= GOOGLE_SHEETS_OFFSET;
  }
  
  // Excel incorrectly treats 1900 as a leap year (includes Feb 29, 1900)
  // We need to adjust for this bug for serial numbers >= 60
  if (adjustedSerial >= 60) {
    adjustedSerial -= 1;
  }
  
  const date = new Date(EXCEL_EPOCH);
  date.setDate(date.getDate() + adjustedSerial - 1);
  
  return date;
}

// Date to Serial
function dateToSerial(date: Date, system: 'excel' | 'google-sheets'): number {
  const excelEpoch = new Date(1900, 0, 1);
  const diffTime = date.getTime() - excelEpoch.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  let serial = diffDays;
  
  // Adjust for Excel's leap year bug (add 1 for dates after Feb 28, 1900)
  if (serial >= 60) {
    serial += 1;
  }
  
  if (system === 'google-sheets') {
    serial += GOOGLE_SHEETS_OFFSET;
  }
  
  return serial;
}

// Get day of week
function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}
```

---

## How to Use Content (for SEO section)

1. Select the date system (Excel or Google Sheets)
2. Enter an Excel serial number or select a calendar date
3. View the converted result instantly
4. See the formatted date and day of the week
5. Toggle between Excel and Google Sheets systems to see the 1-day difference
6. Copy the result to your clipboard
7. Clear the inputs to start a new conversion

---

## About Content (for SEO section)

Our Excel Date Serial Converter converts between Excel's internal date serial numbers and human-readable calendar dates. Excel stores dates as serial numbers where each whole number represents one day starting from January 1, 1900. Google Sheets uses a similar system but with a 1-day offset. This tool handles both systems, so you can accurately convert dates regardless of which spreadsheet application you're using. Perfect for data migration, debugging date calculations, or understanding how spreadsheets store dates. The converter also displays the day of the week for easy reference. All conversions happen instantly in your browser with complete privacy.
