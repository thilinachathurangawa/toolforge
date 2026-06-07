'use client';

import React, { useState, useEffect } from 'react';
import { Search, Copy, Check, Activity, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCheck {
  status: 'up' | 'down' | 'slow';
  statusCode: number;
  responseTime: number;
  timestamp: Date;
}

interface WebsiteStatus {
  url: string;
  currentStatus: StatusCheck;
  uptime: number;
  history: StatusCheck[];
}

export function WebsiteStatusChecker() {
  const [url, setUrl] = useState('');
  const [statusData, setStatusData] = useState<WebsiteStatus | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const checkStatus = async (targetUrl: string) => {
    if (!targetUrl) {
      setError('Please enter a URL');
      return;
    }

    // Add protocol if missing
    let checkUrl = targetUrl;
    if (!checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
      checkUrl = 'https://' + checkUrl;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      const response = await fetch(checkUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      let status: 'up' | 'down' | 'slow' = 'up';
      if (responseTime > 1000) {
        status = 'slow';
      }

      const newCheck: StatusCheck = {
        status,
        statusCode: response.status || 200,
        responseTime,
        timestamp: new Date(),
      };

      setStatusData(prev => {
        const history = prev ? [...prev.history, newCheck].slice(-10) : [newCheck];
        const upCount = history.filter(h => h.status === 'up').length;
        const uptime = Math.round((upCount / history.length) * 100);

        return {
          url: targetUrl,
          currentStatus: newCheck,
          uptime,
          history,
        };
      });
    } catch (err) {
      const newCheck: StatusCheck = {
        status: 'down',
        statusCode: 0,
        responseTime: 0,
        timestamp: new Date(),
      };

      setStatusData(prev => {
        const history = prev ? [...prev.history, newCheck].slice(-10) : [newCheck];
        const upCount = history.filter(h => h.status === 'up').length;
        const uptime = Math.round((upCount / history.length) * 100);

        return {
          url: targetUrl,
          currentStatus: newCheck,
          uptime,
          history,
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkStatus(url);
  };

  const handleCopy = () => {
    if (!statusData) return;

    const text = `Website: ${statusData.url}
Status: ${statusData.currentStatus.status.toUpperCase()}
HTTP Code: ${statusData.currentStatus.statusCode}
Response Time: ${statusData.currentStatus.responseTime}ms
Uptime: ${statusData.uptime}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (autoRefresh && url) {
      const interval = setInterval(() => {
        checkStatus(url);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, url]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 120) return '1 min ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 7200) return '1 hour ago';
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Search size={18} />
              {loading ? 'Checking...' : 'Check Status'}
            </button>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium",
                autoRefresh
                  ? "bg-accent text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
              Auto-refresh
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {statusData && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Website Status</h3>
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
              <Activity size={20} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Status</p>
                <p
                  className={cn(
                    "text-lg font-semibold",
                    statusData.currentStatus.status === 'up'
                      ? "text-green-500"
                      : statusData.currentStatus.status === 'slow'
                      ? "text-yellow-500"
                      : "text-red-500"
                  )}
                >
                  {statusData.currentStatus.status === 'up' && '✅ UP'}
                  {statusData.currentStatus.status === 'slow' && '⚠️ SLOW'}
                  {statusData.currentStatus.status === 'down' && '❌ DOWN'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">HTTP Code</p>
                <p className="text-lg font-semibold text-foreground">
                  {statusData.currentStatus.statusCode}
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-lg font-semibold text-foreground">
                  {statusData.currentStatus.responseTime}ms
                </p>
              </div>

              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold text-foreground">{statusData.uptime}%</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Last Check</p>
              <p className="text-sm font-medium text-foreground">
                {formatTimeAgo(statusData.currentStatus.timestamp)}
              </p>
            </div>
          </div>

          {statusData.history.length > 1 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Status History</h4>
              <div className="space-y-2">
                {statusData.history.slice().reverse().map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-lg",
                          check.status === 'up'
                            ? "text-green-500"
                            : check.status === 'slow'
                            ? "text-yellow-500"
                            : "text-red-500"
                        )}
                      >
                        {check.status === 'up' && '✅'}
                        {check.status === 'slow' && '⚠️'}
                        {check.status === 'down' && '❌'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(check.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {check.responseTime}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
