'use client';

// The Image Editor's core hook: owns the Fabric.js canvas lifecycle, the
// history stack, the derived layer list, every tool interaction, adjustments
// and filters, export, and IndexedDB autosave. Everything below runs
// entirely in the browser — no image or edit ever leaves the device.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActiveSelection,
  Canvas,
  Ellipse,
  FabricImage,
  Gradient,
  Line,
  Path,
  PencilBrush,
  Point,
  Polygon,
  Rect,
  Shadow,
  Textbox,
  Triangle,
  filters,
  util,
  type FabricObject,
} from 'fabric';

// fabric's published type declarations don't surface the individual filter
// classes as top-level named exports (they only exist at runtime under the
// `filters` namespace object) — derive the element type from FabricImage's
// own `filters` property instead of importing `BaseFilter` directly.
type ImageFilter = FabricImage['filters'][number];
import {
  CROP_RATIO_PRESETS,
  MAX_HISTORY_STEPS,
  NEW_DOC_PRESETS,
} from './constants';
import {
  clearSession,
  downloadBlob,
  exportCanvasToBlob,
  fileToImageURL,
  imageFromClipboardEvent,
  loadSession,
  saveSession,
} from './utils/canvasIO';
import { floodFillMask, maskToClipPath, pickColorFromCanvas } from './utils/pixelOps';
import { HEART_PATH_DATA, arrowPoints, polygonPoints, starPoints } from './utils/shapeFactory';
import {
  CUSTOM_PROPS,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_FILTERS,
  type AdjustmentValues,
  type BlendMode,
  type BrushKind,
  type CropRatioPreset,
  type DocSize,
  type ExportOptions,
  type FilterValues,
  type HistoryStep,
  type LayerEntry,
  type ShapeKind,
  type ToolId,
} from './types';

const MAX_WORKING_EDGE = 4096;
const AUTOSAVE_DEBOUNCE_MS = 800;

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function layerKindOf(obj: FabricObject): LayerEntry['kind'] {
  const type = obj.type;
  if (type === 'image') return 'image';
  if (type === 'textbox' || type === 'i-text' || type === 'text') return 'text';
  if (type === 'path') return 'path';
  if (type === 'group' || type === 'activeSelection') return 'group';
  if (['rect', 'ellipse', 'triangle', 'line', 'polygon', 'circle'].includes(type ?? '')) return 'shape';
  return 'other';
}

function isImageLayer(obj: FabricObject | null | undefined): obj is FabricImage {
  return !!obj && obj.type === 'image';
}

interface Pt {
  x: number;
  y: number;
}

