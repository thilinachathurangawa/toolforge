'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function OneRepMaxCalculator() {
  const [weight, setWeight] = useState<string>('80');
  const [reps, setReps] = useState<string>('5');
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const r = parseFloat(reps) || 0;

  let epley = 0;
  let brzycki = 0;

  if (w > 0 && r > 0) {
    epley = w * (1 + r / 30);
    brzycki = w / (1.0278 - 0.0278 * r);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`One Rep Max (Epley): ${epley.toFixed(1)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">One Rep Max Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight Lifted</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reps Performed</label>
          <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {epley > 0 && (
        <div className="space-y-3">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Epley Estimated 1RM</div>
            <div className="text-3xl font-extrabold">{epley.toFixed(1)}</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Brzycki Estimated 1RM</div>
            <div className="text-xl font-bold">{brzycki.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
}