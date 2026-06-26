'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, X, Image as ImageIcon, Package, Type } from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

interface WatermarkResult {
  file: File;
  watermarkedBlob: Blob;
  previewUrl: string;
}

type WatermarkType = 'text' | 'image';
type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

const POSITION_LABELS: Record<Position, string> = {
  'top-left': 'Top Left',
  'top-center': 'Top Center',
  'top-right': 'Top Right',
  'center-left': 'Center Left',
  center: 'Center',
  'center-right': 'Center Right',
  'bottom-left': 'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
};

const MAX_PREVIEW = 480; // longest side of the live-preview canvas

export function ImageWatermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  const [text, setText] = useState('© Your Name');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkScale, setWatermarkScale] = useState(0.2);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [offsetX, setOffsetX] = useState(20);
  const [offsetY, setOffsetY] = useState(20);
  const [opacity, setOpacity] = useState(0.6);
  const [rotation, setRotation] = useState(0);
  const [results, setResults] = useState<WatermarkResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loaded image elements kept in refs — never trigger re-renders.
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const wmImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkImageInputRef = useRef<HTMLInputElement>(null);

  // ── helpers ────────────────────────────────────────────────────────

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getPositionCoords = (
    cw: number,
    ch: number,
    ww: number,
    wh: number,
    pos: Position,
    ox: number,
    oy: number
  ) => {
    switch (pos) {
      case 'top-left':      return { x: ox,                        y: oy };
      case 'top-center':    return { x: (cw - ww) / 2 + ox,        y: oy };
      case 'top-right':     return { x: cw - ww - ox,               y: oy };
      case 'center-left':   return { x: ox,                        y: (ch - wh) / 2 + oy };
      case 'center':        return { x: (cw - ww) / 2 + ox,        y: (ch - wh) / 2 + oy };
      case 'center-right':  return { x: cw - ww - ox,               y: (ch - wh) / 2 + oy };
      case 'bottom-left':   return { x: ox,                        y: ch - wh - oy };
      case 'bottom-center': return { x: (cw - ww) / 2 + ox,        y: ch - wh - oy };
      case 'bottom-right':  return { x: cw - ww - ox,               y: ch - wh - oy };
      default:              return { x: ox, y: oy };
    }
  };

  // ── core draw function — works on any canvas at any scale ──────────

  const drawWatermarked = useCallback(
    (
      canvas: HTMLCanvasElement,
      baseImg: HTMLImageElement,
      scaleFactor: number // 1 for full-res export, <1 for preview
    ) => {
      const W = Math.round(baseImg.naturalWidth  * scaleFactor);
      const H = Math.round(baseImg.naturalHeight * scaleFactor);
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(baseImg, 0, 0, W, H);
      ctx.globalAlpha = opacity;

      if (watermarkType === 'text') {
        ctx.save();
        const scaledFont = Math.round(fontSize * scaleFactor);
        ctx.font = `${fontStyle} ${fontWeight} ${scaledFont}px ${fontFamily}`;
        ctx.fillStyle = fontColor;
        ctx.textBaseline = 'top';

        const tw = ctx.measureText(text).width;
        const th = scaledFont;

        const cx = W / 2;
        const cy = H / 2;
        if (rotation !== 0) {
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }

        const { x, y } = getPositionCoords(
          W, H, tw, th,
          position,
          Math.round(offsetX * scaleFactor),
          Math.round(offsetY * scaleFactor)
        );
        ctx.fillText(text, x, y);
        ctx.restore();
      } else if (watermarkType === 'image' && wmImgRef.current) {
        const wm = wmImgRef.current;
        const wmW = Math.round(W * watermarkScale);
        const wmH = Math.round((wm.naturalHeight * wmW) / wm.naturalWidth);

        ctx.save();
        if (rotation !== 0) {
          const cx = W / 2;
          const cy = H / 2;
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }
        const { x, y } = getPositionCoords(
          W, H, wmW, wmH,
          position,
          Math.round(offsetX * scaleFactor),
          Math.round(offsetY * scaleFactor)
        );
        ctx.drawImage(wm, x, y, wmW, wmH);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      watermarkType, text, fontFamily, fontSize, fontColor, fontWeight, fontStyle,
      watermarkScale, position, offsetX, offsetY, opacity, rotation,
    ]
  );

  // ── live preview: redraw whenever drawWatermarked changes ──────────

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const base   = baseImgRef.current;
    if (!canvas || !base) return;

    const iw = base.naturalWidth;
    const ih = base.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(iw, ih));
    drawWatermarked(canvas, base, scale);
  }, [drawWatermarked]);

  // ── file loading ───────────────────────────────────────────────────

  const loadBaseImage = (file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      baseImgRef.current = img;
      // Trigger preview redraw by calling drawWatermarked directly
      // (state hasn't changed so the effect won't fire automatically).
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const scale = Math.min(1, MAX_PREVIEW / Math.max(img.naturalWidth, img.naturalHeight));
        drawWatermarked(canvas, img, scale);
      }
    };
    img.src = url;
  };

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;
    const valid = Array.from(uploadedFiles).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setError('Please upload valid image files (JPG, PNG, WebP)');
      return;
    }
    setError(null);
    setResults([]);
    setFiles((prev) => {
      const next = [...prev, ...valid];
      // Load the first image (or keep existing if already loaded).
      if (!baseImgRef.current) loadBaseImage(next[0]);
      return next;
    });
  };

  const handleWatermarkImageUpload = (f: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    setWatermarkImage(f);
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      URL.revokeObjectURL(url);
      wmImgRef.current = img;
      // Force preview redraw now that the wm image is available.
      const canvas = previewCanvasRef.current;
      const base   = baseImgRef.current;
      if (canvas && base) {
        const scale = Math.min(1, MAX_PREVIEW / Math.max(base.naturalWidth, base.naturalHeight));
        drawWatermarked(canvas, base, scale);
      }
    };
    img.src = url;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // If the preview image was this file, reload from next[0].
      if (index === 0) {
        baseImgRef.current = null;
        if (next.length > 0) loadBaseImage(next[0]);
        else {
          const canvas = previewCanvasRef.current;
          if (canvas) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0, 0, canvas.width, canvas.height); }
        }
      }
      return next;
    });
    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  // ── watermark export ───────────────────────────────────────────────

  const addWatermarkToFile = (file: File): Promise<WatermarkResult> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        drawWatermarked(canvas, img, 1);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ file, watermarkedBlob: blob, previewUrl: URL.createObjectURL(blob) });
            else reject(new Error('Failed to create blob'));
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          0.92
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
      img.src = url;
    });

  const addWatermarks = async () => {
    if (files.length === 0) { setError('Please upload at least one image'); return; }
    if (watermarkType === 'image' && !wmImgRef.current) { setError('Please upload a watermark image'); return; }
    setIsProcessing(true);
    setError(null);
    try {
      const out: WatermarkResult[] = [];
      for (const file of files) {
        try { out.push(await addWatermarkToFile(file)); }
        catch (err) { console.error('Error processing', file.name, err); }
      }
      if (out.length === 0) setError('Failed to process any images. Please try different images or settings.');
      else setResults(out);
    } catch (err) {
      setError('An error occurred during processing. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadIndividual = (result: WatermarkResult) => {
    const a = document.createElement('a');
    a.href = result.previewUrl;
    a.download = `${result.file.name.replace(/\.[^/.]+$/, '')}_watermarked${result.file.name.substring(result.file.name.lastIndexOf('.'))}`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    results.forEach((r) => {
      zip.file(`${r.file.name.replace(/\.[^/.]+$/, '')}_watermarked${r.file.name.substring(r.file.name.lastIndexOf('.'))}`, r.watermarkedBlob);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watermarked_images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFiles([]);
    setResults([]);
    setError(null);
    baseImgRef.current = null;
    wmImgRef.current   = null;
    setWatermarkImage(null);
    const canvas = previewCanvasRef.current;
    if (canvas) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0, 0, canvas.width, canvas.height); }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (watermarkImageInputRef.current) watermarkImageInputRef.current.value = '';
  };

  // ── render ─────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input ref={fileInputRef} type="file" id="wm-upload" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)} />
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          <label htmlFor="wm-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors">
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported • Multiple files allowed</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{files.length} file(s) selected</span>
              <button onClick={resetAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ImageIcon size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({formatFileSize(file.size)})</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="p-1 hover:bg-background rounded transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
      </div>

      {/* Settings + Live Preview (side by side when image loaded) */}
      {files.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Settings column ── */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-4">
            <h3 className="font-semibold text-foreground">Watermark Settings</h3>

            {/* Type toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <div className="flex gap-2">
                <button onClick={() => setWatermarkType('text')}
                  className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors',
                    watermarkType === 'text' ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
                  <Type size={16} /> Text
                </button>
                <button onClick={() => setWatermarkType('image')}
                  className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors',
                    watermarkType === 'image' ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
                  <ImageIcon size={16} /> Image
                </button>
              </div>
            </div>

            {/* Text options */}
            {watermarkType === 'text' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Text</label>
                  <input type="text" value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Font Family</label>
                  <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                    {['Arial','Helvetica','Times New Roman','Georgia','Verdana','Courier New','Impact'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Font Size: {fontSize}px</label>
                  <input type="range" min="12" max="120" step="2" value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-accent" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>12px</span><span>60px</span><span>120px</span></div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Font Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)}
                      className="w-12 h-10 border border-border rounded-md cursor-pointer" />
                    <input type="text" value={fontColor} onChange={(e) => setFontColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={fontWeight === 'bold'} onChange={(e) => setFontWeight(e.target.checked ? 'bold' : 'normal')} className="accent-accent" />
                    <span className="text-sm text-foreground">Bold</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={fontStyle === 'italic'} onChange={(e) => setFontStyle(e.target.checked ? 'italic' : 'normal')} className="accent-accent" />
                    <span className="text-sm text-foreground">Italic</span>
                  </label>
                </div>
              </>
            )}

            {/* Image watermark options */}
            {watermarkType === 'image' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Watermark Image (logo)</label>
                  <input ref={watermarkImageInputRef} type="file" id="wm-img-upload" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => handleWatermarkImageUpload(e.target.files?.[0] || null)} />
                  <label htmlFor="wm-img-upload"
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors">
                    {watermarkImage ? (
                      <div className="text-center">
                        <ImageIcon size={32} className="text-muted-foreground mx-auto mb-1" />
                        <p className="text-sm font-medium">{watermarkImage.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload size={32} className="text-muted-foreground mx-auto mb-1" />
                        <p className="text-sm text-muted-foreground">Click to upload watermark image</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Scale: {Math.round(watermarkScale * 100)}% of image width</label>
                  <input type="range" min="0.05" max="0.5" step="0.05" value={watermarkScale}
                    onChange={(e) => setWatermarkScale(parseFloat(e.target.value))} className="w-full accent-accent" />
                  <div className="flex justify-between text-xs text-muted-foreground"><span>5%</span><span>25%</span><span>50%</span></div>
                </div>
              </>
            )}

            {/* Position grid */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Position</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.entries(POSITION_LABELS) as [Position, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => setPosition(key)}
                    className={cn('px-2 py-2 text-xs rounded-md transition-colors',
                      position === key ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Offset */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Offset X (px)</label>
                <input type="number" value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Offset Y (px)</label>
                <input type="number" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Opacity: {Math.round(opacity * 100)}%</label>
              <input type="range" min="0.1" max="1" step="0.05" value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-accent" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>10%</span><span>50%</span><span>100%</span></div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rotation: {rotation}°</label>
              <input type="range" min="0" max="360" step="15" value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-accent" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>0°</span><span>180°</span><span>360°</span></div>
            </div>

            <button onClick={addWatermarks} disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
              <ImageIcon size={18} />
              {isProcessing ? 'Processing…' : `Apply to ${files.length} image${files.length > 1 ? 's' : ''}`}
            </button>
          </div>

          {/* ── Live preview column ── */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Live Preview</h3>
              <span className="text-xs text-muted-foreground">Showing first image</span>
            </div>
            <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[300px]">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full h-auto rounded shadow-sm"
                style={{ maxHeight: MAX_PREVIEW }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The preview reflects your current settings in real time. Click &ldquo;Apply&rdquo; to process all {files.length} image{files.length > 1 ? 's' : ''} at full resolution.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Results ({results.length})</h3>
            {results.length > 1 && (
              <button onClick={downloadAllAsZip}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                <Package size={16} /> Download All as ZIP
              </button>
            )}
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={result.previewUrl} alt={result.file.name}
                      className="w-16 h-16 object-cover rounded shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{result.file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatFileSize(result.file.size)} → {formatFileSize(result.watermarkedBlob.size)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => downloadIndividual(result)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors shrink-0">
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
