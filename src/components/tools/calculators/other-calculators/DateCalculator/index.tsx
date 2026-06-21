'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Calendar, ArrowRightLeft } from 'lucide-react';

export function DateCalculator() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(false);
  const [weekendsOnly, setWeekendsOnly] = useState<boolean>(false);
  const [results, setResults] = useState<{
    days: number;
    weeks: number;
    months: number;
    years: number;
    workingDays: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateDateDifference = useCallback(() => {
    if (!startDate || !endDate) {
      setResults(null);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setResults(null);
      return;
    }

    // Reset time components to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const adjustedDays = includeEndDate ? diffDays + 1 : diffDays;
    const weeks = Math.floor(adjustedDays / 7);
    const years = Math.floor(adjustedDays / 365.25);
    const months = Math.floor(years * 12);

    // Calculate working days (excluding weekends)
    let workingDays = 0;
    let current = new Date(start);
    const endDateObj = new Date(end);
    
    while (current <= endDateObj) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday (6) or Sunday (0)
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    if (includeEndDate) {
      // Recalculate working days with end date included
      workingDays = 0;
      current = new Date(start);
      while (current <= endDateObj) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    setResults({
      days: adjustedDays,
      weeks,
      months,
      years,
      workingDays
    });
  }, [startDate, endDate, includeEndDate]);

  useEffect(() => {
    calculateDateDifference();
  }, [calculateDateDifference]);

  const handleSwap = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
  };

  const handleCopy = () => {
    if (results) {
      const result = `Days: ${results.days}\nWeeks: ${results.weeks}\nMonths: ${results.months}\nYears: ${results.years}\nWorking Days: ${results.workingDays}`;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full space-y-6">
      {/* Start Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          max={today}
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="p-2 bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Swap dates"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          max={today}
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeEndDate}
            onChange={(e) => setIncludeEndDate(e.target.checked)}
            className="w-4 h-4 rounded border-input bg-background text-accent focus:ring-accent/20"
          />
          <span className="text-sm text-foreground">Include end date</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={weekendsOnly}
            onChange={(e) => setWeekendsOnly(e.target.checked)}
            className="w-4 h-4 rounded border-input bg-background text-accent focus:ring-accent/20"
          />
          <span className="text-sm text-foreground">Show working days only</span>
        </label>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Difference
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Days:</span>
              <span className="text-foreground">{results.days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Weeks:</span>
              <span className="text-foreground">{results.weeks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Months:</span>
              <span className="text-foreground">{results.months}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Years:</span>
              <span className="text-foreground">{results.years}</span>
            </div>
            {weekendsOnly && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Working Days:</span>
                <span className="text-foreground font-semibold">{results.workingDays}</span>
              </div>
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
