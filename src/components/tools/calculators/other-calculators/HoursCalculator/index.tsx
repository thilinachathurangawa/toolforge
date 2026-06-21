'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Clock, Plus, Trash2 } from 'lucide-react';

interface TimeEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
}

export function HoursCalculator() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    { id: '1', day: 'Monday', startTime: '09:00', endTime: '17:00', breakMinutes: '30' },
    { id: '2', day: 'Tuesday', startTime: '09:00', endTime: '17:00', breakMinutes: '30' },
  ]);
  const [overtimeThreshold, setOvertimeThreshold] = useState<string>('40');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [results, setResults] = useState<{
    totalRegularHours: number;
    totalOvertimeHours: number;
    totalHours: number;
    regularPay: number;
    overtimePay: number;
    totalPay: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const parseTime = useCallback((timeStr: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  }, []);

  const calculateDailyHours = useCallback((startTime: string, endTime: string, breakMinutes: string): number => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const breakMins = parseFloat(breakMinutes) || 0;

    let hours = end.hours - start.hours;
    let minutes = end.minutes - start.minutes;

    // Handle overnight shifts
    if (hours < 0 || (hours === 0 && minutes < 0)) {
      hours += 24;
    }

    const totalMinutes = (hours * 60) + minutes - breakMins;
    return totalMinutes / 60;
  }, [parseTime]);

  const calculateResults = useCallback(() => {
    let totalHours = 0;
    
    timeEntries.forEach(entry => {
      totalHours += calculateDailyHours(entry.startTime, entry.endTime, entry.breakMinutes);
    });

    const threshold = parseFloat(overtimeThreshold) || 40;
    const overtimeHours = Math.max(0, totalHours - threshold);
    const regularHours = totalHours - overtimeHours;

    const rate = parseFloat(hourlyRate) || 0;
    const regularPay = regularHours * rate;
    const overtimePay = overtimeHours * rate * 1.5;
    const totalPay = regularPay + overtimePay;

    setResults({
      totalRegularHours: regularHours,
      totalOvertimeHours: overtimeHours,
      totalHours,
      regularPay,
      overtimePay,
      totalPay
    });
  }, [timeEntries, overtimeThreshold, hourlyRate, calculateDailyHours]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const addEntry = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const nextDay = days[timeEntries.length % 7];
    setTimeEntries([
      ...timeEntries,
      { id: Date.now().toString(), day: nextDay, startTime: '09:00', endTime: '17:00', breakMinutes: '30' }
    ]);
  };

  const removeEntry = (id: string) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof TimeEntry, value: string) => {
    setTimeEntries(timeEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleCopy = () => {
    if (results) {
      const result = `Total Hours: ${results.totalHours.toFixed(2)}\nRegular Hours: ${results.totalRegularHours.toFixed(2)}\nOvertime Hours: ${results.totalOvertimeHours.toFixed(2)}\nTotal Pay: $${results.totalPay.toFixed(2)}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Time Entries */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Time Entries</h3>
          <button
            onClick={addEntry}
            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Day
          </button>
        </div>

        {timeEntries.map((entry) => (
          <div key={entry.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-foreground/60">Day</label>
                  <input
                    type="text"
                    value={entry.day}
                    onChange={(e) => updateEntry(entry.id, 'day', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60">Start</label>
                    <input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60">End</label>
                    <input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-foreground/60">Break (minutes)</label>
                  <input
                    type="number"
                    value={entry.breakMinutes}
                    onChange={(e) => updateEntry(entry.id, 'breakMinutes', e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    min="0"
                  />
                </div>
              </div>
              <button
                onClick={() => removeEntry(entry.id)}
                className="p-1 text-foreground/50 hover:text-destructive transition-colors"
                title="Remove entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-foreground/60">
              Hours: {calculateDailyHours(entry.startTime, entry.endTime, entry.breakMinutes).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground">Overtime Threshold (hours/week)</label>
          <input
            type="number"
            value={overtimeThreshold}
            onChange={(e) => setOvertimeThreshold(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            min="0"
            step="1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Hourly Rate (optional)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
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
              <span className="text-foreground/60">Total Hours:</span>
              <span className="text-foreground font-semibold">{results.totalHours.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Regular Hours:</span>
              <span className="text-foreground">{results.totalRegularHours.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Overtime Hours:</span>
              <span className="text-foreground">{results.totalOvertimeHours.toFixed(2)}</span>
            </div>
            {hourlyRate && (
              <>
                <div className="border-t border-foreground/10 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Regular Pay:</span>
                    <span className="text-foreground">{formatCurrency(results.regularPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Overtime Pay (1.5x):</span>
                    <span className="text-foreground">{formatCurrency(results.overtimePay)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground/60">Total Pay:</span>
                    <span className="text-foreground">{formatCurrency(results.totalPay)}</span>
                  </div>
                </div>
              </>
            )}
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
