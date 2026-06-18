'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function BMRCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [age, setAge] = useState<string>('25');
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age) || 0;

  let bmr = 0;
  if (w > 0 && h > 0 && a > 0) {
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`BMR: ${bmr.toFixed(0)} kcal/day`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">BMR Calculator</h2>
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
          <label className="text-sm font-medium">Age (years)</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Height (cm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {bmr > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Basal Metabolic Rate (BMR)</div>
          <div className="text-4xl font-extrabold">{bmr.toFixed(0)} <span className="text-lg font-normal">kcal/day</span></div>
        </div>
      )}
    </div>
  );
}