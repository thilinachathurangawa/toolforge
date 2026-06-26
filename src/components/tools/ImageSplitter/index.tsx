'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Package, Scissors } from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

type OutFormat = 'image/jpeg' | 'image/png';

const PRESETS: { label: string; cols: number; rows: number }[] = [
  { label: '3 × 1 carousel', cols: 3, rows: 1 },
  { label: '1 × 3', cols: 1, rows: 3 },
  { label: '3 × 3 grid', cols: 3, rows: 3 },
  { label: '2 × 2', cols: 2, rows: 2 },
];

export function ImageSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [format, setFormat] = useState<OutFormat>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }
    setError(null);
    setFile(f);
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

  // Preview with grid overlay.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !imgEl) return;
    const maxW = 480;
    const scale = Math.min(1, maxW / imgEl.naturalWidth);
    const w = Math.round(imgEl.naturalWidth * scale);
    const h = Math.round(imgEl.naturalHeight * scale);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgEl, 0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 2;
    for (let c = 1; c < cols; c++) {
      const x = (w / cols) * c;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      const y = (h / rows) * r;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }, [imgEl, cols, rows]);

  const split = async () => {
    if (!imgEl) {
      setError('Please upload an image first.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const iw = imgEl.naturalWidth;
      const ih = imgEl.naturalHeight;
      const pieceW = Math.floor(iw / cols);
      const pieceH = Math.floor(ih / rows);
      const ext = format === 'image/png' ? 'png' : 'jpg';
      const zip = new JSZip();
      let index = 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = pieceW;
          canvas.height = pieceH;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          ctx.drawImage(imgEl, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
          const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob((b) => resolve(b), format, 0.92)
          );
          if (blob) zip.file(`part_${index}.${ext}`, blob);
          index++;
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(file?.name || 'image').replace(/\.[^/.]+$/, '')}_${cols}x${rows}_pieces.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while slicing the image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setImgEl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pieceW = imgEl ? Math.floor(imgEl.naturalWidth / cols) : 0;
  const pieceH = imgEl ? Math.floor(imgEl.naturalHeight / rows) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <input
          ref={fileInputRef}
          type="file"
          id="splitter-upload"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        {!file ? (
          <div onDrop={handleDrop} onDragOver={handleDragOver}>
            <label
              htmlFor="splitter-upload"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
            >
              <Upload size={48} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop an image here or click to upload</p>
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
              <label className="text-sm font-medium text-foreground">Presets</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setCols(p.cols);
                      setRows(p.rows);
                    }}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md transition-colors',
                      cols === p.cols && rows === p.rows
                        ? 'bg-accent text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Output format</label>
              <div className="flex gap-2">
                {(['image/jpeg', 'image/png'] as OutFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm rounded-md transition-colors',
                      format === fmt
                        ? 'bg-accent text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {fmt === 'image/jpeg' ? 'JPG' : 'PNG'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
              {cols * rows} pieces · each ≈ {pieceW} × {pieceH}px · named{' '}
              <code className="text-xs">part_1</code>…<code className="text-xs">part_{cols * rows}</code> (left→right,
              top→bottom)
            </div>

            <button
              onClick={split}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Scissors size={18} />
              {isProcessing ? 'Slicing…' : 'Download pieces (.zip)'}
            </button>
          </div>

          {/* Preview */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-3">
            <h3 className="font-semibold text-foreground">Preview</h3>
            <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[280px]">
              <canvas ref={previewRef} className="max-w-full h-auto rounded shadow-sm" />
            </div>
            <p className="text-xs text-muted-foreground">
              Post the numbered pieces in order (part_1 first) for a seamless feed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
