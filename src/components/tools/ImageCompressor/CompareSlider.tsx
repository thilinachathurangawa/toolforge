'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareSliderProps {
  originalUrl: string;
  compressedUrl: string;
  originalLabel: string;
  compressedLabel: string;
}

export function CompareSlider({
  originalUrl,
  compressedUrl,
  originalLabel,
  compressedLabel,
}: CompareSliderProps) {
  const [position, setPosition] = useState(50);
  const [actualSize, setActualSize] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPosition((p) => Math.max(0, p - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPosition((p) => Math.min(100, p + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPosition(100);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
            {originalLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            {compressedLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActualSize((v) => !v)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border border-border hover:bg-background transition-colors"
        >
          {actualSize ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          {actualSize ? 'Fit to width' : 'Actual pixels'}
        </button>
      </div>

      <div
        className={cn(
          'rounded-lg border border-border bg-background',
          actualSize ? 'overflow-auto max-h-[420px]' : 'overflow-hidden'
        )}
      >
        <div
          ref={containerRef}
          role="slider"
          tabIndex={0}
          aria-label="Compare original and compressed image"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% original shown`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative select-none touch-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-accent',
            actualSize ? 'inline-block' : 'block w-full'
          )}
        >
          {/* Compressed sits underneath and defines the box size */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={compressedUrl}
            alt={compressedLabel}
            draggable={false}
            className={cn('block', actualSize ? 'max-w-none' : 'w-full h-auto')}
          />
          {/* Original is clipped from the right edge by the divider */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt={originalLabel}
            draggable={false}
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />
          <div
            style={{ left: `${position}%` }}
            className="absolute top-0 bottom-0 w-0.5 -ml-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)] pointer-events-none"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-neutral-700 tracking-tighter">
                ◀▶
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Drag the divider (or use arrow keys) to compare. Switch to actual pixels to
        judge compression artifacts at full resolution.
      </p>
    </div>
  );
}
