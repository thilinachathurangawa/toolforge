import type { MeasurementConfig } from '@cloudflare/speedtest';
import type { Rating, TestMode, UseCase } from './types';

/**
 * Measurement plans.
 *
 * All three deliberately omit the SDK's `packetLoss` phase: it relays UDP
 * through a TURN server whose credentials endpoint
 * (speed.cloudflare.com/turn-creds) is CORS-locked to Cloudflare's own origin,
 * so from this domain it can only ever fail. Packet loss is not part of this
 * tool's output. See docs/specs/tools/network/INTERNET_SPEED_TEST.md.
 *
 * Each bandwidth type stops early once a request crosses the SDK's
 * `bandwidthFinishRequestDuration`, so slower links never reach the largest
 * payloads — the byte estimates below are worst cases for a very fast link.
 */

/** Cloudflare's default ladder, packetLoss removed. */
export const FULL_MEASUREMENTS: MeasurementConfig[] = [
  { type: 'latency', numPackets: 1 },
  { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true },
  { type: 'latency', numPackets: 20 },
  { type: 'download', bytes: 1e5, count: 9 },
  { type: 'download', bytes: 1e6, count: 8 },
  { type: 'upload', bytes: 1e5, count: 8 },
  { type: 'upload', bytes: 1e6, count: 6 },
  { type: 'download', bytes: 1e7, count: 6 },
  { type: 'upload', bytes: 1e7, count: 4 },
  { type: 'download', bytes: 25e6, count: 4 },
  { type: 'upload', bytes: 25e6, count: 4 },
  { type: 'download', bytes: 1e8, count: 3 },
  { type: 'upload', bytes: 5e7, count: 3 },
  { type: 'download', bytes: 25e7, count: 2 },
];

/** Short ladder for a fast check or a metered connection. */
export const QUICK_MEASUREMENTS: MeasurementConfig[] = [
  { type: 'latency', numPackets: 1 },
  { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true },
  { type: 'latency', numPackets: 10 },
  { type: 'download', bytes: 1e6, count: 4 },
  { type: 'upload', bytes: 1e6, count: 4 },
  { type: 'download', bytes: 1e7, count: 3 },
  { type: 'upload', bytes: 1e7, count: 2 },
];

/** Latency only — used by "Re-check ping". */
export const PING_MEASUREMENTS: MeasurementConfig[] = [
  { type: 'latency', numPackets: 1 },
  { type: 'latency', numPackets: 20 },
];

export const MEASUREMENT_PLANS: Record<TestMode, MeasurementConfig[]> = {
  quick: QUICK_MEASUREMENTS,
  full: FULL_MEASUREMENTS,
  ping: PING_MEASUREMENTS,
};

export const MODE_INFO: Record<Exclude<TestMode, 'ping'>, { label: string; blurb: string }> = {
  quick: { label: 'Quick', blurb: '~10 s · up to ~60 MB' },
  full: { label: 'Full', blurb: '~20–40 s · data scales with your speed' },
};

/** Abandon a run that stalls rather than leaving the UI stuck on "Testing...". */
export const RUN_TIMEOUT_MS = 120_000;

/**
 * Reads the client IP / IP version from the `cf-meta-ip` response header.
 *
 * `bytes=1`, deliberately not `bytes=0`: the SDK's latency phase requests
 * `__down?bytes=0` and reads its timings back via
 * `performance.getEntriesByName(url).slice(-1)[0]`. Sharing the URL would let
 * this request's resource-timing entry be picked up as a latency sample. No
 * measurement plan uses a 1-byte payload.
 *
 * The host must be present in the CSP `connect-src` (see vercel.json).
 */
export const EDGE_META_URL = 'https://speed.cloudflare.com/__down?bytes=1';

/** Cap on the metadata request so a blocked host can't delay the test start. */
export const EDGE_META_TIMEOUT_MS = 2000;

export const HISTORY_KEY = 'toolforge:internet-speed-test:history:v1';
export const MODE_KEY = 'toolforge:internet-speed-test:mode:v1';
export const HISTORY_LIMIT = 20;

/**
 * Quality bands, expressed as `[threshold, rating]` pairs evaluated in order;
 * anything past the last threshold is 'bad'.
 *
 * These are our own bands, not the SDK's AIM scores. AIM feeds `packetLoss`
 * into every experience and substitutes 0 points for it when the phase is
 * missing, which biases those scores low — so we rate only what we measure.
 */
export const LOWER_IS_BETTER_BANDS: Record<'latency' | 'jitter' | 'loadedIncrease', [number, Rating][]> = {
  // ms, idle round trip
  latency: [
    [20, 'great'],
    [50, 'good'],
    [100, 'average'],
    [200, 'poor'],
  ],
  // ms, variation between pings
  jitter: [
    [5, 'great'],
    [10, 'good'],
    [30, 'average'],
    [60, 'poor'],
  ],
  // ms added to latency while saturated — bufferbloat
  loadedIncrease: [
    [20, 'great'],
    [50, 'good'],
    [100, 'average'],
    [300, 'poor'],
  ],
};

/** Mbps, higher is better; evaluated highest-first. */
export const HIGHER_IS_BETTER_BANDS: Record<'download' | 'upload', [number, Rating][]> = {
  download: [
    [50, 'great'],
    [25, 'good'],
    [10, 'average'],
    [5, 'poor'],
  ],
  upload: [
    [10, 'great'],
    [5, 'good'],
    [3, 'average'],
    [1, 'poor'],
  ],
};

/**
 * Which metrics each use case depends on. A verdict takes the *worst* of its
 * inputs — a connection is only as good for video calls as its weakest
 * relevant metric — and reports which one that was.
 */
export const USE_CASE_INPUTS: Record<UseCase, Array<'latency' | 'jitter' | 'loadedIncrease' | 'download' | 'upload'>> = {
  streaming: ['download', 'loadedIncrease'],
  calls: ['upload', 'latency', 'jitter', 'loadedIncrease'],
  gaming: ['latency', 'jitter', 'loadedIncrease'],
};

export const USE_CASE_LABEL: Record<UseCase, string> = {
  streaming: 'HD / 4K streaming',
  calls: 'Video calls',
  gaming: 'Online gaming',
};

export const METRIC_LABEL: Record<string, string> = {
  latency: 'ping',
  jitter: 'jitter',
  loadedIncrease: 'latency under load',
  download: 'download speed',
  upload: 'upload speed',
};

export const RATING_LABEL: Record<Rating, string> = {
  bad: 'Bad',
  poor: 'Poor',
  average: 'OK',
  good: 'Good',
  great: 'Great',
};

/** Bar/needle scale steps in Mbps — the bar ceiling adapts to the result. */
export const SCALE_STEPS = [100, 250, 500, 1000, 2500, 10_000];
