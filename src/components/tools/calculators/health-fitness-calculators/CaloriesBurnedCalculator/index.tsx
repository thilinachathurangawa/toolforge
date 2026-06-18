'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CaloriesBurnedCalculator() {
  const [weight, setWeight] = useState<string>('70');
  const [duration, setDuration] = useState<string>('30');
  const [met, setMet] = useState<string>('8.0'); // default running moderate
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const d = parseFloat(duration) || 0;
  const m = parseFloat(met) || 0;

  const calories = m * 3.5 * w / 200 * d;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Calories Burned: ${calories.toFixed(0)} kcal`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Calories Burned Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Activity Type (MET value)</label>
          <select value={met} onChange={(e) => setMet(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
            <option value="8.0">Running (moderate, ~8 km/h) - 8 METs</option>
            <option value="11.5">Running (fast, ~11 km/h) - 11.5 METs</option>
            <option value="4.0">Walking (brisk, ~5 km/h) - 4 METs</option>
            <option value="6.0">Cycling (moderate, ~15 km/h) - 6 METs</option>
            <option value="7.0">Swimming (light-moderate) - 7 METs</option>
            <option value="5.5">Weight Lifting (vigorous) - 5.5 METs</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {calories > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Estimated Energy Burned</div>
          <div className="text-4xl font-extrabold">{calories.toFixed(0)} <span className="text-lg font-normal">kcal</span></div>
        </div>
      )}
    </div>
  );
}