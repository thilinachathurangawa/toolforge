'use client';

import React, { useState, useCallback } from 'react';
import { Play, Square, Copy, Check, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PingResult {
  sequence: number;
  time: number;
  ttl: number;
  status: 'success' | 'timeout' | 'error';
}

interface PingStats {
  sent: number;
  received: number;
  packetLoss: number;
  minTime: number;
  maxTime: number;
  avgTime: number;
}

export function PingTool() {
  const [host, setHost] = useState('');
  const [packetCount, setPacketCount] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);
  const [stats, setStats] = useState<PingStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const simulatePing = async (host: string, sequence: number): Promise<PingResult> => {
    const startTime = performance.now();
    
    try {
      // Use a HEAD request to simulate ping
      // Add protocol if missing
      let targetUrl = host;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      const signal = controller.signal;
      
      await fetch(targetUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        signal,
      });

      const endTime = performance.now();
      const time = Math.round(endTime - startTime);

      return {
        sequence,
        time,
        ttl: 64, // Simulated TTL
        status: 'success',
      };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          sequence,
          time: 0,
          ttl: 0,
          status: 'error',
        };
      }
      
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);
      
      // If it's a timeout or CORS error, we still got a response time
      return {
        sequence,
        time,
        ttl: 0,
        status: 'timeout',
      };
    }
  };

  const calculateStats = (pingResults: PingResult[]): PingStats => {
    const successfulPings = pingResults.filter(r => r.status === 'success');
    const sent = pingResults.length;
    const received = successfulPings.length;
    const packetLoss = sent > 0 ? ((sent - received) / sent) * 100 : 0;
    
    const times = successfulPings.map(r => r.time);
    const minTime = times.length > 0 ? Math.min(...times) : 0;
    const maxTime = times.length > 0 ? Math.max(...times) : 0;
    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    return {
      sent,
      received,
      packetLoss: Math.round(packetLoss * 100) / 100,
      minTime,
      maxTime,
      avgTime,
    };
  };

  const startPing = async () => {
    if (!host) {
      setError('Please enter a hostname or IP address');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults([]);
    setStats(null);

    const pingResults: PingResult[] = [];

    for (let i = 1; i <= packetCount; i++) {
      if (!isRunning) break;

      const result = await simulatePing(host, i);
      pingResults.push(result);
      setResults([...pingResults]);

      // Small delay between pings
      if (i < packetCount && isRunning) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (isRunning) {
      setStats(calculateStats(pingResults));
    }
    
    setIsRunning(false);
  };

  const stopPing = () => {
    setIsRunning(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = () => {
    if (!stats) return;
    
    const text = `Ping results for ${host}:
Packets: ${stats.sent} sent, ${stats.received} received
Packet Loss: ${stats.packetLoss}%
Min: ${stats.minTime}ms  Max: ${stats.maxTime}ms  Avg: ${stats.avgTime}ms`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startPing();
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Host / IP Address</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="example.com or 192.168.1.1"
              disabled={isRunning}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Packets: {packetCount}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={packetCount}
              onChange={(e) => setPacketCount(parseInt(e.target.value))}
              disabled={isRunning}
              className="w-full accent-accent disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isRunning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Play size={18} />
              Start Ping
            </button>
            {isRunning && (
              <button
                type="button"
                onClick={stopPing}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors font-medium"
              >
                <Square size={18} />
                Stop
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Pinging {host}...</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Seq</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Time (ms)</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">TTL</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.sequence} className="border-b border-border last:border-0">
                    <td className="py-2 px-3 text-foreground">{result.sequence}</td>
                    <td className="py-2 px-3 text-foreground font-mono">{result.time}ms</td>
                    <td className="py-2 px-3 text-foreground">{result.ttl}</td>
                    <td className="py-2 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                          result.status === 'success'
                            ? "bg-green-500/10 text-green-500"
                            : result.status === 'timeout'
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        )}
                      >
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Statistics</h4>
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Packets</p>
                  <p className="text-lg font-semibold text-foreground">
                    {stats.sent}/{stats.received}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Packet Loss</p>
                  <p className="text-lg font-semibold text-foreground">{stats.packetLoss}%</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Min/Avg/Max</p>
                  <p className="text-sm font-semibold text-foreground">
                    {stats.minTime}/{stats.avgTime}/{stats.maxTime}ms
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
