'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function ProteinCalculator() {
  const [weight, setWeight] = useState<string>('70');
  const [goal, setGoal] = useState<string>('1.6');
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const factor = parseFloat(goal) || 1.6;
  const protein = w * factor;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Protein Target: ${protein.toFixed(0)}g/day`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Protein Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Goal / Activity Level</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background">
            <option value="0.8">Sedentary (0.8 g/kg)</option>
            <option value="1.2">Light Active / Endurance (1.2 g/kg)</option>
            <option value="1.6">Moderate / Muscle Gain (1.6 g/kg)</option>
            <option value="2.2">High Training / Bodybuilding (2.2 g/kg)</option>
          </select>
        </div>
      </div>

      {protein > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Recommended Daily Protein Intake</div>
          <div className="text-4xl font-extrabold">{protein.toFixed(0)} <span className="text-lg font-normal">g/day</span></div>
        </div>
      )}
    </div>
  );
}