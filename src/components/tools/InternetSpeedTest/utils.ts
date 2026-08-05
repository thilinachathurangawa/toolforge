import type { Results } from '@cloudflare/speedtest';
import {
  HIGHER_IS_BETTER_BANDS,
  LOWER_IS_BETTER_BANDS,
  METRIC_LABEL,
  SCALE_STEPS,
  USE_CASE_INPUTS,
  USE_CASE_LABEL,
} from './constants';
import type {
  EdgeMeta,
  Rating,
  SpeedTestResult,
  TestMode,
  ThroughputPoint,
  UseCase,
  Verdict,
} from './types';

/* ------------------------------- numbers -------------------------------- */

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

const round1 = (v: number) => Math.round(v * 10) / 10;

export const toMbps = (bps: unknown) => round1(num(bps) / 1e6);

export const toMs = (ms: unknown) => Math.round(num(ms));

const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

/* ---------------------------- SDK extraction ---------------------------- */

export interface LatencyDetail {
  latency: number;
  jitter: number;
  latencyMin: number;
  latencyMax: number;
  latencySamples: number;
}

/** Idle latency plus the spread of the individual ping samples. */
export const latencyDetail = (results: Results): LatencyDetail => {
  const summary = results.getSummary();
  const points = results.getUnloadedLatencyPoints().filter((p) => Number.isFinite(p));

  return {
    latency: toMs(summary.latency) || Math.round(median(points)),
    jitter: toMs(summary.jitter),
    latencyMin: points.length ? Math.round(Math.min(...points)) : 0,
    latencyMax: points.length ? Math.round(Math.max(...points)) : 0,
    latencySamples: points.length,
  };
};

/**
 * Bytes moved by the run. Download uses the browser's observed transfer size
 * where available; upload has no such figure, so the payload size is used (the
 * SDK's own +0.5% allowance for protocol overhead is applied to both).
 */
export const bytesTransferred = (results: Results): number => {
  const down = results
    .getDownloadBandwidthPoints()
    .reduce((total, p) => total + (num(p.transferSize) || num(p.bytes) * 1.005), 0);
  const up = results.getUploadBandwidthPoints().reduce((total, p) => total + num(p.bytes) * 1.005, 0);
  return Math.round(down + up);
};

/** Throughput samples for the speed-over-time trace, oldest first. */
export const throughputTrace = (results: Results): ThroughputPoint[] => {
  const raw = [
    ...results.getDownloadBandwidthPoints().map((p) => ({ dir: 'down' as const, p })),
    ...results.getUploadBandwidthPoints().map((p) => ({ dir: 'up' as const, p })),
  ]
    .filter(({ p }) => num(p.bps) > 0 && p.measTime instanceof Date)
    .map(({ dir, p }) => ({ dir, bps: num(p.bps), time: p.measTime.getTime() }))
    .sort((a, b) => a.time - b.time);

  if (raw.length === 0) return [];
  const start = raw[0].time;
  return raw.map(({ dir, bps, time }) => ({ dir, bps, t: time - start }));
};

export const summarize = (
  results: Results,
  mode: Exclude<TestMode, 'ping'>,
  meta?: EdgeMeta
): SpeedTestResult => {
  const summary = results.getSummary();
  const detail = latencyDetail(results);

  const downLoadedLatency = toMs(summary.downLoadedLatency);
  const upLoadedLatency = toMs(summary.upLoadedLatency);
  const worstLoaded = Math.max(downLoadedLatency, upLoadedLatency);

  return {
    downloadSpeed: toMbps(summary.download),
    uploadSpeed: toMbps(summary.upload),
    ...detail,
    downLoadedLatency,
    upLoadedLatency,
    loadedJitter: Math.max(toMs(summary.downLoadedJitter), toMs(summary.upLoadedJitter)),
    loadedLatencyIncrease:
      worstLoaded > 0 && detail.latency > 0 ? Math.max(0, worstLoaded - detail.latency) : 0,
    bytesUsed: bytesTransferred(results),
    durationMs: toMs(summary.totalDurationMs),
    mode,
    clientIp: meta?.clientIp,
    ipVersion: meta?.ipVersion,
    timestamp: new Date().toISOString(),
  };
};

