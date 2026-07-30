'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { ExportDialog } from './ExportDialog';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
import { ToolRail } from './ToolRail';
import { useImageEditor } from './useImageEditor';

const SHORTCUTS_HINT = [
  'V select · C crop · B brush · E eraser · T text',
  'Ctrl/Cmd+Z undo · Ctrl/Cmd+Shift+Z redo',
  'Ctrl/Cmd+D duplicate · Delete removes layer',
  'Ctrl/Cmd+A select all · Escape cancels selection',
  'Space + drag to pan · Ctrl/Cmd+E export',
].join('\n');

export function ImageEditor() {
  const editor = useImageEditor();
  const [showExport, setShowExport] = useState(false);
  const [showNewPrompt, setShowNewPrompt] = useState(false);

  return (
    <div className="w-full">
      <div
        className="flex flex-col rounded-xl border border-border bg-card overflow-hidden"
        style={{ height: '80vh', minHeight: 560, maxHeight: 900 }}
      >
        <Toolbar editor={editor} onExportClick={() => setShowExport(true)} onNewClick={() => setShowNewPrompt(true)} />

        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          <ToolRail editor={editor} />

          {/* The <canvas> below must always be mounted, even before an image
              is loaded — the editor hook creates its Fabric.js instance in a
              mount-only effect that needs this DOM node to exist on the very
              first render. The empty state is an overlay on top of it, not a
              replacement for it. */}
          <div
            ref={editor.viewportRef}
            className="flex-1 min-h-0 overflow-auto bg-muted/50 flex items-start justify-start p-8 relative"
            style={{
              backgroundImage: 'repeating-conic-gradient(hsl(var(--muted-foreground) / 0.08) 0% 25%, transparent 0% 50%)',
              backgroundSize: '20px 20px',
            }}
          >
            <canvas ref={editor.canvasElRef} className="shadow-md" />
            {!editor.hasDocument && (
              <div className="absolute inset-0 overflow-y-auto bg-card p-4 sm:p-8 flex items-center justify-center">
                <div className="w-full max-w-xl">
                  <EmptyState editor={editor} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-border max-h-64 lg:max-h-none overflow-y-auto lg:overflow-visible">
            <LayersPanel editor={editor} />
            <PropertiesPanel editor={editor} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-1.5">
          <span className="text-[11px] text-muted-foreground">
            {editor.hasDocument ? `${editor.docSize.width} × ${editor.docSize.height}px` : 'No document open'}
          </span>
          <button
            type="button"
            title={SHORTCUTS_HINT}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <HelpCircle size={12} /> Keyboard shortcuts
          </button>
        </div>
      </div>

      {editor.error && (
        <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <span>{editor.error}</span>
          <button onClick={() => editor.setError(null)} className="text-xs font-medium underline shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {showExport && <ExportDialog editor={editor} onClose={() => setShowExport(false)} />}

      {showNewPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNewPrompt(false)}>
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-4 space-y-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-foreground">Start a new document?</h3>
            <p className="text-xs text-muted-foreground">
              This discards your current canvas unless you export first. Choose a blank canvas size, or close this and use Open to
              import a new image.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {editor.newDocPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    editor.newBlankDocument(preset.size);
                    setShowNewPrompt(false);
                  }}
                  className="p-3 text-xs font-medium rounded-md border border-border hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowNewPrompt(false)}
              className="w-full py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
