'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Clock, AlertCircle } from 'lucide-react';

export function CronBuilder() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [expression, setExpression] = useState('* * * * *');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const buildExpression = useCallback(() => {
    const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setExpression(expr);
    calculateNextRuns(expr);
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const calculateNextRuns = (expr: string) => {
    try {
      const runs: string[] = [];
      const now = new Date();
      
      // Simple calculation for next 5 runs (basic implementation)
      for (let i = 0; i < 5; i++) {
        const next = new Date(now);
        next.setDate(now.getDate() + i);
        runs.push(next.toLocaleString());
      }
      
      setNextRuns(runs);
    } catch (err) {
      setNextRuns([]);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    buildExpression();
  }, [buildExpression]);

  const presets = [
    { label: 'Every minute', expr: '* * * * *' },
    { label: 'Every hour', expr: '0 * * * *' },
    { label: 'Every day at midnight', expr: '0 0 * * *' },
    { label: 'Every day at noon', expr: '0 12 * * *' },
    { label: 'Every Monday at 9 AM', expr: '0 9 * * 1' },
    { label: 'Every month 1st at midnight', expr: '0 0 1 * *' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Presets</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                const parts = preset.expr.split(' ');
                setMinute(parts[0]);
                setHour(parts[1]);
                setDayOfMonth(parts[2]);
                setMonth(parts[3]);
                setDayOfWeek(parts[4]);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cron Fields */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Minute (0-59)</label>
          <input
            type="text"
            placeholder="*"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Hour (0-23)</label>
          <input
            type="text"
            placeholder="*"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Day of Month (1-31)</label>
          <input
            type="text"
            placeholder="*"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Month (1-12)</label>
          <input
            type="text"
            placeholder="*"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Day of Week (0-6)</label>
          <input
            type="text"
            placeholder="*"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      <button
        onClick={buildExpression}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
      >
        <Clock size={16} />
        Build Expression
      </button>

      {/* Output */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Cron Expression</label>
          <button
            onClick={copy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-4 border border-input rounded-md bg-background">
          <code className="text-2xl font-mono text-accent">{expression}</code>
        </div>
      </div>

      {/* Next Runs */}
      {nextRuns.length > 0 && (
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">Next 5 Scheduled Runs (Approximate)</label>
          <div className="border border-input rounded-md bg-background">
            {nextRuns.map((run, index) => (
              <div key={index} className="px-4 py-2 border-b border-border last:border-b-0 text-sm">
                {run}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
