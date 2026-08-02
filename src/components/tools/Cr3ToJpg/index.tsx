'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, X, FileImage, Loader2, Settings, Eye, AlertCircle, CheckCircle2, ZoomIn, ZoomOut, RotateCw, Info } from 'lucide-react';
import JSZip from 'jszip';
import {
  extractCr3Image,
  buildExifApp1,
  insertApp1,
  findEntry,
  entryNumber,
  entryString,
  TAG,
  type TiffData,
} from './cr3';

interface ConversionSettings {
  quality: number;
  outputResolution: 'original' | 'half' | 'three-quarters' | 'custom';
  customWidth?: number;
  customHeight?: number;
  keepAspectRatio: boolean;
  autoOrientation: boolean;
  removeMetadata: boolean;
}

interface ExifMetadata {
  cameraModel?: string;
  dateTaken?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  lens?: string;
  focalLength?: string;
  whiteBalance?: string;
  orientation?: number;
}

interface ConversionResult {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  convertedBlob?: Blob;
  previewUrl?: string;
  originalSize: number;
  convertedSize?: number;
  width?: number;
  height?: number;
  sourceLabel?: string;
  error?: string;
  metadata?: ExifMetadata;
}

/** Browsers cap canvas area; start here and step down if encoding fails. */
const MAX_PIXELS = 60_000_000;

/** Uint8Array is a valid BlobPart at runtime; TS 5.7+ narrows the buffer type. */
const asBlobPart = (bytes: Uint8Array): BlobPart => bytes as unknown as BlobPart;

