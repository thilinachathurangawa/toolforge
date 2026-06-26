'use client';

import React, { useState, useMemo } from 'react';
import { Check, Copy } from 'lucide-react';

type Harmony = 'complementary' | 'analogous' | 'triadic' | 'split' | 'monochromatic';

const HARMONIES: { value: Harmony; label: string }[] = [
  { value: 'complementary', label: 'Complementary' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'split', label: 'Split-Complementary' },
  { value: 'monochromatic', label: 'Monochromatic' },
];

function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const toHex = (h: number, s: number, l: number) => {
  const [r, g, b] = hslToRgb((h + 360) % 360, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l)));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
};

interface Swatch {
  hex: string;
  rgb: string;
  hsl: string;
}

function buildSwatches(base: string, harmony: Harmony): Swatch[] {
  const [h, s, l] = hexToHsl(base);
  let hsls: [number, number, number][] = [];
  switch (harmony) {
    case 'complementary':
      hsls = [[h, s, l], [h + 180, s, l]];
      break;
    case 'analogous':
      hsls = [[h - 30, s, l], [h, s, l], [h + 30, s, l]];
      break;
    case 'triadic':
      hsls = [[h, s, l], [h + 120, s, l], [h + 240, s, l]];
      break;
    case 'split':
      hsls = [[h, s, l], [h + 150, s, l], [h + 210, s, l]];
      break;
    case 'monochromatic':
      hsls = [
        [h, s, Math.max(12, l - 30)],
        [h, s, Math.max(20, l - 15)],
        [h, s, l],
        [h, s, Math.min(90, l + 15)],
        [h, s, Math.min(96, l + 30)],
      ];
      break;
  }
  return hsls.map(([hh, ss, ll]) => {
    const hex = toHex(hh, ss, ll);
    const [r, g, b] = hslToRgb((hh + 360) % 360, Math.max(0, Math.min(100, ss)), Math.max(0, Math.min(100, ll)));
    return {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round((hh + 360) % 360)}, ${Math.round(ss)}%, ${Math.round(ll)}%)`,
    };
  });
}

export function ColorPaletteGenerator() {
  const [base, setBase] = useState('#6366f1');
  const [harmony, setHarmony] = useState<Harmony>('triadic');
  const [copied, setCopied] = useState<string | null>(null);

  const swatches = useMemo(() => buildSwatches(base, harmony), [base, harmony]);

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Base color</label>
          <div className="flex gap-2">
            <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="w-12 h-10 border border-border rounded cursor-pointer" />
            <input
              type="text"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-28 px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {HARMONIES.map((h) => (
          <button
            key={h.value}
            onClick={() => setHarmony(h.value)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              harmony === h.value ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {swatches.map((sw, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <div className="h-28 w-full" style={{ background: sw.hex }} />
            <div className="p-3 space-y-1.5 bg-card">
              {([['HEX', sw.hex], ['RGB', sw.rgb], ['HSL', sw.hsl]] as const).map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => copyVal(val)}
                  className="w-full flex items-center justify-between gap-2 text-left group"
                  title={`Copy ${val}`}
                >
                  <span className="text-[11px] font-mono text-muted-foreground truncate">{val}</span>
                  {copied === val ? (
                    <Check size={12} className="text-accent shrink-0" />
                  ) : (
                    <Copy size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
