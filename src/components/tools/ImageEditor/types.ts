// Shared types for the Image Editor tool.

import type { FabricObject } from 'fabric';

// Fabric objects are extended with a handful of custom properties so the
// editor can track identity/naming/locking through serialization. This is
// declaration merging, not a hack — `id`/`layerName`/`isLocked`/`isHelper`
// are passed to `canvas.toJSON([...])` as `propertiesToInclude` so they
// round-trip through undo/redo and autosave.
declare module 'fabric' {
  interface FabricObject {
    id?: string;
    layerName?: string;
    isLocked?: boolean;
    /** Marks non-content helper objects (crop overlay, selection marquee) that must never be exported or counted as a layer. */
    isHelper?: boolean;
  }
}

export const CUSTOM_PROPS = ['id', 'layerName', 'isLocked'] as const;

export type ToolId =
  | 'select'
  | 'crop'
  | 'rect-select'
  | 'ellipse-select'
  | 'lasso-select'
  | 'magic-wand'
  | 'brush'
  | 'eraser'
  | 'bucket'
  | 'gradient'
  | 'eyedropper'
  | 'text'
  | 'shape';

export type ShapeKind =
  | 'rect'
  | 'rounded-rect'
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'polygon'
  | 'star'
  | 'heart';

export type BrushKind = 'brush' | 'pencil' | 'marker' | 'airbrush' | 'calligraphy' | 'highlighter';

export const BLEND_MODES = [
  'source-over',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'difference',
  'color-dodge',
  'color-burn',
] as const;
export type BlendMode = (typeof BLEND_MODES)[number];

export interface LayerEntry {
  id: string;
  name: string;
  kind: 'image' | 'text' | 'shape' | 'path' | 'group' | 'other';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  isActive: boolean;
}

export interface HistoryStep {
  id: string;
  label: string;
  json: Record<string, unknown>;
}

export interface DocSize {
  width: number;
  height: number;
}

export interface CropRatioPreset {
  id: string;
  label: string;
  ratio: number | null; // width / height, null = free
}

export interface AdjustmentValues {
  brightness: number; // -100..100
  contrast: number; // -100..100
  saturation: number; // -100..100
  hue: number; // -180..180
  temperature: number; // -100..100 (negative = cooler/blue, positive = warmer/orange)
  sharpen: number; // 0..100
}

export const DEFAULT_ADJUSTMENTS: AdjustmentValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  temperature: 0,
  sharpen: 0,
};

export interface FilterValues {
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  blur: number; // 0..1
  pixelate: number; // 0 (off) .. 40 blockSize
  noise: number; // 0..400
  vignette: number; // 0..100
}

export const DEFAULT_FILTERS: FilterValues = {
  grayscale: false,
  sepia: false,
  invert: false,
  blur: 0,
  pixelate: 0,
  noise: 0,
  vignette: 0,
};

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0..1, ignored for png
  scale: number; // export multiplier, 1 = actual document size
  fileName: string;
}

export function isRealLayer(obj: FabricObject): boolean {
  return !obj.isHelper;
}
