'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function OvulationCalculator() {
  const [lmp, setLmp] = useState<string>('2026-06-01');
  const [cycleLength, setCycleLength] = useState<string>('28');
  const [copied, setCopied] = useState(false);

  const lmpDate = new Date(lmp);
  const cycleDays = parseInt(cycleLength) || 28;

  const ovulationDate = new Date(lmpDate.getTime() + (cycleDays - 14) * 24 * 60 * 60 * 1000);
  const fertileStart = new Date(ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fertileEnd = new Date(ovulationDate.getTime() + 1 * 24 * 60 * 60 * 1000);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Ovulation: ${ovulationDate.toDateString()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Ovulation Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Period Start Date</label>
          <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Average Cycle Length (days)</label>
          <input type="number" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {!isNaN(ovulationDate.getTime()) && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Estimated Ovulation Date</div>
            <div className="text-2xl font-extrabold">{ovulationDate.toDateString()}</div>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 rounded-lg text-center">
            <div className="text-sm font-semibold">Fertile Window Range</div>
            <div>{fertileStart.toDateString()} to {fertileEnd.toDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}