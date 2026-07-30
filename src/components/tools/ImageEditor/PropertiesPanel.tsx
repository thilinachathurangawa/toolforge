'use client';

import React, { useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CROP_RATIO_PRESETS, SOCIAL_CROP_PRESETS } from './constants';
import type { AdjustmentValues, BrushKind, FilterValues, ShapeKind } from './types';
import { SHAPE_LABELS } from './constants';
import type { UseImageEditorReturn } from './useImageEditor';

const BRUSH_KINDS: { id: BrushKind; label: string }[] = [
  { id: 'brush', label: 'Brush' },
  { id: 'pencil', label: 'Pencil' },
  { id: 'marker', label: 'Marker' },
  { id: 'airbrush', label: 'Airbrush' },
  { id: 'calligraphy', label: 'Calligraphy' },
  { id: 'highlighter', label: 'Highlighter' },
];

const SHAPE_KINDS = Object.keys(SHAPE_LABELS) as ShapeKind[];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-16 shrink-0">{label}</label>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-16 shrink-0">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        className="flex-1 accent-accent"
      />
      <span className="text-[11px] text-muted-foreground w-10 text-right shrink-0">
        {value}
        {suffix}
      </span>
    </div>
  );
}

function ToolOptions({ editor }: { editor: UseImageEditorReturn }) {
  const tool = editor.activeTool;

  if (tool === 'crop') {
    return (
      <div className="space-y-2.5 p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">Crop</p>
        <div className="flex flex-wrap gap-1.5">
          {CROP_RATIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => editor.applyCropRatio(preset)}
              className={cn(
                'px-2 py-1 text-[11px] font-medium rounded-md border border-border',
                editor.cropRatio.id === preset.id ? 'bg-accent text-white' : 'bg-background hover:bg-muted'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SOCIAL_CROP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => editor.applyCropRatio(preset, preset.size)}
              className={cn(
                'px-2 py-1 text-[11px] font-medium rounded-md border border-border',
                editor.cropRatio.id === preset.id ? 'bg-accent text-white' : 'bg-background hover:bg-muted'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <SliderRow label="Straighten" value={editor.cropRotation} min={-45} max={45} onChange={editor.setCropRotation} suffix="°" />
        <div className="flex gap-2 pt-1">
          <button
            onClick={editor.confirmCrop}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90"
          >
            <Check size={13} /> Apply Crop
          </button>
          <button
            onClick={editor.cancelCrop}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    );
  }

  if (tool === 'rect-select' || tool === 'ellipse-select' || tool === 'lasso-select' || tool === 'magic-wand') {
    return (
      <div className="space-y-2.5 p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">
          {tool === 'magic-wand' ? 'Magic Wand' : tool === 'lasso-select' ? 'Free Lasso' : 'Selection'}
        </p>
        {tool === 'magic-wand' && (
          <SliderRow label="Tolerance" value={editor.magicWandTolerance} min={1} max={100} onChange={editor.setMagicWandTolerance} />
        )}
        <p className="text-[11px] text-muted-foreground">
          {tool === 'magic-wand'
            ? 'Click a spot on an image layer to select similarly colored pixels.'
            : 'Drag on the canvas to draw a selection, then delete or fill it.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={editor.fillInSelection}
            disabled={!editor.hasActiveSelectionShape}
            className="flex-1 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90 disabled:opacity-40"
          >
            Fill
          </button>
          <button
            onClick={editor.deleteInSelection}
            disabled={!editor.hasActiveSelectionShape}
            className="flex-1 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted disabled:opacity-40"
          >
            Delete
          </button>
          <button
            onClick={editor.clearSelectionOverlay}
            disabled={!editor.hasActiveSelectionShape}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted disabled:opacity-40"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    );
  }

  if (tool === 'brush' || tool === 'eraser') {
    return (
      <div className="space-y-2.5 p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">{tool === 'brush' ? 'Brush' : 'Eraser'}</p>
        {tool === 'brush' && (
          <Row label="Style">
            <select
              value={editor.brushKind}
              onChange={(e) => editor.setBrushKind(e.target.value as BrushKind)}
              className="flex-1 text-xs bg-background border border-border rounded px-1.5 py-1"
            >
              {BRUSH_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </Row>
        )}
        {tool === 'brush' && (
          <Row label="Color">
            <input
              type="color"
              value={editor.brushColor}
              onChange={(e) => editor.setBrushColor(e.target.value)}
              className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
            />
          </Row>
        )}
        <SliderRow label="Size" value={editor.brushSize} min={1} max={120} onChange={editor.setBrushSize} suffix="px" />
        {tool === 'brush' && <SliderRow label="Hardness" value={editor.brushHardness} min={0} max={100} onChange={editor.setBrushHardness} />}
        <SliderRow label="Opacity" value={editor.brushOpacity} min={1} max={100} onChange={editor.setBrushOpacity} />
      </div>
    );
  }

  if (tool === 'bucket') {
    return (
      <div className="space-y-2.5 p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">Paint Bucket</p>
        <Row label="Color">
          <input
            type="color"
            value={editor.fillColor}
            onChange={(e) => editor.setFillColor(e.target.value)}
            className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
          />
        </Row>
        <SliderRow label="Tolerance" value={editor.magicWandTolerance} min={1} max={100} onChange={editor.setMagicWandTolerance} />
        <p className="text-[11px] text-muted-foreground">Click a spot on an image layer to fill similarly colored pixels.</p>
      </div>
    );
  }

  if (tool === 'gradient') {
    return <GradientToolOptions editor={editor} />;
  }

  if (tool === 'eyedropper') {
    return (
      <div className="space-y-2 p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">Eyedropper</p>
        <p className="text-[11px] text-muted-foreground">Click anywhere on the canvas to pick a color.</p>
        {editor.pickedColor && (
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded border border-border" style={{ backgroundColor: editor.pickedColor }} />
            <span className="text-xs font-mono">{editor.pickedColor}</span>
          </div>
        )}
      </div>
    );
  }

  if (tool === 'text') {
    return (
      <div className="space-y-2.5 p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">Text</p>
        <p className="text-[11px] text-muted-foreground">Click on the canvas to place text, then double-click it to edit.</p>
        <TextObjectControls editor={editor} />
      </div>
    );
  }

  if (tool === 'shape') {
    return (
      <div className="space-y-2.5 p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">Shape</p>
        <div className="grid grid-cols-3 gap-1.5">
          {SHAPE_KINDS.map((kind) => (
            <button
              key={kind}
              onClick={() => editor.setShapeKind(kind)}
              className={cn(
                'px-2 py-1.5 text-[11px] font-medium rounded-md border border-border capitalize',
                editor.shapeKind === kind ? 'bg-accent text-white' : 'bg-background hover:bg-muted'
              )}
            >
              {SHAPE_LABELS[kind]}
            </button>
          ))}
        </div>
        <Row label="Fill">
          <input type="color" value={editor.fillColor} onChange={(e) => editor.setFillColor(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5" />
        </Row>
        <Row label="Stroke">
          <input type="color" value={editor.strokeColor} onChange={(e) => editor.setStrokeColor(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5" />
        </Row>
        <SliderRow label="Stroke Wd" value={editor.strokeWidth} min={0} max={40} onChange={editor.setStrokeWidth} suffix="px" />
        {editor.shapeKind === 'rounded-rect' && (
          <SliderRow label="Radius" value={editor.cornerRadius} min={0} max={100} onChange={editor.setCornerRadius} suffix="px" />
        )}
        <p className="text-[11px] text-muted-foreground">Click on the canvas to place the shape.</p>
      </div>
    );
  }

  return null;
}

function GradientToolOptions({ editor }: { editor: UseImageEditorReturn }) {
  const [colorA, setColorA] = useState('#4f46e5');
  const [colorB, setColorB] = useState('#ec4899');
  const [angle, setAngle] = useState(90);
  return (
    <div className="space-y-2.5 p-3 border-b border-border">
      <p className="text-xs font-semibold text-foreground">Gradient Fill</p>
      <Row label="From">
        <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5" />
      </Row>
      <Row label="To">
        <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5" />
      </Row>
      <SliderRow label="Angle" value={angle} min={0} max={360} onChange={setAngle} suffix="°" />
      <button
        onClick={() => editor.addGradientFill(colorA, colorB, angle)}
        className="w-full py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/90"
      >
        Add Gradient Layer
      </button>
    </div>
  );
}

function TextObjectControls({ editor }: { editor: UseImageEditorReturn }) {
  if (editor.activeLayerKind !== 'text') return null;
  return (
    <div className="space-y-2 pt-1">
      <Row label="Fill">
        <input
          type="color"
          defaultValue="#1e1e1e"
          onChange={(e) => {
            editor.updateActiveText({ fill: e.target.value } as never);
            editor.commitActiveTextChange();
          }}
          className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
        />
      </Row>
      <div className="flex gap-1.5">
        <button
          onClick={() => {
            editor.updateActiveText({ fontWeight: 'bold' } as never);
            editor.commitActiveTextChange();
          }}
          className="flex-1 py-1 text-xs font-bold rounded-md border border-border hover:bg-muted"
        >
          B
        </button>
        <button
          onClick={() => {
            editor.updateActiveText({ fontStyle: 'italic' } as never);
            editor.commitActiveTextChange();
          }}
          className="flex-1 py-1 text-xs italic rounded-md border border-border hover:bg-muted"
        >
          I
        </button>
        <button
          onClick={() => {
            editor.updateActiveText({ underline: true } as never);
            editor.commitActiveTextChange();
          }}
          className="flex-1 py-1 text-xs underline rounded-md border border-border hover:bg-muted"
        >
          U
        </button>
      </div>
    </div>
  );
}

function AdjustmentsTab({ editor }: { editor: UseImageEditorReturn }) {
  const disabled = editor.activeLayerKind !== 'image';
  const v: AdjustmentValues = editor.adjustments;
  return (
    <div className={cn('space-y-2.5 p-3', disabled && 'opacity-50 pointer-events-none')}>
      {disabled && <p className="text-[11px] text-muted-foreground">Select an image layer to adjust it.</p>}
      <SliderRow label="Brightness" value={v.brightness} min={-100} max={100} onChange={(n) => editor.setAdjustment('brightness', n)} onCommit={editor.commitAdjustment} />
      <SliderRow label="Contrast" value={v.contrast} min={-100} max={100} onChange={(n) => editor.setAdjustment('contrast', n)} onCommit={editor.commitAdjustment} />
      <SliderRow label="Saturation" value={v.saturation} min={-100} max={100} onChange={(n) => editor.setAdjustment('saturation', n)} onCommit={editor.commitAdjustment} />
      <SliderRow label="Hue" value={v.hue} min={-180} max={180} onChange={(n) => editor.setAdjustment('hue', n)} onCommit={editor.commitAdjustment} suffix="°" />
      <SliderRow label="Temperature" value={v.temperature} min={-100} max={100} onChange={(n) => editor.setAdjustment('temperature', n)} onCommit={editor.commitAdjustment} />
      <SliderRow label="Sharpen" value={v.sharpen} min={0} max={100} onChange={(n) => editor.setAdjustment('sharpen', n)} onCommit={editor.commitAdjustment} />
      <button
        onClick={editor.resetAdjustments}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground pt-1"
      >
        <RotateCcw size={12} /> Reset adjustments
      </button>
    </div>
  );
}

function FiltersTab({ editor }: { editor: UseImageEditorReturn }) {
  const disabled = editor.activeLayerKind !== 'image';
  const f: FilterValues = editor.filterValues;
  return (
    <div className="space-y-2.5 p-3">
      <div className={cn('space-y-2', disabled && 'opacity-50 pointer-events-none')}>
        {disabled && <p className="text-[11px] text-muted-foreground">Select an image layer to apply filters.</p>}
        <div className="flex gap-1.5">
          {(['grayscale', 'sepia', 'invert'] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                editor.setFilterValue(key, !f[key]);
                editor.commitFilter();
              }}
              className={cn(
                'flex-1 py-1.5 text-[11px] font-medium rounded-md border border-border capitalize',
                f[key] ? 'bg-accent text-white' : 'bg-background hover:bg-muted'
              )}
            >
              {key}
            </button>
          ))}
        </div>
        <SliderRow label="Blur" value={f.blur} min={0} max={1} step={0.02} onChange={(n) => editor.setFilterValue('blur', n)} onCommit={editor.commitFilter} />
        <SliderRow label="Pixelate" value={f.pixelate} min={0} max={40} onChange={(n) => editor.setFilterValue('pixelate', n)} onCommit={editor.commitFilter} />
        <SliderRow label="Noise" value={f.noise} min={0} max={400} onChange={(n) => editor.setFilterValue('noise', n)} onCommit={editor.commitFilter} />
      </div>
      <div className="pt-1 border-t border-border/60">
        <SliderRow label="Vignette" value={f.vignette} min={0} max={100} onChange={(n) => editor.applyVignette(n)} />
        <p className="text-[10px] text-muted-foreground pt-1">Vignette applies to the whole document, not just one layer.</p>
      </div>
    </div>
  );
}

function HistoryTab({ editor }: { editor: UseImageEditorReturn }) {
  return (
    <div className="max-h-64 overflow-y-auto">
      {editor.history.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground text-center">No history yet</p>}
      {editor.history.map((step, i) => (
        <button
          key={step.id}
          onClick={() => editor.jumpToHistory(i)}
          className={cn(
            'w-full text-left px-3 py-1.5 text-xs border-b border-border/40',
            i === editor.historyIndex ? 'bg-accent/10 font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60'
          )}
        >
          {i + 1}. {step.label}
        </button>
      ))}
    </div>
  );
}

type Tab = 'adjust' | 'filters' | 'history';

export function PropertiesPanel({ editor }: { editor: UseImageEditorReturn }) {
  const [tab, setTab] = useState<Tab>('adjust');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ToolOptions editor={editor} />
      <div className="flex border-b border-border">
        {(['adjust', 'filters', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-xs font-medium capitalize border-b-2 -mb-px',
              tab === t ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'adjust' && <AdjustmentsTab editor={editor} />}
        {tab === 'filters' && <FiltersTab editor={editor} />}
        {tab === 'history' && <HistoryTab editor={editor} />}
      </div>
    </div>
  );
}
