'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function TargetHeartRateCalculator() {
  const [age, setAge] = useState<string>('25');
  const [restingHr, setRestingHr] = useState<string>('60');
  const [copied, setCopied] = useState(false);

  const a = parseFloat(age) || 0;
  const rhr = parseFloat(restingHr) || 0;
  
  const mhr = 220 - a;
  const hrr = mhr - rhr;

  // zones based on Karvonen method
  const z1Min = hrr * 0.5 + rhr;
  const z1Max = hrr * 0.6 + rhr;
  const z2Min = hrr * 0.6 + rhr;
  const z2Max = hrr * 0.7 + rhr;
  const z3Min = hrr * 0.7 + rhr;
  const z3Max = hrr * 0.8 + rhr;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Max HR: ${mhr} bpm, Aerobic Zone: ${z2Min.toFixed(0)}-\u007B${z2Max.toFixed(0)}\} bpm`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Target Heart Rate Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Age (years)</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Resting HR (bpm)</label>
          <input type="number" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {mhr > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Estimated Max Heart Rate</div>
            <div className="text-3xl font-extrabold">{mhr} <span className="text-lg font-normal">bpm</span></div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Target Intensity Zones (Karvonen)</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between p-2 bg-muted/40 rounded">
                <span>Fat Burning (60% - 70%)</span>
                <span className="font-bold">{z2Min.toFixed(0)} - {z2Max.toFixed(0)} bpm</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/40 rounded">
                <span>Aerobic (70% - 80%)</span>
                <span className="font-bold">{z3Min.toFixed(0)} - {z3Max.toFixed(0)} bpm</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}