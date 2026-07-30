'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  Download,
  Info,
  Palette,
  Pipette,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type Algorithm,
  type ColorFormat,
  type ExportFormat,
  type RGB,
  type Sensitivity,
  type SortMode,
  type Swatch,
  SENSITIVITY_LABELS,
  exportPalette,
  extractPalette,
  formatBytes,
  formatColor,
  nearestColorName,
  pickedSwatch,
  rgbToHex,
  sortSwatches,
  wcagLabel,
} from './palette';

/* ----------------------------- constants ----------------------------- */

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const WARN_PIXELS = 8_000_000;
const ANALYSIS_MAX_EDGE = 1000;
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp';
const PREFS_KEY = 'toolforge:color-palette:prefs';

const EXPORT_LABELS: Record<ExportFormat, string> = {
  css: 'CSS variables',
  scss: 'SCSS variables',
  tailwind: 'Tailwind colors',
  json: 'JSON',
  list: 'HEX list',
  svg: 'SVG',
};

interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  sampledWidth: number;
  sampledHeight: number;
}

interface Prefs {
  algorithm: Algorithm;
  colorCount: number;
  sensitivity: Sensitivity;
  ignoreExtremes: boolean;
  sort: SortMode;
  format: ColorFormat;
}

const DEFAULT_PREFS: Prefs = {
  algorithm: 'dominant',
  colorCount: 6,
  sensitivity: 'balanced',
  ignoreExtremes: false,
  sort: 'coverage',
  format: 'hex',
};

/* --------------------------- sample images --------------------------- */

type SampleKind = 'sunset' | 'logo' | 'artwork';

/** Samples are drawn on the fly, so no binary assets ship with the tool. */
function makeSample(kind: SampleKind): string {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (kind === 'sunset') {
    const sky = ctx.createLinearGradient(0, 0, 0, 320);
    sky.addColorStop(0, '#1B2A4A');
    sky.addColorStop(0.45, '#C2734A');
    sky.addColorStop(0.7, '#F2B25C');
    sky.addColorStop(1, '#2E1A12');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 480, 320);
    ctx.fillStyle = '#FFE9A8';
    ctx.beginPath();
    ctx.arc(340, 150, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#14100E';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(140, 200);
    ctx.lineTo(260, 280);
    ctx.lineTo(360, 190);
    ctx.lineTo(480, 300);
    ctx.lineTo(480, 320);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'logo') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 480, 320);
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(150, 90, 90, 140);
    ctx.fillStyle = '#F97316';
    ctx.fillRect(240, 90, 90, 140);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(150, 236, 180, 16);
  } else {
    const blocks = ['#0E7C7B', '#F4A259', '#BC4B51', '#5B8E7D', '#F4E285', '#3D315B'];
    blocks.forEach((color, index) => {
      ctx.fillStyle = color;
      const column = index % 3;
      const row = Math.floor(index / 3);
      ctx.fillRect(column * 160, row * 160, 160, 160);
    });
  }

  return canvas.toDataURL('image/png');
}

/* ----------------------------- component ----------------------------- */

