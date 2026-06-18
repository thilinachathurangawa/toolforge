'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [copied, setCopied] = useState(false);

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;

  let bsaDuBois = 0;
  let bsaMosteller = 0;
  if (w > 0 && h > 0) {
    bsaDuBois = 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725);
    bsaMosteller = Math.sqrt((w * h) / 3600);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`BSA (DuBois): ${bsaDuBois.toFixed(2)} m²`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Body Surface Area Calculator</h2>
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
          <label className="text-sm font-medium">Height (cm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {bsaDuBois > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground">DuBois BSA</div>
            <div className="text-3xl font-extrabold">{bsaDuBois.toFixed(2)} <span className="text-lg font-normal">m²</span></div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Mosteller BSA</div>
            <div className="text-xl font-bold">{bsaMosteller.toFixed(2)} <span className="text-lg font-normal">m²</span></div>
          </div>
        </div>
      )}
    </div>
  );
}