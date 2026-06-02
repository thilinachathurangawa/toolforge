# SPEC: Cron Expression Builder Tool
**File:** `docs/specs/tools/developer/CRON_BUILDER.md`
**Status:** Completed
**Slug:** `cron-builder`
**Category:** developer

---

## SEO

- **Title:** `Cron Expression Builder — Build Cron Schedules Online | ToolForge`
- **Description:** `Build cron expressions with a visual interface. Test cron schedules and view next execution times. No sign-up required.`
- **Primary Keyword:** cron builder
- **Secondary Keywords:** cron expression, cron schedule builder, cron generator

---

## Functional Requirements

- [ ] Preset schedules (every minute, hourly, daily, etc.)
- [ ] Minute input (0-59 or *)
- [ ] Hour input (0-23 or *)
- [ ] Day of month input (1-31 or *)
- [ ] Month input (1-12 or *)
- [ ] Day of week input (0-6 or *)
- [ ] Build expression button
- [ ] Copy expression button
- [ ] Show next 5 scheduled runs
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  Presets:                       │
│  [Every minute] [Every hour]     │
│  [Daily at midnight] [Weekly]   │
│                                 │
│  Minute: [*]   Hour: [*]        │
│  Day of Month: [*]  Month: [*]  │
│  Day of Week: [*]               │
│                                 │
│  [Build]                        │
├─────────────────────────────────┤
│  Cron Expression:               │
│  ┌───────────────────────────┐  │
│  │ * * * * *                 │  │
│  └───────────────────────────┘  │
│                                 │
│  Next 5 Runs:                   │
│  ┌───────────────────────────┐  │
│  │ 1. [date/time]            │  │
│  │ 2. [date/time]            │  │
│  │ 3. [date/time]            │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  expression: string;
  nextRuns: string[];
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Select a preset schedule or configure custom values
2. Set minute, hour, day of month, month, and day of week
3. Click "Build" to generate the cron expression
4. Review the next 5 scheduled execution times
5. Copy the cron expression for your crontab

---

## About Content (for SEO section)

Our cron expression builder creates cron schedules with a visual interface entirely in your browser. Build complex schedules without memorizing cron syntax. View next execution times to verify your schedule. Perfect for setting up automated tasks, scheduling jobs, or learning cron expressions. No data is sent to any server — all generation happens locally on your device.
