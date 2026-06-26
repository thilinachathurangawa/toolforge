'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Package, X, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';

// Standard favicon / app-icon sizes generated for every upload.
const SIZES = [16, 32, 48, 180, 192, 512] as const;

const SIZE_LABELS: Record<number, string> = {
  16: 'Browser tab',
  32: 'Taskbar / bookmark',
  48: 'Windows site icon',
  180: 'Apple touch icon',
  192: 'Android / PWA',
  512: 'PWA splash / store',
};

interface GeneratedIcon {
  size: number;
  blob: Blob;
  url: string;
}

const SNIPPET = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
`;

export function FaviconGenerator() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string>('');
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkPreview, setDarkPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generate = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setIcons([]);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
      });
      setSourceUrl(dataUrl);
      setSourceName(file.name.replace(/\.[^/.]+$/, ''));

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('That file is not a valid image'));
        img.src = dataUrl;
      });

      const results: GeneratedIcon[] = [];
      for (const size of SIZES) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported in this browser');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // Cover-fit the square so non-square sources are centred, not stretched.
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
        if (blob) results.push({ size, blob, url: URL.createObjectURL(blob) });
      }
      setIcons(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError('Please upload a PNG, JPG, or WebP image.');
      return;
    }
    generate(file);
  };

  const downloadOne = (icon: GeneratedIcon) => {
    const a = document.createElement('a');
    a.href = icon.url;
    a.download = `favicon-${icon.size}x${icon.size}.png`;
    a.click();
  };

  const downloadZip = async () => {
    if (icons.length === 0) return;
    const zip = new JSZip();
    icons.forEach((icon) => {
      zip.file(`favicon-${icon.size}x${icon.size}.png`, icon.blob);
    });
    // 32px doubles as the conventional favicon.png most frameworks expect.
    const main = icons.find((i) => i.size === 32);
    if (main) zip.file('favicon.png', main.blob);
    zip.file('favicon-snippet.html', SNIPPET);
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sourceName || 'favicon'}-icons.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSourceUrl(null);
    setIcons([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          id="favicon-upload"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <label
            htmlFor="favicon-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drop an image here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or WebP · a square image works best</p>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>
        )}

        {sourceUrl && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <ImageIcon size={16} className="text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{sourceName}</span>
            </div>
            <button onClick={reset} className="p-1 hover:bg-muted rounded transition-colors" title="Clear">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="text-sm text-muted-foreground">Generating icon sizes…</div>
      )}

      {icons.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-foreground">Preview</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkPreview((v) => !v)}
                className="px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {darkPreview ? 'Light background' : 'Dark background'}
              </button>
              <button
                onClick={downloadZip}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                <Package size={16} />
                Download All (.zip)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {icons.map((icon) => (
              <div key={icon.size} className="space-y-2 text-center">
                <div
                  className="flex items-center justify-center p-4 rounded-lg border border-border"
                  style={{ background: darkPreview ? '#0f172a' : '#ffffff' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={icon.url}
                    alt={`${icon.size}x${icon.size} favicon`}
                    width={Math.min(icon.size, 96)}
                    height={Math.min(icon.size, 96)}
                    style={{ imageRendering: icon.size <= 48 ? 'pixelated' : 'auto' }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {icon.size}×{icon.size}
                </p>
                <p className="text-xs text-muted-foreground">{SIZE_LABELS[icon.size]}</p>
                <button
                  onClick={() => downloadOne(icon)}
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Download size={12} /> PNG
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">HTML to paste in your &lt;head&gt;</p>
            <pre className="p-4 border border-border rounded-md bg-background text-xs font-mono text-foreground overflow-x-auto whitespace-pre">
              {SNIPPET}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
