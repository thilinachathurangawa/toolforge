'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, Plus, Trash2 } from 'lucide-react';

type GradientType = 'linear' | 'radial' | 'conic';

interface Stop {
  id: number;
  color: string;
  position: number; // 0-100
}

let stopId = 4;

export function CssGradientGenerator() {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [radialShape, setRadialShape] = useState<'circle' | 'ellipse'>('circle');
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, color: '#6366f1', position: 0 },
    { id: 2, color: '#ec4899', position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const stopStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
    if (type === 'linear') return `linear-gradient(${angle}deg, ${stopStr})`;
    if (type === 'radial') return `radial-gradient(${radialShape}, ${stopStr})`;
    return `conic-gradient(from ${angle}deg, ${stopStr})`;
  }, [type, angle, radialShape, stops]);

  const fullCss = `background: ${css};`;

  const addStop = () => {
    setStops((prev) => [...prev, { id: stopId++, color: '#22d3ee', position: 50 }]);
  };

  const removeStop = (id: number) => {
    setStops((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== id) : prev));
  };

  const updateStop = (id: number, patch: Partial<Stop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const copy = () => {
    navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showAngle = type === 'linear' || type === 'conic';

  return (
    <div className="w-full space-y-6">
      <div
        className="h-56 rounded-xl border border-border"
        style={{ background: css }}
        aria-label="Gradient preview"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Type</label>
          <div className="flex gap-2">
            {(['linear', 'radial', 'conic'] as GradientType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 px-3 py-2 text-sm rounded-md capitalize transition-colors ${
                  type === t ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {showAngle ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Angle: {angle}°</label>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-accent" />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Shape</label>
            <div className="flex gap-2">
              {(['circle', 'ellipse'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setRadialShape(s)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md capitalize transition-colors ${
                    radialShape === s ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Color stops</label>
          <button onClick={addStop} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
            <Plus size={14} /> Add stop
          </button>
        </div>
        {stops.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <input
              type="color"
              value={s.color}
              onChange={(e) => updateStop(s.id, { color: e.target.value })}
              className="w-10 h-9 border border-border rounded cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={s.color}
              onChange={(e) => updateStop(s.id, { color: e.target.value })}
              className="w-24 px-2 py-1.5 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={s.position}
              onChange={(e) => updateStop(s.id, { position: +e.target.value })}
              className="flex-1 accent-accent"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">{s.position}%</span>
            <button
              onClick={() => removeStop(s.id)}
              disabled={stops.length <= 2}
              className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
              title="Remove stop"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">CSS</label>
          <button
            onClick={copy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
        </div>
        <pre className="p-4 border border-border rounded-md bg-background text-sm font-mono text-foreground overflow-x-auto" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
          {fullCss}
        </pre>
      </div>
    </div>
  );
}
