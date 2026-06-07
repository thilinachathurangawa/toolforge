'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, ArrowRight, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RedirectStep {
  url: string;
  statusCode: number;
  statusText: string;
  redirectType: string;
  location: string;
  responseTime: number;
  isFinal: boolean;
}

interface RedirectChain {
  steps: RedirectStep[];
  totalRedirects: number;
  totalTime: number;
}

const STATUS_CODES: Record<number, string> = {
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
};

export function UrlRedirectTracer() {
  const [url, setUrl] = useState('');
  const [chain, setChain] = useState<RedirectChain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const traceRedirects = async (targetUrl: string) => {
    if (!targetUrl) {
      setError('Please enter a URL');
      return;
    }

    // Add protocol if missing
    let currentUrl = targetUrl;
    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      currentUrl = 'https://' + currentUrl;
    }

    setLoading(true);
    setError(null);

    const steps: RedirectStep[] = [];
    const maxRedirects = 20;
    let redirectCount = 0;
    const startTime = performance.now();

    try {
      while (redirectCount < maxRedirects) {
        const stepStartTime = performance.now();

        try {
          const response = await fetch(currentUrl, {
            method: 'HEAD',
            redirect: 'manual',
          });

          const stepEndTime = performance.now();
          const responseTime = Math.round(stepEndTime - stepStartTime);

          const location = response.headers.get('location') || '';
          const statusCode = response.status;
          const statusText = response.statusText || STATUS_CODES[statusCode] || 'Unknown';
          const redirectType = STATUS_CODES[statusCode] || 'Other';

          const isFinal = !location || statusCode < 300 || statusCode >= 400;

          steps.push({
            url: currentUrl,
            statusCode,
            statusText,
            redirectType,
            location,
            responseTime,
            isFinal,
          });

          if (isFinal) {
            break;
          }

          // Handle relative URLs
          if (location) {
            try {
              currentUrl = new URL(location, currentUrl).href;
            } catch {
              currentUrl = location;
            }
          }

          redirectCount++;
        } catch (err) {
          const stepEndTime = performance.now();
          const responseTime = Math.round(stepEndTime - stepStartTime);

          steps.push({
            url: currentUrl,
            statusCode: 0,
            statusText: 'Error',
            redirectType: 'Error',
            location: '',
            responseTime,
            isFinal: true,
          });
          break;
        }
      }

      const endTime = performance.now();
      const totalTime = Math.round(endTime - startTime);

      setChain({
        steps,
        totalRedirects: redirectCount,
        totalTime,
      });
    } catch (err) {
      setError('Failed to trace redirects. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!chain) return;

    const text = chain.steps
      .map((step, index) => {
        return `${index + 1}. ${step.url}
   → ${step.statusCode} ${step.statusText}
   ${step.location ? `Location: ${step.location}` : ''}
   Time: ${step.responseTime}ms`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    traceRedirects(url);
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search size={18} />
            {loading ? 'Tracing...' : 'Trace Redirects'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {chain && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Redirect Chain</h3>
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
              {copied ? 'Copied!' : 'Copy Chain'}
            </button>
          </div>

          <div className="space-y-4">
            {chain.steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-medium shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 size={14} className="text-muted-foreground" />
                        <code className="text-sm font-mono text-foreground break-all">
                          {step.url}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <span
                        className={cn(
                          "text-sm font-medium px-2 py-0.5 rounded",
                          step.statusCode >= 300 && step.statusCode < 400
                            ? "bg-yellow-500/10 text-yellow-500"
                            : step.statusCode >= 200 && step.statusCode < 300
                            ? "bg-green-500/10 text-green-500"
                            : step.statusCode === 0
                            ? "bg-red-500/10 text-red-500"
                            : "bg-muted-foreground"
                        )}
                      >
                        {step.statusCode} {step.statusText}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({step.responseTime}ms)
                      </span>
                    </div>

                    {step.location && !step.isFinal && (
                      <div className="flex items-center justify-center py-1">
                        <ArrowRight size={16} className="text-muted-foreground" />
                      </div>
                    )}

                    {step.location && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Location</p>
                        <code className="text-sm font-mono text-foreground break-all">
                          {step.location}
                        </code>
                      </div>
                    )}

                    {step.isFinal && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm font-medium text-green-500">
                          {step.statusCode >= 200 && step.statusCode < 300
                            ? '✓ Final Destination'
                            : '✗ Chain Ended'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">Total redirects:</span>{' '}
              <span className="font-medium text-foreground">{chain.totalRedirects}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Total time:</span>{' '}
              <span className="font-medium text-foreground">{chain.totalTime}ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
