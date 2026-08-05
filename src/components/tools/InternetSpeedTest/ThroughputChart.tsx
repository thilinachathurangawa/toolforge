'use client';

import React from 'react';
import type { ThroughputPoint } from './types';

const W = 300;
const H = 100;
const PAD = 4;

/**
 * Speed over the course of the run, drawn as inline SVG (no chart library, so
 * the tool page's bundle stays flat). A sawtooth trace points at a congested or
 * throttled link; a flat one at a clean pipe.
 */
export function ThroughputChart({ points }: { points: ThroughputPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center rounded-lg bg-muted/50 text-xs text-muted-foreground">
        Collecting throughput samples...
      </div>
    );
  }

  const maxBps = Math.max(...points.map((p) => p.bps));
  const maxT = Math.max(...points.map((p) => p.t)) || 1;

  const x = (t: number) => PAD + (t / maxT) * (W - 2 * PAD);
  const y = (bps: number) => H - PAD - (bps / (maxBps || 1)) * (H - 2 * PAD);

  const line = (series: ThroughputPoint[]) =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t).toFixed(1)} ${y(p.bps).toFixed(1)}`).join(' ');

  const area = (series: ThroughputPoint[]) =>
    series.length < 2
      ? ''
      : `${line(series)} L ${x(series[series.length - 1].t).toFixed(1)} ${H - PAD} L ${x(series[0].t).toFixed(1)} ${H - PAD} Z`;

  const down = points.filter((p) => p.dir === 'down');
  const up = points.filter((p) => p.dir === 'up');
  const peak = maxBps / 1e6;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[120px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Throughput over the test, peaking at ${peak.toFixed(1)} megabits per second`}
      >
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + frac * (H - 2 * PAD)}
            y2={PAD + frac * (H - 2 * PAD)}
            className="stroke-border"
            strokeWidth={0.5}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {down.length > 1 && (
          <>
            <path d={area(down)} className="fill-accent/15" />
            <path
              d={line(down)}
              fill="none"
              className="stroke-accent"
              strokeWidth={1.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
        {up.length > 1 && (
          <path
            d={line(up)}
            fill="none"
            className="stroke-green-500"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeDasharray="4 2"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-accent" aria-hidden="true" />
            Download
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-green-500" aria-hidden="true" />
            Upload
          </span>
        </div>
        <span>Peak {peak.toFixed(1)} Mbps</span>
      </div>
    </div>
  );
}
