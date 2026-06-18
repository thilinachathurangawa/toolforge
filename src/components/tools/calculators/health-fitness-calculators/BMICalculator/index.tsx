'use client';
import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';

export function BMICalculator() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [copied, setCopied] = useState(false);

  const weightNum = parseFloat(weight) || 0;
  const heightNum = parseFloat(height) || 0;

  let bmi = 0;
  if (weightNum > 0 && heightNum > 0) {
    if (unit === 'metric') {
      const heightInMeters = heightNum / 100;
      bmi = weightNum / (heightInMeters * heightInMeters);
    } else {
      bmi = (weightNum / (heightNum * heightNum)) * 703;
    }
  }

  let status = 'Underweight';
  let color = 'text-blue-500';
  if (bmi >= 18.5 && bmi < 25) {
    status = 'Normal weight';
    color = 'text-green-500';
  } else if (bmi >= 25 && bmi < 30) {
    status = 'Overweight';
    color = 'text-orange-500';
  } else if (bmi >= 30) {
    status = 'Obese';
    color = 'text-red-500';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`BMI: ${bmi.toFixed(1)} (${status})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">BMI Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button onClick={() => setUnit('metric')} className={`px-3 py-1.5 text-sm rounded-md ${unit === 'metric' ? 'bg-background shadow' : ''}`}>Metric (kg/cm)</button>
        <button onClick={() => setUnit('imperial')} className={`px-3 py-1.5 text-sm rounded-md ${unit === 'imperial' ? 'bg-background shadow' : ''}`}>Imperial (lbs/inches)</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      {bmi > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-2">
          <div className="text-sm text-muted-foreground">Your Body Mass Index (BMI)</div>
          <div className="text-4xl font-extrabold">{bmi.toFixed(1)}</div>
          <div className={`text-lg font-bold ${color}`}>{status}</div>
        </div>
      )}
    </div>
  );
}