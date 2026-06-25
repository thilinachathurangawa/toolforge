'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { Plus, X, Clock, Copy, Check, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Timezone registry ────────────────────────────────────────────────────────

interface TzOption {
  value: string;
  label: string;
  city: string;
  region: string;
}

const TIMEZONES: TzOption[] = [
  { value: 'UTC',                label: 'UTC — Coordinated Universal Time', city: 'UTC',        region: 'Universal' },
  { value: 'America/New_York',   label: 'EST/EDT — New York',               city: 'New York',   region: 'Americas' },
  { value: 'America/Chicago',    label: 'CST/CDT — Chicago',                city: 'Chicago',    region: 'Americas' },
  { value: 'America/Denver',     label: 'MST/MDT — Denver',                 city: 'Denver',     region: 'Americas' },
  { value: 'America/Los_Angeles',label: 'PST/PDT — Los Angeles',            city: 'Los Angeles',region: 'Americas' },
  { value: 'America/Toronto',    label: 'EST/EDT — Toronto',                city: 'Toronto',    region: 'Americas' },
  { value: 'America/Sao_Paulo',  label: 'BRT — São Paulo',                  city: 'São Paulo',  region: 'Americas' },
  { value: 'Europe/London',      label: 'GMT/BST — London',                 city: 'London',     region: 'Europe' },
  { value: 'Europe/Paris',       label: 'CET/CEST — Paris',                 city: 'Paris',      region: 'Europe' },
  { value: 'Europe/Berlin',      label: 'CET/CEST — Berlin',                city: 'Berlin',     region: 'Europe' },
  { value: 'Europe/Moscow',      label: 'MSK — Moscow',                     city: 'Moscow',     region: 'Europe' },
  { value: 'Africa/Cairo',       label: 'EET — Cairo',                      city: 'Cairo',      region: 'Africa' },
  { value: 'Asia/Dubai',         label: 'GST — Dubai',                      city: 'Dubai',      region: 'Asia' },
  { value: 'Asia/Kolkata',       label: 'IST — Kolkata',                    city: 'Kolkata',    region: 'Asia' },
  { value: 'Asia/Singapore',     label: 'SGT — Singapore',                  city: 'Singapore',  region: 'Asia' },
  { value: 'Asia/Tokyo',         label: 'JST — Tokyo',                      city: 'Tokyo',      region: 'Asia' },
  { value: 'Asia/Shanghai',      label: 'CST — Shanghai',                   city: 'Shanghai',   region: 'Asia' },
  { value: 'Australia/Sydney',   label: 'AEST/AEDT — Sydney',               city: 'Sydney',     region: 'Pacific' },
  { value: 'Pacific/Auckland',   label: 'NZST/NZDT — Auckland',             city: 'Auckland',   region: 'Pacific' },
];

const DEFAULT_COMPARISON_TZS = [
  'Europe/London',
  'Asia/Tokyo',
  'America/Los_Angeles',
];

const MAX_COMPARISON = 8;

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes())
  );
}

function parseDatetimeLocal(value: string): Date {
  // datetime-local returns a string without timezone; treat as local time
  return new Date(value);
}

interface ConvertedTime {
  tz: string;
  city: string;
  region: string;
  label: string;
  time: string;
  date: string;
  offsetLabel: string;
  offsetMinutes: number;
  isDaytime: boolean;
}

function getOffsetMinutes(date: Date, tz: string): number {
  // Reconstruct the date's wall-clock parts in `tz`, then diff against UTC
  const tzFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = tzFormatter.formatToParts(date);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);

  let h = get('hour');
  const m = get('minute');
  const s = get('second');
  const yr = get('year');
  const mo = get('month');
  const dy = get('day');

  // Intl can return 24 for midnight on some platforms
  if (h === 24) h = 0;

  // Treat the tz wall-clock parts as UTC to get a fake "tz-as-UTC" timestamp,
  // then subtract actual UTC — the difference is the offset.
  const reconstructed = Date.UTC(yr, mo - 1, dy, h, m, s);
  const actualUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
  return Math.round((reconstructed - actualUtc) / 60000);
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function convertForTimezone(date: Date, tz: string, use12hr: boolean): ConvertedTime {
  const tzOption = TIMEZONES.find(t => t.value === tz) ?? { city: tz, region: '', label: tz };

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: use12hr,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Short timezone abbreviation via timeZoneName
  const shortFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'short',
  });
  const formatted = shortFormatter.format(date);
  const abbr = formatted.split(', ').pop() ?? '';

  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    hour12: false,
  });
  const localHour = parseInt(hourFormatter.format(date), 10);
  const isDaytime = localHour >= 6 && localHour < 20;

  const offsetMins = getOffsetMinutes(date, tz);

  return {
    tz,
    city: tzOption.city,
    region: tzOption.region,
    label: abbr,
    time: timeFormatter.format(date),
    date: dateFormatter.format(date),
    offsetLabel: formatOffset(offsetMins),
    offsetMinutes: offsetMins,
    isDaytime,
  };
}

