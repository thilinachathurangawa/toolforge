'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function SleepCalculator() {
  const [bedtime, setBedtime] = useState<string>('22:00');
  const [copied, setCopied] = useState(false);

  const calculateCycles = () => {
    const [h, m] = bedtime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);

    const cycles = [3, 4, 5, 6];
    return cycles.map(c => {
      const cycleDate = new Date(date.getTime() + (c * 90 + 15) * 60 * 1000);
      return {
        cyclesCount: c,
        hours: (c * 90 / 60).toFixed(1),
        timeStr: cycleDate.toTimeString().slice(0, 5)
      };
    });
  };

  const times = calculateCycles();

  const handleCopy = () => {
    navigator.clipboard.writeText(`Best Wake Up: ${times[2].timeStr} (for 5 cycles)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sleep Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">What time are you going to sleep?</label>
        <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Optimal times to wake up:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {times.map(t => (
            <div key={t.cyclesCount} className="p-3 bg-muted rounded-md text-center">
              <div className="font-extrabold text-lg">{t.timeStr}</div>
              <div className="text-xs text-muted-foreground">{t.cyclesCount} Cycles ({t.hours} hrs)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}