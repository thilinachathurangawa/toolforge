'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function PeriodCalculator() {
  const [lastStart, setLastStart] = useState<string>('2026-06-01');
  const [cycle, setCycle] = useState<string>('28');
  const [copied, setCopied] = useState(false);

  const last = new Date(lastStart);
  const cycleDays = parseInt(cycle) || 28;

  const nextPeriod = new Date(last.getTime() + cycleDays * 24 * 60 * 60 * 1000);
  const afterNext = new Date(nextPeriod.getTime() + cycleDays * 24 * 60 * 60 * 1000);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Next Period: ${nextPeriod.toDateString()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Period Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Period Start Date</label>
          <input type="date" value={lastStart} onChange={(e) => setLastStart(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Average Cycle Length (days)</label>
          <input type="number" value={cycle} onChange={(e) => setCycle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {!isNaN(nextPeriod.getTime()) && (
        <div className="space-y-3">
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-lg text-center">
            <div className="text-sm font-semibold">Predicted Next Period</div>
            <div className="text-xl font-extrabold">{nextPeriod.toDateString()}</div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center text-sm">
            Following cycle starts around: <span className="font-bold">{afterNext.toDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}