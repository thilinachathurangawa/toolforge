'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import JsBarcode from 'jsbarcode';

const FORMATS = [
  { value: 'CODE128', label: 'CODE128 (general purpose)' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'EAN13', label: 'EAN-13 (retail)' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC', label: 'UPC-A (retail US)' },
  { value: 'ITF14', label: 'ITF-14 (shipping)' },
  { value: 'ITF', label: 'ITF' },
  { value: 'MSI', label: 'MSI' },
  { value: 'pharmacode', label: 'Pharmacode' },
  { value: 'codabar', label: 'Codabar' },
];

// A sensible default sample for each symbology so the preview is never empty.
const SAMPLE: Record<string, string> = {
  CODE128: 'TOOLFORGE-128',
  CODE39: 'TOOLFORGE',
  EAN13: '5901234123457',
  EAN8: '96385074',
  UPC: '036000291452',
  ITF14: '15400141288763',
  ITF: '1234567890',
  MSI: '1234567',
  pharmacode: '1234',
  codabar: 'A40156B',
};

export function BarcodeGenerator() {
  const [format, setFormat] = useState('CODE128');
  const [value, setValue] = useState(SAMPLE.CODE128);
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [margin, setMargin] = useState(10);
  const [lineColor, setLineColor] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [displayValue, setDisplayValue] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const render = useCallback(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value || ' ', {
        format,
        width: barWidth,
        height,
        margin,
        lineColor,
        background,
        displayValue,
        valid: (valid: boolean) => {
          setError(valid ? null : `"${value}" is not valid for ${format}.`);
        },
      });
    } catch {
      setError(`"${value}" is not valid for ${format}.`);
    }
  }, [value, format, barWidth, height, margin, lineColor, background, displayValue]);

  useEffect(() => {
    render();
  }, [render]);

  const onFormatChange = (f: string) => {
    setFormat(f);
    setValue(SAMPLE[f] ?? value);
  };

  const downloadPng = () => {
    const svg = svgRef.current;
    if (!svg || error) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3; // export at 3x for crisp print/scan quality
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `barcode-${format}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, 'image/png');
    };
    img.src = url;
  };

  const inputCls =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Data</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Format</label>
          <select value={format} onChange={(e) => onFormatChange(e.target.value)} className={inputCls}>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Bar width: {barWidth}</label>
          <input type="range" min={1} max={4} step={1} value={barWidth} onChange={(e) => setBarWidth(+e.target.value)} className="w-full accent-accent" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Height: {height}px</label>
          <input type="range" min={20} max={200} step={5} value={height} onChange={(e) => setHeight(+e.target.value)} className="w-full accent-accent" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Margin: {margin}px</label>
          <input type="range" min={0} max={40} step={2} value={margin} onChange={(e) => setMargin(+e.target.value)} className="w-full accent-accent" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Bars</label>
          <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Background</label>
          <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={displayValue} onChange={(e) => setDisplayValue(e.target.checked)} className="accent-accent" />
          Show text under bars
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="p-6 border border-border rounded-xl bg-card flex items-center justify-center overflow-x-auto">
        <svg ref={svgRef} />
      </div>

      <button
        onClick={downloadPng}
        disabled={!!error}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download size={16} />
        Download PNG
      </button>
    </div>
  );
}
