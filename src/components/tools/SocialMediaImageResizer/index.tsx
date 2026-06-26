'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Preset {
  label: string;
  width: number;
  height: number;
}

const PLATFORMS: Record<string, Preset[]> = {
  Instagram: [
    { label: 'Square Post', width: 1080, height: 1080 },
    { label: 'Portrait Post', width: 1080, height: 1350 },
    { label: 'Story / Reel', width: 1080, height: 1920 },
  ],
  Facebook: [
    { label: 'Cover Photo', width: 820, height: 312 },
    { label: 'Feed Post', width: 1200, height: 630 },
  ],
  'Twitter/X': [
    { label: 'Header', width: 1500, height: 500 },
    { label: 'Post', width: 1600, height: 900 },
  ],
  LinkedIn: [
    { label: 'Profile Banner', width: 1584, height: 396 },
    { label: 'Feed Post', width: 1200, height: 627 },
  ],
};

type FitMode = 'cover' | 'contain';

export function SocialMediaImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [platform, setPlatform] = useState<string>('Instagram');
  const [preset, setPreset] = useState<Preset>(PLATFORMS.Instagram[0]);
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [error, setError] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
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

  // Draw the composed image at the preset's exact size into a canvas.
  const renderToCanvas = (canvas: HTMLCanvasElement) => {
    if (!imgEl) return;
    canvas.width = preset.width;
    canvas.height = preset.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const iw = imgEl.naturalWidth;
    const ih = imgEl.naturalHeight;

    if (fitMode === 'contain') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, preset.width, preset.height);
      const scale = Math.min(preset.width / iw, preset.height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(imgEl, (preset.width - dw) / 2, (preset.height - dh) / 2, dw, dh);
    } else {
      // cover
      const scale = Math.max(preset.width / iw, preset.height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(imgEl, (preset.width - dw) / 2, (preset.height - dh) / 2, dw, dh);
    }
  };

  useEffect(() => {
    if (previewCanvasRef.current && imgEl) {
      renderToCanvas(previewCanvasRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgEl, preset, fitMode, bgColor]);

  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    setPreset(PLATFORMS[p][0]);
  };

  const download = (type: 'image/png' | 'image/jpeg') => {
    if (!imgEl) return;
    const canvas = document.createElement('canvas');
    renderToCanvas(canvas);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ext = type === 'image/png' ? 'png' : 'jpg';
        const base = (file?.name || 'image').replace(/\.[^/.]+$/, '');
        a.href = url;
        a.download = `${base}_${preset.width}x${preset.height}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      type,
      0.92
    );
  };

  const reset = () => {
    setFile(null);
    setImgEl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <input
          ref={fileInputRef}
          type="file"
          id="smr-upload"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        {!file ? (
          <div onDrop={handleDrop} onDragOver={handleDragOver}>
            <label
              htmlFor="smr-upload"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
            >
              <Upload size={48} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop an image here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <ImageIcon size={16} className="text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{file.name}</span>
            </div>
            <button onClick={reset} className="p-1 hover:bg-background rounded transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        )}
        {error && (
          <div className="mt-3 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>
        )}
      </div>

      {file && imgEl && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Platform</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PLATFORMS).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePlatformChange(p)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md transition-colors',
                      platform === p
                        ? 'bg-accent text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Size</label>
              <select
                value={preset.label}
                onChange={(e) =>
                  setPreset(PLATFORMS[platform].find((x) => x.label === e.target.value) || PLATFORMS[platform][0])
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {PLATFORMS[platform].map((x) => (
                  <option key={x.label} value={x.label}>
                    {x.label} ({x.width}×{x.height})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fit</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFitMode('cover')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm rounded-md transition-colors',
                    fitMode === 'cover'
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  Cover (crop to fill)
                </button>
                <button
                  onClick={() => setFitMode('contain')}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm rounded-md transition-colors',
                    fitMode === 'contain'
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  Contain (fit + pad)
                </button>
              </div>
            </div>

            {fitMode === 'contain' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Background color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-10 border border-border rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => download('image/png')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors font-medium"
              >
                <Download size={18} /> Download PNG
              </button>
              <button
                onClick={() => download('image/jpeg')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium"
              >
                <Download size={18} /> Download JPG
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Preview</h3>
              <span className="text-sm text-muted-foreground">
                {preset.width} × {preset.height}
              </span>
            </div>
            <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[280px]">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-[420px] h-auto w-auto rounded shadow-sm"
                style={{ aspectRatio: `${preset.width} / ${preset.height}` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {fitMode === 'cover'
                ? 'Cover scales the image to fill the frame and crops the overflow.'
                : 'Contain fits the whole image and pads empty space with your background color.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