// ── Clock face arc component ─────────────────────────────────────────────────

function ClockArc({ offsetMinutes, isDaytime }: { offsetMinutes: number; isDaytime: boolean }) {
  // Normalize offset to a 0–1 position around a 24hr clock
  // UTC-12 → left, UTC+14 → right; center (UTC 0) is noon position
  const clampedOffset = Math.max(-720, Math.min(840, offsetMinutes));
  const fraction = (clampedOffset + 720) / 1560; // 0 at UTC-12, 1 at UTC+13
  const angleDeg = fraction * 360 - 90; // start from top
  const angleRad = (angleDeg * Math.PI) / 180;
  const r = 16;
  const cx = 20;
  const cy = 20;
  const dotX = cx + r * Math.cos(angleRad);
  const dotY = cy + r * Math.sin(angleRad);

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      {/* Track ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-border"
        opacity="0.5"
      />
      {/* Day arc (6AM–8PM = 58.3% of clock) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={`${0.583 * 2 * Math.PI * r} ${2 * Math.PI * r}`}
        strokeDashoffset={`${0.25 * 2 * Math.PI * r}`}
        strokeLinecap="round"
        className="text-warning"
        opacity="0.35"
      />
      {/* Position dot */}
      <circle
        cx={dotX}
        cy={dotY}
        r="3.5"
        className={isDaytime ? 'fill-warning' : 'fill-muted-foreground'}
        style={{ transition: 'cx 0.4s ease, cy 0.4s ease' }}
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="1.5" className="fill-border" />
    </svg>
  );
}

// ── Timezone card ────────────────────────────────────────────────────────────

interface TzCardProps {
  result: ConvertedTime;
  onRemove?: () => void;
  canRemove: boolean;
  isBase?: boolean;
}

