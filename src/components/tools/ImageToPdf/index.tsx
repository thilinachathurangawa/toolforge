'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

type PageSize = 'a4' | 'letter' | 'fit';
type Margin = 'none' | 'small' | 'large';

interface Item {
  id: string;
  file: File;
  url: string;
  w: number;
  h: number;
}

const PAGE_PT: Record<'a4' | 'letter', { w: number; h: number }> = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612, h: 792 },
};

const MARGIN_PT: Record<Margin, number> = { none: 0, small: 24, large: 48 };

export function ImageToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [margin, setMargin] = useState<Margin>('small');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setError('Please add image files (JPG, PNG, WebP).');
      return;
    }
    setError(null);
    valid.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setItems((prev) => [
          ...prev,
          { id: `img-${counter.current++}`, file, url, w: img.naturalWidth, h: img.naturalHeight },
        ]);
      };
      img.src = url;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const move = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const generate = async () => {
    if (items.length === 0) {
      setError('Add at least one image first.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const { jsPDF } = await import('jspdf');
      let doc: import('jspdf').jsPDF | null = null;
      const m = MARGIN_PT[margin];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const dataUrl = await fileToDataUrl(item.file);
        const fmt = item.file.type === 'image/png' ? 'PNG' : item.file.type === 'image/webp' ? 'WEBP' : 'JPEG';

        if (pageSize === 'fit') {
          // Page hugs the image (1px = 1pt).
          const pw = item.w;
          const ph = item.h;
          const orientation = pw >= ph ? 'l' : 'p';
          if (!doc) {
            doc = new jsPDF({ orientation, unit: 'pt', format: [pw, ph] });
          } else {
            doc.addPage([pw, ph], orientation);
          }
          doc.addImage(dataUrl, fmt, 0, 0, pw, ph);
        } else {
          const base = PAGE_PT[pageSize];
          const orientation = item.w >= item.h ? 'l' : 'p';
          const pageW = orientation === 'l' ? base.h : base.w;
          const pageH = orientation === 'l' ? base.w : base.h;
          if (!doc) {
            doc = new jsPDF({ orientation, unit: 'pt', format: pageSize });
          } else {
            doc.addPage(pageSize, orientation);
          }
          const boxW = pageW - m * 2;
          const boxH = pageH - m * 2;
          const scale = Math.min(boxW / item.w, boxH / item.h);
          const dw = item.w * scale;
          const dh = item.h * scale;
          const x = (pageW - dw) / 2;
          const y = (pageH - dh) / 2;
          doc.addImage(dataUrl, fmt, x, y, dw, dh);
        }
      }

      doc?.save('images.pdf');
    } catch (err) {
      setError('Something went wrong building the PDF. Try fewer or smaller images.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          id="itp-upload"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          <label
            htmlFor="itp-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP • Multiple files allowed</p>
          </label>
        </div>
        {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
      </div>

      {items.length > 0 && (
        <>
          {/* Settings */}
          <div className="p-6 border border-border rounded-xl bg-card grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Page size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSize)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="fit">Fit to Image</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as Margin)}
                disabled={pageSize === 'fit'}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Reorderable list */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-3">
            <h3 className="font-semibold text-foreground">Pages ({items.length})</h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground w-6 shrink-0">{index + 1}.</span>
                  <img src={item.url} alt={item.file.name} className="w-12 h-12 object-cover rounded shrink-0" />
                  <span className="text-sm font-medium truncate flex-1">{item.file.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-background rounded transition-colors disabled:opacity-30"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      className="p-1.5 hover:bg-background rounded transition-colors disabled:opacity-30"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-background rounded transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {isGenerating ? 'Generating…' : 'Generate PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