/** True once the run produced at least one usable figure. */
export const hasMeasurement = (r: SpeedTestResult | null): r is SpeedTestResult =>
  !!r && (r.downloadSpeed > 0 || r.uploadSpeed > 0 || r.latency > 0);

/* -------------------------------- ratings ------------------------------- */

const RATING_ORDER: Rating[] = ['bad', 'poor', 'average', 'good', 'great'];

const ratingRank = (rating: Rating) => RATING_ORDER.indexOf(rating);

const rateLower = (metric: keyof typeof LOWER_IS_BETTER_BANDS, value: number): Rating => {
  for (const [threshold, rating] of LOWER_IS_BETTER_BANDS[metric]) {
    if (value <= threshold) return rating;
  }
  return 'bad';
};

const rateHigher = (metric: keyof typeof HIGHER_IS_BETTER_BANDS, value: number): Rating => {
  for (const [threshold, rating] of HIGHER_IS_BETTER_BANDS[metric]) {
    if (value >= threshold) return rating;
  }
  return 'bad';
};

/** The bufferbloat grade: how much latency the link adds when saturated. */
export const bufferbloatRating = (increaseMs: number): Rating =>
  rateLower('loadedIncrease', increaseMs);

/** Whether loaded latency was actually captured, so we don't rate a blank. */
export const hasLoadedLatency = (r: SpeedTestResult) =>
  r.downLoadedLatency > 0 || r.upLoadedLatency > 0;

/**
 * Per-metric ratings, omitting anything that wasn't measured — an unmeasured
 * metric must not be reported as a bad one.
 */
const metricRatings = (r: SpeedTestResult): Partial<Record<string, Rating>> => ({
  ...(r.latency > 0 ? { latency: rateLower('latency', r.latency) } : {}),
  ...(r.latency > 0 && r.latencySamples > 1 ? { jitter: rateLower('jitter', r.jitter) } : {}),
  ...(hasLoadedLatency(r)
    ? { loadedIncrease: rateLower('loadedIncrease', r.loadedLatencyIncrease) }
    : {}),
  ...(r.downloadSpeed > 0 ? { download: rateHigher('download', r.downloadSpeed) } : {}),
  ...(r.uploadSpeed > 0 ? { upload: rateHigher('upload', r.uploadSpeed) } : {}),
});

/**
 * A verdict per use case, taking the worst of that use case's inputs and naming
 * it — "only as good as the weakest relevant metric", which is how a real
 * connection behaves and is explainable to the user.
 */
export const verdicts = (r: SpeedTestResult): Verdict[] => {
  const ratings = metricRatings(r);

  return (Object.keys(USE_CASE_INPUTS) as UseCase[]).flatMap((useCase) => {
    const inputs = USE_CASE_INPUTS[useCase].filter((metric) => ratings[metric] !== undefined);
    if (inputs.length === 0) return [];

    // Ties keep the earlier (more central) input as the named limit.
    const limiting = inputs.reduce((worst, metric) =>
      ratingRank(ratings[metric]!) < ratingRank(ratings[worst]!) ? metric : worst
    );

    return [
      {
        useCase,
        rating: ratings[limiting]!,
        limitedBy: METRIC_LABEL[limiting] ?? limiting,
      },
    ];
  });
};

/* ------------------------------- formatting ----------------------------- */

export const formatSpeed = (mbps: number) => (mbps > 0 ? `${mbps.toFixed(1)} Mbps` : '—');

export const formatMs = (ms: number) => (ms > 0 ? `${ms} ms` : '—');

