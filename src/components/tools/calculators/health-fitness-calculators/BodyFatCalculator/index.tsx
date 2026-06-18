'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function BodyFatCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState<string>('175');
  const [waist, setWaist] = useState<string>('80');
  const [neck, setNeck] = useState<string>('38');
  const [hip, setHip] = useState<string>('95');
  const [copied, setCopied] = useState(false);

  const h = parseFloat(height) || 0;
  const w = parseFloat(waist) || 0;
  const n = parseFloat(neck) || 0;
  const hp = parseFloat(hip) || 0;

  let bodyFat = 0;
  if (h > 0 && w > 0 && n > 0) {
    if (gender === 'male') {
      bodyFat = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
    } else if (hp > 0) {
      bodyFat = 163.205 * Math.log10(w + hp - n) - 97.684 * Math.log10(h) - 78.387;
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Body Fat %: ${bodyFat.toFixed(1)}%`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Body Fat Calculator</h2>
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
          <label className="text-sm font-medium">Height (cm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Neck (cm)</label>
          <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Waist (cm)</label>
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        {gender === 'female' && (
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Hip (cm)</label>
            <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
        )}
      </div>

      {bodyFat > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Body Fat Percentage (US Navy Method)</div>
          <div className="text-4xl font-extrabold">{bodyFat.toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
}