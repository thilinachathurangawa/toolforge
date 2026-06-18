'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function LeanBodyMassCalculator() {
  const [weight, setWeight] = useState<string>('70');
  const [fatPercentage, setFatPercentage] = useState<string>('15');
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const bf = parseFloat(fatPercentage) || 0;

  const lbm = w * (1 - bf / 100);
  const fatMass = w - lbm;

  const handleCopy = () => {
    navigator.clipboard.writeText(`LBM: ${lbm.toFixed(1)} kg`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Lean Body Mass Calculator</h2>
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
          <label className="text-sm font-medium">Body Fat (%)</label>
          <input type="number" value={fatPercentage} onChange={(e) => setFatPercentage(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {w > 0 && bf >= 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Lean Body Mass (LBM)</div>
            <div className="text-3xl font-extrabold">{lbm.toFixed(1)} kg</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Fat Mass</div>
            <div className="text-xl font-bold">{fatMass.toFixed(1)} kg</div>
          </div>
        </div>
      )}
    </div>
  );
}