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

### Implementation notes

- The component passes an explicit `measurements` array: Cloudflare's default
  ladder **minus the `packetLoss` phase**. Do not re-add it. That phase relays
  UDP through a TURN server and fetches credentials from
  `https://speed.cloudflare.com/turn-creds`, which is CORS-restricted to
  `https://speed.cloudflare.com` (any other origin gets `403`). Left in, it
  fails on every run with "Error while measuring packet loss: unable to get
  turn server credentials." Packet loss is not part of this tool's output.
  `/__down` and `/__up` are open (`Access-Control-Allow-Origin: *`), so
  download, upload, latency, and jitter all work cross-origin.
- `logMeasurementApiUrl` and `logAimApiUrl` are both `null`, so no telemetry
  request is made — only the measurement traffic itself leaves the browser.
  The privacy claim in `TOOL_CONTENT` depends on keeping both disabled.
- Mid-run connection errors are collected, not shown immediately: they surface
  after the run as a fatal error when nothing at all was measured, otherwise as
  a warning alongside the partial figures. A 2-minute watchdog finalizes a
  stalled run instead of leaving the button on "Testing...".

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
