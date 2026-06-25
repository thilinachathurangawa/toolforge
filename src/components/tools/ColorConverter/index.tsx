'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }
interface CMYK { c: number; m: number; y: number; k: number }

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hueToRgbChannel(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: Math.round(hueToRgbChannel(p, q, hn + 1 / 3) * 255),
    g: Math.round(hueToRgbChannel(p, q, hn) * 255),
    b: Math.round(hueToRgbChannel(p, q, hn - 1 / 3) * 255),
  };
}

function rgbToCmyk(r: number, g: number, b: number): CMYK {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const k = 1 - Math.max(r, g, b) / 255;
  const denom = 1 - k;
  return {
    c: Math.round(((1 - r / 255 - k) / denom) * 100),
    m: Math.round(((1 - g / 255 - k) / denom) * 100),
    y: Math.round(((1 - b / 255 - k) / denom) * 100),
    k: Math.round(k * 100),
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  const cn = c / 100, mn = m / 100, yn = y / 100, kn = k / 100;
  return {
    r: Math.round(255 * (1 - cn) * (1 - kn)),
    g: Math.round(255 * (1 - mn) * (1 - kn)),
    b: Math.round(255 * (1 - yn) * (1 - kn)),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deriveAll(rgb: RGB) {
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  return { hex, rgb, hsl, cmyk };
}

const DEFAULT_RGB: RGB = { r: 99, g: 102, b: 241 };

export function ColorConverter() {
  const initial = deriveAll(DEFAULT_RGB);

  const [hex, setHex] = useState(initial.hex);
  const [hexInput, setHexInput] = useState(initial.hex);
  const [rgb, setRgb] = useState<RGB>(initial.rgb);
  const [hsl, setHsl] = useState<HSL>(initial.hsl);
  const [cmyk, setCmyk] = useState<CMYK>(initial.cmyk);
  const [copied, setCopied] = useState<string | null>(null);

  const syncFromRgb = useCallback((newRgb: RGB) => {
    const derived = deriveAll(newRgb);
    setHex(derived.hex);
    setHexInput(derived.hex);
    setRgb(derived.rgb);
    setHsl(derived.hsl);
    setCmyk(derived.cmyk);
  }, []);

  const handleHexInput = (value: string) => {
    setHexInput(value);
    const clean = value.startsWith('#') ? value : '#' + value;
    const parsed = hexToRgb(clean);
    if (parsed) {
      const derived = deriveAll(parsed);
      setHex(derived.hex);
      setRgb(derived.rgb);
      setHsl(derived.hsl);
      setCmyk(derived.cmyk);
    }
  };

  const handleRgbChange = (channel: keyof RGB, raw: string) => {
    const val = clamp(parseInt(raw) || 0, 0, 255);
    const newRgb = { ...rgb, [channel]: val };
    syncFromRgb(newRgb);
  };

  const handleHslChange = (channel: keyof HSL, raw: string) => {
    const max = channel === 'h' ? 360 : 100;
    const val = clamp(parseInt(raw) || 0, 0, max);
    const newHsl = { ...hsl, [channel]: val };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const derived = deriveAll(newRgb);
    setHex(derived.hex);
    setHexInput(derived.hex);
    setRgb(derived.rgb);
    setCmyk(derived.cmyk);
  };

  const handleCmykChange = (channel: keyof CMYK, raw: string) => {
    const val = clamp(parseInt(raw) || 0, 0, 100);
    const newCmyk = { ...cmyk, [channel]: val };
    setCmyk(newCmyk);
    const newRgb = cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
    const derived = deriveAll(newRgb);
    setHex(derived.hex);
    setHexInput(derived.hex);
    setRgb(derived.rgb);
    setHsl(derived.hsl);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const inputBase =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono text-center';

  const labelBase = 'text-xs font-medium text-muted-foreground uppercase tracking-wide w-12 shrink-0';

  const unitBadge = 'flex items-center justify-center text-xs text-muted-foreground w-6 shrink-0 select-none';

  return (
    <div className="w-full space-y-4">
      <div
        className="w-full rounded-xl border border-border transition-colors duration-150"
        style={{ backgroundColor: hex, height: '80px' }}
        aria-label={`Color preview: ${hex}`}
      />

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
          <span className={labelBase}>HEX</span>
          <div className="flex items-center flex-1 gap-2">
            <div className="flex items-center flex-1 border border-input rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent">
              <span className="px-2 py-2 text-sm text-muted-foreground bg-muted border-r border-input select-none font-mono">#</span>
              <input
                type="text"
                value={hexInput.replace('#', '')}
                onChange={(e) => handleHexInput('#' + e.target.value)}
                onBlur={() => setHexInput(hex)}
                maxLength={6}
                className="flex-1 px-3 py-2 text-sm bg-background focus:outline-none font-mono uppercase"
                aria-label="HEX color value"
              />
            </div>
          </div>
          <button
            onClick={() => handleCopy(hex, 'hex')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors shrink-0',
              copied === 'hex'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            aria-label="Copy HEX value"
          >
            {copied === 'hex' ? <Check size={13} /> : <Copy size={13} />}
            {copied === 'hex' ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
          <span className={labelBase}>RGB</span>
          <div className="flex items-center flex-1 gap-2">
            {(['r', 'g', 'b'] as const).map((ch) => (
              <div key={ch} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{ch}</span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[ch]}
                  onChange={(e) => handleRgbChange(ch, e.target.value)}
                  className={inputBase}
                  aria-label={`RGB ${ch.toUpperCase()} value`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors shrink-0',
              copied === 'rgb'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            aria-label="Copy RGB value"
          >
            {copied === 'rgb' ? <Check size={13} /> : <Copy size={13} />}
            {copied === 'rgb' ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
          <span className={labelBase}>HSL</span>
          <div className="flex items-center flex-1 gap-2">
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">H</span>
              <div className="flex items-center w-full gap-1">
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={hsl.h}
                  onChange={(e) => handleHslChange('h', e.target.value)}
                  className={cn(inputBase, 'flex-1')}
                  aria-label="HSL hue"
                />
                <span className={unitBadge}>°</span>
              </div>
            </div>
            {(['s', 'l'] as const).map((ch) => (
              <div key={ch} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{ch}</span>
                <div className="flex items-center w-full gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl[ch]}
                    onChange={(e) => handleHslChange(ch, e.target.value)}
                    className={cn(inputBase, 'flex-1')}
                    aria-label={`HSL ${ch}`}
                  />
                  <span className={unitBadge}>%</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors shrink-0',
              copied === 'hsl'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            aria-label="Copy HSL value"
          >
            {copied === 'hsl' ? <Check size={13} /> : <Copy size={13} />}
            {copied === 'hsl' ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
          <span className={labelBase}>CMYK</span>
          <div className="flex items-center flex-1 gap-2">
            {(['c', 'm', 'y', 'k'] as const).map((ch) => (
              <div key={ch} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{ch}</span>
                <div className="flex items-center w-full gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cmyk[ch]}
                    onChange={(e) => handleCmykChange(ch, e.target.value)}
                    className={cn(inputBase, 'flex-1')}
                    aria-label={`CMYK ${ch.toUpperCase()} value`}
                  />
                  <span className={unitBadge}>%</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              handleCopy(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, 'cmyk')
            }
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors shrink-0',
              copied === 'cmyk'
                ? 'bg-accent text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            aria-label="Copy CMYK value"
          >
            {copied === 'cmyk' ? <Check size={13} /> : <Copy size={13} />}
            {copied === 'cmyk' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
