'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function PaceCalculator() {
  const [distance, setDistance] = useState<string>('5'); // in km
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('25');
  const [seconds, setSeconds] = useState<string>('0');
  const [copied, setCopied] = useState(false);

  const dist = parseFloat(distance) || 0;
  const h = parseFloat(hours) || 0;
  const m = parseFloat(minutes) || 0;
  const s = parseFloat(seconds) || 0;

  const totalSeconds = h * 3600 + m * 60 + s;
  
  let paceMin = 0;
  let paceSec = 0;
  if (dist > 0 && totalSeconds > 0) {
    const secondsPerKm = totalSeconds / dist;
    paceMin = Math.floor(secondsPerKm / 60);
    paceSec = Math.floor(secondsPerKm % 60);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Pace: ${paceMin}:${paceSec.toString().padStart(2, '0')} min/km`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 bg-card p-6 border border-border rounded-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Pace Calculator</h2>
        <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-md">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Distance (km)</label>
          <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Hours</label>
            <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Minutes</label>
            <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Seconds</label>
            <input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
      </div>

      {paceMin > 0 && (
        <div className="p-4 bg-muted rounded-lg text-center space-y-1">
          <div className="text-sm text-muted-foreground">Calculated Pace</div>
          <div className="text-4xl font-extrabold">{paceMin}:{paceSec.toString().padStart(2, '0')} <span className="text-lg font-normal">min/km</span></div>
        </div>
      )}
    </div>
  );
}