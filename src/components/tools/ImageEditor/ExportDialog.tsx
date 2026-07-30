'use client';

import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportFormat } from './types';
import type { UseImageEditorReturn } from './useImageEditor';

const SCALE_PRESETS = [0.5, 1, 2];

export function ExportDialog({ editor, onClose }: { editor: UseImageEditorReturn; onClose: () => void }) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(1);
  const [fileName, setFileName] = useState('image-editor-export');

  const outW = Math.round(editor.docSize.width * scale);
  const outH = Math.round(editor.docSize.height * scale);

  async function handleExport() {
    const ext = format === 'jpeg' ? 'jpg' : format;
    await editor.exportImage({ format, quality, scale, fileName: `${fileName || 'image'}.${ext}` });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-4 space-y-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Export Image</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Format</label>
          <div className="flex gap-1.5">
            {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-md border border-border uppercase transition-colors',
                  format === f ? 'bg-accent text-white' : 'bg-background hover:bg-muted'
                )}
              >
                {f === 'jpeg' ? 'JPG' : f}
              </button>
            ))}
          </div>
        </div>

        {format !== 'png' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Quality</label>
              <span className="text-xs text-muted-foreground">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Size</label>
            <span className="text-xs text-muted-foreground">
              {outW} × {outH}px
            </span>
          </div>
          <div className="flex gap-1.5">
            {SCALE_PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-md border border-border transition-colors',
                  scale === s ? 'bg-accent text-white' : 'bg-background hover:bg-muted'
                )}
              >
                {Math.round(s * 100)}%
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">File name</label>
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={editor.isBusy}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          <Download size={15} /> Download
        </button>
        {format === 'jpeg' && (
          <p className="text-[11px] text-muted-foreground">JPG has no transparency — transparent areas export as white. Use PNG or WebP to keep transparency.</p>
        )}
      </div>
    </div>
  );
}
