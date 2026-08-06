# SPEC: Internet Speed Test Tool
**File:** `docs/specs/tools/network/INTERNET_SPEED_TEST.md`  
**Status:** v2 shipped — Tier 1 + Tier 2 (E1–E15) implemented; Tier 3 deliberately deferred  
**Slug:** `internet-speed-test`  
**Category:** network

---

## SEO

- **Title:** `Internet Speed Test — Check Download & Upload Speed | ToolForge`
- **Description:** `Test your internet connection speed with our free online speed test. Measure download, upload, latency, and jitter using Cloudflare's network.`
- **Primary Keyword:** internet speed test
- **Secondary Keywords:** network speed test, bandwidth test, connection speed, download speed, upload speed
- **Keywords unlocked by the enhancements below:** bufferbloat test, latency under load, ping test, jitter test, is my internet good enough for zoom/gaming, connection quality test

---

## Functional Requirements

Original v1 scope — all delivered except the one that is technically impossible:

- [x] Start/Stop speed test button
- [x] Display download speed (Mbps)
- [x] Display upload speed (Mbps)
- [x] Display latency/ping (ms)
- [x] Display jitter (ms)
- [x] Progress indicator during test
- [x] Visual speed meter/gauge — semicircular SVG gauge, live during the run (E8)
- [x] Test history — last 20, persisted to `localStorage`, labelled, exportable (E10)
- [ ] Server location selection (optional) — **not possible**, see "Won't do" below
- [x] Share results button — Web Share API with clipboard fallback (E11)
- [x] Use @cloudflare/speedtest library

---

## Library

@cloudflare/speedtest (v1.10.1) — Cloudflare's speed test SDK for accurate network
performance measurement.

### Implementation notes

- **`https://speed.cloudflare.com` must stay in the CSP `connect-src` list in
  `vercel.json`.** It was missing, so the browser blocked every measurement
  request in production — the SDK retried each one 20 times and reported
  "Connection failed to https://speed.cloudflare.com/__down?bytes=0. Gave up
  after 20 retries." The failure is invisible in local development, because
  `vercel.json` headers are only applied by Vercel; `next dev` and `next start`
  serve no CSP at all. Any future measurement host needs the same entry.
- The metadata request uses `__down?bytes=1`, **not** `bytes=0`, and is awaited
  before the engine starts. The SDK's latency phase requests `__down?bytes=0`
  and recovers its timings with
  `performance.getEntriesByName(url).slice(-1)[0]`, so a concurrent request to
  the same URL can be mistaken for a latency sample.
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

### Endpoint capabilities (verified against speed.cloudflare.com)

Checked before speccing the enhancements — this is what our origin can and
cannot get, so no enhancement below is based on a guess:

| Endpoint / field | Cross-origin result |
| --- | --- |
| `GET /__down?bytes=N` | 200, `Access-Control-Allow-Origin: *`, `timing-allow-origin: *` |
| `POST /__up` | 200, open to any origin |
| `server-timing` header | Exposed — already used by the SDK for server processing time |
| `cf-meta-ip` header | **Exposed and populated** — client IP as seen by Cloudflare's edge |
| `cf-meta-request-time` | Exposed and populated |
| `cf-meta-colo`, `-asn`, `-city`, `-country`, `-latitude`, `-longitude` | Listed in `access-control-expose-headers` but **not actually sent** — absent even when the request carries Cloudflare's own `Origin`. Do not build on these. |
| `CF-RAY` (contains the colo code) | Sent but **not** in the expose list, so unreadable from JS |
| `GET /meta` (JSON: colo, asn, city…) | **403** cross-origin |
| `GET /turn-creds` | **403** cross-origin (CORS-locked to `speed.cloudflare.com`) |

### SDK data the v1 UI collects and then discards

The current measurement plan already produces all of the following; v1 reads
only four values out of `getSummary()`. Everything in Tier 1 is therefore free
in bandwidth and test-duration terms:

- `getSummary()` → `downLoadedLatency`, `downLoadedJitter`, `upLoadedLatency`,
  `upLoadedJitter` (loaded latency is measured in-band by parallel pings during
  the download/upload phases; `measureDownloadLoadedLatency` /
  `measureUploadLoadedLatency` default to `true`), plus `totalDurationMs`.
- `getUnloadedLatencyPoints()` → every individual ping sample.
- `getDownloadBandwidthPoints()` / `getUploadBandwidthPoints()` → per-request
  `{ bytes, bps, duration, ping, measTime, transferSize }`.
