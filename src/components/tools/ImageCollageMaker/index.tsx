'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
} // fractions 0..1

interface Layout {
  id: string;
  label: string;
  cells: Cell[];
}

const LAYOUTS: Layout[] = [
  { id: '2x1', label: '2 × 1', cells: [
    { x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 },
  ] },
  { id: '1x2', label: '1 × 2', cells: [
    { x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 },
  ] },
  { id: '2x2', label: '2 × 2', cells: [
    { x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ] },
  { id: '3x1', label: '3 × 1', cells: [
    { x: 0, y: 0, w: 1 / 3, h: 1 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 1 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
  ] },
  { id: '1x3', label: '1 × 3', cells: [
    { x: 0, y: 0, w: 1, h: 1 / 3 }, { x: 0, y: 1 / 3, w: 1, h: 1 / 3 }, { x: 0, y: 2 / 3, w: 1, h: 1 / 3 },
  ] },
  { id: '3x3', label: '3 × 3', cells: Array.from({ length: 9 }, (_, i) => ({
    x: (i % 3) / 3, y: Math.floor(i / 3) / 3, w: 1 / 3, h: 1 / 3,
  })) },
  { id: 'uneven', label: '1 + 2', cells: [
    { x: 0, y: 0, w: 2 / 3, h: 1 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
    { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
  ] },
];

const CANVAS_SIZES: Record<string, { w: number; h: number }> = {
  Square: { w: 1080, h: 1080 },
  Landscape: { w: 1350, h: 1080 },
  Portrait: { w: 1080, h: 1350 },
};

export function ImageCollageMaker() {
  const [layout, setLayout] = useState<Layout>(LAYOUTS[2]);
  const [sizeKey, setSizeKey] = useState<string>('Square');
  const [slots, setSlots] = useState<(HTMLImageElement | null)[]>(Array(LAYOUTS[2].cells.length).fill(null));
  const [border, setBorder] = useState(12);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const previewRef = useRef<HTMLCanvasElement>(null);
  const slotInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<number>(0);

  const canvasSize = CANVAS_SIZES[sizeKey];
  const MAX_DISPLAY = 420;
  const displayScale = MAX_DISPLAY / Math.max(canvasSize.w, canvasSize.h);
  const displayW = Math.round(canvasSize.w * displayScale);
  const displayH = Math.round(canvasSize.h * displayScale);

  const changeLayout = (l: Layout) => {
    setLayout(l);
    setSlots((prev) => {
      const next = Array(l.cells.length).fill(null);
      for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i];
      return next;
    });
  };

  const loadIntoSlot = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      setSlots((prev) => {
        const next = [...prev];
        next[index] = img;
        return next;
      });
    };
    img.src = url;
  };

  const onSlotClick = (index: number) => {
    activeSlotRef.current = index;
    slotInputRef.current?.click();
  };

  const onSlotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadIntoSlot(activeSlotRef.current, f);
    e.target.value = '';
  };

  const onSlotDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) loadIntoSlot(index, f);
  };

  const clearSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  // Draw a single image into a rect using cover-fit (center-cropped).
  const drawCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) => {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(dw / iw, dh / ih);
    const sw = dw / scale;
    const sh = dh / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const drawCollage = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, scale: number) => {
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, w, h);
      const b = (border * scale) / 2;
      layout.cells.forEach((cell, i) => {
        const cx = cell.x * w + b;
        const cy = cell.y * h + b;
        const cw = cell.w * w - b * 2;
        const ch = cell.h * h - b * 2;
        const img = slots[i];
        if (img) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(cx, cy, cw, ch);
          ctx.clip();
          drawCover(ctx, img, cx, cy, cw, ch);
          ctx.restore();
        }
      });
    },
    [layout, slots, border, borderColor]
  );

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    canvas.width = displayW;
    canvas.height = displayH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCollage(ctx, displayW, displayH, displayScale);
  }, [drawCollage, displayW, displayH, displayScale]);

  const download = (type: 'image/png' | 'image/jpeg') => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCollage(ctx, canvasSize.w, canvasSize.h, 1);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collage.${type === 'image/png' ? 'png' : 'jpg'}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      type,
      0.92
    );
  };

  const filledCount = slots.filter(Boolean).length;

  return (
    <div className="w-full space-y-6">
      <input ref={slotInputRef} type="file" accept="image/*" className="hidden" onChange={onSlotFileChange} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Layout</label>
            <div className="flex flex-wrap gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => changeLayout(l)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    layout.id === l.id
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Canvas shape</label>
            <div className="flex gap-2">
              {Object.keys(CANVAS_SIZES).map((k) => (
                <button
                  key={k}
                  onClick={() => setSizeKey(k)}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm rounded-md transition-colors',
                    sizeKey === k
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Border thickness: {border}px</label>
            <input
              type="range"
              min="0"
              max="60"
              step="2"
              value={border}
              onChange={(e) => setBorder(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Border color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-12 h-10 border border-border rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => download('image/png')}
              disabled={filledCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download size={18} /> Download PNG
            </button>
            <button
              onClick={() => download('image/jpeg')}
              disabled={filledCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download size={18} /> Download JPG
            </button>
          </div>
        </div>

        {/* Preview + interactive slots */}
        <div className="p-6 border border-border rounded-xl bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Collage</h3>
            <span className="text-sm text-muted-foreground">
              {canvasSize.w} × {canvasSize.h}
            </span>
          </div>
          <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[300px]">
            <div className="relative" style={{ width: displayW, height: displayH }}>
              <canvas ref={previewRef} className="absolute inset-0 rounded shadow-sm" />
              {/* Clickable slot overlays */}
              {layout.cells.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => onSlotClick(i)}
                  onDrop={(e) => onSlotDrop(i, e)}
                  onDragOver={(e) => e.preventDefault()}
                  className="absolute flex items-center justify-center group"
                  style={{
                    left: cell.x * displayW,
                    top: cell.y * displayH,
                    width: cell.w * displayW,
                    height: cell.h * displayH,
                  }}
                >
                  {!slots[i] && (
                    <span className="flex flex-col items-center text-muted-foreground/80 pointer-events-none">
                      <Plus size={20} />
                    </span>
                  )}
                  {slots[i] && (
                    <span
                      onClick={(e) => clearSlot(i, e)}
                      className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Click an empty cell to add a photo, or drag an image onto it. Hover a filled cell and click ✕ to clear it.
          </p>
        </div>
      </div>
    </div>
  );
}
