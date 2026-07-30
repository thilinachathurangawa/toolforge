'use client';

import React, { useRef } from 'react';
import { Download, FolderPlus, Loader2, Maximize, Redo2, Undo2, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { ACCEPTED_EXTENSIONS } from './constants';
import type { UseImageEditorReturn } from './useImageEditor';

interface ToolbarProps {
  editor: UseImageEditorReturn;
  onExportClick: () => void;
  onNewClick: () => void;
}

const ZOOM_PRESETS = [0.5, 1, 2, 4];

export function Toolbar({ editor, onExportClick, onNewClick }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-1.5 border-b border-border bg-card px-2.5 py-2 flex-wrap">
      <button
        type="button"
        onClick={onNewClick}
        title="New document"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <FolderPlus size={15} />
        <span className="hidden sm:inline">New</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void editor.openFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Open image"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Upload size={15} />
        <span className="hidden sm:inline">Open</span>
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        onClick={editor.undo}
        disabled={!editor.canUndo}
        title="Undo (Ctrl+Z)"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Undo2 size={16} />
      </button>
      <button
        type="button"
        onClick={editor.redo}
        disabled={!editor.canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Redo2 size={16} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        onClick={editor.zoomOut}
        title="Zoom out"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ZoomOut size={16} />
      </button>
      <select
        value={ZOOM_PRESETS.includes(editor.zoom) ? String(editor.zoom) : 'custom'}
        onChange={(e) => {
          if (e.target.value !== 'custom') editor.applyZoom(Number(e.target.value));
        }}
        title="Zoom level"
        className="text-xs font-medium bg-background border border-border rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="custom">{Math.round(editor.zoom * 100)}%</option>
        {ZOOM_PRESETS.map((z) => (
          <option key={z} value={z}>
            {Math.round(z * 100)}%
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={editor.zoomIn}
        title="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <ZoomIn size={16} />
      </button>
      <button
        type="button"
        onClick={editor.zoomToFit}
        title="Fit to screen"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Maximize size={16} />
      </button>

      <div className="flex-1" />

      {editor.isBusy && <Loader2 size={16} className="animate-spin text-muted-foreground" />}

      <button
        type="button"
        onClick={onExportClick}
        disabled={!editor.hasDocument}
        title="Export (Ctrl+E)"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:hover:bg-accent transition-colors"
      >
        <Download size={15} />
        Export
      </button>
    </div>
  );
}