- `getScores()` → AIM experience scores for `streaming`, `gaming`, `rtc`.
- `results.raw` → per-phase started/finished/error state.

---

## File layout

```
src/components/tools/InternetSpeedTest/
  index.tsx            orchestration, run lifecycle, UI
  types.ts             SpeedTestResult, Rating, Verdict, ThroughputPoint, EdgeMeta
  constants.ts         measurement plans, storage keys, rating bands, scale steps
  utils.ts             SDK extraction, ratings/verdicts, formatting, CSV/JSON export
  Gauge.tsx            semicircular SVG gauge
  ThroughputChart.tsx  inline SVG speed-over-time trace
```

`utils.ts` imports only *types* from the SDK, so its logic is testable without a
browser (it was verified that way: band boundaries, weakest-link verdicts,
unmeasured-metric skipping, CSV escaping).

### Rating bands

Our own bands — deliberately **not** the SDK's AIM scores, for the reason given
under E2. Evaluated in order; anything past the last threshold is `bad`. Defined
in `constants.ts`; keep this table and that file in step.

| Metric | great | good | average | poor |
| --- | --- | --- | --- | --- |
| Idle ping | ≤20 ms | ≤50 ms | ≤100 ms | ≤200 ms |
| Jitter | ≤5 ms | ≤10 ms | ≤30 ms | ≤60 ms |
| Latency increase under load | ≤20 ms | ≤50 ms | ≤100 ms | ≤300 ms |
| Download | ≥50 Mbps | ≥25 Mbps | ≥10 Mbps | ≥5 Mbps |
| Upload | ≥10 Mbps | ≥5 Mbps | ≥3 Mbps | ≥1 Mbps |

Use-case inputs, each verdict taking the **worst** of its inputs and naming it:

| Use case | Inputs |
| --- | --- |
| HD / 4K streaming | download, latency-under-load increase |
| Video calls | upload, ping, jitter, latency-under-load increase |
| Online gaming | ping, jitter, latency-under-load increase |

A metric that wasn't measured is **skipped, never rated `bad`** — a quick run on
a fast link may not produce loaded latency at all (requests finish below the
SDK's `loadedRequestMinDuration`), and an absent measurement must not read as a
failing one.

### Theme note

The codebase's `bg-destructive` / `text-destructive` classes (used in ~82
components) generate **no CSS**: the Tailwind theme defines `--error`, not
`destructive`. In v1 that left the Stop button as white text on a transparent
background. This component therefore uses `red-500` utilities, as ~30 other tool
components already do. Adding a `destructive` colour to `tailwind.config.ts`
would fix all 82 call sites at once, but that is a site-wide visual change and
out of scope here.

---

## Enhancement Options

Grouped by cost, not by appeal. IDs (E1…E21) are referenced by the phase plan.

**Status: E1–E15 are implemented.** E16–E21 remain open, with recommendations
below (most are "don't"). The descriptions are kept as written so the reasoning
behind each decision stays on record.

### Tier 1 — surface data we already measure (no extra network cost, no new deps)

**E1. Bufferbloat / latency under load** ⭐ highest value
Show latency and jitter measured *while the link is saturated*, next to the idle
figures, plus the increase (`max(downLoadedLatency, upLoadedLatency) − latency`)
as a graded verdict. This is the metric that explains "my speed test looks fine
but calls still stutter", and no mainstream free tool on the site covers it.
Present as: Idle 12 ms → Under load 148 ms (+136 ms) → grade. Grade bands come
from the SDK's own `loadedLatencyIncrease` scoring table (≤10 / ≤20 / ≤50 /
≤100 / ≤500 ms). Data: already in `getSummary()`.

**E2. Connection quality verdict ("what this connection can handle")**
Translate the numbers into plain-language verdicts for video streaming, video
calls, and gaming, each with a bad→great rating and a one-line reason.
Two implementation choices:
- (a) Use `results.getScores()` directly. **Caveat that must not be ignored:**
  every AIM experience takes `packetLoss` as an input, and with that phase
  removed the SDK substitutes `0` points for it (`defaultPoints = {packetLoss: 0}`)
  rather than the up-to-10 points a clean link would earn. Scores therefore run
  systematically low — enough to drop a band or two on the `gaming` thresholds
  `[5,15,25,30]`. Only acceptable if labelled as conservative.
