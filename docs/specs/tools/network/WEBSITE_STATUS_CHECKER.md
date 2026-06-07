# SPEC: Website Status Checker Tool
**File:** `docs/specs/tools/network/WEBSITE_STATUS_CHECKER.md`  
**Status:** Pending  
**Slug:** `website-status-checker`  
**Category:** network

---

## SEO

- **Title:** `Website Status Checker — Monitor Uptime & Availability | ToolForge`
- **Description:** `Check if a website is online or down. Monitor uptime, response time, and status codes using UpDown.io API. Free website monitoring.`
- **Primary Keyword:** website status checker
- **Secondary Keywords:** website uptime, is website down, site status, uptime monitor, website availability

---

## Functional Requirements

- [ ] URL input field
- [ ] Check status button
- [ ] Display current status (up/down)
- [ ] Display HTTP status code
- [ ] Display response time
- [ ] Display uptime percentage (if available)
- [ ] Display last check time
- [ ] Show status history (last 10 checks)
- [ ] Auto-refresh toggle
- [ ] Add to monitor list (optional)
- [ ] Use https://updown.io/api (free tier)

---

## Library

No external library needed — use fetch API with updown.io API

---

## UI Layout

```
┌─────────────────────────────────┐
│  URL: [https://example.com]     │
│  [Check Status] [Auto-refresh]  │
├─────────────────────────────────┤
│  Status: ✅ UP                  │
│  HTTP Code: 200 OK             │
│  Response Time: 245ms           │
│  Last Check: Just now           │
│  Uptime: 99.9% (30 days)        │
│                                 │
│  Status History:                │
│  • ✅ UP - 2 min ago (245ms)    │
│  • ✅ UP - 5 min ago (238ms)    │
│  • ✅ UP - 10 min ago (251ms)   │
│  • ⚠️ Slow - 15 min ago (890ms) │
│  • ✅ UP - 20 min ago (242ms)   │
│                                 │
│  [Add to Monitors]              │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface StatusCheck {
  status: 'up' | 'down' | 'slow';
  statusCode: number;
  responseTime: number;
  timestamp: Date;
}

interface WebsiteStatus {
  url: string;
  currentStatus: StatusCheck;
  uptime: number;
  history: StatusCheck[];
}

state: {
  url: string;
  statusData: WebsiteStatus | null;
  autoRefresh: boolean;
  loading: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Enter a website URL in the input field
2. Click "Check Status" to test if the website is online
3. View the current status, HTTP code, and response time
4. Enable auto-refresh for continuous monitoring
5. Check status history to see recent performance

---

## About Content (for SEO section)

Our website status checker uses the UpDown.io API to monitor website availability and performance. Check if a website is up or down, view HTTP status codes, response times, and uptime statistics. The tool shows a history of recent status checks and supports auto-refresh for continuous monitoring. Perfect for website owners, developers, and anyone needing to monitor website uptime.
