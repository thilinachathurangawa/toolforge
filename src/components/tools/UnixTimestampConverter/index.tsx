'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  if (abs < 60_000) return `${Math.round(abs / 1000)} seconds ${future ? 'from now' : 'ago'}`;
  if (abs < 3_600_000) return `${Math.round(abs / 60_000)} minutes ${future ? 'from now' : 'ago'}`;
  if (abs < 86_400_000) return `${Math.round(abs / 3_600_000)} hours ${future ? 'from now' : 'ago'}`;
  return `${Math.round(abs / 86_400_000)} days ${future ? 'from now' : 'ago'}`;
}

interface DateParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}

export function UnixTimestampConverter() {
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));
  const [tsInput, setTsInput] = useState('');
  const [tsResult, setTsResult] = useState<{ local: string; utc: string; relative: string } | null>(null);
  const [tsError, setTsError] = useState('');
  const [dateParts, setDateParts] = useState<DateParts>(() => {
    const now = new Date();
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: String(now.getDate()).padStart(2, '0'),
      hour: String(now.getHours()).padStart(2, '0'),
      minute: String(now.getMinutes()).padStart(2, '0'),
      second: String(now.getSeconds()).padStart(2, '0'),
    };
  });
  const [isoInput, setIsoInput] = useState('');
  const [epochResult, setEpochResult] = useState<{ seconds: string; ms: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setCurrentTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const convertTimestamp = useCallback(() => {
    const raw = tsInput.trim();
    if (!raw) { setTsResult(null); setTsError(''); return; }
    const num = Number(raw);
    if (isNaN(num)) { setTsError('Enter a valid numeric timestamp.'); setTsResult(null); return; }
    const ms = raw.length >= 13 ? num : num * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) { setTsError('Timestamp is out of range.'); setTsResult(null); return; }
    setTsError('');
    setTsResult({
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      relative: formatRelative(date),
    });
  }, [tsInput]);

  useEffect(() => { convertTimestamp(); }, [convertTimestamp]);

  const computeEpoch = useCallback(() => {
    try {
      let date: Date;
      if (isoInput.trim()) {
        date = new Date(isoInput.trim());
      } else {
        date = new Date(
          Number(dateParts.year),
          Number(dateParts.month) - 1,
          Number(dateParts.day),
          Number(dateParts.hour),
          Number(dateParts.minute),
          Number(dateParts.second),
        );
      }
      if (isNaN(date.getTime())) { setEpochResult(null); return; }
      setEpochResult({ seconds: String(Math.floor(date.getTime() / 1000)), ms: String(date.getTime()) });
    } catch { setEpochResult(null); }
  }, [dateParts, isoInput]);

  useEffect(() => { computeEpoch(); }, [computeEpoch]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors shrink-0"
    >
      {copied === id ? <Check size={12} /> : <Copy size={12} />}
      {copied === id ? 'Copied' : 'Copy'}
    </button>
  );

  const inputCls = 'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
  const labelCls = 'text-xs font-medium text-muted-foreground uppercase tracking-wide';
  const valueCls = 'flex items-center justify-between gap-2 px-3 py-2 bg-muted rounded-md font-mono text-sm';

  return (
    <div className="w-full space-y-6">
      {/* Live clock */}
      <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <Clock size={20} className="text-accent shrink-0" />
        <div>
          <p className={labelCls}>Current Unix Timestamp (seconds)</p>
          <p className="font-mono text-2xl font-semibold text-foreground">{currentTs}</p>
        </div>
        <button
          onClick={() => copy(String(currentTs), 'clock')}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          {copied === 'clock' ? <Check size={14} /> : <Copy size={14} />}
          {copied === 'clock' ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Block 1: timestamp → date */}
      <div className="p-4 border border-border rounded-xl bg-card space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <RefreshCw size={16} className="text-accent" />
          Timestamp → Human Date
        </h2>
        <div className="space-y-1">
          <label className={labelCls}>Enter Unix Timestamp (seconds or milliseconds)</label>
          <input
            type="number"
            value={tsInput}
            onChange={e => setTsInput(e.target.value)}
            placeholder={String(currentTs)}
            className={inputCls}
          />
          {tsError && <p className="text-xs text-destructive">{tsError}</p>}
        </div>
        {tsResult && (
          <div className="space-y-2">
            <div className="space-y-1">
              <p className={labelCls}>Local Time</p>
              <div className={valueCls}>
                <span>{tsResult.local}</span>
                <CopyButton text={tsResult.local} id="local" />
              </div>
            </div>
            <div className="space-y-1">
              <p className={labelCls}>UTC Time</p>
              <div className={valueCls}>
                <span>{tsResult.utc}</span>
                <CopyButton text={tsResult.utc} id="utc" />
              </div>
            </div>
            <div className="space-y-1">
              <p className={labelCls}>Relative</p>
              <div className={valueCls}>
                <span>{tsResult.relative}</span>
                <CopyButton text={tsResult.relative} id="rel" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block 2: date → timestamp */}
      <div className="p-4 border border-border rounded-xl bg-card space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <RefreshCw size={16} className="text-accent" />
          Human Date → Timestamp
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {(['year', 'month', 'day', 'hour', 'minute', 'second'] as const).map(field => (
            <div key={field} className="space-y-1">
              <label className={labelCls}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type="number"
                value={dateParts[field]}
                onChange={e => { setIsoInput(''); setDateParts(p => ({ ...p, [field]: e.target.value })); }}
                className={cn(inputCls, 'text-center')}
              />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Or paste ISO string (overrides selectors)</label>
          <input
            type="text"
            value={isoInput}
            onChange={e => setIsoInput(e.target.value)}
            placeholder="2025-06-27T07:00:00Z"
            className={inputCls}
          />
        </div>
        {epochResult && (
          <div className="space-y-2">
            <div className="space-y-1">
              <p className={labelCls}>Epoch (seconds)</p>
              <div className={valueCls}>
                <span>{epochResult.seconds}</span>
                <CopyButton text={epochResult.seconds} id="eps" />
              </div>
            </div>
            <div className="space-y-1">
              <p className={labelCls}>Epoch (milliseconds)</p>
              <div className={valueCls}>
                <span>{epochResult.ms}</span>
                <CopyButton text={epochResult.ms} id="epms" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
