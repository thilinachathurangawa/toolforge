'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, X, FileImage, Package, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

type OutFormat = 'image/jpeg' | 'image/png';

interface ConvResult {
  name: string;
  blob: Blob;
  url: string;
  status: 'done' | 'error';
  error?: string;
}

const isHeic = (f: File) =>
  /\.(heic|heif)$/i.test(f.name) ||
  f.type === 'image/heic' ||
  f.type === 'image/heif' ||
  f.type === '';

export function HeicToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<OutFormat>('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [results, setResults] = useState<ConvResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileUpload = (uploaded: FileList | null) => {
    if (!uploaded) return;
    const valid = Array.from(uploaded).filter(isHeic);
    if (valid.length === 0) {
      setError('Please add HEIC or HEIF files (the format iPhones use).');
      return;
    }
    setError(null);
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
  };

  const convert = async () => {
    if (files.length === 0) {
      setError('Please add at least one HEIC file.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setResults([]);
    setProgress({ current: 0, total: files.length });

    let heic2any: typeof import('heic2any').default;
    try {
      heic2any = (await import('heic2any')).default;
    } catch {
      setError('Could not load the HEIC decoder. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }

    const out: ConvResult[] = [];
    const ext = format === 'image/png' ? 'png' : 'jpg';

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setProgress({ current: i + 1, total: files.length });
      const base = f.name.replace(/\.[^/.]+$/, '');
      try {
        const converted = await heic2any({
          blob: f,
          toType: format,
          quality: format === 'image/jpeg' ? quality : undefined,
        });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        out.push({
          name: `${base}.${ext}`,
          blob,
          url: URL.createObjectURL(blob),
          status: 'done',
        });
      } catch (err) {
        out.push({
          name: `${base}.${ext}`,
          blob: new Blob(),
          url: '',
          status: 'error',
          error: err instanceof Error ? err.message : 'Conversion failed',
        });
      }
      // Update incrementally so users see progress on large batches.
      setResults([...out]);
    }

    setIsProcessing(false);
  };

  const downloadOne = (r: ConvResult) => {
    if (r.status !== 'done') return;
    const a = document.createElement('a');
    a.href = r.url;
    a.download = r.name;
    a.click();
  };

  const downloadZip = async () => {
    const done = results.filter((r) => r.status === 'done');
    if (done.length === 0) return;
    const zip = new JSZip();
    done.forEach((r) => zip.file(r.name, r.blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const doneCount = results.filter((r) => r.status === 'done').length;

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          id="heic-upload"
          accept=".heic,.heif,image/heic,image/heif"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          <label
            htmlFor="heic-upload"
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={56} className="text-muted-foreground mb-3" />
            <p className="text-base font-medium text-foreground">Drop HEIC files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse — .heic / .heif, multiple files allowed
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
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileImage size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({formatSize(file.size)})</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-background rounded transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
      </div>

      {/* Settings */}
      {files.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Output format</label>
            <div className="flex gap-2">
              {(['image/jpeg', 'image/png'] as OutFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={
                    'flex-1 px-4 py-2 text-sm rounded-md transition-colors ' +
                    (format === fmt
                      ? 'bg-accent text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')
                  }
                >
                  {fmt === 'image/jpeg' ? 'JPG' : 'PNG'}
                </button>
              ))}
            </div>
          </div>

          {format === 'image/jpeg' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                JPG quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}

          <button
            onClick={convert}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Converting {progress.current} / {progress.total} …
              </>
            ) : (
              <>Convert {files.length} file(s)</>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Converted ({doneCount})</h3>
            {doneCount > 1 && (
              <button
                onClick={downloadZip}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Package size={16} /> Download All (.zip)
              </button>
            )}
          </div>

          <div className="space-y-3">
            {results.map((r, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg flex items-center gap-4">
                {r.status === 'done' ? (
                  <img src={r.url} alt={r.name} className="w-14 h-14 object-cover rounded shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded shrink-0 bg-destructive/10 flex items-center justify-center">
                    <X size={20} className="text-destructive" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  {r.status === 'done' ? (
                    <p className="text-xs text-muted-foreground">{formatSize(r.blob.size)}</p>
                  ) : (
                    <p className="text-xs text-destructive">{r.error || 'Could not convert this file'}</p>
                  )}
                </div>
                {r.status === 'done' && (
                  <button
                    onClick={() => downloadOne(r)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors shrink-0"
                  >
                    <Download size={16} /> Download
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
