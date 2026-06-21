'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Clock } from 'lucide-react';

export function TimeCalculator() {
  const [mode, setMode] = useState<'add' | 'subtract' | 'difference'>('add');
  const [time1, setTime1] = useState({ hours: '2', minutes: '30', seconds: '45', isPM: false });
  const [time2, setTime2] = useState({ hours: '1', minutes: '15', seconds: '30', isPM: false });
  const [format, setFormat] = useState<'12hour' | '24hour'>('24hour');
  const [results, setResults] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalHours: number;
    totalMinutes: number;
    totalSeconds: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const timeToSeconds = useCallback((hours: number, minutes: number, seconds: number): number => {
    return (hours * 3600) + (minutes * 60) + seconds;
  }, []);

  const secondsToTime = useCallback((totalSeconds: number): { hours: number; minutes: number; seconds: number } => {
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return { hours, minutes, seconds };
  }, []);

  const parseTime = useCallback((timeStr: { hours: string; minutes: string; seconds: string; isPM: boolean }): { hours: number; minutes: number; seconds: number } => {
    let hours = parseInt(timeStr.hours) || 0;
    const minutes = parseInt(timeStr.minutes) || 0;
    const seconds = parseInt(timeStr.seconds) || 0;

    if (format === '12hour') {
      if (timeStr.isPM && hours !== 12) hours += 12;
      if (!timeStr.isPM && hours === 12) hours = 0;
    }

    return { hours, minutes, seconds };
  }, [format]);

  const calculateTime = useCallback(() => {
    const t1 = parseTime(time1);
    const t2 = parseTime(time2);

    const seconds1 = timeToSeconds(t1.hours, t1.minutes, t1.seconds);
    const seconds2 = timeToSeconds(t2.hours, t2.minutes, t2.seconds);

    let totalSeconds: number;

    if (mode === 'add') {
      totalSeconds = seconds1 + seconds2;
    } else if (mode === 'subtract') {
      totalSeconds = Math.abs(seconds1 - seconds2);
    } else {
      totalSeconds = Math.abs(seconds1 - seconds2);
    }

    const time = secondsToTime(totalSeconds);
    const totalHours = totalSeconds / 3600;
    const totalMinutes = totalSeconds / 60;

    setResults({
      ...time,
      totalHours,
      totalMinutes,
      totalSeconds
    });
  }, [time1, time2, mode, format, parseTime, timeToSeconds, secondsToTime]);

  useEffect(() => {
    calculateTime();
  }, [calculateTime]);

  const handleCopy = () => {
    if (results) {
      const result = `Total: ${results.hours}:${results.minutes.toString().padStart(2, '0')}:${results.seconds.toString().padStart(2, '0')}\nTotal Hours: ${results.totalHours.toFixed(2)}\nTotal Minutes: ${results.totalMinutes.toFixed(2)}\nTotal Seconds: ${results.totalSeconds}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimeDisplay = (h: number, m: number, s: number): string => {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mode</label>
        <div className="flex gap-2">
          {(['add', 'subtract', 'difference'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                mode === m
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Format</label>
        <div className="flex gap-2">
          {(['12hour', '24hour'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                format === f
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background border border-input hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {f === '12hour' ? '12-hour' : '24-hour'}
            </button>
          ))}
        </div>
      </div>

      {/* Time 1 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Time 1</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={time1.hours}
              onChange={(e) => setTime1({ ...time1, hours: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="HH"
              min="0"
              max={format === '12hour' ? 12 : 23}
            />
          </div>
          <span className="text-foreground/50 self-center">:</span>
          <div className="flex-1">
            <input
              type="number"
              value={time1.minutes}
              onChange={(e) => setTime1({ ...time1, minutes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="MM"
              min="0"
              max="59"
            />
          </div>
          <span className="text-foreground/50 self-center">:</span>
          <div className="flex-1">
            <input
              type="number"
              value={time1.seconds}
              onChange={(e) => setTime1({ ...time1, seconds: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="SS"
              min="0"
              max="59"
            />
          </div>
          {format === '12hour' && (
            <div className="flex gap-1">
              <button
                onClick={() => setTime1({ ...time1, isPM: false })}
                className={`px-2 py-2 text-xs rounded-md transition-colors ${
                  !time1.isPM ? 'bg-accent text-accent-foreground' : 'bg-background border border-input'
                }`}
              >
                AM
              </button>
              <button
                onClick={() => setTime1({ ...time1, isPM: true })}
                className={`px-2 py-2 text-xs rounded-md transition-colors ${
                  time1.isPM ? 'bg-accent text-accent-foreground' : 'bg-background border border-input'
                }`}
              >
                PM
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Time 2 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Time 2</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={time2.hours}
              onChange={(e) => setTime2({ ...time2, hours: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="HH"
              min="0"
              max={format === '12hour' ? 12 : 23}
            />
          </div>
          <span className="text-foreground/50 self-center">:</span>
          <div className="flex-1">
            <input
              type="number"
              value={time2.minutes}
              onChange={(e) => setTime2({ ...time2, minutes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="MM"
              min="0"
              max="59"
            />
          </div>
          <span className="text-foreground/50 self-center">:</span>
          <div className="flex-1">
            <input
              type="number"
              value={time2.seconds}
              onChange={(e) => setTime2({ ...time2, seconds: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="SS"
              min="0"
              max="59"
            />
          </div>
          {format === '12hour' && (
            <div className="flex gap-1">
              <button
                onClick={() => setTime2({ ...time2, isPM: false })}
                className={`px-2 py-2 text-xs rounded-md transition-colors ${
                  !time2.isPM ? 'bg-accent text-accent-foreground' : 'bg-background border border-input'
                }`}
              >
                AM
              </button>
              <button
                onClick={() => setTime2({ ...time2, isPM: true })}
                className={`px-2 py-2 text-xs rounded-md transition-colors ${
                  time2.isPM ? 'bg-accent text-accent-foreground' : 'bg-background border border-input'
                }`}
              >
                PM
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Results
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Total:</span>
              <span className="text-foreground font-semibold">{formatTimeDisplay(results.hours, results.minutes, results.seconds)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Hours:</span>
              <span className="text-foreground">{results.totalHours.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Minutes:</span>
              <span className="text-foreground">{results.totalMinutes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Seconds:</span>
              <span className="text-foreground">{results.totalSeconds}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full mt-3 px-3 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      )}
    </div>
  );
}
