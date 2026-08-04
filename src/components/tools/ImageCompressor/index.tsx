'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload,
  Download,
  X,
  Image as ImageIcon,
  Package,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  RotateCcw,
  Ban,
  Check,
  Wand2,
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { Options } from 'browser-image-compression';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';
import { CompareSlider } from './CompareSlider';
import type {
  CompressSettings,
  CompressionResult,
  ItemStatus,
  OutputFormat,
  QueueItem,
} from './types';
import {
  FORMAT_LABELS,
  QUALITY_PRESETS,
  RESIZE_OPTIONS,
  buildOutputName,
  buildPresets,
  detectEncodeSupport,
  formatFileSize,
  isAnimatedGif,
  readImageDimensions,
} from './utils';

/**
 * Self-hosted copy of the library's worker build. Without this the worker calls
 * importScripts() against jsdelivr, which would make a "runs entirely in your
 * browser" tool fetch a third-party script at compress time.
 */
const WORKER_LIB_URL = '/browser-image-compression.js';

const DEFAULT_SETTINGS: CompressSettings = {
  mode: 'quality',
  quality: 0.8,
  targetSizeKB: 500,
  format: 'original',
  maxDimension: 1920,
  stripMetadata: true,
  neverLarger: true,
};

const STATUS_META: Record<ItemStatus, { label: string; className: string }> = {
  queued: { label: 'Queued', className: 'bg-muted-foreground/10 text-muted-foreground' },
  processing: { label: 'Compressing', className: 'bg-accent/10 text-accent' },
  done: { label: 'Done', className: 'bg-green-500/10 text-green-500' },
  skipped: { label: 'Already optimised', className: 'bg-amber-500/10 text-amber-500' },
  failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive' },
};

let idCounter = 0;
const nextId = () => `img-${++idCounter}`;

