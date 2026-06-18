'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function BACCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('70');
  const [drinks, setDrinks] = useState<string>('3');
  const [hours, setHours] = useState<string>('2');
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const d = parseFloat(drinks) || 0;
  const h = parseFloat(hours) || 0;

  let bac = 0;
  if (w > 0 && d >= 0) {
    const alcoholGrams = d * 14;
    const bodyWeightGrams = w * 1000;
    const r = gender === 'male' ? 0.68 : 0.55;
    bac = (alcoholGrams / (bodyWeightGrams * r)) * 100 - (0.015 * h);
    bac = Math.max(0, bac);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`BAC: ${bac.toFixed(3)}%`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">BAC Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <div className="flex gap-2">
            <button onClick={() => setGender('male')} className={`flex-1 py-2 border rounded-md ${gender === 'male' ? 'bg-primary text-primary-foreground border-primary' : ''}`}>Male</button>
            <button onClick={() => setGender('female')} className={`flex-1 py-2 border rounded-md ${gender === 'female' ? 'bg-primary text-primary-foreground border-primary' : ''}`}>Female</button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Standard Drinks Consumed</label>
          <input type="number" value={drinks} onChange={(e) => setDrinks(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Elapsed (hours)</label>
          <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {w > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Estimated Blood Alcohol Concentration (BAC)</div>
          <div className="text-4xl font-extrabold">{bac.toFixed(3)}%</div>
          <div className="text-xs text-muted-foreground font-semibold mt-2">
            {bac >= 0.08 ? '⚠️ Above Legal Driving Limit (0.08%)' : '✅ Below General Driving Limit'}
          </div>
        </div>
      )}
    </div>
  );
}