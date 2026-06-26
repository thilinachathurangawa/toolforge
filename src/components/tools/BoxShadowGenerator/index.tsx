'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function BoxShadowGenerator() {
  const [hOffset, setHOffset] = useState(8);
  const [vOffset, setVOffset] = useState(8);
  const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(0);
  const [opacity, setOpacity] = useState(25);
  const [shadowColor, setShadowColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#f1f5f9');
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const shadow = useMemo(() => {
    const { r, g, b } = hexToRgb(shadowColor);
    const rgba = `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
    return `${inset ? 'inset ' : ''}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${rgba}`;
  }, [hOffset, vOffset, blur, spread, opacity, shadowColor, inset]);

  const fullCss = `box-shadow: ${shadow};`;

  const copy = () => {
    navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Slider = ({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}: {value}
        {label === 'Opacity' ? '%' : 'px'}
      </label>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} className="w-full accent-accent" />
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border border-border p-10 flex items-center justify-center" style={{ background: bgColor }}>
        <div className="w-40 h-40 rounded-2xl bg-white" style={{ boxShadow: shadow }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slider label="Horizontal offset" value={hOffset} set={setHOffset} min={-100} max={100} />
        <Slider label="Vertical offset" value={vOffset} set={setVOffset} min={-100} max={100} />
        <Slider label="Blur radius" value={blur} set={setBlur} min={0} max={100} />
        <Slider label="Spread radius" value={spread} set={setSpread} min={-50} max={50} />
        <Slider label="Opacity" value={opacity} set={setOpacity} min={0} max={100} />
        <div className="flex items-end gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Shadow</label>
            <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="accent-accent" />
        Inset shadow
      </label>

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