export function ImageCompressor() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [settings, setSettings] = useState<CompressSettings>(DEFAULT_SETTINGS);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, CompressionResult>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [supported, setSupported] = useState({ webp: false, avif: false });
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const objectUrls = useRef<Set<string>>(new Set());
  const dragDepth = useRef(0);
  // Mirrors of state, so object-URL bookkeeping never has to run inside a state
  // updater (React may call those more than once per commit).
  const itemsRef = useRef<QueueItem[]>([]);
  const resultsRef = useRef<Record<string, CompressionResult>>({});

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  /* ---------------------------------------------------------------- URLs -- */

  const makeUrl = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    objectUrls.current.add(url);
    return url;
  }, []);

  const dropUrl = useCallback((url?: string) => {
    if (url && objectUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(url);
    }
  }, []);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
      abortRef.current?.abort();
    };
  }, []);

  /* ------------------------------------------------- format capabilities -- */

  useEffect(() => {
    setSupported({
      webp: detectEncodeSupport('image/webp'),
      avif: detectEncodeSupport('image/avif'),
    });
  }, []);

  const formatOptions = useMemo(() => {
    const list: OutputFormat[] = ['original', 'image/jpeg', 'image/png'];
    if (supported.webp) list.push('image/webp');
    if (supported.avif) list.push('image/avif');
    return list;
  }, [supported]);

  const presets = useMemo(() => buildPresets(supported.webp), [supported.webp]);

  /* --------------------------------------------------------- file intake -- */

  const addFiles = useCallback(
    async (incoming: FileList | File[] | null) => {
      if (!incoming) return;
      const candidates = Array.from(incoming).filter((f) => f.type.startsWith('image/'));

      if (candidates.length === 0) {
        setError('Please add valid image files (JPG, PNG, WebP, GIF, AVIF).');
        return;
      }

      setError(null);

      let duplicates = 0;
      const accepted: QueueItem[] = [];
      const seen = new Set(itemsRef.current.map((i) => `${i.file.name}:${i.file.size}`));

      for (const file of candidates) {
        const key = `${file.name}:${file.size}`;
        if (seen.has(key)) {
          duplicates++;
          continue;
        }
        seen.add(key);
        accepted.push({ id: nextId(), file, originalUrl: makeUrl(file) });
      }

      if (accepted.length > 0) {
        itemsRef.current = [...itemsRef.current, ...accepted];
        setItems(itemsRef.current);
      }

      setNotice(
        duplicates > 0
          ? `Skipped ${duplicates} file${duplicates > 1 ? 's' : ''} already in the queue.`
          : null
      );

      // Metadata is read after the items land so the list renders immediately.
      await Promise.all(
        accepted.map(async (item) => {
          const [dims, animated] = await Promise.all([
            readImageDimensions(item.originalUrl),
            isAnimatedGif(item.file),
          ]);
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, width: dims?.width, height: dims?.height, isAnimatedGif: animated }
                : i
            )
          );
        })
      );
    },
    [makeUrl]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (images.length > 0) {
          e.preventDefault();
          void addFiles(images);
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current++;
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepth.current = 0;
      setIsDragging(false);
      void addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeItem = (id: string) => {
    dropUrl(itemsRef.current.find((i) => i.id === id)?.originalUrl);
    dropUrl(resultsRef.current[id]?.compressedUrl);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setResults((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    setExpanded((prev) => {
      const { [id]: _open, ...rest } = prev;
      return rest;
    });
  };

  const resetAll = () => {
    abortRef.current?.abort();
    itemsRef.current.forEach((i) => dropUrl(i.originalUrl));
    Object.values(resultsRef.current).forEach((r) => dropUrl(r.compressedUrl));
    itemsRef.current = [];
    resultsRef.current = {};
    setItems([]);
    setResults({});
    setExpanded({});
    setError(null);
    setNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ----------------------------------------------------------- settings -- */

  const patchSettings = (patch: Partial<CompressSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setActivePreset(null);
  };

  const applyPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    setSettings((prev) => ({ ...prev, ...preset.settings }));
    setActivePreset(presetId);
  };

  /* -------------------------------------------------------- compression -- */

  const buildOptions = useCallback(
    (signal: AbortSignal, onProgress: (p: number) => void): Options => {
      const options: Options = {
        useWebWorker: true,
        libURL: WORKER_LIB_URL,
        initialQuality: settings.quality,
        maxIteration: 12,
        preserveExif: !settings.stripMetadata,
        alwaysKeepResolution: settings.maxDimension === null,
        maxSizeMB:
          settings.mode === 'targetSize'
            ? Math.max(settings.targetSizeKB, 1) / 1024
            : Number.POSITIVE_INFINITY,
        signal,
        onProgress,
      };
      if (settings.maxDimension !== null) options.maxWidthOrHeight = settings.maxDimension;
      if (settings.format !== 'original') options.fileType = settings.format;
      return options;
    },
    [settings]
  );

  const compressItem = useCallback(
    async (item: QueueItem, signal: AbortSignal) => {
      dropUrl(resultsRef.current[item.id]?.compressedUrl);
      setResults((prev) => ({
        ...prev,
        [item.id]: {
          id: item.id,
          status: 'processing',
          outputName: item.file.name,
          outputType: item.file.type,
          originalSize: item.file.size,
          compressedSize: 0,
          compressionRatio: 0,
          progress: 0,
        },
      }));

      try {
        const options = buildOptions(signal, (p) => {
          setResults((prev) => {
            const current = prev[item.id];
            if (!current || current.status !== 'processing') return prev;
            return { ...prev, [item.id]: { ...current, progress: p } };
          });
        });

        const output = await imageCompression(item.file, options);

        // Handing back something larger than the input is never the useful answer.
        const keepOriginal = settings.neverLarger && output.size >= item.file.size;
        const blob: Blob = keepOriginal ? item.file : output;
        const outputType = blob.type || item.file.type;
        const compressedUrl = makeUrl(blob);
        const dims = await readImageDimensions(compressedUrl);

        setResults((prev) => ({
          ...prev,
          [item.id]: {
            id: item.id,
            status: keepOriginal ? 'skipped' : 'done',
            outputName: keepOriginal
              ? item.file.name
              : buildOutputName(item.file.name, outputType),
            outputType,
            originalSize: item.file.size,
            compressedSize: blob.size,
            compressionRatio: ((item.file.size - blob.size) / item.file.size) * 100,
            outputWidth: dims?.width,
            outputHeight: dims?.height,
            blob,
            compressedUrl,
            progress: 100,
          },
        }));
      } catch (err) {
        if (signal.aborted) {
          setResults((prev) => {
            const current = prev[item.id];
            if (!current) return prev;
            return { ...prev, [item.id]: { ...current, status: 'queued', progress: 0 } };
          });
          return;
        }
        setResults((prev) => ({
          ...prev,
          [item.id]: {
            id: item.id,
            status: 'failed',
            outputName: item.file.name,
            outputType: item.file.type,
            originalSize: item.file.size,
            compressedSize: 0,
            compressionRatio: 0,
            progress: 0,
            error: err instanceof Error ? err.message : 'Could not compress this file.',
          },
        }));
      }
    },
    [buildOptions, dropUrl, makeUrl, settings.neverLarger]
  );

  const runQueue = async (queue: QueueItem[]) => {
    if (queue.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setIsProcessing(true);
    setError(null);

    const limit = Math.max(
      1,
      Math.min(4, (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 2)
    );

    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (cursor < queue.length && !controller.signal.aborted) {
        const item = queue[cursor++];
        await compressItem(item, controller.signal);
      }
    });

    try {
      await Promise.all(runners);
    } finally {
      setIsProcessing(false);
      abortRef.current = null;
    }
  };

  const compressAll = () => {
    if (items.length === 0) {
      setError('Please add at least one image.');
      return;
    }
    void runQueue(items);
  };

  const retryItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) void runQueue([item]);
  };

  const cancel = () => abortRef.current?.abort();

  /* ---------------------------------------------------------- downloads -- */

  const downloadOne = (result: CompressionResult) => {
    if (!result.compressedUrl) return;
    const a = document.createElement('a');
    a.href = result.compressedUrl;
    a.download = result.outputName;
    a.click();
  };

  const downloadZip = async () => {
    const ready = items
      .map((i) => results[i.id])
      .filter((r): r is CompressionResult => Boolean(r?.blob));
    if (ready.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      ready.forEach((result) => {
        let name = result.outputName;
        if (used.has(name)) {
          const dot = name.lastIndexOf('.');
          const base = dot === -1 ? name : name.slice(0, dot);
          const ext = dot === -1 ? '' : name.slice(dot);
          let n = 2;
          while (used.has(`${base} (${n})${ext}`)) n++;
          name = `${base} (${n})${ext}`;
        }
        used.add(name);
        zip.file(name, result.blob as Blob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compressed_images.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not build the ZIP file. Try downloading the images individually.');
    } finally {
      setIsZipping(false);
    }
  };

  /* ----------------------------------------------------------- derived --- */

  const totalInputSize = useMemo(
    () => items.reduce((sum, i) => sum + i.file.size, 0),
    [items]
  );

  const summary = useMemo(() => {
    const finished = items
      .map((i) => results[i.id])
      .filter((r): r is CompressionResult => Boolean(r?.blob));
    const originalBytes = finished.reduce((s, r) => s + r.originalSize, 0);
    const compressedBytes = finished.reduce((s, r) => s + r.compressedSize, 0);
    return {
      count: finished.length,
      originalBytes,
      compressedBytes,
      saved: originalBytes - compressedBytes,
      ratio: originalBytes > 0 ? ((originalBytes - compressedBytes) / originalBytes) * 100 : 0,
    };
  }, [items, results]);

  const overallProgress = useMemo(() => {
    if (items.length === 0) return 0;
    const total = items.reduce((sum, i) => sum + (results[i.id]?.progress ?? 0), 0);
    return Math.round(total / items.length);
  }, [items, results]);

  const completedCount = useMemo(
    () =>
      items.filter((i) => {
        const status = results[i.id]?.status;
        return status === 'done' || status === 'skipped' || status === 'failed';
      }).length,
    [items, results]
  );

  const hasResults = items.some((i) => results[i.id]);

  // Browsers ignore the quality argument for image/png, so a PNG that stays a PNG
  // only shrinks through resizing. Say so instead of letting the slider imply more.
  const pngCount = items.filter((i) => i.file.type === 'image/png').length;
  const pngStaysPng = settings.format === 'original' || settings.format === 'image/png';
  const showPngHint = pngCount > 0 && pngStaysPng;
  const animatedCount = items.filter((i) => i.isAnimatedGif).length;

  /* --------------------------------------------------------------- view -- */

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            id="image-upload"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="hidden"
            onChange={(e) => void addFiles(e.target.files)}
          />
          <div
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <label
              htmlFor="image-upload"
              className={cn(
                'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                isDragging
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50 hover:bg-accent/5'
              )}
            >
              <Upload
                size={48}
                className={cn('mb-2', isDragging ? 'text-accent' : 'text-muted-foreground')}
              />
              <p className="text-sm text-muted-foreground">
                {isDragging ? 'Drop to add images' : 'Drop images here or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP, GIF supported • Multiple files • Or paste with Ctrl/⌘+V
              </p>
            </label>
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {items.length} file{items.length > 1 ? 's' : ''} selected ·{' '}
                  {formatFileSize(totalInputSize)}
                </span>
                <button
                  onClick={resetAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ImageIcon size={16} className="text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{item.file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({formatFileSize(item.file.size)}
                        {item.width && item.height
                          ? ` · ${item.width}×${item.height}`
                          : ''}
                        )
                      </span>
                      {item.isAnimatedGif && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 shrink-0">
                          animated
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                      className="p-1 hover:bg-background rounded transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showPngHint && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 text-sm">
              <Info size={16} className="text-accent shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-foreground">
                  PNG output ignores the quality setting — browsers only apply quality to
                  lossy formats, so {pngCount === 1 ? 'this PNG' : 'these PNGs'} would only
                  shrink through resizing.
                </p>
                {supported.webp && (
                  <button
                    onClick={() => patchSettings({ format: 'image/webp' })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
                  >
                    <Wand2 size={12} />
                    Convert to WebP instead
                  </button>
                )}
              </div>
            </div>
          )}

          {animatedCount > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 text-sm">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-foreground">
                {animatedCount === 1 ? 'One file is' : `${animatedCount} files are`} an
                animated GIF. Compression re-encodes through a canvas, so the result keeps
                only the first frame.
              </p>
            </div>
          )}

          {notice && <p className="text-xs text-muted-foreground">{notice}</p>}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      {items.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-5">
          {/* Presets */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Preset</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  title={preset.hint}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md border transition-colors',
                    activePreset === preset.id
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <span className="px-3 py-1.5 text-sm text-muted-foreground">
                {activePreset
                  ? presets.find((p) => p.id === activePreset)?.hint
                  : 'Custom settings'}
              </span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Output format */}
            <div className="space-y-2">
              <label
                htmlFor="output-format"
                className="text-sm font-medium text-foreground block"
              >
                Output format
              </label>
              <select
                id="output-format"
                value={settings.format}
                onChange={(e) => patchSettings({ format: e.target.value as OutputFormat })}
                className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {formatOptions.map((format) => (
                  <option key={format} value={format}>
                    {FORMAT_LABELS[format]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {supported.webp
                  ? 'WebP usually beats JPEG and PNG at the same visual quality.'
                  : 'This browser cannot encode WebP, so only JPEG and PNG are offered.'}
              </p>
            </div>

            {/* Resize */}
            <div className="space-y-2">
              <label
                htmlFor="max-dimension"
                className="text-sm font-medium text-foreground block"
              >
                Resize longest edge
              </label>
              <select
                id="max-dimension"
                value={settings.maxDimension === null ? 'none' : String(settings.maxDimension)}
                onChange={(e) =>
                  patchSettings({
                    maxDimension: e.target.value === 'none' ? null : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {RESIZE_OPTIONS.map((option) => (
                  <option
                    key={option.label}
                    value={option.value === null ? 'none' : String(option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Images smaller than this are left at their original dimensions.
              </p>
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="compress-mode"
                  checked={settings.mode === 'quality'}
                  onChange={() => patchSettings({ mode: 'quality' })}
                  className="accent-accent"
                />
                Quality level
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="compress-mode"
                  checked={settings.mode === 'targetSize'}
                  onChange={() => patchSettings({ mode: 'targetSize' })}
                  className="accent-accent"
                />
                Target file size
              </label>
            </div>

            {settings.mode === 'quality' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="quality" className="text-sm font-medium text-foreground">
                    Quality: {Math.round(settings.quality * 100)}%
                  </label>
                  <div className="flex gap-1.5">
                    {QUALITY_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => patchSettings({ quality: preset.value })}
                        className={cn(
                          'px-2 py-0.5 text-xs rounded border transition-colors',
                          Math.abs(settings.quality - preset.value) < 0.005
                            ? 'border-accent text-accent'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="quality"
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.01"
                  value={settings.quality}
                  onChange={(e) => patchSettings({ quality: parseFloat(e.target.value) })}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
                {showPngHint && (
                  <p className="text-xs text-amber-500">
                    Note: this slider has no effect on the {pngCount} PNG
                    {pngCount > 1 ? 's' : ''} while the output stays PNG.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="target-size"
                  className="text-sm font-medium text-foreground block"
                >
                  Compress each image to under
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="target-size"
                    type="number"
                    min={5}
                    step={5}
                    value={settings.targetSizeKB}
                    onChange={(e) =>
                      patchSettings({
                        targetSizeKB: Math.max(5, Number(e.target.value) || 5),
                      })
                    }
                    className="w-32 px-3 py-2 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="text-sm text-muted-foreground">KB</span>
                  <div className="flex gap-1.5 ml-2">
                    {[100, 200, 500, 1024].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => patchSettings({ targetSizeKB: kb })}
                        className={cn(
                          'px-2 py-0.5 text-xs rounded border transition-colors',
                          settings.targetSizeKB === kb
                            ? 'border-accent text-accent'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {kb === 1024 ? '1 MB' : `${kb} KB`}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  The target is best-effort: quality is lowered step by step, and the
                  achieved size is shown per file. Very small targets may not be reachable
                  without also resizing.
                </p>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-start gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={settings.stripMetadata}
                onChange={(e) => patchSettings({ stripMetadata: e.target.checked })}
                className="mt-0.5 accent-accent"
              />
              <span>
                Strip metadata (EXIF, GPS)
                <span className="block text-xs text-muted-foreground">
                  Unchecking keeps EXIF only for JPEG in → JPEG out; other conversions drop
                  it regardless.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={settings.neverLarger}
                onChange={(e) => patchSettings({ neverLarger: e.target.checked })}
                className="mt-0.5 accent-accent"
              />
              <span>
                Keep the original if compression makes it bigger
                <span className="block text-xs text-muted-foreground">
                  Already-optimised files are passed through untouched.
                </span>
              </span>
            </label>
          </div>

          {isProcessing ? (
            <div className="space-y-3" aria-live="polite">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Compressing {Math.min(completedCount + 1, items.length)} of {items.length}
                </span>
                <span className="text-muted-foreground">{overallProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-200"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <button
                onClick={cancel}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-md hover:bg-muted transition-colors font-medium"
              >
                <Ban size={16} />
                Cancel — keep finished results
              </button>
            </div>
          ) : (
            <button
              onClick={compressAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors font-medium"
            >
              <ImageIcon size={18} />
              {hasResults
                ? `Re-compress ${items.length} image${items.length > 1 ? 's' : ''}`
                : `Compress ${items.length} image${items.length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">Compression Results</h3>
              {summary.count > 0 && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatFileSize(summary.originalBytes)} →{' '}
                  <span className="text-foreground font-medium">
                    {formatFileSize(summary.compressedBytes)}
                  </span>{' '}
                  · saved {formatFileSize(Math.max(0, summary.saved))} (
                  {summary.ratio >= 0 ? '−' : '+'}
                  {Math.abs(summary.ratio).toFixed(1)}%)
                </p>
              )}
            </div>
            {summary.count > 1 && (
              <button
                onClick={downloadZip}
                disabled={isZipping}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                <Package size={16} />
                {isZipping ? 'Building ZIP…' : 'Download All as ZIP'}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const result = results[item.id];
              if (!result) return null;
              const meta = STATUS_META[result.status];
              const isOpen = Boolean(expanded[item.id]);

              return (
                <div key={item.id} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{result.outputName}</p>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded shrink-0',
                            meta.className
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>

                      {result.status === 'processing' && (
                        <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-background overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-200"
                            style={{ width: `${result.progress}%` }}
                          />
                        </div>
                      )}

                      {result.status === 'failed' && (
                        <p className="text-sm text-destructive mt-1">{result.error}</p>
                      )}

                      {(result.status === 'done' || result.status === 'skipped') && (
                        <>
                          <div className="flex items-center gap-2 mt-1 text-sm flex-wrap">
                            <span className="text-muted-foreground">
                              {formatFileSize(result.originalSize)}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-foreground font-medium">
                              {formatFileSize(result.compressedSize)}
                            </span>
                            <span
                              className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded',
                                result.compressionRatio > 0
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-muted-foreground/10 text-muted-foreground'
                              )}
                            >
                              {result.compressionRatio > 0
                                ? `−${result.compressionRatio.toFixed(1)}%`
                                : 'no change'}
                            </span>
                          </div>
                          {item.width && item.height && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.width}×{item.height}
                              {result.outputWidth && result.outputHeight && (
                                <>
                                  {' → '}
                                  {result.outputWidth}×{result.outputHeight}
                                  {result.outputWidth < item.width && ' (resized)'}
                                </>
                              )}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {result.status === 'failed' && (
                        <button
                          onClick={() => retryItem(item.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-background disabled:opacity-50 transition-colors"
                        >
                          <RotateCcw size={14} />
                          Retry
                        </button>
                      )}
                      {result.compressedUrl && (
                        <>
                          <button
                            onClick={() =>
                              setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                            }
                            aria-label={isOpen ? 'Hide comparison' : 'Compare before and after'}
                            className="p-2 hover:bg-background rounded transition-colors"
                          >
                            {isOpen ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => downloadOne(result)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isOpen && result.compressedUrl && (
                    <CompareSlider
                      originalUrl={item.originalUrl}
                      compressedUrl={result.compressedUrl}
                      originalLabel={`Original — ${formatFileSize(result.originalSize)}`}
                      compressedLabel={`Compressed — ${formatFileSize(result.compressedSize)}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {summary.count > 0 && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check size={12} className="text-green-500" />
              Every image was processed on your device — nothing was uploaded.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