- (b) **Recommended:** compute our own three verdicts from the metrics we do
  measure (latency, jitter, loaded-latency increase, download, upload) with the
  thresholds documented in this spec, and don't call them AIM scores. Honest,
  and it doesn't inherit a missing input.

**E3. Latency detail (min / median / max)**
`getUnloadedLatencyPoints()` holds all ~20 samples. A min/median/max row (or a
tiny strip plot) shows whether the link is steady or spiky in a way a single
median can't. Pairs naturally with E1.

**E4. Data used by this test**
Sum `transferSize` over download points and payload bytes over upload points to
report "Data used: 412 MB". The full ladder can move hundreds of MB on a fast
link; on a metered or mobile connection that matters, and it makes the Quick
mode (E9) self-justifying.

**E5. Live speed-over-time chart**
`getDownloadBandwidthPoints()` / `getUploadBandwidthPoints()` carry `bps` plus
`measTime`, which is everything needed for the sparkline-style trace the big
speed tests show while running. Also diagnostic after the fact: a sawtooth trace
means a throttled or congested link, a flat one means a clean pipe.
Implementation note: inline SVG, no chart library — keep the bundle flat.

**E6. Test duration**
`totalDurationMs` — a small "completed in 24.6 s" line. Cheap credibility.

**E7. Your IP and IPv4/IPv6 in use**
One extra `fetch('/__down?bytes=0')` exposes `cf-meta-ip`: the address Cloudflare
saw. Whether it contains `:` tells us the test ran over IPv6 or IPv4 — genuinely
useful context, from the same endpoint we're already hammering, with no third
party involved. (This is what the "server location" ambition in v1's spec can
actually deliver; the edge/ISP fields are not available — see the table above.)

### Tier 2 — UX, presentation, and correctness (no new data source)

**E8. Real gauge + auto-scaling bars**
The original spec asked for a meter/gauge and it was never built. Two problems
to fix together: add an animated arc/needle gauge showing live throughput during
the run, and drop the hard-coded 100 Mbps bar ceiling — any connection above
100 Mbps currently pegs the bar at 100%, so gigabit and 120 Mbps look identical.
Auto-select a scale (100 / 250 / 500 / 1000 / 2500 / 10000 Mbps) from the
measured maximum, and print the chosen ceiling under the bars so the scale is
never ambiguous.
**Decision taken while implementing:** the colour thresholds (`≥50` green,
`≥25` yellow) stay **absolute** rather than scaling with the ceiling. Scaling
them would paint a slow connection green purely because it is the fastest thing
in view — the colour is a judgement about quality, not about the bar.

**E9. Test modes: Quick / Full**
Quick (~10 s, a truncated ladder capped around 10 MB payloads) for a fast check
or a metered connection; Full (current ladder) for accuracy. Show the expected
duration and rough data cost per mode, tied to E4. Implemented purely as
alternative `measurements` arrays — no new SDK surface.

**E10. Persistent history + export**
History is in-memory, so a reload wipes it — while `TOOL_CONTENT` tells users
they can "compare runs across the day or different rooms". Either persist or
stop making the claim. Persist the last ~20 runs to `localStorage`, add a label
field ("kitchen Wi-Fi", "wired"), a clear-history control, and CSV/JSON export.
Keep it strictly local — no upload — so the privacy line still holds.

**E11. Share results**
The remaining unbuilt v1 requirement. `navigator.share()` where available
(mobile), clipboard fallback elsewhere — reusing the Copy text plus any new
metrics. Optional stretch: render a result card to canvas for download as PNG.
Note: results must not be encoded into a shareable URL as if authoritative —
anyone can edit the numbers, so a "verified result" link would be misleading.

**E12. Accessibility**
`role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` on the
progress bar, an `aria-live="polite"` region announcing phase changes and final
figures, and `prefers-reduced-motion` respected by the gauge/chart animations
from E5 and E8.

**E13. Mobile layout**
The latency/jitter `grid-cols-2` is cramped on small screens, and E1–E3 add more
tiles. Move to a responsive grid (single column under `sm`) and check the gauge
and chart at 320 px.

**E14. Re-test latency only**
A "Re-check ping" action that runs just the latency phase (~3 s, negligible
data) for users iterating on Wi-Fi placement or QoS settings, without paying for
a full bandwidth run.

