'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CalorieCalculator() {
  const [tdee, setTdee] = useState<string>('2000');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');
  const [copied, setCopied] = useState(false);

  const tdeeNum = parseFloat(tdee) || 0;
  let target = tdeeNum;
  if (goal === 'lose') target = tdeeNum - 500;
  if (goal === 'gain') target = tdeeNum + 500;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Calorie Target: ${target.toFixed(0)} kcal/day`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Calorie Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Daily TDEE (kcal/day)</label>
          <input type="number" value={tdee} onChange={(e) => setTdee(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Fitness Goal</label>
          <div className="flex gap-2">
            <button onClick={() => setGoal('lose')} className={`flex-1 py-2 border rounded-md ${goal === 'lose' ? 'bg-primary text-primary-foreground border-primary' : ''}`}>Lose Weight</button>
            <button onClick={() => setGoal('maintain')} className={`flex-1 py-2 border rounded-md ${goal === 'maintain' ? 'bg-primary text-primary-foreground border-primary' : ''}`}>Maintain</button>
            <button onClick={() => setGoal('gain')} className={`flex-1 py-2 border rounded-md ${goal === 'gain' ? 'bg-primary text-primary-foreground border-primary' : ''}`}>Gain Weight</button>
          </div>
        </div>
      </div>

      {target > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Target Daily Calorie Intake</div>
          <div className="text-4xl font-extrabold">{target.toFixed(0)} <span className="text-lg font-normal">kcal/day</span></div>
        </div>
      )}
    </div>
  );
}