'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortResult {
  port: number;
  status: 'open' | 'closed' | 'filtered' | 'timeout';
  service: string;
  responseTime: number;
}

const COMMON_PORTS = [
  { port: 80, service: 'HTTP' },
  { port: 443, service: 'HTTPS' },
  { port: 22, service: 'SSH' },
  { port: 21, service: 'FTP' },
  { port: 3306, service: 'MySQL' },
  { port: 8080, service: 'HTTP-Alt' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
];

const PORT_SERVICES: Record<number, string> = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  5900: 'VNC',
  6379: 'Redis',
  8080: 'HTTP-Alt',
  8443: 'HTTPS-Alt',
  27017: 'MongoDB',
};

export function PortChecker() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('443');
  const [isChecking, setIsChecking] = useState(false);
  const [currentResult, setCurrentResult] = useState<PortResult | null>(null);
  const [history, setHistory] = useState<PortResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const checkPort = async (targetHost: string, targetPort: number): Promise<PortResult> => {
    const startTime = performance.now();
    
    try {
      // Add protocol if missing
      let targetUrl = targetHost;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetHost}:${targetPort}`;
      } else {
        // If protocol is included, add port
        const url = new URL(targetUrl);
        url.port = targetPort.toString();
        targetUrl = url.toString();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        await fetch(targetUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Even if fetch fails (CORS), if we got a response, the port might be open
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw fetchError;
        }
      }

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      return {
        port: targetPort,
        status: 'open',
        service: PORT_SERVICES[targetPort] || 'Unknown',
        responseTime,
      };
    } catch (err) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (err instanceof Error && err.name === 'AbortError') {
        return {
          port: targetPort,
          status: 'timeout',
          service: PORT_SERVICES[targetPort] || 'Unknown',
          responseTime,
        };
      }

      return {
        port: targetPort,
        status: 'closed',
        service: PORT_SERVICES[targetPort] || 'Unknown',
        responseTime,
      };
    }
  };

  const handleCheck = async () => {
    if (!host) {
      setError('Please enter a hostname or IP address');
      return;
    }

    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Please enter a valid port number (1-65535)');
      return;
    }

    setIsChecking(true);
    setError(null);
    setCurrentResult(null);

    try {
      const result = await checkPort(host, portNum);
      setCurrentResult(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
    } catch (err) {
      setError('Failed to check port. Please try again.');
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleQuickSelect = (portNum: number) => {
    setPort(portNum.toString());
  };

  const handleCopy = () => {
    if (!currentResult) return;
    
    const text = `Port ${currentResult.port} on ${host}:
Status: ${currentResult.status}
Service: ${currentResult.service}
Response Time: ${currentResult.responseTime}ms`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheck();
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
              disabled={isChecking}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="443"
              min="1"
              max="65535"
              disabled={isChecking}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Common Ports</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_PORTS.map(({ port: p, service }) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleQuickSelect(p)}
                  disabled={isChecking}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    port === p.toString()
                      ? "bg-accent text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
                  )}
                >
                  {p} ({service})
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search size={18} />
            {isChecking ? 'Checking...' : 'Check Port'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {currentResult && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Port {currentResult.port} on {host}
            </h3>
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
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Server size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Status</p>
                <p
                  className={cn(
                    "text-sm font-medium",
                    currentResult.status === 'open'
                      ? "text-green-500"
                      : currentResult.status === 'timeout'
                      ? "text-yellow-500"
                      : "text-red-500"
                  )}
                >
                  {currentResult.status.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Server size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="text-sm font-medium text-foreground">{currentResult.service}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Server size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-sm font-medium text-foreground">{currentResult.responseTime}ms</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="font-semibold text-foreground">Results History</h3>
          <div className="space-y-2">
            {history.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {result.port}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded font-medium",
                      result.status === 'open'
                        ? "bg-green-500/10 text-green-500"
                        : result.status === 'timeout'
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {result.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({result.responseTime}ms)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
