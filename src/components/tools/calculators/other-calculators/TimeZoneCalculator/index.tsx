'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Clock, Plus, Trash2 } from 'lucide-react';

const MAJOR_TIME_ZONES = [
  { id: 'America/New_York', name: 'New York (EST/EDT)' },
  { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)' },
  { id: 'America/Chicago', name: 'Chicago (CST/CDT)' },
  { id: 'Europe/London', name: 'London (GMT/BST)' },
  { id: 'Europe/Paris', name: 'Paris (CET/CEST)' },
  { id: 'Europe/Berlin', name: 'Berlin (CET/CEST)' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST)' },
  { id: 'Asia/Shanghai', name: 'Shanghai (CST)' },
  { id: 'Asia/Dubai', name: 'Dubai (GST)' },
  { id: 'Asia/Singapore', name: 'Singapore (SGT)' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)' },
  { id: 'Pacific/Auckland', name: 'Auckland (NZST/NZDT)' },
];

export function TimeZoneCalculator() {
  const [dateTime, setDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [fromTimeZone, setFromTimeZone] = useState<string>('America/New_York');
  const [toTimeZone, setToTimeZone] = useState<string>('Europe/London');
  const [additionalTimeZones, setAdditionalTimeZones] = useState<string[]>([]);
  const [results, setResults] = useState<{
    fromTime: string;
    toTime: string;
    timeDifference: number;
    additional: { timeZone: string; time: string; offset: string }[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const convertTimeZone = useCallback((dateStr: string, fromTz: string, toTz: string): { time: string; offset: string } => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: toTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const time = formatter.format(date);

    // Calculate offset (simplified)
    const fromOffset = getTimeZoneOffset(date, fromTz);
    const toOffset = getTimeZoneOffset(date, toTz);
    const offsetHours = (toOffset - fromOffset) / (1000 * 60 * 60);
    const offsetString = offsetHours >= 0 ? `+${offsetHours.toFixed(1)} hours` : `${offsetHours.toFixed(1)} hours`;

    return { time, offset: offsetString };
  }, []);

  const getTimeZoneOffset = useCallback((date: Date, timeZone: string): number => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);

    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');

    const year = getPart('year');
    const month = getPart('month') - 1;
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');

    const localDate = new Date(year, month, day, hour, minute);
    return localDate.getTime() - date.getTime();
  }, []);

  const handleConvert = useCallback(() => {
    const date = new Date(dateTime);
    const fromResult = convertTimeZone(dateTime, fromTimeZone, fromTimeZone);
    const toResult = convertTimeZone(dateTime, fromTimeZone, toTimeZone);

    const fromOffset = getTimeZoneOffset(date, fromTimeZone);
    const toOffset = getTimeZoneOffset(date, toTimeZone);
    const timeDifference = (toOffset - fromOffset) / (1000 * 60 * 60);

    const additional = additionalTimeZones.map(tz => {
      const result = convertTimeZone(dateTime, fromTimeZone, tz);
      return {
        timeZone: tz,
        time: result.time,
        offset: result.offset
      };
    });

    setResults({
      fromTime: fromResult.time,
      toTime: toResult.time,
      timeDifference,
      additional
    });
  }, [dateTime, fromTimeZone, toTimeZone, additionalTimeZones, convertTimeZone, getTimeZoneOffset]);

  React.useEffect(() => {
    handleConvert();
  }, [handleConvert]);

  const addTimeZone = () => {
    const available = MAJOR_TIME_ZONES.filter(tz => 
      tz.id !== fromTimeZone && 
      tz.id !== toTimeZone && 
      !additionalTimeZones.includes(tz.id)
    );
    if (available.length > 0) {
      setAdditionalTimeZones([...additionalTimeZones, available[0].id]);
    }
  };

  const removeTimeZone = (tz: string) => {
    setAdditionalTimeZones(additionalTimeZones.filter(t => t !== tz));
  };

  const handleCopy = () => {
    if (results) {
      const result = `${fromTimeZone}: ${results.fromTime}\n${toTimeZone}: ${results.toTime}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Date & Time */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Date & Time</label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      {/* From Time Zone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">From</label>
        <select
          value={fromTimeZone}
          onChange={(e) => setFromTimeZone(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {MAJOR_TIME_ZONES.map(tz => (
            <option key={tz.id} value={tz.id}>{tz.name}</option>
          ))}
        </select>
      </div>

      {/* To Time Zone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">To</label>
        <select
          value={toTimeZone}
          onChange={(e) => setToTimeZone(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        >
          {MAJOR_TIME_ZONES.map(tz => (
            <option key={tz.id} value={tz.id}>{tz.name}</option>
          ))}
        </select>
      </div>

      {/* Additional Time Zones */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Add More Cities</h3>
          <button
            onClick={addTimeZone}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {additionalTimeZones.map(tz => {
          const zone = MAJOR_TIME_ZONES.find(z => z.id === tz);
          return (
            <div key={tz} className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
              <span className="flex-1 text-sm">{zone?.name}</span>
              <button
                onClick={() => removeTimeZone(tz)}
                className="p-1 text-foreground/50 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
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
              <span className="text-foreground/60">{MAJOR_TIME_ZONES.find(tz => tz.id === fromTimeZone)?.name}:</span>
              <span className="text-foreground">{results.fromTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">{MAJOR_TIME_ZONES.find(tz => tz.id === toTimeZone)?.name}:</span>
              <span className="text-foreground font-semibold">{results.toTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Time Difference:</span>
              <span className="text-foreground">{results.timeDifference >= 0 ? '+' : ''}{results.timeDifference.toFixed(1)} hours</span>
            </div>
          </div>

          {results.additional.length > 0 && (
            <div className="border-t border-foreground/10 pt-3">
              <h4 className="text-xs font-medium text-foreground/60 mb-2">Additional Cities</h4>
              <div className="space-y-1 text-xs">
                {results.additional.map((result, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-foreground/60">{MAJOR_TIME_ZONES.find(tz => tz.id === result.timeZone)?.name}:</span>
                    <span className="text-foreground">{result.time} ({result.offset})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