export function ColorPalette() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [status, setStatus] = useState<{ level: 'warn' | 'error'; message: string } | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [picked, setPicked] = useState<Swatch[]>([]);
  const [removedHexes, setRemovedHexes] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  const [eyedropperOn, setEyedropperOn] = useState(false);
  const [hover, setHover] = useState<{ rgb: RGB; x: number; y: number; ratio: { x: number; y: number } } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');
  const [announcement, setAnnouncement] = useState('');

  const imageRef = useRef<HTMLImageElement>(null);
  const analysisRef = useRef<{ data: Uint8ClampedArray; width: number; height: number } | null>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { algorithm, colorCount, sensitivity, ignoreExtremes, sort, format } = prefs;

  const setPref = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((previous) => ({ ...previous, [key]: value }));
  }, []);

  /* ------------------------- persisted preferences ------------------------- */

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PREFS_KEY);
      if (stored) setPrefs((previous) => ({ ...previous, ...(JSON.parse(stored) as Prefs) }));
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs, hydrated]);

  /* ------------------------------- loading ------------------------------- */

  const loadDataUrl = useCallback((dataUrl: string, info: Omit<ImageInfo, 'width' | 'height' | 'sampledWidth' | 'sampledHeight'>) => {
    analysisRef.current = null;
    setSwatches([]);
    setPicked([]);
    setRemovedHexes([]);
    setNotes([]);
    setHover(null);
    setStatus(null);
    setImageInfo({ ...info, width: 0, height: 0, sampledWidth: 0, sampledHeight: 0 });
    setImageUrl(dataUrl);
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setStatus({ level: 'error', message: `${file.name || 'That file'} is not an image.` });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setStatus({
          level: 'error',
          message: `${file.name} is ${formatBytes(file.size)}, over the ${formatBytes(MAX_FILE_SIZE)} limit.`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () =>
        loadDataUrl(String(reader.result ?? ''), {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      reader.onerror = () => setStatus({ level: 'error', message: `Could not read ${file.name}.` });
      reader.readAsDataURL(file);
    },
    [loadDataUrl]
  );

  const loadSample = useCallback(
    (kind: SampleKind) => {
      const dataUrl = makeSample(kind);
      if (!dataUrl) return;
      loadDataUrl(dataUrl, {
        name: `${kind} sample.png`,
        size: Math.round((dataUrl.length * 3) / 4),
        type: 'image/png',
      });
    },
    [loadDataUrl]
  );

  // Paste an image straight from the clipboard.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? [])[0];
      if (file) {
        event.preventDefault();
        handleFile(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFile]);

  /* ------------------------------ analysing ------------------------------ */

  const runExtraction = useCallback(() => {
    const buffer = analysisRef.current;
    if (!buffer) return;

    const result = extractPalette(buffer, { algorithm, colorCount, sensitivity, ignoreExtremes });
    setSwatches(result.swatches);

    const messages: string[] = [];
    if (result.transparentShare > 0.05) {
      messages.push(
        `${Math.round(result.transparentShare * 100)}% of the pixels are transparent and were skipped.`
      );
    }
    if (ignoreExtremes && result.extremeShare > 0.02) {
      messages.push(
        `${Math.round(result.extremeShare * 100)}% were skipped as near-white or near-black.`
      );
    }
    if (result.swatches.length < colorCount && result.swatches.length > 0) {
      messages.push(
        `This image only supports ${result.swatches.length} distinct colour${
          result.swatches.length === 1 ? '' : 's'
        } at this sensitivity.`
      );
    }
    setNotes(messages);

    if (!result.swatches.length) {
      setStatus({
        level: 'warn',
        message:
          result.transparentShare > 0.9
            ? 'Every sampled pixel was transparent, so there is nothing to extract.'
            : 'No colours left to extract — try turning off "ignore near-white and near-black".',
      });
    } else {
      setStatus(null);
      setAnnouncement(`Extracted ${result.swatches.length} colours.`);
    }
  }, [algorithm, colorCount, sensitivity, ignoreExtremes]);

  // Decode first, then draw a downscaled copy and read its pixels once per image.
  const handleImageLoad = useCallback(async () => {
    const image = imageRef.current;
    if (!image) return;

    setIsAnalysing(true);
    try {
      if (typeof image.decode === 'function') {
        try {
          await image.decode();
        } catch {
          /* decode() rejects on some cached images even when they are fine */
        }
      }

      const { naturalWidth, naturalHeight } = image;
      if (!naturalWidth || !naturalHeight) {
        setStatus({ level: 'error', message: 'That image could not be decoded — it may be corrupt.' });
        return;
      }

      const scale = Math.min(1, ANALYSIS_MAX_EDGE / Math.max(naturalWidth, naturalHeight));
      const width = Math.max(1, Math.round(naturalWidth * scale));
      const height = Math.max(1, Math.round(naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setStatus({ level: 'error', message: 'This browser would not provide a canvas to analyse the image.' });
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      analysisRef.current = { data: ctx.getImageData(0, 0, width, height).data, width, height };

      setImageInfo((previous) =>
        previous
          ? { ...previous, width: naturalWidth, height: naturalHeight, sampledWidth: width, sampledHeight: height }
          : previous
      );

      if (naturalWidth * naturalHeight > WARN_PIXELS) {
        setStatus({
          level: 'warn',
          message: `That is a ${(naturalWidth * naturalHeight / 1_000_000).toFixed(1)} MP image — it was scaled to ${width}×${height} for analysis, which is plenty for a palette.`,
        });
      }

      runExtraction();
    } finally {
      setIsAnalysing(false);
    }
  }, [runExtraction]);

  // Re-extract when the controls change, without re-decoding the image.
  useEffect(() => {
    if (!analysisRef.current) return;
    runExtraction();
  }, [runExtraction]);

  /* ------------------------------ eyedropper ------------------------------ */

  const readPixel = useCallback((clientX: number, clientY: number) => {
    const image = imageRef.current;
    if (!image || !image.naturalWidth) return null;

    const rect = image.getBoundingClientRect();
    const ratioX = (clientX - rect.left) / rect.width;
    const ratioY = (clientY - rect.top) / rect.height;
    if (ratioX < 0 || ratioX > 1 || ratioY < 0 || ratioY > 1) return null;

    const sourceX = Math.min(image.naturalWidth - 1, Math.floor(ratioX * image.naturalWidth));
    const sourceY = Math.min(image.naturalHeight - 1, Math.floor(ratioY * image.naturalHeight));

    // One pixel, straight from the full-resolution image — no interpolation.
    if (!pixelCanvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      pixelCanvasRef.current = canvas;
    }
    const ctx = pixelCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 1, 1);
    ctx.drawImage(image, sourceX, sourceY, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    return {
      rgb: { r, g, b },
      x: clientX - rect.left,
      y: clientY - rect.top,
      ratio: { x: ratioX, y: ratioY },
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLImageElement>) => {
      if (!eyedropperOn) return;
      setHover(readPixel(event.clientX, event.clientY));
    },
    [eyedropperOn, readPixel]
  );

  const addPicked = useCallback((rgb: RGB) => {
    const swatch = pickedSwatch(rgb);
    setPicked((previous) =>
      previous.some((entry) => entry.hex === swatch.hex) ? previous : [...previous, swatch]
    );
    setAnnouncement(`Added ${swatch.hex} to the palette.`);
  }, []);

  /* ------------------------------- palette ------------------------------- */

  const visible = useMemo(() => {
    const extracted = swatches.filter((swatch) => !removedHexes.includes(swatch.hex));
    const pickedVisible = picked.filter((swatch) => !removedHexes.includes(swatch.hex));
    return [...sortSwatches(extracted, sort), ...pickedVisible];
  }, [swatches, picked, removedHexes, sort]);

  const coveredShare = useMemo(
    () => visible.reduce((sum, swatch) => sum + swatch.coverage, 0),
    [visible]
  );

  /* ------------------------------- actions ------------------------------- */

  const copyValue = useCallback((value: string, id: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedId(id);
        setAnnouncement(`Copied ${value}`);
        setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
      })
      .catch(() => setAnnouncement('Copying failed — your browser blocked clipboard access.'));
  }, []);

  const download = useCallback((content: string | Blob, filename: string, type = 'text/plain') => {
    const blob = typeof content === 'string' ? new Blob([content], { type }) : content;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, []);

  const downloadPng = useCallback(
    (scale: number) => {
      if (!visible.length) return;

      const swatchWidth = 140;
      const swatchHeight = 160;
      const labelHeight = 62;
      const canvas = document.createElement('canvas');
      canvas.width = swatchWidth * visible.length * scale;
      canvas.height = (swatchHeight + labelHeight) * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      visible.forEach((swatch, index) => {
        const x = index * swatchWidth;
        ctx.fillStyle = swatch.hex;
        ctx.fillRect(x, 0, swatchWidth, swatchHeight);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(swatch.hex, x + swatchWidth / 2, swatchHeight + 24);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#555555';
        ctx.fillText(swatch.name, x + swatchWidth / 2, swatchHeight + 42);
        ctx.fillText(
          swatch.origin === 'picked' ? 'picked' : `${(swatch.coverage * 100).toFixed(1)}%`,
          x + swatchWidth / 2,
          swatchHeight + 58
        );
      });

      canvas.toBlob((blob) => {
        if (blob) download(blob, `color-palette${scale > 1 ? '@2x' : ''}.png`, 'image/png');
      }, 'image/png');
    },
    [visible, download]
  );

  const clearImage = useCallback(() => {
    analysisRef.current = null;
    setImageUrl(null);
    setImageInfo(null);
    setSwatches([]);
    setPicked([]);
    setRemovedHexes([]);
    setNotes([]);
    setHover(null);
    setStatus(null);
  }, []);

  /* -------------------------------- render -------------------------------- */

  const hoverHex = hover ? rgbToHex(hover.rgb) : null;

  return (
    <div className="w-full space-y-6">
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          type="file"
          id="color-palette-upload"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = '';
          }}
        />
        <label
          htmlFor="color-palette-upload"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={cn(
            'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-accent/5'
          )}
        >
          <Upload size={44} className={cn('mb-2', isDragging ? 'text-accent' : 'text-muted-foreground')} />
          <span className="text-sm font-medium">Drop an image, click to browse, or paste from your clipboard</span>
          <span className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP, GIF, AVIF, BMP · up to {formatBytes(MAX_FILE_SIZE)}
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Try a sample:</span>
          {(['sunset', 'logo', 'artwork'] as SampleKind[]).map((kind) => (
            <button
              key={kind}
              onClick={() => loadSample(kind)}
              className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 capitalize transition-colors"
            >
              {kind}
            </button>
          ))}
        </div>

        {status && (
          <div
            className={cn(
              'flex items-start gap-2 p-3 rounded-md border text-sm',
              status.level === 'error'
                ? 'bg-destructive/10 border-destructive/20 text-destructive'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/30 text-amber-700 dark:text-amber-400'
            )}
          >
            {status.level === 'error' ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* Preview + eyedropper */}
      {imageUrl && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{imageInfo?.name}</p>
              {imageInfo && imageInfo.width > 0 && (
                <p className="text-xs text-muted-foreground">
                  {imageInfo.width}×{imageInfo.height} · {formatBytes(imageInfo.size)} · analysed at{' '}
                  {imageInfo.sampledWidth}×{imageInfo.sampledHeight}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEyedropperOn((value) => !value);
                  setHover(null);
                }}
                aria-pressed={eyedropperOn}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  eyedropperOn
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <Pipette size={16} />
                Eyedropper
              </button>
              <button
                onClick={clearImage}
                aria-label="Remove image"
                className="p-2 text-muted-foreground hover:text-destructive rounded-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
            <div className="relative border rounded-lg p-4 flex justify-center bg-muted/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={imageUrl}
                alt={imageInfo?.name ? `Preview of ${imageInfo.name}` : 'Preview'}
                onLoad={handleImageLoad}
                onError={() =>
                  setStatus({ level: 'error', message: 'That image could not be displayed — it may be corrupt.' })
                }
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setHover(null)}
                onClick={() => hover && addPicked(hover.rgb)}
                className={cn(
                  'max-w-full max-h-[320px] object-contain',
                  eyedropperOn && 'cursor-crosshair'
                )}
              />
              {eyedropperOn && hover && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow ring-1 ring-black/40"
                  style={{
                    left: `calc(1rem + ${hover.x}px)`,
                    top: `calc(1rem + ${hover.y}px)`,
                    backgroundColor: hoverHex ?? undefined,
                  }}
                />
              )}
            </div>

            {eyedropperOn && (
              <div className="w-full md:w-56 space-y-2">
                <div
                  className="w-full h-28 rounded-lg border border-border bg-muted"
                  style={
                    hover
                      ? {
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: `${(imageRef.current?.naturalWidth ?? 1) * 8}px ${
                            (imageRef.current?.naturalHeight ?? 1) * 8
                          }px`,
                          backgroundPosition: `${-hover.ratio.x * (imageRef.current?.naturalWidth ?? 1) * 8 + 112}px ${
                            -hover.ratio.y * (imageRef.current?.naturalHeight ?? 1) * 8 + 56
                          }px`,
                          backgroundRepeat: 'no-repeat',
                          imageRendering: 'pixelated',
                        }
                      : undefined
                  }
                />
                {hover && hoverHex ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded border border-border shrink-0"
                        style={{ backgroundColor: hoverHex }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-mono">{hoverHex}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {nearestColorName(hover.rgb)} · rgb({hover.rgb.r}, {hover.rgb.g}, {hover.rgb.b})
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addPicked(hover.rgb)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                      >
                        <Plus size={14} />
                        Add to palette
                      </button>
                      <button
                        onClick={() => copyValue(hoverHex, 'hover')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        {copiedId === 'hover' ? <Check size={14} /> : <Copy size={14} />}
                        Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Move the pointer over the image to read any pixel, then click to pick it. Values come
                    from the full-resolution image, not the downscaled copy.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            <div className="space-y-1">
              <label htmlFor="palette-algorithm" className="block text-sm font-medium">
                Algorithm
              </label>
              <select
                id="palette-algorithm"
                value={algorithm}
                onChange={(event) => setPref('algorithm', event.target.value as Algorithm)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
              >
                <option value="dominant">Dominant — most common colours</option>
                <option value="vibrant">Vibrant — vibrant, muted, light, dark</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="palette-count" className="block text-sm font-medium">
                Colours: {colorCount}
              </label>
              <input
                id="palette-count"
                type="range"
                min={3}
                max={16}
                value={colorCount}
                onChange={(event) => setPref('colorCount', Number(event.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="palette-sensitivity" className="block text-sm font-medium">
                Sensitivity
              </label>
              <select
                id="palette-sensitivity"
                value={sensitivity}
                onChange={(event) => setPref('sensitivity', event.target.value as Sensitivity)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
              >
                {(['fast', 'balanced', 'fine'] as Sensitivity[]).map((value) => (
                  <option key={value} value={value}>
                    {SENSITIVITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-medium">Options</span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ignoreExtremes}
                  onChange={(event) => setPref('ignoreExtremes', event.target.checked)}
                  className="rounded"
                />
                Ignore near-white/black
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Palette */}
      {visible.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Palette size={18} />
                Palette
              </h3>
              <p className="text-xs text-muted-foreground">
                {visible.length} colour{visible.length === 1 ? '' : 's'}
                {coveredShare > 0 && ` · ${Math.round(coveredShare * 100)}% of sampled pixels`}
                {isAnalysing && ' · analysing…'}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label htmlFor="palette-sort" className="block text-xs font-medium text-muted-foreground">
                  Sort
                </label>
                <select
                  id="palette-sort"
                  value={sort}
                  onChange={(event) => setPref('sort', event.target.value as SortMode)}
                  className="px-2 py-1.5 text-sm bg-background border border-input rounded-md"
                >
                  <option value="coverage">coverage</option>
                  <option value="hue">hue</option>
                  <option value="lightness">lightness</option>
                  <option value="saturation">saturation</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="palette-format" className="block text-xs font-medium text-muted-foreground">
                  Copy as
                </label>
                <select
                  id="palette-format"
                  value={format}
                  onChange={(event) => setPref('format', event.target.value as ColorFormat)}
                  className="px-2 py-1.5 text-sm bg-background border border-input rounded-md"
                >
                  <option value="hex">HEX</option>
                  <option value="rgb">RGB</option>
                  <option value="hsl">HSL</option>
                </select>
              </div>
            </div>
          </div>

          {notes.length > 0 && (
            <ul className="space-y-1">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visible.map((swatch) => {
              const value = formatColor(swatch, format);
              const onWhite = wcagLabel(swatch.contrastWhite);
              const onBlack = wcagLabel(swatch.contrastBlack);
              const bestText = swatch.contrastWhite >= swatch.contrastBlack ? 'white' : 'black';

              return (
                <div key={swatch.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => copyValue(value, swatch.id)}
                    aria-label={`Copy ${value}, ${swatch.name}${
                      swatch.origin === 'picked'
                        ? ', picked from the image'
                        : `, ${(swatch.coverage * 100).toFixed(1)} percent of the image`
                    }`}
                    className="relative w-full h-24 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity bg-black/25">
                      {copiedId === swatch.id ? (
                        <Check size={20} className="text-white" />
                      ) : (
                        <Copy size={20} className="text-white" />
                      )}
                    </span>
                    {swatch.origin === 'extracted' && (
                      <span className="absolute bottom-1 right-1.5 px-1.5 py-0.5 text-[11px] font-medium rounded bg-black/45 text-white">
                        {(swatch.coverage * 100).toFixed(1)}%
                      </span>
                    )}
                    {swatch.origin === 'picked' && (
                      <span className="absolute bottom-1 right-1.5 px-1.5 py-0.5 text-[11px] font-medium rounded bg-black/45 text-white">
                        picked
                      </span>
                    )}
                    {swatch.role && (
                      <span className="absolute top-1 left-1.5 px-1.5 py-0.5 text-[11px] font-medium rounded bg-black/45 text-white capitalize">
                        {swatch.role}
                      </span>
                    )}
                  </button>

                  <div className="p-2 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-mono truncate">{value}</span>
                      <button
                        onClick={() => setRemovedHexes((previous) => [...previous, swatch.hex])}
                        aria-label={`Remove ${swatch.hex} from the palette`}
                        className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate" title={swatch.name}>
                      {swatch.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Text: {bestText} · white {swatch.contrastWhite.toFixed(1)}:1 ({onWhite}) · black{' '}
                      {swatch.contrastBlack.toFixed(1)}:1 ({onBlack})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {removedHexes.length > 0 && (
            <button
              onClick={() => setRemovedHexes([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Restore {removedHexes.length} removed colour{removedHexes.length === 1 ? '' : 's'}
            </button>
          )}

          {/* Exports */}
          <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-border">
            <div className="space-y-1">
              <label htmlFor="palette-export" className="block text-xs font-medium text-muted-foreground">
                Copy all as
              </label>
              <div className="flex gap-2">
                <select
                  id="palette-export"
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value as ExportFormat)}
                  className="px-2 py-1.5 text-sm bg-background border border-input rounded-md"
                >
                  {(Object.keys(EXPORT_LABELS) as ExportFormat[]).map((value) => (
                    <option key={value} value={value}>
                      {EXPORT_LABELS[value]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => copyValue(exportPalette(visible, exportFormat), 'export')}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {copiedId === 'export' ? <Check size={16} /> : <Copy size={16} />}
                  Copy all
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadPng(1)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                PNG
              </button>
              <button
                onClick={() => downloadPng(2)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                PNG @2×
              </button>
              <button
                onClick={() => download(exportPalette(visible, 'svg'), 'color-palette.svg', 'image/svg+xml')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                SVG
              </button>
              <button
                onClick={() =>
                  download(exportPalette(visible, 'json'), 'color-palette.json', 'application/json')
                }
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
