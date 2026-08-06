'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  Copy,
  Check,
  Activity,
  Share2,
  Trash2,
  Download,
  RefreshCw,
  Timer,
  Database,
  Network,
  AlertTriangle,
} from 'lucide-react';
import SpeedTest, { type Results } from '@cloudflare/speedtest';
import { cn } from '@/lib/utils';
import { Gauge } from './Gauge';
import { ThroughputChart } from './ThroughputChart';
import {
  EDGE_META_TIMEOUT_MS,
  EDGE_META_URL,
  HISTORY_KEY,
  HISTORY_LIMIT,
  MEASUREMENT_PLANS,
  MODE_INFO,
  MODE_KEY,
  RATING_LABEL,
  RUN_TIMEOUT_MS,
  USE_CASE_LABEL,
} from './constants';
import type { EdgeMeta, Phase, SpeedTestResult, TestMode, ThroughputPoint } from './types';
import {
  barScale,
  bufferbloatRating,
  downloadFile,
  formatBytes,
  formatDuration,
  formatMs,
  formatSpeed,
  hasLoadedLatency,
  hasMeasurement,
  historyToCsv,
  historyToJson,
  latencyDetail,
  percentOfScale,
  ratingBg,
  ratingColor,
  resultToText,
  speedColor,
  summarize,
  throughputTrace,
  verdicts,
} from './utils';

const PHASE_LABEL: Record<Phase, string> = {
  idle: '',
  latency: 'Measuring latency...',
  download: 'Testing download speed...',
  upload: 'Testing upload speed...',
  complete: 'Complete',
};

