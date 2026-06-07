'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DNSRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

const RECORD_TYPES = [
  { value: 1, label: 'A' },
  { value: 28, label: 'AAAA' },
  { value: 15, label: 'MX' },
  { value: 16, label: 'TXT' },
  { value: 2, label: 'NS' },
  { value: 5, label: 'CNAME' },
  { value: 6, label: 'SOA' },
];

const RECORD_TYPE_LABELS: Record<number, string> = {
  1: 'A',
  28: 'AAAA',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
};

export function DnsLookup() {
  const [domain, setDomain] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<number[]>([1]);
  const [results, setResults] = useState<Map<number, DNSRecord[]>>(new Map());
  const [queryTime, setQueryTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const toggleType = (type: number) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length > 1) {
          return prev.filter(t => t !== type);
        }
        return prev;
      }
      return [...prev, type];
    });
  };

  const lookupDNS = async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(new Map());

    try {
      const startTime = performance.now();
      const resultsMap = new Map<number, DNSRecord[]>();

      for (const type of selectedTypes) {
        try {
          const response = await fetch(
            `https://dns.google/resolve?name=${domain}&type=${type}`
          );
          const data = await response.json();

          if (data.Answer) {
            resultsMap.set(type, data.Answer);
          } else {
            resultsMap.set(type, []);
          }
        } catch (err) {
          console.error(`Error querying ${RECORD_TYPE_LABELS[type]}:`, err);
          resultsMap.set(type, []);
        }
      }

      const endTime = performance.now();
      setQueryTime(Math.round(endTime - startTime));
      setResults(resultsMap);
    } catch (err) {
      setError('Failed to lookup DNS records. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (type: number) => {
    const records = results.get(type);
    if (!records) return;

    const text = records.map(r => r.data).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(RECORD_TYPE_LABELS[type]);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupDNS();
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Record Types</label>
            <div className="flex flex-wrap gap-2">
              {RECORD_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleType(type.value)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    selectedTypes.includes(type.value)
                      ? "bg-accent text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Search size={18} />
            {loading ? 'Looking up...' : 'Lookup'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {results.size > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">DNS Records</h3>
            <div className="text-sm text-muted-foreground">
              Query Time: {queryTime}ms
            </div>
          </div>

          <div className="space-y-4">
            {Array.from(results.entries()).map(([type, records]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {RECORD_TYPE_LABELS[type]} Records
                    </span>
                  </div>
                  {records.length > 0 && (
                    <button
                      onClick={() => handleCopy(type)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                        copied === RECORD_TYPE_LABELS[type]
                          ? "bg-green-500 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {copied === RECORD_TYPE_LABELS[type] ? <Check size={16} /> : <Copy size={16} />}
                      {copied === RECORD_TYPE_LABELS[type] ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {records.length > 0 ? (
                  <div className="space-y-1">
                    {records.map((record, index) => (
                      <div
                        key={index}
                        className="p-3 bg-muted rounded-lg font-mono text-sm text-foreground break-all"
                      >
                        {record.data}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    No records found
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
