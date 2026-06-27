'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Download, Trash2, RefreshCw, AlertTriangle, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type GridSize = 16 | 32 | 64;
type Tool = 'pen' | 'fill' | 'eraser';
type ConfirmAction =
  | { type: 'gridSize'; newSize: GridSize }
  | { type: 'clear' };

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#ff8800', '#ffff00', '#00cc00',
  '#0000ff', '#8800ff', '#ff00ff', '#00ccff', '#ff6688', '#88ff66',
  '#884400', '#444444', '#888888', '#cccccc',
];
const CELL_SIZE = 16;
const EXPORT_SCALE = 8;

function createEmptyGrid(size: GridSize): string[][] {
  return Array.from({ length: size }, () => Array(size).fill(''));
}

function floodFill(grid: string[][], row: number, col: number, fillColor: string): string[][] {
  const targetColor = grid[row][col];
  if (targetColor === fillColor) return grid;
  const newGrid = grid.map(r => [...r]);
  const queue: [number, number][] = [[row, col]];
  const size = newGrid.length;
  while (queue.length) {
    const item = queue.shift()!;
    const r = item[0];
    const c = item[1];
    if (r < 0 || r >= size || c < 0 || c >= size) continue;
    if (newGrid[r][c] !== targetColor) continue;
    newGrid[r][c] = fillColor;
    queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return newGrid;
}

function renderGrid(canvas: HTMLCanvasElement, grid: string[][], cellSize: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      if (!grid[r][c]) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#e0e0e0' : '#c8c8c8';
        ctx.fillRect(x, y, cellSize, cellSize);
      } else {
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, size * cellSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(size * cellSize, i * cellSize);
    ctx.stroke();
  }
}

function exportPng(grid: string[][], scale: number) {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = grid[0].length * scale;
  exportCanvas.height = grid.length * scale;
  const ctx = exportCanvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }
  const link = document.createElement('a');
  link.download = 'pixel-art.png';
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

export function PixelArtMaker() {
  const [gridSize, setGridSize] = useState<GridSize>(16);
  const [grid, setGrid] = useState<string[][]>(() => createEmptyGrid(16));
  const [currentColor, setCurrentColor] = useState('#000000');
  const [tool, setTool] = useState<Tool>('pen');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [pendingAction, setPendingAction] = useState<ConfirmAction | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = gridSize * CELL_SIZE;
    canvas.height = gridSize * CELL_SIZE;
    renderGrid(canvas, grid, CELL_SIZE);
  }, [grid, gridSize]);

  const getCellFromEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
    const row = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
    return [
      Math.max(0, Math.min(row, gridSize - 1)),
      Math.max(0, Math.min(col, gridSize - 1)),
    ];
  }, [gridSize]);

  const applyTool = useCallback((row: number, col: number) => {
    if (tool === 'pen') {
      setGrid(g => {
        const ng = g.map(r => [...r]);
        ng[row][col] = currentColor;
        return ng;
      });
    } else if (tool === 'eraser') {
      setGrid(g => {
        const ng = g.map(r => [...r]);
        ng[row][col] = '';
        return ng;
      });
    } else if (tool === 'fill') {
      setGrid(g => floodFill(g, row, col, currentColor));
    }
  }, [tool, currentColor]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const [row, col] = getCellFromEvent(e);
    applyTool(row, col);
  }, [getCellFromEvent, applyTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown || tool === 'fill') return;
    const [row, col] = getCellFromEvent(e);
    applyTool(row, col);
  }, [isMouseDown, tool, getCellFromEvent, applyTool]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const handleGridSizeChange = useCallback((newSize: GridSize) => {
    if (newSize === gridSize) return;
    setPendingAction({ type: 'gridSize', newSize });
  }, [gridSize]);

  const handleClear = useCallback(() => {
    setPendingAction({ type: 'clear' });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!pendingAction) return;
    if (pendingAction.type === 'gridSize') {
      setGridSize(pendingAction.newSize);
      setGrid(createEmptyGrid(pendingAction.newSize));
    } else {
      setGrid(createEmptyGrid(gridSize));
    }
    setPendingAction(null);
  }, [pendingAction, gridSize]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
  }, []);

  const handleDownload = useCallback(() => {
    exportPng(grid, EXPORT_SCALE);
  }, [grid]);

  const exportSizePx = gridSize * EXPORT_SCALE;

  const confirmMessage = pendingAction?.type === 'gridSize'
    ? `Changing to ${pendingAction.newSize}×${pendingAction.newSize} will clear your current artwork. This cannot be undone.`
    : 'This will clear your entire canvas. This cannot be undone.';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
        <div className="flex rounded-md border border-border overflow-hidden">
          {([16, 32, 64] as GridSize[]).map(size => (
            <button
              key={size}
              onClick={() => handleGridSizeChange(size)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                gridSize === size
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              )}
            >
              {size}×{size}
            </button>
          ))}
        </div>

        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setTool('pen')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors',
              tool === 'pen'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <Pencil className="w-3.5 h-3.5" />
            Pen
          </button>
          <button
            onClick={() => setTool('fill')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors',
              tool === 'fill'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Fill
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors',
              tool === 'eraser'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <Eraser className="w-3.5 h-3.5" />
            Eraser
          </button>
        </div>

        <input
          type="color"
          value={currentColor}
          onChange={e => setCurrentColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent p-0.5"
          title="Pick color"
        />

        <button
          onClick={handleClear}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download PNG
        </button>
      </div>

      {pendingAction && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Are you sure?</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">{confirmMessage}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-amber-300 dark:border-amber-600 bg-white dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Yes, clear it
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-8 gap-1">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setCurrentColor(c)}
            style={{ backgroundColor: c }}
            className={cn(
              'w-7 h-7 rounded border-2 transition-transform hover:scale-110',
              currentColor === c ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-border'
            )}
            title={c}
          />
        ))}
      </div>

      <div className="overflow-auto border border-border rounded-lg p-2 bg-muted/30">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {gridSize} × {gridSize} grid — {exportSizePx} × {exportSizePx} px export
      </p>
    </div>
  );
}