function TzCard({ result, onRemove, canRemove, isBase = false }: TzCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${result.city}: ${result.time} ${result.label} (${result.date}) — ${result.offsetLabel}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border p-4 transition-all duration-200',
        isBase
          ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/20'
          : 'border-border bg-card hover:border-accent/30 hover:shadow-sm'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <ClockArc offsetMinutes={result.offsetMinutes} isDaytime={result.isDaytime} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {result.isDaytime ? (
                <Sun size={11} className="text-warning shrink-0" aria-label="Daytime" />
              ) : (
                <Moon size={11} className="text-muted-foreground shrink-0" aria-label="Night" />
              )}
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                {result.region}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight truncate">
              {result.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isBase && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              Base
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Copy time to clipboard"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
          {!isBase && canRemove && onRemove && (
            <button
              onClick={onRemove}
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${result.city}`}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Time display */}
      <div className="space-y-0.5">
        <p className={cn(
          'font-mono font-bold leading-none tabular-nums',
          isBase ? 'text-2xl text-accent' : 'text-xl text-foreground'
        )}>
          {result.time}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {result.label}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {result.offsetLabel}
          </span>
        </div>
      </div>

      {/* Date */}
      <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
        {result.date}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TimezoneConverter() {
  const baseId = useId();

  const [baseDatetime, setBaseDatetime] = useState<string>(() =>
    toLocalDatetimeString(new Date())
  );
  const [baseTz, setBaseTz] = useState<string>(() => {
    // Detect browser timezone, fall back to UTC
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return TIMEZONES.some(t => t.value === detected) ? detected : 'UTC';
    } catch {
      return 'UTC';
    }
  });
  const [comparisonTzs, setComparisonTzs] = useState<string[]>(DEFAULT_COMPARISON_TZS);
  const [use12hr, setUse12hr] = useState(true);
  const [liveMode, setLiveMode] = useState(false);

  // Live clock tick
  useEffect(() => {
    if (!liveMode) return;
    const tick = () => setBaseDatetime(toLocalDatetimeString(new Date()));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [liveMode]);

  const parsedDate = useCallback((): Date => {
    if (liveMode) return new Date();
    const d = parseDatetimeLocal(baseDatetime);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [baseDatetime, liveMode]);

  // Convert base datetime from baseTz perspective:
  // The user picks a datetime in baseTz, so we must shift to actual UTC first.
  const resolveToUtc = useCallback((): Date => {
    const local = parsedDate();
    // local is already interpreted as browser-local time by the browser engine.
    // We want to treat it as baseTz time. Compute offset difference.
    const browserOffsetMins = -local.getTimezoneOffset();
    const baseOffsetMins = getOffsetMinutes(local, baseTz);
    const diffMs = (baseOffsetMins - browserOffsetMins) * 60000;
    return new Date(local.getTime() - diffMs);
  }, [parsedDate, baseTz]);

  const utcDate = resolveToUtc();

  const baseResult = convertForTimezone(utcDate, baseTz, use12hr);
  const comparisonResults = comparisonTzs.map(tz => convertForTimezone(utcDate, tz, use12hr));

  const addTimezone = (tz: string) => {
    if (comparisonTzs.includes(tz) || comparisonTzs.length >= MAX_COMPARISON) return;
    setComparisonTzs(prev => [...prev, tz]);
  };

  const removeTimezone = (tz: string) => {
    setComparisonTzs(prev => prev.filter(t => t !== tz));
  };

  const availableToAdd = TIMEZONES.filter(
    t => t.value !== baseTz && !comparisonTzs.includes(t.value)
  );

  return (
    <div className="w-full space-y-6">
      {/* ── Control strip ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Clock size={16} className="text-accent shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Base time</span>

          {/* Live mode toggle */}
          <button
            onClick={() => setLiveMode(prev => !prev)}
            className={cn(
              'ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200',
              liveMode
                ? 'border-accent bg-accent text-white shadow-sm shadow-accent/30'
                : 'border-border bg-secondary text-secondary-foreground hover:border-accent/50'
            )}
            aria-pressed={liveMode}
          >
            <span
              className={cn(
                'inline-block w-1.5 h-1.5 rounded-full',
                liveMode ? 'bg-white animate-pulse' : 'bg-muted-foreground'
              )}
              aria-hidden="true"
            />
            {liveMode ? 'Live' : 'Live off'}
          </button>

          {/* 12/24hr toggle */}
          <div
            className="flex items-center rounded-lg border border-border overflow-hidden text-xs font-semibold"
            role="group"
            aria-label="Time format"
          >
            <button
              onClick={() => setUse12hr(true)}
              className={cn(
                'px-3 py-1 transition-colors',
                use12hr
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              )}
              aria-pressed={use12hr}
            >
              12h
            </button>
            <button
              onClick={() => setUse12hr(false)}
              className={cn(
                'px-3 py-1 transition-colors',
                !use12hr
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              )}
              aria-pressed={!use12hr}
            >
              24h
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Datetime input */}
          <div className="space-y-1">
            <label
              htmlFor={`${baseId}-datetime`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Date & time
            </label>
            <input
              id={`${baseId}-datetime`}
              type="datetime-local"
              value={baseDatetime}
              onChange={e => {
                setLiveMode(false);
                setBaseDatetime(e.target.value);
              }}
              disabled={liveMode}
              className={cn(
                'w-full px-3 py-2 text-sm bg-background border border-input rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'font-mono'
              )}
            />
          </div>

          {/* Base timezone selector */}
          <div className="space-y-1">
            <label
              htmlFor={`${baseId}-tz`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Base timezone
            </label>
            <select
              id={`${baseId}-tz`}
              value={baseTz}
              onChange={e => setBaseTz(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Cards grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Base card — always first */}
        <TzCard result={baseResult} canRemove={false} isBase />

        {/* Comparison cards */}
        {comparisonResults.map((result) => (
          <TzCard
            key={result.tz}
            result={result}
            canRemove={comparisonTzs.length > 1}
            onRemove={() => removeTimezone(result.tz)}
          />
        ))}
      </div>

      {/* ── Add timezone ──────────────────────────────────────────────── */}
      {comparisonTzs.length < MAX_COMPARISON && availableToAdd.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Plus size={12} aria-hidden="true" />
            Add timezone
          </span>
          <div className="flex-1 min-w-[200px]">
            <select
              className="w-full px-3 py-1.5 text-sm bg-background border border-dashed border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-muted-foreground hover:border-accent/50 transition-colors"
              value=""
              onChange={e => {
                if (e.target.value) addTimezone(e.target.value);
                e.target.value = '';
              }}
              aria-label="Add a comparison timezone"
            >
              <option value="" disabled>
                Select a timezone to add ({MAX_COMPARISON - comparisonTzs.length} remaining)...
              </option>
              {availableToAdd.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {comparisonTzs.length >= MAX_COMPARISON && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum of {MAX_COMPARISON} comparison timezones reached. Remove one to add another.
        </p>
      )}

      {/* ── UTC reference strip ───────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          UTC reference:
        </span>
        <span className="text-xs font-mono text-foreground">
          {utcDate.toUTCString()}
        </span>
      </div>
    </div>
  );
}
