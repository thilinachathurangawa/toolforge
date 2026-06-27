# SPEC: Unix Timestamp Converter
**File:** `docs/specs/tools/developer/UNIX_TIMESTAMP_CONVERTER.md`
**Status:** Completed
**Slug:** `unix-timestamp-converter`
**Category:** developer

---

## SEO

- **Title:** `Unix Timestamp Converter — Epoch to Date Online | ToolForge`
- **Description:** `Convert Unix timestamps to human-readable dates and back. See current epoch time live. Supports seconds and milliseconds. Free, no sign-up, runs in your browser.`
- **Primary Keywords:** unix timestamp converter, epoch to date, current unix time online
- **Secondary Keywords:** convert epoch time to date, UTC to local time calculator, unix time to human readable

---

## Functional Requirements

- Real-time "Current Unix Time" banner (seconds, refreshes every second)
- Block 1 — Timestamp → Date:
  - Numeric input (auto-detects 10-digit seconds vs 13-digit milliseconds)
  - Output: local time, UTC time, relative time ("3 minutes ago")
- Block 2 — Date → Timestamp:
  - Individual selectors: Year, Month, Day, Hour, Minute, Second
  - ISO string input field (alternative)
  - Output: epoch in seconds and milliseconds
- Copy buttons for all outputs
- All processing via JavaScript `Date` object; no network calls

---

## UI Layout

```
┌──────────────────────────────────────────────┐
│  Current Unix Time: 1719475200  [seconds]    │
│  (updating every second)                     │
├──────────────────────────────────────────────┤
│  TIMESTAMP → DATE                            │
│  Input: [_______________] (s or ms)          │
│  Local:  Fri Jun 27 2025 12:00:00 GMT+0500   │
│  UTC:    Fri, 27 Jun 2025 07:00:00 GMT       │
│  Relative: 3 minutes ago                     │
├──────────────────────────────────────────────┤
│  DATE → TIMESTAMP                            │
│  Year [2025] Month [06] Day [27]             │
│  Hour [12]   Min   [00] Sec  [00]            │
│  ISO: [2025-06-27T07:00:00Z]                 │
│  Epoch (s):  1719475200  [Copy]              │
│  Epoch (ms): 1719475200000  [Copy]           │
└──────────────────────────────────────────────┘
```

---

## Notes

- The 2038 problem: 32-bit signed integers overflow on 19 Jan 2038 at 03:14:07 UTC.
  Include a brief educational note in the SEO content.
- Auto-detect seconds vs milliseconds based on digit count (10 → seconds, 13 → ms).
