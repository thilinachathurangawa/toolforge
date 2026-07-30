'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Clipboard, History, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCEPTED_EXTENSIONS } from './constants';
import type { UseImageEditorReturn } from './useImageEditor';

export function EmptyState({ editor }: { editor: UseImageEditorReturn }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files?.length) void editor.openFiles(e.dataTransfer.files);
    },
    [editor]
  );

  return (
    <div className="space-y-4">
      {editor.restorePrompt && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/40 text-sm">
          <span className="flex items-center gap-2 text-foreground">
            <History size={15} className="text-muted-foreground shrink-0" />
            You have an unsaved session from {new Date(editor.restorePrompt.savedAt).toLocaleString()}.
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={editor.restoreSession}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={editor.dismissRestore}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          'flex flex-col items-center justify-center gap-3 p-10 sm:p-14 border-2 border-dashed rounded-xl text-center transition-colors',
          isDragOver ? 'border-accent bg-accent/5' : 'border-border'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void editor.openFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <Upload size={40} className="text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">Drag & drop an image, or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            PNG, JPG, WEBP, GIF, BMP, SVG, ICO, AVIF, HEIC — nothing is uploaded, everything runs in your browser.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          Choose Image
        </button>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clipboard size={12} /> or press Ctrl/Cmd+V to paste an image from your clipboard
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground shrink-0">or start blank</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {editor.newDocPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => editor.newBlankDocument(preset.size)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <ImageIcon size={20} className="text-muted-foreground" />
            <span className="text-xs font-medium text-foreground text-center">{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