const isCr3File = (file: File): boolean =>
  /\.cr3$/i.test(file.name) || file.type === 'image/x-canon-cr3';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatExifDate = (raw: string): string => {
  const m = /^(\d{4}):(\d{2}):(\d{2})\s(.+)$/.exec(raw);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}` : raw;
};

function readMetadata(tiff: TiffData | null): ExifMetadata {
  if (!tiff) return {};
  const meta: ExifMetadata = {};

  const make = entryString(findEntry(tiff.ifd0, TAG.make));
  const model = entryString(findEntry(tiff.ifd0, TAG.model));
  if (make || model) {
    meta.cameraModel = model && make && model.startsWith(make) ? model : [make, model].filter(Boolean).join(' ');
  }

  const orientation = entryNumber(findEntry(tiff.ifd0, TAG.orientation));
  if (orientation && orientation >= 1 && orientation <= 8) meta.orientation = orientation;

  const date = entryString(findEntry(tiff.exif, TAG.dateTimeOriginal));
  if (date) meta.dateTaken = formatExifDate(date);

  const iso = entryNumber(findEntry(tiff.exif, TAG.iso));
  if (iso) meta.iso = iso;

  const fNumber = entryNumber(findEntry(tiff.exif, TAG.fNumber));
  if (fNumber) meta.aperture = `f/${fNumber.toFixed(1).replace(/\.0$/, '')}`;

  const exposure = entryNumber(findEntry(tiff.exif, TAG.exposureTime));
  if (exposure && exposure > 0) {
    meta.shutterSpeed = exposure >= 1 ? `${Math.round(exposure * 10) / 10}s` : `1/${Math.round(1 / exposure)}s`;
  }

  const lens = entryString(findEntry(tiff.exif, TAG.lensModel));
  if (lens) meta.lens = lens;

  const focal = entryNumber(findEntry(tiff.exif, TAG.focalLength));
  if (focal) meta.focalLength = `${Math.round(focal)}mm`;

  const wb = entryNumber(findEntry(tiff.exif, TAG.whiteBalance));
  if (wb === 0) meta.whiteBalance = 'Auto';
  else if (wb === 1) meta.whiteBalance = 'Manual';

  return meta;
}

/** Map an EXIF orientation onto the canvas so the drawn image comes out upright. */
function applyOrientation(ctx: CanvasRenderingContext2D, orientation: number, dw: number, dh: number): void {
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, dw, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, dw, dh); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, dh); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, dh, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, dh, dw); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, dw); break;
    default: break;
  }
}

interface LoadedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

/** Decode without letting the browser auto-rotate — we handle orientation ourselves. */
async function loadImage(blob: Blob): Promise<LoadedImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob, { imageOrientation: 'none' });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('The embedded preview could not be decoded.'));
      el.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/** Output dimensions after resize and rotation, in display (upright) space. */
function computeTargetSize(
  width: number,
  height: number,
  settings: ConversionSettings,
  swap: boolean,
): { displayWidth: number; displayHeight: number } {
  const baseW = swap ? height : width;
  const baseH = swap ? width : height;

  let w = baseW;
  let h = baseH;

  if (settings.outputResolution === 'half') {
    w = baseW / 2;
    h = baseH / 2;
  } else if (settings.outputResolution === 'three-quarters') {
    w = baseW * 0.75;
    h = baseH * 0.75;
  } else if (settings.outputResolution === 'custom') {
    const cw = settings.customWidth;
    const ch = settings.customHeight;
    if (cw && ch) {
      if (settings.keepAspectRatio) {
        const scale = Math.min(cw / baseW, ch / baseH);
        w = baseW * scale;
        h = baseH * scale;
      } else {
        w = cw;
        h = ch;
      }
    } else if (cw) {
      w = cw;
      h = baseH * (cw / baseW);
    } else if (ch) {
      h = ch;
      w = baseW * (ch / baseH);
    }
  }

  w = Math.max(1, Math.round(w));
  h = Math.max(1, Math.round(h));

  if (w * h > MAX_PIXELS) {
    const scale = Math.sqrt(MAX_PIXELS / (w * h));
    w = Math.max(1, Math.floor(w * scale));
    h = Math.max(1, Math.floor(h * scale));
  }

  return { displayWidth: w, displayHeight: h };
}

async function encodeJpeg(
  image: LoadedImage,
  displayWidth: number,
  displayHeight: number,
  orientation: number,
  quality: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const swap = orientation >= 5;

  // Step down if the browser refuses a canvas this large.
  for (const scale of [1, 0.6, 0.36]) {
    const outW = Math.max(1, Math.round(displayWidth * scale));
    const outH = Math.max(1, Math.round(displayHeight * scale));
    const drawW = swap ? outH : outW;
    const drawH = swap ? outW : outH;

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas rendering is unavailable in this browser.');

    try {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      applyOrientation(ctx, orientation, drawW, drawH);
      ctx.drawImage(image.source, 0, 0, drawW, drawH);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
      });
      if (blob && blob.size > 0) return { blob, width: outW, height: outH };
    } catch {
      // Fall through to the next, smaller attempt.
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  throw new Error('This image is too large for your browser to render. Try a smaller output resolution.');
}

export function Cr3ToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 0.9,
    outputResolution: 'original',
    keepAspectRatio: true,
    autoOrientation: true,
    removeMetadata: false,
  });
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [previewFile, setPreviewFile] = useState<ConversionResult | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);
  const urlsRef = useRef<string[]>([]);

  const releaseUrls = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  }, []);

  useEffect(() => releaseUrls, [releaseUrls]);

  const handleFileUpload = (uploaded: FileList | null) => {
    if (!uploaded) return;
    const valid = Array.from(uploaded).filter(isCr3File);
    if (valid.length === 0) {
      setError('Please upload CR3 files (.cr3 extension).');
      return;
    }
    setError(null);
    releaseUrls();
    setResults([]);
    setFiles((prev) => [...prev, ...valid]);
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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  const convertSingleFile = async (file: File, s: ConversionSettings): Promise<ConversionResult> => {
    const { jpeg, source, tiff } = await extractCr3Image(file);
    const metadata = readMetadata(tiff);

    const orientation = s.autoOrientation ? metadata.orientation ?? 1 : 1;
    const image = await loadImage(new Blob([asBlobPart(jpeg)], { type: 'image/jpeg' }));

    let encoded: { blob: Blob; width: number; height: number };
    try {
      const { displayWidth, displayHeight } = computeTargetSize(image.width, image.height, s, orientation >= 5);
      encoded = await encodeJpeg(image, displayWidth, displayHeight, orientation, s.quality);
    } finally {
      image.release();
    }

    let output = encoded.blob;
    if (!s.removeMetadata) {
      const app1 = buildExifApp1(tiff, {
        // The pixels are already rotated, so the tag must read "normal".
        orientation: s.autoOrientation ? 1 : metadata.orientation,
        width: encoded.width,
        height: encoded.height,
        software: 'ToolForge CR3 to JPG',
      });
      if (app1) {
        const bytes = new Uint8Array(await encoded.blob.arrayBuffer());
        output = new Blob([asBlobPart(insertApp1(bytes, app1))], { type: 'image/jpeg' });
      }
    }

    const previewUrl = URL.createObjectURL(output);
    urlsRef.current.push(previewUrl);

    return {
      file,
      status: 'done',
      convertedBlob: output,
      previewUrl,
      originalSize: file.size,
      convertedSize: output.size,
      width: encoded.width,
      height: encoded.height,
      sourceLabel: source,
      metadata,
    };
  };

  const convert = async () => {
    if (files.length === 0) {
      setError('Please add at least one CR3 file.');
      return;
    }

    cancelRef.current = false;
    setIsProcessing(true);
    setError(null);
    releaseUrls();
    setResults([]);
    setProgress({ current: 0, total: files.length });

    const out: ConversionResult[] = [];

    for (let i = 0; i < files.length; i++) {
      if (cancelRef.current) break;
      const f = files[i];
      setProgress({ current: i + 1, total: files.length });

      out.push({ file: f, status: 'processing', originalSize: f.size });
      setResults([...out]);

      try {
        out[i] = await convertSingleFile(f, settings);
      } catch (err) {
        out[i] = {
          file: f,
          status: 'error',
          originalSize: f.size,
          error: err instanceof Error ? err.message : 'Conversion failed',
        };
      }
      setResults([...out]);
      // Yield so the progress UI repaints between files.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setIsProcessing(false);
  };

  const downloadOne = (r: ConversionResult) => {
    if (r.status !== 'done' || !r.previewUrl) return;
    const a = document.createElement('a');
    a.href = r.previewUrl;
    a.download = `${r.file.name.replace(/\.[^/.]+$/, '')}.jpg`;
    a.click();
  };

  const downloadZip = async () => {
    const done = results.filter((r) => r.status === 'done' && r.convertedBlob);
    if (done.length === 0) return;
    const zip = new JSZip();
    done.forEach((r) => {
      zip.file(`${r.file.name.replace(/\.[^/.]+$/, '')}.jpg`, r.convertedBlob!);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cr3-converted-images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    cancelRef.current = true;
    releaseUrls();
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
    setPreviewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const doneCount = results.filter((r) => r.status === 'done').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <div className="w-full space-y-6">
      {/* How it works */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Everything runs in your browser</p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Your CR3 files are read locally and never uploaded. The converter extracts the full-resolution JPEG that
              your Canon camera embeds in every CR3 — complete with its picture style and white balance — then re-encodes
              it at your chosen quality and size. It does not re-develop the raw sensor data, so it cannot recover
              highlight or shadow detail beyond what the camera rendered.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          id="cr3-upload"
          accept=".cr3,image/x-canon-cr3"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          <label
            htmlFor="cr3-upload"
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={56} className="text-muted-foreground mb-3" />
            <p className="text-base font-medium text-foreground">Drop CR3 files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse — .cr3 files, multiple files allowed
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{files.length} file(s) selected</span>
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Clear all
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => {
                const result = results[index];
                return (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileImage size={16} className="text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">({formatFileSize(file.size)})</span>
                      {result && (
                        <span className="text-xs shrink-0">
                          {result.status === 'done' && <CheckCircle2 size={14} className="text-green-500 inline" />}
                          {result.status === 'processing' && <Loader2 size={14} className="text-blue-500 inline animate-spin" />}
                          {result.status === 'error' && <AlertCircle size={14} className="text-red-500 inline" />}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-background rounded transition-colors shrink-0"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
      </div>

      {/* Settings */}
      {files.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Conversion Settings</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-expanded={showSettings}
              aria-label="Toggle conversion settings"
            >
              <Settings size={20} />
            </button>
          </div>

          {showSettings && (
            <div className="space-y-4 pt-4 border-t border-border">
              {/* Quality */}
              <div className="space-y-2">
                <label htmlFor="cr3-quality" className="text-sm font-medium text-foreground">
                  JPG Quality: {Math.round(settings.quality * 100)}%
                </label>
                <input
                  id="cr3-quality"
                  type="range"
                  min="10"
                  max="100"
                  value={Math.round(settings.quality * 100)}
                  onChange={(e) => setSettings({ ...settings, quality: parseInt(e.target.value) / 100 })}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Smaller file</span>
                  <span>Higher quality</span>
                </div>
              </div>

              {/* Output Resolution */}
              <div className="space-y-2">
                <label htmlFor="cr3-resolution" className="text-sm font-medium text-foreground">
                  Output Resolution
                </label>
                <select
                  id="cr3-resolution"
                  value={settings.outputResolution}
                  onChange={(e) => setSettings({ ...settings, outputResolution: e.target.value as ConversionSettings['outputResolution'] })}
                  className="w-full p-2 bg-secondary border border-border rounded-lg"
                >
                  <option value="original">Original</option>
                  <option value="three-quarters">75%</option>
                  <option value="half">50%</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {settings.outputResolution === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="cr3-width" className="text-sm font-medium text-foreground">Width (px)</label>
                    <input
                      id="cr3-width"
                      type="number"
                      min="1"
                      value={settings.customWidth ?? ''}
                      onChange={(e) => setSettings({ ...settings, customWidth: parseInt(e.target.value) || undefined })}
                      className="w-full p-2 bg-secondary border border-border rounded-lg"
                      placeholder="1920"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cr3-height" className="text-sm font-medium text-foreground">Height (px)</label>
                    <input
                      id="cr3-height"
                      type="number"
                      min="1"
                      value={settings.customHeight ?? ''}
                      onChange={(e) => setSettings({ ...settings, customHeight: parseInt(e.target.value) || undefined })}
                      className="w-full p-2 bg-secondary border border-border rounded-lg"
                      placeholder="1080"
                    />
                  </div>
                </div>
              )}

              {settings.outputResolution === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aspect-ratio"
                    checked={settings.keepAspectRatio}
                    onChange={(e) => setSettings({ ...settings, keepAspectRatio: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="aspect-ratio" className="text-sm font-medium text-foreground">
                    Keep aspect ratio (fit inside the given box)
                  </label>
                </div>
              )}

              {/* Auto Orientation */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-orientation"
                  checked={settings.autoOrientation}
                  onChange={(e) => setSettings({ ...settings, autoOrientation: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="auto-orientation" className="text-sm font-medium text-foreground">
                  Auto-rotate using the camera&apos;s orientation tag
                </label>
              </div>

              {/* Remove Metadata */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remove-metadata"
                  checked={settings.removeMetadata}
                  onChange={(e) => setSettings({ ...settings, removeMetadata: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="remove-metadata" className="text-sm font-medium text-foreground">
                  Remove EXIF metadata (including GPS) from the JPG
                </label>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <div className="space-y-3">
            <button
              onClick={convert}
              disabled={isProcessing}
              className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Converting ({progress.current}/{progress.total})
                </>
              ) : (
                <>
                  <RotateCw size={20} />
                  Convert to JPG
                </>
              )}
            </button>

            {isProcessing && (
              <>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => { cancelRef.current = true; }}
                  className="w-full py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent/10 transition-colors"
                >
                  Cancel remaining files
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Conversion Results
              {doneCount > 0 && (
                <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                  ({doneCount} successful)
                </span>
              )}
              {errorCount > 0 && (
                <span className="ml-2 text-sm font-normal text-red-600 dark:text-red-400">
                  ({errorCount} failed)
                </span>
              )}
            </h3>
            {doneCount > 1 && (
              <button
                onClick={downloadZip}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Download All (ZIP)
              </button>
            )}
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={`${result.file.name}-${index}`} className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {result.status === 'done' && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
                    {result.status === 'processing' && <Loader2 size={20} className="text-blue-500 shrink-0 animate-spin" />}
                    {result.status === 'error' && <AlertCircle size={20} className="text-red-500 shrink-0" />}
                    <span className="text-sm font-medium truncate">{result.file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {result.status === 'done' && (
                      <>
                        <button
                          onClick={() => { setPreviewFile(result); setZoomLevel(100); }}
                          className="p-2 hover:bg-background rounded-lg transition-colors"
                          title="Preview"
                          aria-label={`Preview ${result.file.name}`}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => downloadOne(result)}
                          className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-1"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {result.status === 'error' && (
                  <p className="text-xs text-red-500">{result.error}</p>
                )}

                {result.status === 'done' && result.previewUrl && (
                  <button
                    onClick={() => { setPreviewFile(result); setZoomLevel(100); }}
                    className="block w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.previewUrl}
                      alt={`Converted preview of ${result.file.name}`}
                      className="max-h-64 w-auto mx-auto rounded-lg shadow"
                    />
                  </button>
                )}

                {result.metadata && result.status === 'done' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {result.metadata.cameraModel && (
                      <div><span className="text-muted-foreground">Camera:</span> {result.metadata.cameraModel}</div>
                    )}
                    {result.metadata.lens && (
                      <div><span className="text-muted-foreground">Lens:</span> {result.metadata.lens}</div>
                    )}
                    {result.metadata.iso && (
                      <div><span className="text-muted-foreground">ISO:</span> {result.metadata.iso}</div>
                    )}
                    {result.metadata.aperture && (
                      <div><span className="text-muted-foreground">Aperture:</span> {result.metadata.aperture}</div>
                    )}
                    {result.metadata.shutterSpeed && (
                      <div><span className="text-muted-foreground">Shutter:</span> {result.metadata.shutterSpeed}</div>
                    )}
                    {result.metadata.focalLength && (
                      <div><span className="text-muted-foreground">Focal length:</span> {result.metadata.focalLength}</div>
                    )}
                    {result.metadata.dateTaken && (
                      <div><span className="text-muted-foreground">Taken:</span> {result.metadata.dateTaken}</div>
                    )}
                  </div>
                )}

                {result.status === 'done' && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {result.width && result.height && <span>{result.width} × {result.height} px</span>}
                    <span>Original: {formatFileSize(result.originalSize)}</span>
                    <span>JPG: {formatFileSize(result.convertedSize || 0)}</span>
                    {result.convertedSize && (
                      <span className={result.convertedSize < result.originalSize ? 'text-green-600' : 'text-red-600'}>
                        {((result.convertedSize / result.originalSize) * 100).toFixed(1)}% of original
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-background rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold truncate">{previewFile.file.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={20} />
                </button>
                <span className="text-sm font-medium w-16 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(400, zoomLevel + 25))}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-start justify-center bg-muted">
              {previewFile.previewUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewFile.previewUrl}
                  alt={`Converted ${previewFile.file.name}`}
                  style={{ width: `${zoomLevel}%`, maxWidth: 'none' }}
                  className="rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
