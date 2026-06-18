'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function FatIntakeCalculator() {
  const [calories, setCalories] = useState<string>('2000');
  const [copied, setCopied] = useState(false);

  const cal = parseFloat(calories) || 0;
  
  const minFat = (cal * 0.20) / 9;
  const maxFat = (cal * 0.35) / 9;
  const saturatedLimit = (cal * 0.10) / 9;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Total Fat: ${minFat.toFixed(0)}-${maxFat.toFixed(0)}g/day, Saturated Fat Limit: ${saturatedLimit.toFixed(0)}g`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Fat Intake Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Daily Calorie Target (kcal)</label>
        <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
      </div>

      {cal > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Total Fat Intake Range (20% - 35%)</div>
            <div className="text-2xl font-extrabold">{minFat.toFixed(0)}g to {maxFat.toFixed(0)}g <span className="text-lg font-normal">/ day</span></div>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-lg text-center">
            <div className="text-sm font-semibold">Saturated Fat Limit (&lt;10%)</div>
            <div className="text-lg font-extrabold">&lt; {saturatedLimit.toFixed(0)}g <span className="text-normal font-normal">/ day</span></div>
          </div>
        </div>
      )}
    </div>
  );
}