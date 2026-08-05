'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GaugeProps {
  /** Current value in Mbps. */
  value: number;
  /** Full-scale value in Mbps. */
  scale: number;
  /** Small caption above the number, e.g. "Download". */
  label: string;
  /** Tailwind text-colour class driving both the arc and the number. */
  colorClass: string;
  /** Shows the live dot while a test is in flight. */
  running?: boolean;
}

// Semicircular arc: left end (20,100) → right end (180,100) over the top.
// pathLength=100 lets the dash array be a straight percentage.
const ARC = 'M 20 100 A 80 80 0 0 1 180 100';

export function Gauge({ value, scale, label, colorClass, running = false }: GaugeProps) {
  const pct = Math.max(0, Math.min(100, (value / scale) * 100));

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 124"
        className="w-full max-w-[280px]"
        role="img"
        aria-label={`${label}: ${value > 0 ? `${value.toFixed(1)} Mbps` : 'not measured'} of a ${scale} Mbps scale`}
      >
        <path
          d={ARC}
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          className="stroke-muted"
        />
        <path
          d={ARC}
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          stroke="currentColor"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          className={cn('transition-all duration-500 ease-out motion-reduce:transition-none', colorClass)}
        />

        <text x="20" y="118" textAnchor="middle" className="fill-muted-foreground text-[9px]">
          0
        </text>
        <text x="180" y="118" textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {scale >= 1000 ? `${scale / 1000}G` : scale}
        </text>

        <text
          x="100"
          y="86"
          textAnchor="middle"
          className={cn('text-[30px] font-bold', colorClass)}
          fill="currentColor"
        >
          {value > 0 ? value.toFixed(1) : '—'}
        </text>
        <text x="100" y="102" textAnchor="middle" className="fill-muted-foreground text-[10px]">
          Mbps
        </text>
      </svg>

      <div className="flex items-center gap-2 -mt-1">
        {running && (
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        )}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