**E15. Result interpretation copy**
Short, honest, in-context explanations next to each metric ("Jitter is the
variation in ping; under 10 ms is stable") rather than only in the SEO body.
Sourced from the existing `TOOL_CONTENT` FAQ material so the two stay aligned.

### Tier 3 — needs a server, a third party, or a compromise (deliberate decisions)

**E16. Packet loss** — currently impossible client-side, and worth writing down
why. The only route is proxying `turn-creds` through our own Next.js route
handler to launder the CORS restriction; the WebRTC/TURN relay traffic itself
would still be direct. Costs: a server route to maintain, a dependency on an
undocumented Cloudflare endpoint that is clearly not meant for third-party use,
and it complicates the "no server involved" story. **Recommendation: don't.**
Keep the `PING_TOOL` for loss-adjacent diagnosis and leave packet loss out of
this tool's claims.

**E17. Edge/server location and ISP name** — not obtainable from Cloudflare at
our origin (see the table: `cf-meta-colo`/`-asn`/`-city` are advertised but
never sent, `/meta` is 403, `CF-RAY` isn't exposed). The only way is a
third-party geo API — `ipapi.co`, which `AddressLookup` already calls. That
sends the user's IP to a third party, which contradicts this tool's current
privacy claim. If it ships at all it must be **opt-in behind an explicit
button**, name the service in the UI, and `TOOL_CONTENT` must be updated to say
data leaves the browser for that lookup. Otherwise link to `address-lookup`
instead and keep this tool clean. Prefer E7.

**E18. IPv4 vs IPv6 reachability badges** — the SDK has `v4Reachability` /
`v6Reachability` phases, but they need v4-only and v6-only hostnames and
Cloudflare provides none we can rely on, so it means adopting third-party hosts.
E7 already answers "which protocol did this test actually use" for free.
**Recommendation: skip in favour of E7.**

**E19. Historical trend chart** — a chart of saved runs over days/weeks. Depends
on E10; only worth building once persistence exists and there's data to plot.

**E20. Scheduled / repeat testing** — run every N minutes and chart stability,
for diagnosing intermittent drops. Genuinely useful but heavy: long-lived
timers, tab-throttling behaviour, and a lot of data consumed. Defer until E5,
E9, and E10 are in.

**E21. ISP/plan comparison ("faster than 78% of connections")** — needs a
dataset we don't have and cannot invent. **Won't do.**

### Won't do (with reasons, so it isn't re-proposed)

- **Server location *selection*** (in the original requirements): Cloudflare's
  anycast network routes every request to the nearest edge; there is no
  server-picking API on `/__down` or `/__up`. The dropdown implied by v1's spec
  cannot be built, and a cosmetic one would violate the project's rule against
  non-functional controls.
- **Fabricated packet-loss figure** derived from failed HTTP requests: HTTP
  retries and TCP recovery make this meaningless as a loss percentage. Report
  nothing rather than a number that looks authoritative and isn't.

---

## Delivery status

**Phase 1 — the measurement story (E1, E3, E6, E12, E13)** — ✅ shipped.
Latency under load with a graded verdict, ping min/max/sample count, run
duration, `role="progressbar"` with aria values plus an `aria-live` status
region, and a single-column layout under `sm`.

**Phase 2 — make it feel like a speed test (E5, E8, E4)** — ✅ shipped.
Inline-SVG gauge (live during the run) and speed-over-time trace, both with
`motion-reduce` fallbacks; auto-scaling bars; data-used readout.

**Phase 3 — verdicts and modes (E2 option b, E9, E15, E7)** — ✅ shipped.
Own-thresholds verdicts naming their limiting metric, Quick/Full plans (choice
persisted), inline metric explanations, client IP + IPv4/IPv6 from `cf-meta-ip`,
plus E14's ping-only re-check.

**Phase 4 — persistence and sharing (E10, E11)** — ✅ shipped.
Twenty runs in `localStorage`, per-run labels, per-row delete, clear-all, CSV and
JSON export, Web Share API with a clipboard fallback.

**Remaining:** E19 (trend chart over saved runs) is now unblocked by E10 and is
the obvious next step. E16–E18, E20, E21 stay closed for the reasons recorded
above.

Each phase must end with `npm run validate:content` and `npm run type-check`,
and `npm run build` before merge.

---

## Content obligations (per CLAUDE.md)

Every change that adds a user-visible metric or control **must** update
`TOOL_CONTENT['internet-speed-test']` in the same commit.

Rewritten alongside the E1–E15 work — the entry now covers latency under load
and bufferbloat, the ping detail figures, Quick vs Full and their data cost, the
use-case ratings (explicitly framed as guides, with packet loss named as not
measured), labelled local history with export, the ping-only re-check, and
Copy/Share. Three FAQs were added ("What is latency under load, and why does it
matter?", "How much data does a test use?", "Are the streaming and gaming
ratings guarantees?") and the privacy paragraph now also states that saved
history never leaves the device.

The privacy claim still holds as written: both SDK telemetry URLs stay `null`,
the extra `cf-meta-ip` request goes to the same Cloudflare measurement endpoint,
and history is `localStorage` only.

**E17 remains the one enhancement that would force a privacy rewrite** — the
current text says only measurement traffic leaves the browser, so a third-party
IP lookup would have to name the service there.

Do not add a metric to the UI without adding it here, and do not describe a
metric here that the component doesn't actually compute.

---

## UI Layout

Current layout (v1 showed only the Download/Upload/Ping/Jitter block):

```
┌──────────────────────────────────────────────┐
│  [ Quick | Full ]        [Start Speed Test]  │  E9
│  Measuring download...            ▓▓▓▓░░ 62% │
│                                              │
│              ╭─────────────╮                 │
│              │   87.4      │  ← live gauge   │  E8
│              │    Mbps     │                 │
│              ╰─────────────╯                 │
│   ╱╲    ╱╲___╱╲                              │
│  ╱  ╲__╱        ╲___  speed over time        │  E5
├──────────────────────────────────────────────┤
│  Download  ████████░░ 85.2 Mbps  (of 250)    │  E8 auto-scale
│  Upload    ██████░░░░ 42.1 Mbps              │
│                                              │
│  Ping 12 ms │ Jitter 3 ms │ min/med/max      │  E3
│                                              │
│  Under load ▸ 148 ms  (+136 ms)   Grade: D   │  E1
│  Streaming ★★★★  Calls ★★  Gaming ★★         │  E2
│                                              │
│  Data used 412 MB · 24.6 s · IPv6            │  E4 E6 E7
│  [Copy] [Share]                              │  E11
├──────────────────────────────────────────────┤
│  Test History (saved locally)   [Export][×]  │  E10
│  • 85.2/42.1 Mbps · 12 ms · 2 min ago        │
│  • 78.5/38.2 Mbps · 14 ms · 1 hour ago       │
└──────────────────────────────────────────────┘
```

---

## Component State

`SpeedTestResult`, `Rating`, `Verdict`, `ThroughputPoint`, `Phase`, `TestMode`,
and `EdgeMeta` live in `types.ts` — that file is the reference, not this section.
Notes on the shape that are worth keeping here:

- `timestamp` is an **ISO string**, not a `Date`: history round-trips through
  `localStorage`, and a `Date` does not survive `JSON.parse`. It also serves as
  the React key and the identity used by label edits and per-row deletes.
- Unmeasured numeric metrics are `0`, never `undefined`, so the UI can lean on
  `> 0` checks; `verdicts()` treats those zeros as "skip", not "bad".
- Verdicts are **derived**, not stored — recomputing from a saved result keeps
  old history consistent if the bands are ever retuned.
- `ThroughputPoint.t` is milliseconds since the run's first sample; the trace is
  live-only and deliberately not persisted.

```typescript
state: {
  mode, activeMode, isRunning, phase, progress,   // run lifecycle
  result, trace, history, hydrated,               // data
  error, warning, copied, shareNote, status,      // messaging (status = aria-live)
}
refs: { engine, timeout, runId, errors, meta }    // runId guards stale callbacks
```

---

## How to Use Content (for SEO section)

The authoritative copy is `TOOL_CONTENT['internet-speed-test'].steps`; this is
the outline it follows.

1. Choose Quick or Full, then click "Start Speed Test"
2. Watch the live gauge and speed-over-time trace as it measures latency, download, and upload
3. Read download and upload speeds, then ping (with min/max/samples) and jitter
4. Check latency under load and the streaming / calls / gaming ratings
5. Re-check ping on its own after moving a router, without a full re-test
6. Label the run, copy or share it, and export or clear the saved history

---

## About Content (for SEO section)

Our internet speed test uses Cloudflare's global network to accurately measure your connection's download and upload speeds, latency, and jitter. The test runs directly in your browser using Cloudflare's speed test SDK, providing reliable results without requiring any software installation. Perfect for checking your ISP's performance, troubleshooting network issues, or verifying you're getting the speeds you pay for.
