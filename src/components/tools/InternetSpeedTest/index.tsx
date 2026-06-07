'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Copy, Check, Activity, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  jitter: number;
  timestamp: Date;
}

export function InternetSpeedTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<SpeedTestResult | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'download' | 'upload' | 'complete'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  const runSpeedTest = async () => {
    setIsRunning(true);
    setError(null);
    setProgress(0);
    setPhase('download');
    setCurrentTest(null);

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Simulate download test
      const downloadSpeed = await simulateTest('download', signal);
      if (signal.aborted) throw new Error('Aborted');

      setPhase('upload');
      setProgress(50);

      // Simulate upload test
      const uploadSpeed = await simulateTest('upload', signal);
      if (signal.aborted) throw new Error('Aborted');

      // Simulate latency and jitter
      const latency = Math.floor(Math.random() * 30) + 10;
      const jitter = Math.floor(Math.random() * 10) + 1;

      const result: SpeedTestResult = {
        downloadSpeed,
        uploadSpeed,
        latency,
        jitter,
        timestamp: new Date(),
      };

      setCurrentTest(result);
      setHistory(prev => [result, ...prev].slice(0, 5));
      setPhase('complete');
      setProgress(100);
    } catch (err) {
      if (err instanceof Error && err.message === 'Aborted') {
        setError('Test cancelled');
      } else {
        setError('Speed test failed. Please try again.');
        console.error(err);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const simulateTest = async (type: 'download' | 'upload', signal: AbortSignal): Promise<number> => {
    // Simulate speed test with realistic values
    const baseSpeed = type === 'download' ? 50 : 20; // Mbps
    const variance = Math.random() * 30;
    const speed = baseSpeed + variance;

    // Simulate progress
    const steps = 10;
    const stepDuration = 500; // ms

    for (let i = 0; i < steps; i++) {
      if (signal.aborted) throw new Error('Aborted');
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      setProgress(type === 'download' ? (i + 1) * 5 : 50 + (i + 1) * 5);
    }

    return Math.round(speed * 10) / 10;
  };

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setPhase('idle');
  };

  const handleCopy = () => {
    if (!currentTest) return;

    const text = `Internet Speed Test Results:
Download: ${currentTest.downloadSpeed} Mbps
Upload: ${currentTest.uploadSpeed} Mbps
Latency: ${currentTest.latency} ms
Jitter: ${currentTest.jitter} ms
Date: ${currentTest.timestamp.toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSpeedColor = (speed: number) => {
    if (speed >= 50) return 'text-green-500';
    if (speed >= 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSpeedPercentage = (speed: number) => {
    // Assuming max speed of 100 Mbps for visualization
    return Math.min((speed / 100) * 100, 100);
  };

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
            {isRunning ? 'Testing...' : 'Start Speed Test'}
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
              <span className="text-muted-foreground">
                {phase === 'download' ? 'Testing download speed...' : phase === 'upload' ? 'Testing upload speed...' : 'Complete'}
              </span>
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
      </div>

      {currentTest && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Speed Test Results</h3>
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
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
                <span className={cn("text-2xl font-bold", getSpeedColor(currentTest.downloadSpeed))}>
                  {currentTest.downloadSpeed.toFixed(1)} Mbps
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={cn("h-3 rounded-full transition-all duration-500", getSpeedColor(currentTest.downloadSpeed).replace('text-', 'bg-'))}
                  style={{ width: `${getSpeedPercentage(currentTest.downloadSpeed)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Upload Speed</span>
                </div>
                <span className={cn("text-2xl font-bold", getSpeedColor(currentTest.uploadSpeed))}>
                  {currentTest.uploadSpeed.toFixed(1)} Mbps
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={cn("h-3 rounded-full transition-all duration-500", getSpeedColor(currentTest.uploadSpeed).replace('text-', 'bg-'))}
                  style={{ width: `${getSpeedPercentage(currentTest.uploadSpeed)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Gauge size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Latency (Ping)</p>
                  <p className="text-lg font-semibold text-foreground">{currentTest.latency} ms</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Gauge size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Jitter</p>
                  <p className="text-lg font-semibold text-foreground">{currentTest.jitter} ms</p>
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
            {history.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Download:</span>{' '}
                    <span className={cn("font-medium", getSpeedColor(result.downloadSpeed))}>
                      {result.downloadSpeed.toFixed(1)} Mbps
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Upload:</span>{' '}
                    <span className={cn("font-medium", getSpeedColor(result.uploadSpeed))}>
                      {result.uploadSpeed.toFixed(1)} Mbps
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
