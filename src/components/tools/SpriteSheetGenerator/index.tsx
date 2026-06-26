'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, X, FileJson, Image as ImageIcon } from 'lucide-react';

interface SourceImg {
  name: string;
  img: HTMLImageElement;
}

interface Frame {
  name: string;
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function SpriteSheetGenerator() {
  const [sources, setSources] = useState<SourceImg[]>([]);
  const [maxWidth, setMaxWidth] = useState(512);
  const [padding, setPadding] = useState(2);
  const [scale, setScale] = useState(1);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [sheetSize, setSheetSize] = useState({ w: 0, h: 0 });
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    valid.forEach((file) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        setSources((prev) => [...prev, { name: file.name.replace(/\.[^/.]+$/, ''), img }]);
      };
      img.src = url;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  // Shelf-pack frames into rows under maxWidth.
  useEffect(() => {
    if (sources.length === 0) {
      setFrames([]);
      setSheetSize({ w: 0, h: 0 });
      return;
    }
    const pad = padding;
    let x = pad;
    let y = pad;
    let rowHeight = 0;
    let sheetW = 0;
    const packed: Frame[] = [];

    for (const s of sources) {
      const w = Math.max(1, Math.round(s.img.naturalWidth * scale));
      const h = Math.max(1, Math.round(s.img.naturalHeight * scale));
      if (x + w + pad > maxWidth && x > pad) {
        // wrap to next row
        x = pad;
        y += rowHeight + pad;
        rowHeight = 0;
      }
      packed.push({ name: s.name, img: s.img, x, y, w, h });
      x += w + pad;
      rowHeight = Math.max(rowHeight, h);
      sheetW = Math.max(sheetW, x);
    }
    const sheetH = y + rowHeight + pad;
    setFrames(packed);
    setSheetSize({ w: Math.max(sheetW, maxWidth >= sheetW ? sheetW : maxWidth), h: sheetH });
  }, [sources, maxWidth, padding, scale]);

  // Draw preview.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || sheetSize.w === 0) return;
    canvas.width = sheetSize.w;
    canvas.height = sheetSize.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, sheetSize.w, sheetSize.h);
    frames.forEach((f) => ctx.drawImage(f.img, f.x, f.y, f.w, f.h));
  }, [frames, sheetSize]);

  const buildSheetCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = sheetSize.w;
    canvas.height = sheetSize.h;
    const ctx = canvas.getContext('2d');
    if (ctx) frames.forEach((f) => ctx.drawImage(f.img, f.x, f.y, f.w, f.h));
    return canvas;
  };

  const downloadPng = () => {
    if (frames.length === 0) return;
    buildSheetCanvas().toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spritesheet.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const downloadJson = () => {
    if (frames.length === 0) return;
    const map: Record<string, { x: number; y: number; w: number; h: number }> = {};
    frames.forEach((f) => {
      map[f.name] = { x: f.x, y: f.y, w: f.w, h: f.h };
    });
    const json = JSON.stringify({ frames: map, meta: { w: sheetSize.w, h: sheetSize.h } }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spritesheet.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          id="sprite-upload"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          <label
            htmlFor="sprite-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drop sprite images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PNG recommended (keeps transparency) • multiple files</p>
          </label>
        </div>

        {sources.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">{sources.length} sprite(s)</span>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sources.map((s, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ImageIcon size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{s.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {s.img.naturalWidth}×{s.img.naturalHeight}
                    </span>
                  </div>
                  <button
                    onClick={() => removeSource(index)}
                    className="p-1 hover:bg-background rounded transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {sources.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Max sheet width (px)</label>
              <input
                type="number"
                min="32"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Math.max(32, parseInt(e.target.value) || 32))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Padding between sprites: {padding}px</label>
              <input
                type="range"
                min="0"
                max="20"
                value={padding}
                onChange={(e) => setPadding(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {[0.25, 0.5, 1, 1.5, 2].map((s) => (
                  <option key={s} value={s}>
                    {s}×
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              Sheet: {sheetSize.w} × {sheetSize.h}px · {frames.length} frames
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={downloadPng}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors font-medium"
              >
                <Download size={18} /> Download PNG
              </button>
              <button
                onClick={downloadJson}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium"
              >
                <FileJson size={18} /> Download JSON
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-3">
            <h3 className="font-semibold text-foreground">Packed atlas</h3>
            <div
              className="flex items-center justify-center rounded-lg p-4 min-h-[280px] overflow-auto"
              style={{
                backgroundImage:
                  'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
              }}
            >
              <canvas ref={previewRef} className="max-w-full h-auto" />
            </div>
            <p className="text-xs text-muted-foreground">
              The JSON maps each sprite name to its x/y/width/height in the sheet, ready for your engine or CSS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
