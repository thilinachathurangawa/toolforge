'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function DueDateCalculator() {
  const [lmp, setLmp] = useState<string>('2026-01-01');
  const [copied, setCopied] = useState(false);

  const lmpDate = new Date(lmp);
  const edd = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Due Date: ${edd.toDateString()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Due Date Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">First day of Last Menstrual Period (LMP)</label>
        <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
      </div>

      {!isNaN(edd.getTime()) && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Estimated Due Date (EDD)</div>
          <div className="text-3xl font-extrabold">{edd.toDateString()}</div>
        </div>
      )}
    </div>
  );
}