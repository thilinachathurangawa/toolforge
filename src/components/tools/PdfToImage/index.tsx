'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Package, Loader2, FileText } from 'lucide-react';
import JSZip from 'jszip';

type OutFormat = 'image/jpeg' | 'image/png';

interface PageImg {
  page: number;
  url: string;
  blob: Blob;
  selected: boolean;
}

export function PdfToImage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [format, setFormat] = useState<OutFormat>('image/jpeg');
  const [scale, setScale] = useState(2);
  const [pages, setPages] = useState<PageImg[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const render = async (file: File) => {
    setIsRendering(true);
    setError(null);
    setPages([]);
    setFileName(file.name);
    try {
      const pdfjs = await import('pdfjs-dist');
      // Worker is copied to public/ by scripts/ensure-node.cjs during prebuild.
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const data = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data }).promise;
      const total = pdf.numPages;
      setProgress({ current: 0, total });

      const out: PageImg[] = [];
      for (let p = 1; p <= total; p++) {
        setProgress({ current: p, total });
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), format, 0.92)
        );
        if (blob) {
          out.push({ page: p, url: URL.createObjectURL(blob), blob, selected: true });
          setPages([...out]);
        }
      }
      if (out.length === 0) setError('No pages could be rendered from this PDF.');
    } catch (err) {
      console.error(err);
      setError('Could not read that PDF. Make sure it is a valid, unencrypted PDF file.');
    } finally {
      setIsRendering(false);
    }
  };

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) {
      setError('Please upload a PDF file.');
      return;
    }
    render(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFile(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, scale]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const toggle = (page: number) => {
    setPages((prev) => prev.map((p) => (p.page === page ? { ...p, selected: !p.selected } : p)));
  };
  const setAll = (val: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: val })));
  };

  const ext = format === 'image/png' ? 'png' : 'jpg';

  const downloadOne = (p: PageImg) => {
    const a = document.createElement('a');
    a.href = p.url;
    a.download = `${(fileName || 'page').replace(/\.pdf$/i, '')}_page_${p.page}.${ext}`;
    a.click();
  };

  const downloadZip = async () => {
    const selected = pages.filter((p) => p.selected);
    if (selected.length === 0) return;
    const zip = new JSZip();
    const base = (fileName || 'pdf').replace(/\.pdf$/i, '');
    selected.forEach((p) => zip.file(`${base}_page_${p.page}.${ext}`, p.blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}-images.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          id="pti-upload"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          <label
            htmlFor="pti-upload"
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">Drop a PDF here or click to browse</p>
            {fileName && <p className="text-xs text-muted-foreground mt-1">{fileName}</p>}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Format</label>
            <div className="flex gap-2">
              {(['image/jpeg', 'image/png'] as OutFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={
                    'flex-1 px-3 py-2 text-sm rounded-md transition-colors ' +
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Resolution</label>
            <select
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value={1}>1× (standard)</option>
              <option value={2}>2× (high)</option>
              <option value={3}>3× (max)</option>
            </select>
          </div>
        </div>

        {isRendering && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            Rendering page {progress.current} / {progress.total} …
          </div>
        )}
        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
      </div>

      {/* Pages grid */}
      {pages.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText size={18} /> {pages.length} page(s) · {selectedCount} selected
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setAll(true)} className="text-xs text-muted-foreground hover:text-foreground">
                Select all
              </button>
              <span className="text-muted-foreground">·</span>
              <button onClick={() => setAll(false)} className="text-xs text-muted-foreground hover:text-foreground">
                Clear
              </button>
              <button
                onClick={downloadZip}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                <Package size={16} /> Download Selected (.zip)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pages.map((p) => (
              <div
                key={p.page}
                className={
                  'group relative border rounded-lg overflow-hidden bg-muted ' +
                  (p.selected ? 'border-accent ring-2 ring-accent/40' : 'border-border')
                }
              >
                <button onClick={() => toggle(p.page)} className="block w-full">
                  <img src={p.url} alt={`Page ${p.page}`} className="w-full h-auto" />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/60 text-white rounded">
                    {p.page}
                  </span>
                  <span
                    className={
                      'absolute top-1 right-1 w-4 h-4 rounded border flex items-center justify-center text-[10px] ' +
                      (p.selected ? 'bg-accent border-accent text-white' : 'bg-background border-border')
                    }
                  >
                    {p.selected ? '✓' : ''}
                  </span>
                </button>
                <button
                  onClick={() => downloadOne(p)}
                  className="absolute bottom-1 right-1 p-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Download this page"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