export function useImageEditor() {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const isRestoringRef = useRef(false);
  const historyRef = useRef<HistoryStep[]>([]);
  const historyIndexRef = useRef(-1);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeToolRef = useRef<ToolId>('select');
  const shapeKindRef = useRef<ShapeKind>('rect');
  const magicWandToleranceRef = useRef(24);
  const fillColorRef = useRef('#4f46e5');
  const docSizeRef = useRef<DocSize>({ width: 0, height: 0 });
  const hasDocumentRef = useRef(false);

  const spaceHeldRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<Pt | null>(null);

  const isDrawingSelectionRef = useRef(false);
  const selectionStartRef = useRef<Pt | null>(null);
  const selectionOverlayRef = useRef<Rect | Ellipse | null>(null);
  const isDrawingLassoRef = useRef(false);
  const lassoPointsRef = useRef<Pt[]>([]);
  const lassoOverlayRef = useRef<Polygon | null>(null);

  const cropOverlayRef = useRef<Rect | null>(null);

  // Always holds this render's mouse handlers so the mount-only canvas
  // listeners (bound once, see the init effect) never call stale closures.
  const latestHandlersRef = useRef<{
    down: (opt: { e: MouseEvent; target?: FabricObject }) => void;
    move: (opt: { e: MouseEvent }) => void;
    up: () => void;
  }>({ down: () => {}, move: () => {}, up: () => {} });

  const [ready, setReady] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docSize, setDocSize] = useState<DocSize>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveToolState] = useState<ToolId>('select');
  const [layers, setLayers] = useState<LayerEntry[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [activeLayerKind, setActiveLayerKind] = useState<LayerEntry['kind'] | null>(null);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [restorePrompt, setRestorePrompt] = useState<{ savedAt: number } | null>(null);
  const [hasActiveSelectionShape, setHasActiveSelectionShape] = useState(false);

  const [brushColor, setBrushColor] = useState('#1e1e1e');
  const [brushSize, setBrushSize] = useState(14);
  const [brushHardness, setBrushHardness] = useState(80);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [brushKind, setBrushKind] = useState<BrushKind>('brush');
  const [fillColor, setFillColorState] = useState('#4f46e5');
  const [strokeColor, setStrokeColor] = useState('#1e1e1e');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shapeKind, setShapeKindState] = useState<ShapeKind>('rect');
  const [cornerRadius, setCornerRadius] = useState(16);
  const [magicWandTolerance, setMagicWandToleranceState] = useState(24);
  const [pickedColor, setPickedColor] = useState<string | null>(null);

  const [cropRatio, setCropRatioState] = useState<CropRatioPreset>(CROP_RATIO_PRESETS[0]);
  const [cropRotation, setCropRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);

  const [adjustments, setAdjustmentsState] = useState<AdjustmentValues>(DEFAULT_ADJUSTMENTS);
  const [filterValues, setFilterValuesState] = useState<FilterValues>(DEFAULT_FILTERS);

  // Keep refs in sync with state that fabric-event handlers (bound once) need to read live.
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);
  useEffect(() => {
    shapeKindRef.current = shapeKind;
  }, [shapeKind]);
  useEffect(() => {
    magicWandToleranceRef.current = magicWandTolerance;
  }, [magicWandTolerance]);
  useEffect(() => {
    fillColorRef.current = fillColor;
  }, [fillColor]);
  useEffect(() => {
    docSizeRef.current = docSize;
  }, [docSize]);
  useEffect(() => {
    hasDocumentRef.current = hasDocument;
  }, [hasDocument]);

  // ── Layers / active object bookkeeping ──────────────────────────────────

  const refreshLayers = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    const objects = canvas.getObjects().filter((o) => !o.isHelper);
    const entries: LayerEntry[] = objects
      .map((obj) => ({
        id: obj.id ?? '',
        name: obj.layerName || (layerKindOf(obj) === 'image' ? 'Image' : 'Layer'),
        kind: layerKindOf(obj),
        visible: obj.visible !== false,
        locked: !!obj.isLocked,
        opacity: obj.opacity ?? 1,
        blendMode: (obj.globalCompositeOperation as BlendMode) || 'source-over',
        isActive: !!active && active === obj,
      }))
      .reverse();
    setLayers(entries);
    setActiveLayerId(active?.id ?? null);
    setActiveLayerKind(active ? layerKindOf(active) : null);
  }, []);

  const findLayer = useCallback((id: string): FabricObject | undefined => {
    return fabricRef.current?.getObjects().find((o) => o.id === id && !o.isHelper);
  }, []);

  // ── Autosave ─────────────────────────────────────────────────────────────

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      const canvas = fabricRef.current;
      if (!canvas || !hasDocumentRef.current) return;
      const json = canvas.toObject([...CUSTOM_PROPS]) as Record<string, unknown>;
      void saveSession({ ...json, __docSize: docSizeRef.current });
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  // ── History ──────────────────────────────────────────────────────────────

  const pushHistory = useCallback(
    (label: string) => {
      const canvas = fabricRef.current;
      if (!canvas || isRestoringRef.current) return;
      const json = canvas.toObject([...CUSTOM_PROPS]) as Record<string, unknown>;
      const step: HistoryStep = { id: uid(), label, json };
      const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
      let next = [...trimmed, step];
      if (next.length > MAX_HISTORY_STEPS) next = next.slice(next.length - MAX_HISTORY_STEPS);
      historyRef.current = next;
      historyIndexRef.current = next.length - 1;
      setHistory(next);
      setHistoryIndex(historyIndexRef.current);
      scheduleAutosave();
    },
    [scheduleAutosave]
  );

  const restoreFromHistory = useCallback(
    async (index: number) => {
      const canvas = fabricRef.current;
      const step = historyRef.current[index];
      if (!canvas || !step) return;
      isRestoringRef.current = true;
      await canvas.loadFromJSON(step.json);
      canvas.requestRenderAll();
      isRestoringRef.current = false;
      historyIndexRef.current = index;
      setHistoryIndex(index);
      refreshLayers();
      scheduleAutosave();
    },
    [refreshLayers, scheduleAutosave]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    void restoreFromHistory(historyIndexRef.current - 1);
  }, [restoreFromHistory]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    void restoreFromHistory(historyIndexRef.current + 1);
  }, [restoreFromHistory]);

  const jumpToHistory = useCallback(
    (index: number) => {
      void restoreFromHistory(index);
    },
    [restoreFromHistory]
  );

  // ── Zoom / pan ───────────────────────────────────────────────────────────

  const applyZoom = useCallback((z: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const next = clamp(z, 0.1, 16);
    canvas.setZoom(next);
    canvas.setDimensions({
      width: Math.round(docSizeRef.current.width * next),
      height: Math.round(docSizeRef.current.height * next),
    });
    canvas.requestRenderAll();
    setZoom(next);
  }, []);

  const zoomToFit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || docSizeRef.current.width === 0) return;
    const padding = 48;
    const scaleX = (viewport.clientWidth - padding) / docSizeRef.current.width;
    const scaleY = (viewport.clientHeight - padding) / docSizeRef.current.height;
    applyZoom(Math.max(0.05, Math.min(scaleX, scaleY)));
  }, [applyZoom]);

  const zoomIn = useCallback(() => applyZoom(zoom * 1.25), [applyZoom, zoom]);
  const zoomOut = useCallback(() => applyZoom(zoom / 1.25), [applyZoom, zoom]);

  // ── Canvas lifecycle ─────────────────────────────────────────────────────

  useEffect(() => {
    const el = canvasElRef.current;
    if (!el) return;

    const canvas = new Canvas(el, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: undefined,
    });
    fabricRef.current = canvas;

    const onAddOrRemove = () => refreshLayers();
    const onSelection = () => refreshLayers();
    const onModified = () => {
      pushHistory('Transform');
    };
    const onPathCreated = (opt: { path?: FabricObject }) => {
      const path = opt.path;
      if (!path) return;
      path.id = uid();
      path.layerName = 'Brush Stroke';
      if (activeToolRef.current === 'eraser') {
        path.globalCompositeOperation = 'destination-out';
      }
      refreshLayers();
      pushHistory(activeToolRef.current === 'eraser' ? 'Erase' : 'Brush Stroke');
    };

    canvas.on('object:added', onAddOrRemove);
    canvas.on('object:removed', onAddOrRemove);
    canvas.on('object:modified', onModified);
    canvas.on('selection:created', onSelection);
    canvas.on('selection:updated', onSelection);
    canvas.on('selection:cleared', onSelection);
    canvas.on('path:created', onPathCreated as never);
    // These forward through a ref (kept fresh below on every render) rather
    // than closing over this mount-only effect's handlers directly, since
    // the handlers call useCallback tool actions whose closures change as
    // tool-option state (color, brush size, shape kind, ...) changes.
    canvas.on('mouse:down', (opt: never) => latestHandlersRef.current.down(opt));
    canvas.on('mouse:move', (opt: never) => latestHandlersRef.current.move(opt));
    canvas.on('mouse:up', () => latestHandlersRef.current.up());

    setReady(true);

    void loadSession().then((session) => {
      if (session?.json) setRestorePrompt({ savedAt: session.savedAt });
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Paste from clipboard (Ctrl/Cmd+V) ────────────────────────────────────

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const file = imageFromClipboardEvent(e);
      if (file) void addImageFromFile(file);
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── File open / new document ─────────────────────────────────────────────

  const addImageFromFile = useCallback(
    async (file: File) => {
      setIsBusy(true);
      setError(null);
      try {
        const url = await fileToImageURL(file);
        const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
        const canvas = fabricRef.current;
        if (!canvas) return;
        const naturalW = img.width || 1;
        const naturalH = img.height || 1;

        if (!hasDocumentRef.current) {
          const edge = Math.max(naturalW, naturalH);
          const clampScale = edge > MAX_WORKING_EDGE ? MAX_WORKING_EDGE / edge : 1;
          const docW = Math.round(naturalW * clampScale);
          const docH = Math.round(naturalH * clampScale);
          canvas.clear();
          img.id = uid();
          img.layerName = (file.name.replace(/\.[^/.]+$/, '') || 'Background').slice(0, 40);
          img.set({
            left: docW / 2,
            top: docH / 2,
            originX: 'center',
            originY: 'center',
            scaleX: clampScale,
            scaleY: clampScale,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          docSizeRef.current = { width: docW, height: docH };
          setDocSize({ width: docW, height: docH });
          hasDocumentRef.current = true;
          setHasDocument(true);
          applyZoom(1);
          zoomToFitDeferred();
          isRestoringRef.current = false;
          historyRef.current = [];
          historyIndexRef.current = -1;
          pushHistory('Open Image');
        } else {
          img.id = uid();
          img.layerName = (file.name.replace(/\.[^/.]+$/, '') || 'Image').slice(0, 40);
          const scale = Math.min(
            1,
            (docSizeRef.current.width * 0.9) / naturalW,
            (docSizeRef.current.height * 0.9) / naturalH
          );
          img.set({
            left: docSizeRef.current.width / 2,
            top: docSizeRef.current.height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          pushHistory('Add Image Layer');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not open this file.');
      } finally {
        setIsBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applyZoom, pushHistory]
  );

  function zoomToFitDeferred() {
    // canvas needs one layout tick before the viewport has its final size
    requestAnimationFrame(() => zoomToFit());
  }

  const openFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
      if (list.length === 0) {
        setError('Please choose an image file.');
        return;
      }
      for (const file of list) {
        await addImageFromFile(file);
      }
    },
    [addImageFromFile]
  );

  const newBlankDocument = useCallback(
    (size: DocSize) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.clear();
      canvas.setDimensions({ width: size.width, height: size.height });
      const bg = new Rect({
        left: 0,
        top: 0,
        width: size.width,
        height: size.height,
        fill: '#ffffff',
        originX: 'left',
        originY: 'top',
        selectable: true,
      });
      bg.id = uid();
      bg.layerName = 'Background';
      canvas.add(bg);
      docSizeRef.current = size;
      setDocSize(size);
      hasDocumentRef.current = true;
      setHasDocument(true);
      historyRef.current = [];
      historyIndexRef.current = -1;
      applyZoom(1);
      zoomToFitDeferred();
      pushHistory('New Document');
    },
    [applyZoom, pushHistory]
  );

  const restoreSession = useCallback(async () => {
    const canvas = fabricRef.current;
    const session = await loadSession();
    if (!canvas || !session?.json) return;
    const { __docSize, ...json } = session.json as Record<string, unknown> & { __docSize?: DocSize };
    isRestoringRef.current = true;
    await canvas.loadFromJSON(json);
    const size = (__docSize as DocSize) || { width: canvas.getWidth(), height: canvas.getHeight() };
    canvas.setDimensions(size);
    docSizeRef.current = size;
    setDocSize(size);
    hasDocumentRef.current = true;
    setHasDocument(true);
    isRestoringRef.current = false;
    applyZoom(1);
    zoomToFitDeferred();
    refreshLayers();
    historyRef.current = [{ id: uid(), label: 'Restored Session', json: json as Record<string, unknown> }];
    historyIndexRef.current = 0;
    setHistory(historyRef.current);
    setHistoryIndex(0);
    setRestorePrompt(null);
  }, [applyZoom, refreshLayers]);

  const dismissRestore = useCallback(() => {
    setRestorePrompt(null);
    void clearSession();
  }, []);

  // ── Tool selection ───────────────────────────────────────────────────────

  const setActiveTool = useCallback((tool: ToolId) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (activeToolRef.current === 'crop' && tool !== 'crop') cancelCropInternal();
    canvas.isDrawingMode = tool === 'brush' || tool === 'eraser';
    canvas.selection = tool === 'select';
    canvas.defaultCursor = tool === 'select' ? 'default' : 'crosshair';
    canvas.getObjects().forEach((o) => {
      if (o.isHelper) return;
      o.selectable = tool === 'select';
      o.evented = tool === 'select' || tool === 'brush' || tool === 'eraser';
    });
    activeToolRef.current = tool;
    setActiveToolState(tool);
    if (tool === 'crop') startCropInternal();
  }, []);

  // ── Brush configuration ──────────────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || (activeTool !== 'brush' && activeTool !== 'eraser')) return;
    const brush = new PencilBrush(canvas);
    const opacity = clamp(brushOpacity, 0, 100) / 100;
    const hex = brushColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2) || '1e', 16);
    const g = parseInt(hex.slice(2, 4) || '1e', 16);
    const b = parseInt(hex.slice(4, 6) || '1e', 16);

    let width = brushSize;
    let cap: CanvasLineCap = 'round';
    let alpha = opacity;
    if (activeTool === 'brush') {
      if (brushKind === 'pencil') width = Math.max(1, brushSize * 0.4);
      if (brushKind === 'marker') width = brushSize * 1.3;
      if (brushKind === 'airbrush') alpha = opacity * 0.6;
      if (brushKind === 'highlighter') {
        width = brushSize * 1.6;
        alpha = opacity * 0.45;
        cap = 'square';
      }
      if (brushKind === 'calligraphy') cap = 'square';
    }

    brush.width = activeTool === 'eraser' ? brushSize : width;
    brush.color = `rgba(${r}, ${g}, ${b}, ${activeTool === 'eraser' ? 1 : alpha})`;
    brush.strokeLineCap = activeTool === 'eraser' ? 'round' : cap;

    const softness = activeTool === 'brush' ? clamp(100 - brushHardness, 0, 100) : 0;
    if (softness > 0) {
      brush.shadow = new Shadow({ color: brushColor, blur: (softness / 100) * brush.width });
    } else {
      brush.shadow = null;
    }

    canvas.freeDrawingBrush = brush;
  }, [activeTool, brushColor, brushSize, brushHardness, brushOpacity, brushKind]);

  // ── Pointer / tool interaction (rect/ellipse/lasso select, magic wand, bucket, eyedropper) ──

  const clearSelectionOverlay = useCallback(() => {
    const canvas = fabricRef.current;
    if (selectionOverlayRef.current && canvas) canvas.remove(selectionOverlayRef.current);
    if (lassoOverlayRef.current && canvas) canvas.remove(lassoOverlayRef.current);
    selectionOverlayRef.current = null;
    lassoOverlayRef.current = null;
    lassoPointsRef.current = [];
    setHasActiveSelectionShape(false);
    canvas?.requestRenderAll();
  }, []);

  function toLocalPixel(target: FabricObject, canvasPoint: Pt): Pt {
    const matrix = target.calcTransformMatrix();
    const inverted = util.invertTransform(matrix);
    const local = util.transformPoint(new Point(canvasPoint.x, canvasPoint.y), inverted);
    const w = target.width ?? 0;
    const h = target.height ?? 0;
    return { x: local.x + w / 2, y: local.y + h / 2 };
  }

  const getActiveImageTarget = useCallback((): FabricImage | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    const active = canvas.getActiveObject();
    if (isImageLayer(active)) return active;
    const topImage = [...canvas.getObjects()].reverse().find((o) => !o.isHelper && isImageLayer(o));
    return isImageLayer(topImage) ? topImage : null;
  }, []);

  const runMagicWand = useCallback(
    (pointer: Pt) => {
      const canvas = fabricRef.current;
      const target = getActiveImageTarget();
      if (!canvas || !target) {
        setError('Add or select an image layer first, then click on it with the Magic Wand.');
        return;
      }
      try {
        const local = toLocalPixel(target, pointer);
        const element = target.getElement() as HTMLImageElement | HTMLCanvasElement;
        const mask = floodFillMask(element, local.x, local.y, magicWandToleranceRef.current);
        const clip = maskToClipPath(mask, target, false);
        target.set('clipPath', undefined);
        canvas.remove(...canvas.getObjects().filter((o) => o.isHelper && o.layerName === '__magicwand-preview'));
        const preview = new FabricImage(mask, {
          left: target.left,
          top: target.top,
          originX: target.originX,
          originY: target.originY,
          angle: target.angle,
          scaleX: (target.scaleX ?? 1) * ((target.width ?? mask.width) / mask.width),
          scaleY: (target.scaleY ?? 1) * ((target.height ?? mask.height) / mask.height),
          opacity: 0.35,
          selectable: false,
          evented: false,
        });
        preview.isHelper = true;
        preview.layerName = '__magicwand-preview';
        preview.set({ globalCompositeOperation: 'multiply' });
        canvas.add(preview);
        canvas.requestRenderAll();
        (target as unknown as { __pendingMask?: HTMLCanvasElement }).__pendingMask = mask;
        setHasActiveSelectionShape(true);
      } catch {
        setError('Could not compute the magic wand selection.');
      }
    },
    [getActiveImageTarget]
  );

  const runEyedropper = useCallback((pointer: Pt) => {
    const el = canvasElRef.current;
    const canvas = fabricRef.current;
    if (!el || !canvas) return;
    const z = canvas.getZoom();
    const color = pickColorFromCanvas(el, pointer.x * z, pointer.y * z);
    if (color) {
      setPickedColor(color);
      setFillColorState(color);
      setBrushColor(color);
    }
  }, []);

  const runBucketFill = useCallback(
    (pointer: Pt) => {
      const canvas = fabricRef.current;
      const target = getActiveImageTarget();
      if (!canvas || !target) {
        setError('Add or select an image layer first, then click with the Paint Bucket.');
        return;
      }
      try {
        const local = toLocalPixel(target, pointer);
        const element = target.getElement() as HTMLImageElement | HTMLCanvasElement;
        const mask = floodFillMask(element, local.x, local.y, magicWandToleranceRef.current);
        const fillRect = new Rect({
          left: target.left,
          top: target.top,
          originX: target.originX,
          originY: target.originY,
          angle: target.angle,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
          width: target.width,
          height: target.height,
          fill: fillColorRef.current,
        });
        fillRect.clipPath = maskToClipPath(mask, fillRect, false);
        fillRect.id = uid();
        fillRect.layerName = 'Bucket Fill';
        const idx = canvas.getObjects().indexOf(target);
        canvas.insertAt(idx + 1, fillRect);
        canvas.setActiveObject(fillRect);
        pushHistory('Bucket Fill');
      } catch {
        setError('Could not fill this area.');
      }
    },
    [getActiveImageTarget, pushHistory]
  );

  function makeSelectionClipGeometry(inverted: boolean): FabricObject | null {
    if (selectionOverlayRef.current) {
      const s = selectionOverlayRef.current;
      if (s instanceof Ellipse) {
        return new Ellipse({
          left: s.left,
          top: s.top,
          rx: s.rx,
          ry: s.ry,
          originX: 'left',
          originY: 'top',
          absolutePositioned: true,
          inverted,
        });
      }
      return new Rect({
        left: s.left,
        top: s.top,
        width: s.width,
        height: s.height,
        originX: 'left',
        originY: 'top',
        absolutePositioned: true,
        inverted,
      });
    }
    if (lassoOverlayRef.current && lassoPointsRef.current.length > 2) {
      return new Polygon([...lassoPointsRef.current], {
        absolutePositioned: true,
        inverted,
      });
    }
    return null;
  }

  const deleteInSelection = useCallback(() => {
    const canvas = fabricRef.current;
    const target = getActiveImageTarget();
    if (!canvas || !target) return;

    if (activeToolRef.current === 'magic-wand') {
      const pending = (target as unknown as { __pendingMask?: HTMLCanvasElement }).__pendingMask;
      if (pending) {
        const clip = maskToClipPath(pending, target, true);
        target.clipPath = target.clipPath
          ? util.mergeClipPaths(target.clipPath as unknown as FabricObject, clip as unknown as FabricObject)
          : clip;
      }
    } else {
      const clip = makeSelectionClipGeometry(true);
      if (clip) {
        target.clipPath = target.clipPath
          ? util.mergeClipPaths(target.clipPath as unknown as FabricObject, clip as unknown as FabricObject)
          : clip;
      }
    }
    canvas.getObjects().forEach((o) => {
      if (o.isHelper && o.layerName === '__magicwand-preview') canvas.remove(o);
    });
    clearSelectionOverlay();
    canvas.requestRenderAll();
    pushHistory('Delete in Selection');
  }, [clearSelectionOverlay, getActiveImageTarget, pushHistory]);

  const fillInSelection = useCallback(() => {
    const canvas = fabricRef.current;
    const target = getActiveImageTarget();
    if (!canvas) return;

    let fillShape: FabricObject | null = null;
    if (activeToolRef.current === 'magic-wand' && target) {
      const pending = (target as unknown as { __pendingMask?: HTMLCanvasElement }).__pendingMask;
      if (pending) {
        const rect = new Rect({
          left: target.left,
          top: target.top,
          originX: target.originX,
          originY: target.originY,
          angle: target.angle,
          scaleX: target.scaleX,
          scaleY: target.scaleY,
          width: target.width,
          height: target.height,
          fill: fillColorRef.current,
        });
        rect.clipPath = maskToClipPath(pending, rect, false);
        fillShape = rect;
      }
    } else {
      fillShape = makeSelectionClipGeometry(false);
      if (fillShape) fillShape.set('fill', fillColorRef.current);
    }
    if (!fillShape) return;
    fillShape.id = uid();
    fillShape.layerName = 'Fill';
    if (target) {
      const idx = canvas.getObjects().indexOf(target);
      canvas.insertAt(idx + 1, fillShape);
    } else {
      canvas.add(fillShape);
    }
    canvas.getObjects().forEach((o) => {
      if (o.isHelper && o.layerName === '__magicwand-preview') canvas.remove(o);
    });
    clearSelectionOverlay();
    canvas.setActiveObject(fillShape);
    pushHistory('Fill Selection');
  }, [clearSelectionOverlay, getActiveImageTarget, pushHistory]);

  // ── Shared canvas pointer handlers (bound once at mount) ─────────────────

  function handleMouseDown(opt: { e: MouseEvent; target?: FabricObject }) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const evt = opt.e;
    if (spaceHeldRef.current) {
      isPanningRef.current = true;
      lastPanPointRef.current = { x: evt.clientX, y: evt.clientY };
      return;
    }
    const tool = activeToolRef.current;
    const pointer = canvas.getScenePoint(evt);

    if (tool === 'rect-select' || tool === 'ellipse-select') {
      if (opt.target && opt.target === selectionOverlayRef.current) return;
      clearSelectionOverlay();
      isDrawingSelectionRef.current = true;
      selectionStartRef.current = pointer;
      const common = {
        left: pointer.x,
        top: pointer.y,
        fill: 'rgba(79,70,229,0.15)',
        stroke: '#4f46e5',
        strokeDashArray: [6, 4],
        strokeWidth: 1,
        originX: 'left' as const,
        originY: 'top' as const,
        selectable: false,
        evented: false,
      };
      const shape = tool === 'rect-select' ? new Rect({ ...common, width: 1, height: 1 }) : new Ellipse({ ...common, rx: 1, ry: 1 });
      shape.isHelper = true;
      selectionOverlayRef.current = shape;
      canvas.add(shape);
      return;
    }

    if (tool === 'lasso-select') {
      clearSelectionOverlay();
      isDrawingLassoRef.current = true;
      lassoPointsRef.current = [pointer];
      return;
    }

    if (tool === 'magic-wand') {
      runMagicWand(pointer);
      return;
    }

    if (tool === 'bucket') {
      runBucketFill(pointer);
      return;
    }

    if (tool === 'eyedropper') {
      runEyedropper(pointer);
      return;
    }

    if (tool === 'text') {
      addTextAt(pointer);
      return;
    }

    if (tool === 'shape') {
      addShapeAt(pointer, shapeKindRef.current);
      return;
    }
  }

  function handleMouseMove(opt: { e: MouseEvent }) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const evt = opt.e;

    if (isPanningRef.current && lastPanPointRef.current) {
      const dx = evt.clientX - lastPanPointRef.current.x;
      const dy = evt.clientY - lastPanPointRef.current.y;
      const viewport = viewportRef.current;
      if (viewport) {
        viewport.scrollLeft -= dx;
        viewport.scrollTop -= dy;
      }
      lastPanPointRef.current = { x: evt.clientX, y: evt.clientY };
      return;
    }

    const tool = activeToolRef.current;
    const pointer = canvas.getScenePoint(evt);

    if ((tool === 'rect-select' || tool === 'ellipse-select') && isDrawingSelectionRef.current && selectionOverlayRef.current && selectionStartRef.current) {
      const shape = selectionOverlayRef.current;
      const start = selectionStartRef.current;
      const w = Math.abs(pointer.x - start.x);
      const h = Math.abs(pointer.y - start.y);
      const left = Math.min(pointer.x, start.x);
      const top = Math.min(pointer.y, start.y);
      if (shape instanceof Ellipse) {
        shape.set({ left, top, rx: w / 2, ry: h / 2 });
      } else {
        shape.set({ left, top, width: w, height: h });
      }
      canvas.requestRenderAll();
      return;
    }

    if (tool === 'lasso-select' && isDrawingLassoRef.current) {
      lassoPointsRef.current.push(pointer);
      if (lassoOverlayRef.current) canvas.remove(lassoOverlayRef.current);
      const poly = new Polygon([...lassoPointsRef.current], {
        fill: 'rgba(79,70,229,0.15)',
        stroke: '#4f46e5',
        strokeDashArray: [6, 4],
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      poly.isHelper = true;
      lassoOverlayRef.current = poly;
      canvas.add(poly);
      canvas.requestRenderAll();
      return;
    }
  }

  function handleMouseUp() {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      lastPanPointRef.current = null;
      return;
    }
    const tool = activeToolRef.current;
    const canvas = fabricRef.current;
    if ((tool === 'rect-select' || tool === 'ellipse-select') && isDrawingSelectionRef.current) {
      isDrawingSelectionRef.current = false;
      setHasActiveSelectionShape(!!selectionOverlayRef.current);
    }
    if (tool === 'lasso-select' && isDrawingLassoRef.current) {
      isDrawingLassoRef.current = false;
      setHasActiveSelectionShape(lassoPointsRef.current.length > 2);
    }
    canvas?.requestRenderAll();
  }

  latestHandlersRef.current = { down: handleMouseDown, move: handleMouseMove, up: handleMouseUp };

  // ── Text ─────────────────────────────────────────────────────────────────

  const addTextAt = useCallback(
    (pointer: Pt) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const text = new Textbox('Double-click to edit', {
        left: pointer.x,
        top: pointer.y,
        fontFamily: 'Arial',
        fontSize: 42,
        fill: strokeColor === '#1e1e1e' ? '#1e1e1e' : strokeColor,
        width: 260,
      });
      text.id = uid();
      text.layerName = 'Text';
      canvas.add(text);
      canvas.setActiveObject(text);
      pushHistory('Add Text');
      setActiveTool('select');
    },
    [pushHistory, setActiveTool, strokeColor]
  );

  const updateActiveText = useCallback(
    (props: Partial<Textbox>) => {
      const canvas = fabricRef.current;
      const active = canvas?.getActiveObject();
      if (!canvas || !active || !(active instanceof Textbox)) return;
      active.set(props as never);
      canvas.requestRenderAll();
    },
    []
  );

  const commitActiveTextChange = useCallback(() => pushHistory('Edit Text'), [pushHistory]);

  // ── Shapes ───────────────────────────────────────────────────────────────

  const addShapeAt = useCallback(
    (pointer: Pt, kind: ShapeKind) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const common = {
        left: pointer.x,
        top: pointer.y,
        fill: fillColorRef.current,
        stroke: strokeColor,
        strokeWidth,
        originX: 'center' as const,
        originY: 'center' as const,
      };
      let shape: FabricObject;
      switch (kind) {
        case 'rounded-rect':
          shape = new Rect({ ...common, width: 220, height: 140, rx: cornerRadius, ry: cornerRadius });
          break;
        case 'rect':
          shape = new Rect({ ...common, width: 220, height: 140 });
          break;
        case 'ellipse':
          shape = new Ellipse({ ...common, rx: 110, ry: 80 });
          break;
        case 'triangle':
          shape = new Triangle({ ...common, width: 200, height: 170 });
          break;
        case 'line':
          shape = new Line([pointer.x - 100, pointer.y, pointer.x + 100, pointer.y], {
            stroke: strokeColor,
            strokeWidth: Math.max(2, strokeWidth),
          });
          break;
        case 'arrow':
          shape = new Polygon(arrowPoints(200, 18), { ...common, originX: 'left', originY: 'top', left: pointer.x - 100, top: pointer.y - 27 });
          break;
        case 'polygon':
          shape = new Polygon(polygonPoints(6, 100), { ...common, originX: 'left', originY: 'top', left: pointer.x - 100, top: pointer.y - 100 });
          break;
        case 'star':
          shape = new Polygon(starPoints(5, 100, 42), { ...common, originX: 'left', originY: 'top', left: pointer.x - 100, top: pointer.y - 100 });
          break;
        case 'heart':
          shape = new Path(HEART_PATH_DATA, { ...common, originX: 'left', originY: 'top', left: pointer.x - 50, top: pointer.y - 45 });
          break;
        default:
          shape = new Rect({ ...common, width: 220, height: 140 });
      }
      shape.id = uid();
      shape.layerName = kind.replace('-', ' ');
      canvas.add(shape);
      canvas.setActiveObject(shape);
      pushHistory('Add Shape');
      setActiveTool('select');
    },
    [cornerRadius, pushHistory, setActiveTool, strokeColor, strokeWidth]
  );

  const addGradientFill = useCallback(
    (colorA: string, colorB: string, angleDeg: number) => {
      const canvas = fabricRef.current;
      if (!canvas || docSizeRef.current.width === 0) return;
      const { width, height } = docSizeRef.current;
      const rad = (angleDeg * Math.PI) / 180;
      const dx = (Math.cos(rad) * width) / 2;
      const dy = (Math.sin(rad) * height) / 2;

      const gradientRect = new Rect({
        left: 0,
        top: 0,
        width,
        height,
        originX: 'left',
        originY: 'top',
      });
      gradientRect.set(
        'fill',
        new Gradient({
          type: 'linear',
          coords: { x1: width / 2 - dx, y1: height / 2 - dy, x2: width / 2 + dx, y2: height / 2 + dy },
          colorStops: [
            { offset: 0, color: colorA },
            { offset: 1, color: colorB },
          ],
        })
      );
      gradientRect.id = uid();
      gradientRect.layerName = 'Gradient';
      canvas.add(gradientRect);
      canvas.setActiveObject(gradientRect);
      pushHistory('Add Gradient');
    },
    [pushHistory]
  );

  // ── Crop ─────────────────────────────────────────────────────────────────

  function startCropInternal() {
    const canvas = fabricRef.current;
    if (!canvas || docSizeRef.current.width === 0) return;
    const { width, height } = docSizeRef.current;
    const margin = Math.min(width, height) * 0.1;
    const rect = new Rect({
      left: margin,
      top: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      fill: 'rgba(0,0,0,0)',
      stroke: '#ffffff',
      strokeWidth: 2,
      strokeDashArray: [8, 6],
      originX: 'left',
      originY: 'top',
      lockRotation: true,
      cornerColor: '#4f46e5',
      transparentCorners: false,
    });
    rect.isHelper = true;
    cropOverlayRef.current = rect;
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setIsCropping(true);
  }

  function cancelCropInternal() {
    const canvas = fabricRef.current;
    if (cropOverlayRef.current && canvas) canvas.remove(cropOverlayRef.current);
    cropOverlayRef.current = null;
    setIsCropping(false);
    setCropRotation(0);
  }

  const cancelCrop = useCallback(() => {
    cancelCropInternal();
    setActiveTool('select');
  }, [setActiveTool]);

  const applyCropRatio = useCallback((preset: CropRatioPreset, size?: DocSize) => {
    setCropRatioState(preset);
    const rect = cropOverlayRef.current;
    const canvas = fabricRef.current;
    if (!rect || !canvas) return;
    const { width: docW, height: docH } = docSizeRef.current;
    let w = rect.width ?? docW * 0.8;
    let h = rect.height ?? docH * 0.8;
    if (size) {
      const scale = Math.min(docW / size.width, docH / size.height, 1) * 0.9;
      w = size.width * scale;
      h = size.height * scale;
    } else if (preset.ratio) {
      const maxW = docW * 0.9;
      const maxH = docH * 0.9;
      if (maxW / preset.ratio <= maxH) {
        w = maxW;
        h = maxW / preset.ratio;
      } else {
        h = maxH;
        w = maxH * preset.ratio;
      }
    }
    rect.set({ width: w, height: h, left: (docW - w) / 2, top: (docH - h) / 2 });
    canvas.requestRenderAll();
  }, []);

  const confirmCrop = useCallback(() => {
    const canvas = fabricRef.current;
    const rect = cropOverlayRef.current;
    if (!canvas || !rect) return;

    if (cropRotation !== 0) {
      const objects = canvas.getObjects().filter((o) => !o.isHelper);
      if (objects.length) {
        const selection = new ActiveSelection(objects, { canvas });
        selection.rotate((selection.angle || 0) + cropRotation);
        selection.setCoords();
        canvas.setActiveObject(selection);
        canvas.discardActiveObject();
      }
    }

    const rectLeft = rect.left ?? 0;
    const rectTop = rect.top ?? 0;
    const rectW = Math.round(rect.getScaledWidth());
    const rectH = Math.round(rect.getScaledHeight());
    canvas.remove(rect);
    cropOverlayRef.current = null;

    canvas.getObjects().forEach((o) => {
      o.set({ left: (o.left ?? 0) - rectLeft, top: (o.top ?? 0) - rectTop });
      o.setCoords();
    });
    canvas.setDimensions({ width: rectW, height: rectH });
    docSizeRef.current = { width: rectW, height: rectH };
    setDocSize({ width: rectW, height: rectH });
    setIsCropping(false);
    setCropRotation(0);
    canvas.requestRenderAll();
    pushHistory('Crop');
    setActiveTool('select');
    zoomToFitDeferred();
  }, [cropRotation, pushHistory, setActiveTool]);

  // ── Layer operations ─────────────────────────────────────────────────────

  const setActiveLayer = useCallback(
    (id: string) => {
      const canvas = fabricRef.current;
      const obj = findLayer(id);
      if (!canvas || !obj) return;
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      refreshLayers();
    },
    [findLayer, refreshLayers]
  );

  const duplicateLayer = useCallback(
    async (id: string) => {
      const canvas = fabricRef.current;
      const obj = findLayer(id);
      if (!canvas || !obj) return;
      const clone = await obj.clone([...CUSTOM_PROPS]);
      clone.id = uid();
      clone.layerName = `${obj.layerName || 'Layer'} copy`;
      clone.set({ left: (obj.left ?? 0) + 20, top: (obj.top ?? 0) + 20 });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      pushHistory('Duplicate Layer');
    },
    [findLayer, pushHistory]
  );

  const removeLayer = useCallback(
    (id: string) => {
      const canvas = fabricRef.current;
      const obj = findLayer(id);
      if (!canvas || !obj) return;
      canvas.remove(obj);
      pushHistory('Delete Layer');
    },
    [findLayer, pushHistory]
  );

  const renameLayer = useCallback(
    (id: string, name: string) => {
      const obj = findLayer(id);
      if (!obj) return;
      obj.layerName = name.slice(0, 60);
      refreshLayers();
      scheduleAutosave();
    },
    [findLayer, refreshLayers, scheduleAutosave]
  );

  const reorderLayer = useCallback(
    (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
      const canvas = fabricRef.current;
      const obj = findLayer(id);
      if (!canvas || !obj) return;
      if (direction === 'up') canvas.bringObjectForward(obj);
      if (direction === 'down') canvas.sendObjectBackwards(obj);
      if (direction === 'top') canvas.bringObjectToFront(obj);
      if (direction === 'bottom') canvas.sendObjectToBack(obj);
      refreshLayers();
      pushHistory('Reorder Layer');
    },
    [findLayer, pushHistory, refreshLayers]
  );

  const setLayerOpacity = useCallback(
    (id: string, opacity: number) => {
      const obj = findLayer(id);
      if (!obj) return;
      obj.set('opacity', clamp(opacity, 0, 100) / 100);
      fabricRef.current?.requestRenderAll();
      refreshLayers();
    },
    [findLayer, refreshLayers]
  );

  const commitLayerOpacity = useCallback(() => pushHistory('Layer Opacity'), [pushHistory]);

  const setLayerBlendMode = useCallback(
    (id: string, mode: BlendMode) => {
      const obj = findLayer(id);
      if (!obj) return;
      obj.set('globalCompositeOperation', mode === 'source-over' ? undefined : mode);
      fabricRef.current?.requestRenderAll();
      refreshLayers();
      pushHistory('Blend Mode');
    },
    [findLayer, pushHistory, refreshLayers]
  );

  const toggleLayerVisibility = useCallback(
    (id: string) => {
      const obj = findLayer(id);
      if (!obj) return;
      obj.set('visible', !(obj.visible !== false));
      fabricRef.current?.requestRenderAll();
      refreshLayers();
      pushHistory('Toggle Visibility');
    },
    [findLayer, pushHistory, refreshLayers]
  );

  const toggleLayerLock = useCallback(
    (id: string) => {
      const obj = findLayer(id);
      const canvas = fabricRef.current;
      if (!obj || !canvas) return;
      const next = !obj.isLocked;
      obj.isLocked = next;
      obj.selectable = !next && activeToolRef.current === 'select';
      obj.lockMovementX = next;
      obj.lockMovementY = next;
      obj.lockScalingX = next;
      obj.lockScalingY = next;
      obj.lockRotation = next;
      canvas.requestRenderAll();
      refreshLayers();
    },
    [findLayer, refreshLayers]
  );

  const mergeDown = useCallback(
    async (id: string) => {
      const canvas = fabricRef.current;
      const obj = findLayer(id);
      if (!canvas || !obj) return;
      const objects = canvas.getObjects().filter((o) => !o.isHelper);
      const index = objects.indexOf(obj);
      if (index <= 0) return;
      const below = objects[index - 1];
      const temp = new ActiveSelection([below, obj], { canvas });
      canvas.setActiveObject(temp);
      const bounds = temp.getBoundingRect();
      const dataUrl = temp.toDataURL({ format: 'png', multiplier: 1 });
      canvas.discardActiveObject();
      canvas.remove(below, obj);
      const flattened = await FabricImage.fromURL(dataUrl, {});
      flattened.set({ left: bounds.left + bounds.width / 2, top: bounds.top + bounds.height / 2, originX: 'center', originY: 'center' });
      flattened.id = uid();
      flattened.layerName = 'Merged Layer';
      canvas.insertAt(index - 1, flattened);
      canvas.setActiveObject(flattened);
      pushHistory('Merge Down');
    },
    [findLayer, pushHistory]
  );

  const flattenAll = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects().filter((o) => !o.isHelper);
    if (objects.length < 2) return;
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
    canvas.clear();
    const flat = await FabricImage.fromURL(dataUrl, {});
    flat.set({
      left: docSizeRef.current.width / 2,
      top: docSizeRef.current.height / 2,
      originX: 'center',
      originY: 'center',
    });
    flat.id = uid();
    flat.layerName = 'Flattened Image';
    canvas.add(flat);
    canvas.setActiveObject(flat);
    pushHistory('Flatten Image');
  }, [pushHistory]);

  // ── Adjustments & filters (active image layer) ───────────────────────────

  const applyAdjustmentsToTarget = useCallback((target: FabricImage, values: AdjustmentValues) => {
    const list: ImageFilter[] = [];
    if (values.brightness !== 0) list.push(new filters.Brightness({ brightness: values.brightness / 100 }));
    if (values.contrast !== 0) list.push(new filters.Contrast({ contrast: values.contrast / 100 }));
    if (values.saturation !== 0) list.push(new filters.Saturation({ saturation: values.saturation / 100 }));
    if (values.hue !== 0) list.push(new filters.HueRotation({ rotation: (values.hue * Math.PI) / 180 }));
    if (values.temperature !== 0) {
      // Warm/cool cast via a hand-built ColorMatrix: push red up / blue down (or the reverse) by `offset`.
      const offset = (values.temperature / 100) * 60;
      list.push(
        new filters.ColorMatrix({
          matrix: [1, 0, 0, 0, offset, 0, 1, 0, 0, 0, 0, 0, 1, 0, -offset, 0, 0, 0, 1, 0],
        })
      );
    }
    if (values.sharpen > 0) {
      const s = values.sharpen / 100;
      list.push(
        new filters.Convolute({
          matrix: [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0],
        })
      );
    }
    const effectFilters = target.filters.filter((f) => (f as unknown as { __isEffect?: boolean }).__isEffect);
    target.filters = [...list, ...effectFilters];
    target.applyFilters();
    fabricRef.current?.requestRenderAll();
  }, []);

  const applyEffectFiltersToTarget = useCallback((target: FabricImage, values: FilterValues) => {
    const list: ImageFilter[] = [];
    if (values.grayscale) list.push(new filters.Grayscale());
    if (values.sepia) list.push(new filters.Sepia());
    if (values.invert) list.push(new filters.Invert());
    if (values.blur > 0) list.push(new filters.Blur({ blur: values.blur }));
    if (values.pixelate > 0) list.push(new filters.Pixelate({ blocksize: values.pixelate }));
    if (values.noise > 0) list.push(new filters.Noise({ noise: values.noise }));
    list.forEach((f) => ((f as unknown as { __isEffect?: boolean }).__isEffect = true));
    const nonEffect = target.filters.filter((f) => !(f as unknown as { __isEffect?: boolean }).__isEffect);
    target.filters = [...nonEffect, ...list];
    target.applyFilters();
    fabricRef.current?.requestRenderAll();
  }, []);

  const setAdjustment = useCallback(
    (key: keyof AdjustmentValues, value: number) => {
      setAdjustmentsState((prev) => {
        const next = { ...prev, [key]: value };
        const target = getActiveImageTarget();
        if (target) applyAdjustmentsToTarget(target, next);
        return next;
      });
    },
    [applyAdjustmentsToTarget, getActiveImageTarget]
  );

  const commitAdjustment = useCallback(() => pushHistory('Adjust Image'), [pushHistory]);

  const resetAdjustments = useCallback(() => {
    setAdjustmentsState(DEFAULT_ADJUSTMENTS);
    const target = getActiveImageTarget();
    if (target) applyAdjustmentsToTarget(target, DEFAULT_ADJUSTMENTS);
    pushHistory('Reset Adjustments');
  }, [applyAdjustmentsToTarget, getActiveImageTarget, pushHistory]);

  const setFilterValue = useCallback(
    (key: keyof FilterValues, value: boolean | number) => {
      setFilterValuesState((prev) => {
        const next = { ...prev, [key]: value } as FilterValues;
        const target = getActiveImageTarget();
        if (target) applyEffectFiltersToTarget(target, next);
        return next;
      });
    },
    [applyEffectFiltersToTarget, getActiveImageTarget]
  );

  const commitFilter = useCallback(() => pushHistory('Apply Filter'), [pushHistory]);

  // Vignette is composited as an overlay object (radial dark gradient,
  // multiply blend) rather than a pixel filter, so it works on the whole
  // document rather than requiring a single target image.
  const applyVignette = useCallback(
    (amount: number) => {
      const canvas = fabricRef.current;
      if (!canvas || docSizeRef.current.width === 0) return;
      canvas.getObjects().forEach((o) => {
        if (o.isHelper && o.layerName === '__vignette') canvas.remove(o);
      });
      if (amount <= 0) {
        canvas.requestRenderAll();
        return;
      }
      const { width, height } = docSizeRef.current;
      const r = Math.max(width, height) * 0.75;
      const overlay = new Ellipse({
        left: 0,
        top: 0,
        width,
        height,
        rx: width / 2,
        ry: height / 2,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
      });
      overlay.set('fill', {
        type: 'radial',
        coords: { x1: width / 2, y1: height / 2, x2: width / 2, y2: height / 2, r1: 0, r2: r },
        colorStops: [
          { offset: 0, color: 'rgba(0,0,0,0)' },
          { offset: 0.65, color: 'rgba(0,0,0,0)' },
          { offset: 1, color: `rgba(0,0,0,${clamp(amount, 0, 100) / 100})` },
        ],
      } as never);
      overlay.set('globalCompositeOperation', 'multiply');
      overlay.isHelper = false;
      overlay.layerName = '__vignette';
      overlay.selectable = false;
      overlay.evented = false;
      canvas.add(overlay);
      canvas.requestRenderAll();
    },
    []
  );

  // ── Export ───────────────────────────────────────────────────────────────

  const exportImage = useCallback(async (opts: ExportOptions) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setIsBusy(true);
    try {
      const currentZoom = canvas.getZoom();
      canvas.setZoom(1);
      canvas.setDimensions({ width: docSizeRef.current.width, height: docSizeRef.current.height });
      const blob = await exportCanvasToBlob(canvas, opts);
      canvas.setZoom(currentZoom);
      canvas.setDimensions({
        width: docSizeRef.current.width * currentZoom,
        height: docSizeRef.current.height * currentZoom,
      });
      downloadBlob(blob, opts.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setIsBusy(false);
    }
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      const canvas = fabricRef.current;
      if (e.code === 'Space' && !isTypingTarget(document.activeElement)) {
        spaceHeldRef.current = true;
      }
      if (isTypingTarget(document.activeElement)) return;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const active = canvas?.getActiveObject();
        if (active?.id) void duplicateLayer(active.id);
        return;
      }
      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (canvas) {
          const objects = canvas.getObjects().filter((o) => !o.isHelper);
          canvas.setActiveObject(new ActiveSelection(objects, { canvas }));
          canvas.requestRenderAll();
        }
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas) {
        const active = canvas.getActiveObject();
        if (active?.id) {
          e.preventDefault();
          removeLayer(active.id);
        }
        return;
      }
      if (e.key === 'Escape') {
        clearSelectionOverlay();
        if (activeToolRef.current === 'crop') cancelCrop();
        return;
      }
      if (!mod) {
        if (e.key.toLowerCase() === 'v') setActiveTool('select');
        if (e.key.toLowerCase() === 'c' && !isCropping) setActiveTool('crop');
        if (e.key.toLowerCase() === 'b') setActiveTool('brush');
        if (e.key.toLowerCase() === 't') setActiveTool('text');
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') spaceHeldRef.current = false;
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [cancelCrop, clearSelectionOverlay, duplicateLayer, isCropping, redo, removeLayer, setActiveTool, undo]);

  return {
    canvasElRef,
    viewportRef,
    ready,
    hasDocument,
    isBusy,
    error,
    setError,
    docSize,
    zoom,
    applyZoom,
    zoomIn,
    zoomOut,
    zoomToFit,

    activeTool,
    setActiveTool,

    layers,
    activeLayerId,
    activeLayerKind,
    setActiveLayer,
    duplicateLayer,
    removeLayer,
    renameLayer,
    reorderLayer,
    setLayerOpacity,
    commitLayerOpacity,
    setLayerBlendMode,
    toggleLayerVisibility,
    toggleLayerLock,
    mergeDown,
    flattenAll,

    history,
    historyIndex,
    undo,
    redo,
    jumpToHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    restorePrompt,
    restoreSession,
    dismissRestore,

    openFiles,
    newBlankDocument,
    newDocPresets: NEW_DOC_PRESETS,

    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    brushHardness,
    setBrushHardness,
    brushOpacity,
    setBrushOpacity,
    brushKind,
    setBrushKind,

    fillColor,
    setFillColor: setFillColorState,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    shapeKind,
    setShapeKind: setShapeKindState,
    cornerRadius,
    setCornerRadius,

    magicWandTolerance,
    setMagicWandTolerance: setMagicWandToleranceState,
    pickedColor,

    hasActiveSelectionShape,
    clearSelectionOverlay,
    deleteInSelection,
    fillInSelection,

    addTextAt,
    updateActiveText,
    commitActiveTextChange,
    addGradientFill,

    cropRatio,
    cropRotation,
    setCropRotation,
    applyCropRatio,
    confirmCrop,
    cancelCrop,
    isCropping,

    adjustments,
    setAdjustment,
    commitAdjustment,
    resetAdjustments,
    filterValues,
    setFilterValue,
    commitFilter,
    applyVignette,

    exportImage,
  };
}

export type UseImageEditorReturn = ReturnType<typeof useImageEditor>;
