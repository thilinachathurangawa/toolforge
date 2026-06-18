'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function TDEECalculator() {
  const [bmr, setBmr] = useState<string>('1500');
  const [activity, setActivity] = useState<string>('1.375');
  const [copied, setCopied] = useState(false);

  const bmrNum = parseFloat(bmr) || 0;
  const activityFactor = parseFloat(activity) || 1.2;
  const tdee = bmrNum * activityFactor;

  const handleCopy = () => {
    navigator.clipboard.writeText(`TDEE: ${tdee.toFixed(0)} kcal/day`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">TDEE Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">BMR (kcal/day)</label>
          <input type="number" value={bmr} onChange={(e) => setBmr(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Activity Level</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
            <option value="1.2">Sedentary (Little or no exercise)</option>
            <option value="1.375">Lightly Active (Exercise 1-3 times/week)</option>
            <option value="1.55">Moderately Active (Exercise 3-5 times/week)</option>
            <option value="1.725">Very Active (Hard exercise 6-7 times/week)</option>
            <option value="1.9">Extra Active (Very hard exercise, physical job)</option>
          </select>
        </div>
      </div>

      {tdee > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Total Daily Energy Expenditure (TDEE)</div>
          <div className="text-4xl font-extrabold">{tdee.toFixed(0)} <span className="text-lg font-normal">kcal/day</span></div>
        </div>
      )}
    </div>
  );
}