'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, X, Grid2x2 } from 'lucide-react';

interface Standard {
  id: string;
  label: string;
  wMm: number;
  hMm: number;
}

const STANDARDS: Standard[] = [
  { id: 'us', label: 'US Passport / Visa — 2×2 in', wMm: 51, hMm: 51 },
  { id: 'eu', label: 'UK / EU / Schengen — 35×45 mm', wMm: 35, hMm: 45 },
  { id: 'ca', label: 'Canada — 50×70 mm', wMm: 50, hMm: 70 },
  { id: 'in', label: 'India — 35×45 mm', wMm: 35, hMm: 45 },
  { id: 'au', label: 'Australia — 35×45 mm', wMm: 35, hMm: 45 },
];

const BG_COLORS: Record<string, string> = {
  white: '#ffffff',
  grey: '#e9edf2',
  blue: '#cfe0f3',
};

const MAX_DISPLAY = 340; // px, longest side of the preview frame

export function PassportPhotoMaker() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [standard, setStandard] = useState<Standard>(STANDARDS[0]);
  const [dpi, setDpi] = useState(300);
  const [bg, setBg] = useState<'white' | 'grey' | 'blue'>('white');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const targetW = Math.round((standard.wMm / 25.4) * dpi);
  const targetH = Math.round((standard.hMm / 25.4) * dpi);
  const displayScale = MAX_DISPLAY / Math.max(targetW, targetH);
  const displayW = Math.round(targetW * displayScale);
  const displayH = Math.round(targetH * displayScale);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }
    setError(null);
    setFile(f);
    setSheetUrl(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      URL.revokeObjectURL(url);
      setImgEl(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Could not load that image. Please try a different file.');
    };
    img.src = url;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Draw the cropped photo (background + transformed image) in OUTPUT pixel coords.
  const drawPhoto = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!imgEl) return;
      ctx.fillStyle = BG_COLORS[bg];
      ctx.fillRect(0, 0, targetW, targetH);
      const iw = imgEl.naturalWidth;
      const ih = imgEl.naturalHeight;
      const baseScale = Math.max(targetW / iw, targetH / ih);
      const eff = baseScale * zoom;
      const dw = iw * eff;
      const dh = ih * eff;
      const x = (targetW - dw) / 2 + offset.x;
      const y = (targetH - dh) / 2 + offset.y;
      ctx.drawImage(imgEl, x, y, dw, dh);
    },
    [imgEl, bg, targetW, targetH, zoom, offset]
  );

  // Render the visible preview = scaled photo + head-position guide overlay.
  const renderPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas || !imgEl) return;
    canvas.width = displayW;
    canvas.height = displayH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, displayW, displayH);
    ctx.save();
    ctx.scale(displayScale, displayScale);
    drawPhoto(ctx);
    ctx.restore();

    // Guide overlay (oval + crown/chin lines) in display coords.
    ctx.strokeStyle = 'rgba(59,130,246,0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    const ovalW = displayW * 0.5;
    const ovalH = displayH * 0.62;
    ctx.beginPath();
    ctx.ellipse(displayW / 2, displayH * 0.46, ovalW / 2, ovalH / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, displayH * 0.13);
    ctx.lineTo(displayW, displayH * 0.13);
    ctx.moveTo(0, displayH * 0.86);
    ctx.lineTo(displayW, displayH * 0.86);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [drawPhoto, imgEl, displayW, displayH, displayScale]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // Pan via pointer drag.
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imgEl) return;
    dragState.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragState.current.active) return;
    const dxDisplay = e.clientX - dragState.current.lastX;
    const dyDisplay = e.clientY - dragState.current.lastY;
    dragState.current.lastX = e.clientX;
    dragState.current.lastY = e.clientY;
    setOffset((o) => ({
      x: o.x + dxDisplay / displayScale,
      y: o.y + dyDisplay / displayScale,
    }));
  };
  const onPointerUp = () => {
    dragState.current.active = false;
  };

  const renderSingle = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (ctx) drawPhoto(ctx);
    return canvas;
  };

  const downloadPhoto = (type: 'image/png' | 'image/jpeg') => {
    if (!imgEl) return;
    renderSingle().toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `id-photo-${standard.id}.${type === 'image/png' ? 'png' : 'jpg'}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      type,
      0.95
    );
  };

  const generateSheet = () => {
    if (!imgEl) return;
    const sheetW = 4 * dpi;
    const sheetH = 6 * dpi;
    const gap = Math.round(dpi * 0.08);
    const cols = Math.max(1, Math.floor((sheetW + gap) / (targetW + gap)));
    const rows = Math.max(1, Math.floor((sheetH + gap) / (targetH + gap)));
    const canvas = document.createElement('canvas');
    canvas.width = sheetW;
    canvas.height = sheetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetW, sheetH);

    const single = renderSingle();
    const gridW = cols * targetW + (cols - 1) * gap;
    const gridH = rows * targetH + (rows - 1) * gap;
    const startX = (sheetW - gridW) / 2;
    const startY = (sheetH - gridH) / 2;
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (targetW + gap);
        const y = startY + r * (targetH + gap);
        ctx.drawImage(single, x, y);
        ctx.strokeRect(x, y, targetW, targetH);
      }
    }
    if (sheetUrl) URL.revokeObjectURL(sheetUrl);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setSheetUrl(URL.createObjectURL(blob));
      },
      'image/jpeg',
      0.92
    );
  };

  const downloadSheet = () => {
    if (!sheetUrl) return;
    const a = document.createElement('a');
    a.href = sheetUrl;
    a.download = `id-photo-print-sheet-4x6.jpg`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setImgEl(null);
    setSheetUrl(null);
    setError(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <input
          ref={fileInputRef}
          type="file"
          id="passport-upload"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        {!file ? (
          <div onDrop={handleDrop} onDragOver={handleDragOver}>
            <label
              htmlFor="passport-upload"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
            >
              <Upload size={48} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Upload a front-facing portrait</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <button onClick={reset} className="p-1 hover:bg-background rounded transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        )}
        {error && <div className="mt-3 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
      </div>

      {file && imgEl && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Standard</label>
              <select
                value={standard.id}
                onChange={(e) => {
                  setStandard(STANDARDS.find((s) => s.id === e.target.value) || STANDARDS[0]);
                  setSheetUrl(null);
                }}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {STANDARDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">DPI</label>
                <select
                  value={dpi}
                  onChange={(e) => {
                    setDpi(parseInt(e.target.value));
                    setSheetUrl(null);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {[300, 600].map((d) => (
                    <option key={d} value={d}>
                      {d} DPI
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Output</label>
                <div className="px-3 py-2 text-sm text-muted-foreground border border-border rounded-md bg-muted">
                  {targetW} × {targetH} px
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Background</label>
              <div className="flex gap-2">
                {(['white', 'grey', 'blue'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setBg(c)}
                    className={
                      'flex-1 px-3 py-2 text-sm rounded-md capitalize transition-colors ' +
                      (bg === c
                        ? 'bg-accent text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Zoom: {zoom.toFixed(2)}×</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
              <p className="text-xs text-muted-foreground">Drag inside the preview to reposition the face.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => downloadPhoto('image/jpeg')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors font-medium"
              >
                <Download size={18} /> Download Photo
              </button>
              <button
                onClick={generateSheet}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium"
              >
                <Grid2x2 size={18} /> 4×6 Print Sheet
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-3">
            <h3 className="font-semibold text-foreground">Crop &amp; position</h3>
            <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[300px]">
              <canvas
                ref={previewRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="rounded shadow-sm cursor-move touch-none border border-border"
                style={{ width: displayW, height: displayH }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Keep the top of your head near the upper line and your chin near the lower line, eyes inside the oval.
            </p>
          </div>
        </div>
      )}

      {/* Print sheet */}
      {sheetUrl && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">4×6 inch print sheet</h3>
            <button
              onClick={downloadSheet}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              <Download size={16} /> Download Sheet
            </button>
          </div>
          <div className="flex items-center justify-center bg-muted rounded-lg p-4">
            <img src={sheetUrl} alt="4x6 print sheet" className="max-h-[480px] w-auto rounded shadow-sm" />
          </div>
          <p className="text-xs text-muted-foreground">
            Print this 4×6 inch sheet at any photo lab (borderless, actual size) and cut along the guides.
          </p>
        </div>
      )}
    </div>
  );
}
