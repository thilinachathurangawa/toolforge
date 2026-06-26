'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';

type Shape = 'circle' | 'square' | 'squircle';

const SIZE = 256;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Rounded-rect path shared by canvas + SVG so both renders match.
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const PRESETS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#ef4444', '#8b5cf6', '#14b8a6'];

export function AvatarGenerator() {
  const [name, setName] = useState('Ada Lovelace');
  const [shape, setShape] = useState<Shape>('circle');
  const [fontSize, setFontSize] = useState(110);
  const [radius, setRadius] = useState(48);
  const [bgColor, setBgColor] = useState('#6366f1');
  const [textColor, setTextColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initials = getInitials(name);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = bgColor;
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'square') {
      ctx.fillRect(0, 0, SIZE, SIZE);
    } else {
      roundRect(ctx, 0, 0, SIZE, SIZE, radius);
      ctx.fill();
    }

    ctx.fillStyle = textColor;
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, SIZE / 2, SIZE / 2 + fontSize * 0.04);
  }, [bgColor, textColor, fontSize, shape, radius, initials]);

  useEffect(() => {
    draw();
  }, [draw]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `avatar-${initials.toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  };

  const downloadSvg = () => {
    let shapeEl = '';
    if (shape === 'circle') shapeEl = `<circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="${bgColor}"/>`;
    else if (shape === 'square') shapeEl = `<rect width="${SIZE}" height="${SIZE}" fill="${bgColor}"/>`;
    else shapeEl = `<rect width="${SIZE}" height="${SIZE}" rx="${radius}" ry="${radius}" fill="${bgColor}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${shapeEl}
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="600" font-size="${fontSize}" fill="${textColor}">${initials}</text>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `avatar-${initials.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="p-6 border border-border rounded-xl bg-card flex flex-col items-center justify-center gap-5">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="w-48 h-48"
          style={{ imageRendering: 'auto' }}
        />
        <div className="flex gap-3">
          <button onClick={downloadPng} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
            <Download size={16} /> PNG
          </button>
          <button onClick={downloadSvg} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            <Download size={16} /> SVG
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grace Hopper"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <p className="text-xs text-muted-foreground">Initials: <span className="font-mono">{initials}</span></p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Shape</label>
          <div className="flex gap-2">
            {(['circle', 'square', 'squircle'] as Shape[]).map((s) => (
              <button
                key={s}
                onClick={() => setShape(s)}
                className={`flex-1 px-2 py-2 text-sm rounded-md capitalize transition-colors ${
                  shape === s ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Font size: {fontSize}px</label>
          <input type="range" min={40} max={180} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-accent" />
        </div>

        {shape === 'squircle' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Corner radius: {radius}px</label>
            <input type="range" min={0} max={128} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-accent" />
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Text</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => setBgColor(c)}
              className="w-7 h-7 rounded-full border border-border"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
