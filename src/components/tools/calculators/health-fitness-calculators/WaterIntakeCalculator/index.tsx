'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function WaterIntakeCalculator() {
  const [weight, setWeight] = useState<string>('70');
  const [exercise, setExercise] = useState<string>('30');
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const e = parseFloat(exercise) || 0;

  const waterMl = w * 35 + e * 11.8;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Water Goal: ${waterMl.toFixed(0)} ml`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Water Intake Calculator</h2>
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
          <label className="text-sm font-medium">Daily Active Time (minutes)</label>
          <input type="number" value={exercise} onChange={(e) => setExercise(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {waterMl > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Recommended Daily Hydration</div>
          <div className="text-4xl font-extrabold">{waterMl.toFixed(0)} <span className="text-lg font-normal">ml</span></div>
        </div>
      )}
    </div>
  );
}