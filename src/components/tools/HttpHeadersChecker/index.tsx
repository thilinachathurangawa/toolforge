'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, Shield, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderResult {
  name: string;
  value: string;
  isSecurityHeader: boolean;
}

const SECURITY_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
];

const CACHING_HEADERS = [
  'cache-control',
  'expires',
  'etag',
  'last-modified',
  'age',
];

export function HttpHeadersChecker() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<number>(0);
  const [statusText, setStatusText] = useState('');
  const [headers, setHeaders] = useState<HeaderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'security' | 'caching' | 'other'>('all');
  const [copied, setCopied] = useState(false);

  const isSecurityHeader = (name: string): boolean => {
    return SECURITY_HEADERS.some(sh => name.toLowerCase().includes(sh));
  };

  const isCachingHeader = (name: string): boolean => {
    return CACHING_HEADERS.some(ch => name.toLowerCase().includes(ch));
  };

  const checkHeaders = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // Add protocol if missing
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
      const data = await response.json();

      if (data.status) {
        setStatus(data.status.http_code);
        setStatusText(data.status.http_code === 200 ? 'OK' : 'Error');

        const headerResults: HeaderResult[] = [];
        if (data.status.headers) {
          Object.entries(data.status.headers).forEach(([name, value]) => {
            headerResults.push({
              name,
              value: String(value),
              isSecurityHeader: isSecurityHeader(name),
            });
          });
        }

        setHeaders(headerResults);
      } else {
        setError('Failed to fetch headers. Please check the URL and try again.');
      }
    } catch (err) {
      setError('Failed to fetch headers. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = headers.map(h => `${h.name}: ${h.value}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkHeaders();
  };

  const filteredHeaders = headers.filter(header => {
    if (filter === 'all') return true;
    if (filter === 'security') return header.isSecurityHeader;
    if (filter === 'caching') return isCachingHeader(header.name);
    if (filter === 'other') return !header.isSecurityHeader && !isCachingHeader(header.name);
    return true;
  });

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
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search size={18} />
            {loading ? 'Checking...' : 'Check Headers'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {headers.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Response Headers</h3>
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

          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">Status:</span>{' '}
              <span className="font-medium text-foreground">{status} {statusText}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">Filter</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'security', 'caching', 'other'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                    filter === filterType
                      ? "bg-accent text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredHeaders.map((header, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg space-y-1",
                  header.isSecurityHeader
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  {header.isSecurityHeader && (
                    <Shield size={14} className="text-green-500" />
                  )}
                  <span className="text-sm font-medium text-foreground">{header.name}</span>
                </div>
                <code className="block text-sm text-foreground break-all">
                  {header.value}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
