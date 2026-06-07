# SPEC: Internet Speed Test Tool
**File:** `docs/specs/tools/network/INTERNET_SPEED_TEST.md`  
**Status:** Pending  
**Slug:** `internet-speed-test`  
**Category:** network

---

## SEO

- **Title:** `Internet Speed Test — Check Download & Upload Speed | ToolForge`
- **Description:** `Test your internet connection speed with our free online speed test. Measure download, upload, latency, and jitter using Cloudflare's network.`
- **Primary Keyword:** internet speed test
- **Secondary Keywords:** network speed test, bandwidth test, connection speed, download speed, upload speed

---

## Functional Requirements

- [ ] Start/Stop speed test button
- [ ] Display download speed (Mbps)
- [ ] Display upload speed (Mbps)
- [ ] Display latency/ping (ms)
- [ ] Display jitter (ms)
- [ ] Progress indicator during test
- [ ] Visual speed meter/gauge
- [ ] Test history (last 5 tests)
- [ ] Server location selection (optional)
- [ ] Share results button
- [ ] Use @cloudflare/speedtest library

---

## Library

@cloudflare/speedtest - Cloudflare's speed test SDK for accurate network performance measurement

---

## UI Layout

```
┌─────────────────────────────────┐
│  [Start Speed Test] button       │
│                                 │
│  Download: ████████░░ 85.2 Mbps │
│  Upload:   ██████░░░░ 42.1 Mbps │
│  Ping:     12 ms                │
│  Jitter:   3 ms                 │
│                                 │
│  [Stop] [Share Results]         │
├─────────────────────────────────┤
│  Test History:                  │
│  • 85.2/42.1 Mbps - 2 min ago   │
│  • 78.5/38.2 Mbps - 1 hour ago  │
│  • 92.1/45.8 Mbps - Yesterday   │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  latency: number; // ms
  jitter: number; // ms
  timestamp: Date;
}

state: {
  isRunning: boolean;
  currentTest: SpeedTestResult | null;
  history: SpeedTestResult[];
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Click "Start Speed Test" to begin measuring your internet connection
2. Wait for the test to complete (typically 10-30 seconds)
3. View your download, upload speeds, ping, and jitter results
4. Check your test history to compare previous results
5. Share your results if needed

---

## About Content (for SEO section)

Our internet speed test uses Cloudflare's global network to accurately measure your connection's download and upload speeds, latency, and jitter. The test runs directly in your browser using Cloudflare's speed test SDK, providing reliable results without requiring any software installation. Perfect for checking your ISP's performance, troubleshooting network issues, or verifying you're getting the speeds you pay for.
