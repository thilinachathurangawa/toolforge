/** Shared types for the Internet Speed Test tool. */

/** Quality band, worst to best. Mirrors the naming the Cloudflare SDK uses. */
export type Rating = 'bad' | 'poor' | 'average' | 'good' | 'great';

/** `ping` re-measures latency only and does not produce a history entry. */
export type TestMode = 'quick' | 'full' | 'ping';

export type Phase = 'idle' | 'latency' | 'download' | 'upload' | 'complete';

export type UseCase = 'streaming' | 'calls' | 'gaming';

export interface Verdict {
  useCase: UseCase;
  rating: Rating;
  /** The metric that held the rating down — shown so the verdict is explainable. */
  limitedBy: string;
}

/** One throughput sample, for the speed-over-time trace. */
export interface ThroughputPoint {
  /** Milliseconds since the first sample of the run. */
  t: number;
  bps: number;
  dir: 'down' | 'up';
}

/** Client-side network context read from the measurement endpoint's headers. */
export interface EdgeMeta {
  clientIp?: string;
  ipVersion?: 4 | 6;
}

export interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps

  /** Idle (unloaded) latency and jitter, ms. */
  latency: number;
  jitter: number;
  /** Spread of the individual idle ping samples, ms. 0 when not measured. */
  latencyMin: number;
  latencyMax: number;
  latencySamples: number;

  /** Latency measured while the link is saturated, ms. 0 when not measured. */
  downLoadedLatency: number;
  upLoadedLatency: number;
  loadedJitter: number;
  /** Worst loaded latency minus idle latency, ms — the bufferbloat figure. */
  loadedLatencyIncrease: number;

  /** Bytes actually transferred by the run. */
  bytesUsed: number;
  durationMs: number;
  mode: Exclude<TestMode, 'ping'>;

  clientIp?: string;
  ipVersion?: 4 | 6;

  /** Optional user-entered note, e.g. "kitchen Wi-Fi". */
  label?: string;
  /** ISO string — survives a localStorage round-trip, unlike a Date. */
  timestamp: string;
  /** Set when latency was re-checked after the full run (ISO). */
  pingRecheckedAt?: string;
}