export const formatBytes = (bytes: number) => {
  if (bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${round1(bytes / (1024 * 1024 * 1024))} GB`;
};

export const formatDuration = (ms: number) => (ms > 0 ? `${round1(ms / 1000)} s` : '—');

/** Bar ceiling: the smallest step that comfortably contains the result. */
export const barScale = (maxMbps: number) =>
  SCALE_STEPS.find((step) => maxMbps <= step * 0.95) ?? SCALE_STEPS[SCALE_STEPS.length - 1];

export const percentOfScale = (mbps: number, scale: number) =>
  Math.max(0, Math.min(100, (mbps / scale) * 100));

/** Quality colour for a speed — absolute, so a slow link never looks green. */
export const speedColor = (mbps: number) => {
  if (mbps <= 0) return 'text-muted-foreground';
  if (mbps >= 50) return 'text-green-500';
  if (mbps >= 25) return 'text-yellow-500';
  return 'text-red-500';
};

export const ratingColor = (rating: Rating) => {
  switch (rating) {
    case 'great':
    case 'good':
      return 'text-green-500';
    case 'average':
      return 'text-yellow-500';
    default:
      return 'text-red-500';
  }
};

export const ratingBg = (rating: Rating) => {
  switch (rating) {
    case 'great':
    case 'good':
      return 'bg-green-500';
    case 'average':
      return 'bg-yellow-500';
    default:
      return 'bg-red-500';
  }
};

/* ---------------------------- export / sharing -------------------------- */

export const resultToText = (r: SpeedTestResult) => {
  const lines = [
    'Internet Speed Test Results',
    `Download: ${formatSpeed(r.downloadSpeed)}`,
    `Upload: ${formatSpeed(r.uploadSpeed)}`,
    `Ping: ${formatMs(r.latency)}${r.latencySamples > 1 ? ` (min ${r.latencyMin} / max ${r.latencyMax} ms)` : ''}`,
    `Jitter: ${formatMs(r.jitter)}`,
  ];

  if (hasLoadedLatency(r)) {
    lines.push(
      `Latency under load: ${formatMs(Math.max(r.downLoadedLatency, r.upLoadedLatency))} (+${r.loadedLatencyIncrease} ms)`
    );
  }
  for (const v of verdicts(r)) {
    lines.push(`${USE_CASE_LABEL[v.useCase]}: ${v.rating} (limited by ${v.limitedBy})`);
  }
  if (r.ipVersion) lines.push(`Tested over: IPv${r.ipVersion}`);
  if (r.bytesUsed > 0) lines.push(`Data used: ${formatBytes(r.bytesUsed)}`);
  if (r.durationMs > 0) lines.push(`Duration: ${formatDuration(r.durationMs)}`);
  if (r.label) lines.push(`Label: ${r.label}`);
  lines.push(`Date: ${new Date(r.timestamp).toLocaleString()}`);

  return lines.join('\n');
};

const CSV_COLUMNS: Array<[string, (r: SpeedTestResult) => string | number]> = [
  ['timestamp', (r) => r.timestamp],
  ['label', (r) => r.label ?? ''],
  ['mode', (r) => r.mode],
  ['download_mbps', (r) => r.downloadSpeed],
  ['upload_mbps', (r) => r.uploadSpeed],
  ['ping_ms', (r) => r.latency],
  ['jitter_ms', (r) => r.jitter],
  ['ping_min_ms', (r) => r.latencyMin],
  ['ping_max_ms', (r) => r.latencyMax],
  ['down_loaded_latency_ms', (r) => r.downLoadedLatency],
  ['up_loaded_latency_ms', (r) => r.upLoadedLatency],
  ['loaded_latency_increase_ms', (r) => r.loadedLatencyIncrease],
  ['bytes_used', (r) => r.bytesUsed],
  ['duration_ms', (r) => r.durationMs],
  ['ip_version', (r) => (r.ipVersion ? `IPv${r.ipVersion}` : '')],
];

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const historyToCsv = (entries: SpeedTestResult[]) =>
  [
    CSV_COLUMNS.map(([header]) => header).join(','),
    ...entries.map((entry) => CSV_COLUMNS.map(([, read]) => csvCell(read(entry))).join(',')),
  ].join('\n');

export const historyToJson = (entries: SpeedTestResult[]) => JSON.stringify(entries, null, 2);

export const downloadFile = (contents: string, filename: string, mime: string) => {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
