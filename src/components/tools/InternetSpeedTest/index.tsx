'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Copy, Check, Activity, Gauge, AlertTriangle } from 'lucide-react';
import SpeedTest, { type MeasurementConfig, type Results } from '@cloudflare/speedtest';
import { cn } from '@/lib/utils';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  timestamp: Date;
}

type Phase = 'idle' | 'latency' | 'download' | 'upload' | 'complete';

// Measurement plan: Cloudflare's default ladder with the packetLoss phase removed.
// That phase relays UDP through a TURN server whose credentials endpoint
// (speed.cloudflare.com/turn-creds) is CORS-restricted to Cloudflare's own
// origin, so it can only ever fail here — and we don't report packet loss.
// Each bandwidth type stops early once a request crosses the library's
// duration threshold, so slow connections never run the largest payloads.
const MEASUREMENTS: MeasurementConfig[] = [
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

// Abandon a run that stalls rather than leaving the UI stuck on "Testing...".
const RUN_TIMEOUT_MS = 120_000;

const PHASE_LABEL: Record<Phase, string> = {
  idle: '',
  latency: 'Measuring latency...',
  download: 'Testing download speed...',
  upload: 'Testing upload speed...',
  complete: 'Complete',
};

const toMbps = (bps?: number) =>
  typeof bps === 'number' && Number.isFinite(bps) ? Math.round((bps / 1e6) * 10) / 10 : 0;

const toMs = (ms?: number | null) =>
  typeof ms === 'number' && Number.isFinite(ms) ? Math.round(ms) : 0;

const summarize = (results: Results): SpeedTestResult => {
  const summary = results.getSummary();
  return {
    downloadSpeed: toMbps(summary.download),
    uploadSpeed: toMbps(summary.upload),
    latency: toMs(summary.latency),
    jitter: toMs(summary.jitter),
    timestamp: new Date(),
  };
};

export function InternetSpeedTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');

  const engineRef = useRef<SpeedTest | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every start/stop so callbacks from a discarded engine are ignored.
  const runIdRef = useRef(0);
  // Connection errors reported mid-run; only surfaced once the run ends, since
  // a failed phase doesn't necessarily invalidate the rest of the test.
  const errorsRef = useRef<string[]>([]);

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

  const runSpeedTest = () => {
    teardown();
    const runId = runIdRef.current;
    const isStale = () => runIdRef.current !== runId;

    setIsRunning(true);
    setError(null);
    setWarning(null);
    setProgress(0);
    setPhase('latency');
    setResult(null);
    errorsRef.current = [];

    try {
      // Real measurement against Cloudflare's speed-test endpoints. Both
      // telemetry endpoints are disabled so only the measurement traffic
      // itself leaves the browser.
      const engine = new SpeedTest({
        autoStart: false,
        measurements: MEASUREMENTS,
        logMeasurementApiUrl: null,
        logAimApiUrl: null,
      });
      engineRef.current = engine;

      const finalize = (results: Results | null, timedOut: boolean) => {
        if (isStale()) return;
        teardown();

        const final = results ? summarize(results) : null;
        const measuredSomething =
          !!final && (final.downloadSpeed > 0 || final.uploadSpeed > 0 || final.latency > 0);

        if (!measuredSomething) {
          setError(
            timedOut
              ? 'The speed test timed out before any measurement completed. Check your connection and try again.'
              : `Could not reach the measurement servers${errorsRef.current[0] ? ` (${errorsRef.current[0]})` : ''}. A firewall, VPN, or ad blocker may be blocking speed.cloudflare.com.`
          );
          setResult(null);
          setPhase('idle');
          setProgress(0);
          setIsRunning(false);
          return;
        }

        setResult(final);
        setHistory((prev) => [final, ...prev].slice(0, 5));
        setPhase('complete');
        setProgress(100);
        setIsRunning(false);

        if (timedOut) {
          setWarning('The test was cut short after two minutes — these figures are partial.');
        } else if (errorsRef.current.length > 0) {
          setWarning(`Some measurements did not complete (${errorsRef.current[0]}), so results may be incomplete.`);
        } else if (final.uploadSpeed === 0 || final.downloadSpeed === 0) {
          setWarning('One direction could not be measured. Retry with other downloads and streams paused.');
        }
      };

      timeoutRef.current = setTimeout(() => {
        finalize(engineRef.current?.results ?? null, true);
      }, RUN_TIMEOUT_MS);

      // Progress follows the measurement plan; a phase label comes with it.
      engine.onPhaseChange = ({ measurementId, measurement }) => {
        if (isStale()) return;
        const type = measurement.type;
        if (type === 'latency' || type === 'download' || type === 'upload') {
          setPhase(type);
        }
        const pct = Math.round((measurementId / MEASUREMENTS.length) * 100);
        setProgress((p) => Math.min(99, Math.max(p, pct)));
      };

      // Show numbers as they firm up instead of a blank panel for 30 seconds.
      engine.onResultsChange = () => {
        if (isStale()) return;
        setResult(summarize(engine.results));
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
  };

  const stopTest = () => {
    teardown();
    setIsRunning(false);
    setPhase(result ? 'complete' : 'idle');
  };

  const handleCopy = () => {
    if (!result) return;

    const text = `Internet Speed Test Results:
Download: ${result.downloadSpeed.toFixed(1)} Mbps
Upload: ${result.uploadSpeed.toFixed(1)} Mbps
Latency: ${result.latency} ms
Jitter: ${result.jitter} ms
Date: ${result.timestamp.toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSpeedColor = (speed: number) => {
    if (speed <= 0) return 'text-muted-foreground';
    if (speed >= 50) return 'text-green-500';
    if (speed >= 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Bars are scaled against 100 Mbps.
  const getSpeedPercentage = (speed: number) => Math.min((speed / 100) * 100, 100);

  const formatSpeed = (speed: number) => (speed > 0 ? `${speed.toFixed(1)} Mbps` : '—');
  const formatMs = (ms: number) => (ms > 0 ? `${ms} ms` : '—');

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={runSpeedTest}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Play size={18} />
            {isRunning ? 'Testing...' : result ? 'Test Again' : 'Start Speed Test'}
          </button>
          {isRunning && (
            <button
              onClick={stopTest}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors font-medium"
            >
              <Square size={18} />
              Stop
            </button>
          )}
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{PHASE_LABEL[phase]}</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {warning && !error && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm rounded-lg">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Speed Test Results</h3>
            <button
              onClick={handleCopy}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Download Speed</span>
                </div>
                <span className={cn("text-2xl font-bold", getSpeedColor(result.downloadSpeed))}>
                  {formatSpeed(result.downloadSpeed)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={cn("h-3 rounded-full transition-all duration-500", getSpeedColor(result.downloadSpeed).replace('text-', 'bg-'))}
                  style={{ width: `${getSpeedPercentage(result.downloadSpeed)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Upload Speed</span>
                </div>
                <span className={cn("text-2xl font-bold", getSpeedColor(result.uploadSpeed))}>
                  {formatSpeed(result.uploadSpeed)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={cn("h-3 rounded-full transition-all duration-500", getSpeedColor(result.uploadSpeed).replace('text-', 'bg-'))}
                  style={{ width: `${getSpeedPercentage(result.uploadSpeed)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Gauge size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Latency (Ping)</p>
                  <p className="text-lg font-semibold text-foreground">{formatMs(result.latency)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Gauge size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Jitter</p>
                  <p className="text-lg font-semibold text-foreground">{formatMs(result.jitter)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="font-semibold text-foreground">Test History</h3>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Download:</span>{' '}
                    <span className={cn("font-medium", getSpeedColor(entry.downloadSpeed))}>
                      {formatSpeed(entry.downloadSpeed)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Upload:</span>{' '}
                    <span className={cn("font-medium", getSpeedColor(entry.uploadSpeed))}>
                      {formatSpeed(entry.uploadSpeed)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
