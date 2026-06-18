'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function MacroCalculator() {
  const [calories, setCalories] = useState<string>('2000');
  const [diet, setDiet] = useState<'balanced' | 'lowcarb' | 'highprotein' | 'keto'>('balanced');
  const [copied, setCopied] = useState(false);

  const cal = parseFloat(calories) || 0;
  
  let pPct = 30, cPct = 40, fPct = 30; // balanced default
  if (diet === 'lowcarb') { pPct = 35; cPct = 25; fPct = 40; }
  if (diet === 'highprotein') { pPct = 40; cPct = 30; fPct = 30; }
  if (diet === 'keto') { pPct = 20; cPct = 5; fPct = 75; }

  const pG = (cal * (pPct / 100)) / 4;
  const cG = (cal * (cPct / 100)) / 4;
  const fG = (cal * (fPct / 100)) / 9;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Protein: ${pG.toFixed(0)}g, Carbs: ${cG.toFixed(0)}g, Fat: ${fG.toFixed(0)}g`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Macro Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Daily Calorie Target (kcal)</label>
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Diet Type</label>
          <select value={diet} onChange={(e) => setDiet(e.target.value as any)} className="w-full px-3 py-2 border rounded-md bg-background">
            <option value="balanced">Balanced (40% Carbs, 30% Protein, 30% Fat)</option>
            <option value="lowcarb">Low Carb (25% Carbs, 35% Protein, 40% Fat)</option>
            <option value="highprotein">High Protein (30% Carbs, 40% Protein, 30% Fat)</option>
            <option value="keto">Keto (5% Carbs, 20% Protein, 75% Fat)</option>
          </select>
        </div>
      </div>

      {cal > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-md">
            <div>Protein</div>
            <div className="text-xl font-extrabold">{pG.toFixed(0)}g</div>
            <div className="text-xs font-normal text-muted-foreground">{pPct}%</div>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-md">
            <div>Carbs</div>
            <div className="text-xl font-extrabold">{cG.toFixed(0)}g</div>
            <div className="text-xs font-normal text-muted-foreground">{cPct}%</div>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-md">
            <div>Fat</div>
            <div className="text-xl font-extrabold">{fG.toFixed(0)}g</div>
            <div className="text-xs font-normal text-muted-foreground">{fPct}%</div>
          </div>
        </div>
      )}
    </div>
  );
}