export function InternetSpeedTest() {
  const [mode, setMode] = useState<Exclude<TestMode, 'ping'>>('full');
  const [activeMode, setActiveMode] = useState<TestMode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);

  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [trace, setTrace] = useState<ThroughputPoint[]>([]);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const engineRef = useRef<SpeedTest | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every start/stop so callbacks from a discarded engine are ignored.
  const runIdRef = useRef(0);
  // Connection errors reported mid-run; only surfaced once the run ends, since
  // a failed phase doesn't necessarily invalidate the rest of the test.
  const errorsRef = useRef<string[]>([]);
  const metaRef = useRef<EdgeMeta | null>(null);

  /* ------------------------------ persistence ----------------------------- */

  useEffect(() => {
    try {
      const storedHistory = window.localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory) as SpeedTestResult[];
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, HISTORY_LIMIT));
      }
      const storedMode = window.localStorage.getItem(MODE_KEY);
      if (storedMode === 'quick' || storedMode === 'full') setMode(storedMode);
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore — quota or private mode */
    }
  }, [history, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode, hydrated]);

  /* -------------------------------- engine -------------------------------- */

  const teardown = useCallback(() => {
    runIdRef.current += 1;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    try {
      engineRef.current?.pause();
    } catch {
      /* ignore */
    }
    engineRef.current = null;
  }, []);

  // Stop any in-flight test if the component unmounts.
  useEffect(() => teardown, [teardown]);

  /**
   * Reads `cf-meta-ip` off a zero-byte response from the same measurement
   * endpoint — tells us the client IP Cloudflare sees and, from its shape,
   * whether the test ran over IPv6 or IPv4. No third party involved.
   */
  // Re-read per run rather than caching: a VPN toggled between tests would
  // otherwise leave a stale IP on screen. Awaited before the engine starts so
  // it never competes with a measurement, and time-boxed so a blocked host
  // cannot hold up the test.
  const loadEdgeMeta = useCallback(async () => {
    const controller = new AbortController();
    const bail = setTimeout(() => controller.abort(), EDGE_META_TIMEOUT_MS);
    try {
      const response = await fetch(EDGE_META_URL, {
        cache: 'no-store',
        signal: controller.signal,
      });
      const ip = response.headers.get('cf-meta-ip');
      metaRef.current = ip ? { clientIp: ip, ipVersion: ip.includes(':') ? 6 : 4 } : {};
    } catch {
      metaRef.current = {};
    } finally {
      clearTimeout(bail);
    }
  }, []);

  const start = useCallback(
    async (runMode: TestMode) => {
      teardown();
      const runId = runIdRef.current;
      const isStale = () => runIdRef.current !== runId;
      const plan = MEASUREMENT_PLANS[runMode];

      setActiveMode(runMode);
      setIsRunning(true);
      setError(null);
      setWarning(null);
      setShareNote(null);
      setProgress(0);
      setPhase('latency');
      setStatus(runMode === 'ping' ? 'Re-checking ping.' : 'Speed test started.');
      errorsRef.current = [];

      if (runMode !== 'ping') {
        setResult(null);
        setTrace([]);
        metaRef.current = null;
        await loadEdgeMeta();
        // The user may have pressed Stop while that was in flight.
        if (isStale()) return;
      }

      try {
        // Real measurement against Cloudflare's speed-test endpoints. Both
        // telemetry endpoints are disabled so only the measurement traffic
        // itself leaves the browser.
        const engine = new SpeedTest({
          autoStart: false,
          measurements: plan,
          logMeasurementApiUrl: null,
          logAimApiUrl: null,
        });
        engineRef.current = engine;

        const finalize = (results: Results | null, timedOut: boolean) => {
          if (isStale()) return;
          teardown();
          setIsRunning(false);

          // A ping re-check only refreshes the latency figures in place.
          if (runMode === 'ping') {
            if (results) {
              const detail = latencyDetail(results);
              setResult((prev) =>
                prev ? { ...prev, ...detail, pingRecheckedAt: new Date().toISOString() } : prev
              );
              setStatus(`Ping re-checked: ${detail.latency} ms, jitter ${detail.jitter} ms.`);
            }
            setPhase('complete');
            setProgress(100);
            return;
          }

          const final = results ? summarize(results, runMode, metaRef.current ?? undefined) : null;

          if (!hasMeasurement(final)) {
            setError(
              timedOut
                ? 'The speed test timed out before any measurement completed. Check your connection and try again.'
                : `Could not reach the measurement servers${errorsRef.current[0] ? ` (${errorsRef.current[0]})` : ''}. A firewall, VPN, or ad blocker may be blocking speed.cloudflare.com.`
            );
            setResult(null);
            setPhase('idle');
            setProgress(0);
            setStatus('Speed test failed.');
            return;
          }

          setResult(final);
          setTrace(throughputTrace(results!));
          setHistory((prev) => [final, ...prev].slice(0, HISTORY_LIMIT));
          setPhase('complete');
          setProgress(100);
          setStatus(
            `Test complete. Download ${formatSpeed(final.downloadSpeed)}, upload ${formatSpeed(final.uploadSpeed)}, ping ${formatMs(final.latency)}, jitter ${formatMs(final.jitter)}.`
          );

          if (timedOut) {
            setWarning('The test was cut short after two minutes — these figures are partial.');
          } else if (errorsRef.current.length > 0) {
            setWarning(
              `Some measurements did not complete (${errorsRef.current[0]}), so results may be incomplete.`
            );
          } else if (final.uploadSpeed === 0 || final.downloadSpeed === 0) {
            setWarning(
              'One direction could not be measured. Retry with other downloads and streams paused.'
            );
          }
        };

        timeoutRef.current = setTimeout(() => {
          finalize(engineRef.current?.results ?? null, true);
        }, RUN_TIMEOUT_MS);

        engine.onPhaseChange = ({ measurementId, measurement }) => {
          if (isStale()) return;
          const type = measurement.type;
          if (type === 'latency' || type === 'download' || type === 'upload') {
            setPhase(type);
            setStatus(PHASE_LABEL[type]);
          }
          const pct = Math.round((measurementId / plan.length) * 100);
          setProgress((p) => Math.min(99, Math.max(p, pct)));
        };

        // Show numbers as they firm up instead of a blank panel for 30 seconds.
        engine.onResultsChange = () => {
          if (isStale()) return;
          if (runMode === 'ping') {
            const detail = latencyDetail(engine.results);
            setResult((prev) => (prev ? { ...prev, ...detail } : prev));
            return;
          }
          setResult(summarize(engine.results, runMode, metaRef.current ?? undefined));
          setTrace(throughputTrace(engine.results));
        };

        engine.onError = (message: string) => {
          if (isStale()) return;
          errorsRef.current.push(message.replace(/\.$/, ''));
        };

        engine.onFinish = (results) => finalize(results, false);

        engine.play();
      } catch (err) {
        teardown();
        setError('Speed test failed to start. Please try again.');
        setIsRunning(false);
        setPhase('idle');
        console.error(err);
      }
    },
    [loadEdgeMeta, teardown]
  );

  const stopTest = () => {
    teardown();
    setIsRunning(false);
    setPhase(result ? 'complete' : 'idle');
    setStatus('Speed test stopped.');
    // A cancelled run is never saved to history, so say so rather than leaving
    // partial figures looking like a finished test.
    if (result && activeMode !== 'ping') {
      setWarning('Test stopped early — these figures are partial and were not saved to history.');
    }
  };

  /* -------------------------------- actions ------------------------------- */

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(resultToText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!result) return;
    const text = resultToText(result);
    setShareNote(null);

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Internet Speed Test Results', text });
        return;
      } catch (err) {
        // The user dismissing the share sheet is not a failure.
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShareNote('Sharing is unavailable here — the result was copied to your clipboard instead.');
    } catch {
      setShareNote('Sharing is not available in this browser.');
    }
  };

  const updateLabel = (value: string) => {
    const label = value.slice(0, 48);
    const stamp = result?.timestamp;
    setResult((prev) => (prev ? { ...prev, label } : prev));
    setHistory((prev) => prev.map((entry) => (entry.timestamp === stamp ? { ...entry, label } : entry)));
  };

  const removeEntry = (timestamp: string) =>
    setHistory((prev) => prev.filter((entry) => entry.timestamp !== timestamp));

  /* -------------------------------- derived ------------------------------- */

  const liveDirection = phase === 'upload' ? 'up' : 'down';
  const latestLive = [...trace].reverse().find((point) => point.dir === liveDirection);
  const gaugeValue =
    isRunning && activeMode !== 'ping'
      ? Math.round(((latestLive?.bps ?? 0) / 1e6) * 10) / 10
      : (result?.downloadSpeed ?? 0);
  const scale = barScale(Math.max(gaugeValue, result?.downloadSpeed ?? 0, result?.uploadSpeed ?? 0));
  const gaugeLabel = isRunning
    ? activeMode === 'ping'
      ? 'Re-checking ping'
      : phase === 'upload'
        ? 'Upload (live)'
        : 'Download (live)'
    : 'Download';

  const resultVerdicts = result ? verdicts(result) : [];
  const showLoaded = !!result && hasLoadedLatency(result);
  const loadedWorst = result ? Math.max(result.downLoadedLatency, result.upLoadedLatency) : 0;
  const bloat = result ? bufferbloatRating(result.loadedLatencyIncrease) : 'great';
  // Only offer labelling for a run that actually reached history — a cancelled
  // run has nowhere to save the label to.
  const canLabel =
    !isRunning && !!result && history.some((entry) => entry.timestamp === result.timestamp);

  return (
    <div className="w-full space-y-6">
      {/* ------------------------------ controls ----------------------------- */}
      <div className="p-4 sm:p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div
            className="flex rounded-lg border border-border p-1 bg-muted/50"
            role="group"
            aria-label="Test length"
          >
            {(['quick', 'full'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setMode(option)}
                disabled={isRunning}
                aria-pressed={mode === option}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  mode === option
                    ? 'bg-accent text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {MODE_INFO[option].label}
              </button>
            ))}
          </div>

          <button
            onClick={() => void start(mode)}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Play size={18} />
            {isRunning ? 'Testing...' : result ? 'Test Again' : 'Start Speed Test'}
          </button>

          {isRunning && (
            <button
              onClick={stopTest}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <Square size={18} />
              Stop
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {MODE_INFO[mode].label} test — {MODE_INFO[mode].blurb}. Measuring throughput means moving
          real data, so it uses part of your data allowance.
        </p>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{PHASE_LABEL[phase]}</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div
              className="w-full bg-muted rounded-full h-2"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Speed test progress"
            >
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300 motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {warning && !error && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm rounded-lg">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
        )}

        {/* Screen-reader running commentary. */}
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
      </div>

      {/* ------------------------------- results ----------------------------- */}
      {result && (
        <div className="p-4 sm:p-6 border border-border rounded-xl bg-card space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground">
              {isRunning ? 'Measuring...' : 'Speed Test Results'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void start('ping')}
                disabled={isRunning}
                title="Re-measure latency only (a few seconds, negligible data)"
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={16} />
                Re-check ping
              </button>
              <button
                onClick={handleShare}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={handleCopy}
                disabled={isRunning}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {shareNote && <p className="text-xs text-muted-foreground">{shareNote}</p>}

          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <Gauge
              value={gaugeValue}
              scale={scale}
              label={gaugeLabel}
              colorClass={speedColor(gaugeValue)}
              running={isRunning}
            />
            <ThroughputChart points={trace} />
          </div>

          {/* Download / upload bars, scaled to the result rather than a fixed 100 Mbps. */}
          <div className="grid gap-4">
            {(
              [
                { key: 'down', label: 'Download Speed', value: result.downloadSpeed },
                { key: 'up', label: 'Upload Speed', value: result.uploadSpeed },
              ] as const
            ).map(({ key, label, value }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <span className={cn('text-2xl font-bold', speedColor(value))}>
                    {formatSpeed(value)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={cn(
                      'h-3 rounded-full transition-all duration-500 motion-reduce:transition-none',
                      speedColor(value).replace('text-', 'bg-')
                    )}
                    style={{ width: `${percentOfScale(value, scale)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Bars are scaled to {scale} Mbps.</p>
          </div>

          {/* Latency detail. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Latency (Ping), idle</p>
              <p className="text-lg font-semibold text-foreground">{formatMs(result.latency)}</p>
              {result.latencySamples > 1 && (
                <p className="text-xs text-muted-foreground">
                  min {result.latencyMin} ms · max {result.latencyMax} ms · {result.latencySamples}{' '}
                  samples
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Round-trip time on an idle line — under 50 ms feels responsive.
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Jitter</p>
              <p className="text-lg font-semibold text-foreground">{formatMs(result.jitter)}</p>
              <p className="text-xs text-muted-foreground">
                Variation between pings; under 10 ms is stable. High jitter causes stutter in calls.
              </p>
            </div>
          </div>

          {/* Bufferbloat — the metric that explains "fast test, bad calls". */}
          {showLoaded && (
            <div className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-foreground">Latency under load</h4>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold text-white',
                    ratingBg(bloat)
                  )}
                >
                  {RATING_LABEL[bloat]}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Idle</span>
                <span className="font-semibold text-foreground">{formatMs(result.latency)}</span>
                <span className="text-muted-foreground">→ under load</span>
                <span className={cn('font-semibold', ratingColor(bloat))}>
                  {formatMs(loadedWorst)}
                </span>
                <span className={cn('font-semibold', ratingColor(bloat))}>
                  (+{result.loadedLatencyIncrease} ms)
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
                <span>While downloading: {formatMs(result.downLoadedLatency)}</span>
                <span>While uploading: {formatMs(result.upLoadedLatency)}</span>
                <span>Jitter under load: {formatMs(result.loadedJitter)}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                How far ping rises while the connection is saturated. A large increase — bufferbloat
                — is why calls and games can stutter on a link whose raw speed looks fine.
              </p>
            </div>
          )}

          {/* Plain-language verdicts, worst relevant metric wins. */}
          {resultVerdicts.length > 0 && (
            <div className="p-4 border border-border rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-foreground">What this connection handles</h4>
              <div className="grid gap-2 sm:grid-cols-3">
                {resultVerdicts.map((verdict) => (
                  <div key={verdict.useCase} className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="text-xs text-muted-foreground">{USE_CASE_LABEL[verdict.useCase]}</p>
                    <p className={cn('text-base font-semibold', ratingColor(verdict.rating))}>
                      {RATING_LABEL[verdict.rating]}
                    </p>
                    <p className="text-xs text-muted-foreground">Limited by {verdict.limitedBy}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Each rating takes the worst of the metrics that matter for that use case. Packet loss
                is not measured here, so these are guides rather than guarantees.
              </p>
            </div>
          )}

          {/* Run metadata. */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {result.bytesUsed > 0 && (
              <span className="flex items-center gap-1.5">
                <Database size={14} /> Data used {formatBytes(result.bytesUsed)}
              </span>
            )}
            {result.durationMs > 0 && (
              <span className="flex items-center gap-1.5">
                <Timer size={14} /> Completed in {formatDuration(result.durationMs)}
              </span>
            )}
            {result.ipVersion && (
              <span className="flex items-center gap-1.5">
                <Network size={14} /> Tested over IPv{result.ipVersion}
                {result.clientIp ? ` · ${result.clientIp}` : ''}
              </span>
            )}
            <span>{MODE_INFO[result.mode].label} test</span>
            {result.pingRecheckedAt && (
              <span>
                Ping re-checked at {new Date(result.pingRecheckedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {canLabel && (
            <div className="space-y-1">
              <label htmlFor="speedtest-label" className="text-xs text-muted-foreground">
                Label this run (saved with your history)
              </label>
              <input
                id="speedtest-label"
                type="text"
                value={result.label ?? ''}
                onChange={(event) => updateLabel(event.target.value)}
                placeholder="e.g. kitchen Wi-Fi, wired, evening"
                className="w-full sm:max-w-sm px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}
        </div>
      )}

      {/* ------------------------------- history ----------------------------- */}
      {history.length > 0 && (
        <div className="p-4 sm:p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">Test History</h3>
              <p className="text-xs text-muted-foreground">
                Last {HISTORY_LIMIT} runs, saved in this browser only.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadFile(historyToCsv(history), 'speed-test-history.csv', 'text/csv')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                CSV
              </button>
              <button
                onClick={() =>
                  downloadFile(historyToJson(history), 'speed-test-history.json', 'application/json')
                }
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                JSON
              </button>
              <button
                onClick={() => setHistory([])}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={16} />
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.timestamp}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted rounded-lg"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span>
                    <span className="text-muted-foreground">Down:</span>{' '}
                    <span className={cn('font-medium', speedColor(entry.downloadSpeed))}>
                      {formatSpeed(entry.downloadSpeed)}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Up:</span>{' '}
                    <span className={cn('font-medium', speedColor(entry.uploadSpeed))}>
                      {formatSpeed(entry.uploadSpeed)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Ping {formatMs(entry.latency)}
                    {entry.loadedLatencyIncrease > 0 && ` (+${entry.loadedLatencyIncrease} loaded)`}
                  </span>
                  {entry.label && (
                    <span className="px-2 py-0.5 rounded-full bg-background text-xs text-foreground">
                      {entry.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeEntry(entry.timestamp)}
                    aria-label={`Delete test from ${new Date(entry.timestamp).toLocaleString()}`}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
