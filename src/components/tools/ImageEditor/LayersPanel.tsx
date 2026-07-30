'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Combine, Copy, Eye, EyeOff, Layers as LayersIcon, Lock, Trash2, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLEND_MODE_LABELS } from './constants';
import { BLEND_MODES, type BlendMode } from './types';
import type { UseImageEditorReturn } from './useImageEditor';

export function LayersPanel({ editor }: { editor: UseImageEditorReturn }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const activeLayer = editor.layers.find((l) => l.isActive);

  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
        <span className="text-xs font-semibold text-foreground">Layers</span>
        <div className="flex gap-1">
          <button
            type="button"
            title="Merge active layer down"
            onClick={() => editor.activeLayerId && editor.mergeDown(editor.activeLayerId)}
            disabled={!editor.activeLayerId || editor.layers.length < 2}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
          >
            <Combine size={14} />
          </button>
          <button
            type="button"
            title="Flatten all layers"
            onClick={() => editor.flattenAll()}
            disabled={editor.layers.length < 2}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground"
          >
            <LayersIcon size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto divide-y divide-border/60">
        {editor.layers.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground text-center">No layers yet</p>}
        {editor.layers.map((layer, index) => (
          <div
            key={layer.id}
            onClick={() => editor.setActiveLayer(layer.id)}
            className={cn(
              'group flex items-center gap-1.5 px-2.5 py-2 cursor-pointer',
              layer.isActive ? 'bg-accent/10' : 'hover:bg-muted/60'
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                editor.toggleLayerVisibility(layer.id);
              }}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>

            {editingId === layer.id ? (
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => {
                  editor.renameLayer(layer.id, nameDraft);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-0 text-xs bg-background border border-border rounded px-1 py-0.5"
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(layer.id);
                  setNameDraft(layer.name);
                }}
                className="flex-1 min-w-0 truncate text-xs font-medium capitalize"
                title="Double-click to rename"
              >
                {layer.name}
              </span>
            )}

            <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  editor.reorderLayer(layer.id, 'up');
                }}
                disabled={index === 0}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                aria-label="Move layer up"
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  editor.reorderLayer(layer.id, 'down');
                }}
                disabled={index === editor.layers.length - 1}
                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                aria-label="Move layer down"
              >
                <ChevronDown size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                editor.toggleLayerLock(layer.id);
              }}
              className={cn(
                'shrink-0 text-muted-foreground hover:text-foreground',
                !layer.locked && 'opacity-0 group-hover:opacity-100'
              )}
              aria-label={layer.locked ? 'Unlock layer' : 'Lock layer'}
            >
              {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void editor.duplicateLayer(layer.id);
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
              aria-label="Duplicate layer"
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                editor.removeLayer(layer.id);
              }}
              className="shrink-0 text-destructive opacity-0 group-hover:opacity-100"
              aria-label="Delete layer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {activeLayer && (
        <div className="px-3 py-2 border-t border-border/60 space-y-2 bg-muted/20">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-muted-foreground w-14 shrink-0">Opacity</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(activeLayer.opacity * 100)}
              onChange={(e) => editor.activeLayerId && editor.setLayerOpacity(editor.activeLayerId, Number(e.target.value))}
              onMouseUp={editor.commitLayerOpacity}
              onTouchEnd={editor.commitLayerOpacity}
              className="flex-1 accent-accent"
            />
            <span className="text-[11px] text-muted-foreground w-8 text-right">{Math.round(activeLayer.opacity * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-muted-foreground w-14 shrink-0">Blend</label>
            <select
              value={activeLayer.blendMode}
              onChange={(e) => editor.activeLayerId && editor.setLayerBlendMode(editor.activeLayerId, e.target.value as BlendMode)}
              className="flex-1 text-xs bg-background border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {BLEND_MODES.map((m) => (
                <option key={m} value={m}>
                  {BLEND_MODE_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
