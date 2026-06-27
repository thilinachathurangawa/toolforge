'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Pencil, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

type DrawMode = 'draw' | 'erase';

interface Point {
  x: number;
  y: number;
}

export function DrawingPad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#1e1e1e');
  const [brushSize, setBrushSize] = useState(4);
  const [mode, setMode] = useState<DrawMode>('draw');
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  const draw = useCallback((current: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = mode === 'erase' ? 'rgba(0,0,0,1)' : color;

    const last = lastPointRef.current;
    if (last) {
      const mid = { x: (last.x + current.x) / 2, y: (last.y + current.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(current.x, current.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPointRef.current = current;
  }, [color, brushSize, mode]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = null;
    draw(getPoint(e));
  }, [draw]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    draw(getPoint(e));
  }, [draw]);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent p-0.5"
            title="Pick color"
          />
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Size: {brushSize}px
          </label>
          <input
            type="range"
            min="1"
            max="40"
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
        </div>

        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setMode('draw')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              mode === 'draw'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <Pencil className="w-3.5 h-3.5" />
            Draw
          </button>
          <button
            onClick={() => setMode('erase')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              mode === 'erase'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <Eraser className="w-3.5 h-3.5" />
            Erase
          </button>
        </div>

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>

        <button
          onClick={downloadPng}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download PNG
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full border border-border rounded-lg cursor-crosshair touch-none"
        style={{ height: '500px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
