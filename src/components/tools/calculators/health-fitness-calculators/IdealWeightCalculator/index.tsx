'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function IdealWeightCalculator() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState<string>('175');
  const [copied, setCopied] = useState(false);

  const heightInches = (parseFloat(heightCm) || 0) / 2.54;
  const inchesOver5Foot = Math.max(0, heightInches - 60);

  let devine = 0, robinson = 0, miller = 0, hamwi = 0;

  if (inchesOver5Foot >= 0 && heightInches > 0) {
    if (gender === 'male') {
      devine = 50.0 + 2.3 * inchesOver5Foot;
      robinson = 52.0 + 1.9 * inchesOver5Foot;
      miller = 56.2 + 1.41 * inchesOver5Foot;
      hamwi = 48.0 + 2.7 * inchesOver5Foot;
    } else {
      devine = 45.5 + 2.3 * inchesOver5Foot;
      robinson = 49.0 + 1.7 * inchesOver5Foot;
      miller = 53.1 + 1.36 * inchesOver5Foot;
      hamwi = 45.5 + 2.2 * inchesOver5Foot;
    }
  }

  const averageWeight = (devine + robinson + miller + hamwi) / 4;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Ideal Weight (Avg): ${averageWeight.toFixed(1)} kg`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Ideal Weight Calculator</h2>
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
          <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {averageWeight > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Estimated Average Ideal Weight</div>
            <div className="text-3xl font-extrabold">{averageWeight.toFixed(1)} kg</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 border rounded-md">Devine: <span className="font-bold">{devine.toFixed(1)} kg</span></div>
            <div className="p-2 border rounded-md">Robinson: <span className="font-bold">{robinson.toFixed(1)} kg</span></div>
            <div className="p-2 border rounded-md">Miller: <span className="font-bold">{miller.toFixed(1)} kg</span></div>
            <div className="p-2 border rounded-md">Hamwi: <span className="font-bold">{hamwi.toFixed(1)} kg</span></div>
          </div>
        </div>
      )}
    </div>
  );
}