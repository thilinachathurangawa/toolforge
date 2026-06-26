'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Trophy } from 'lucide-react';

const SIZE = 360;
const R = SIZE / 2;

interface Particle {
  x: number; y: number; vx: number; vy: number; color: string; life: number;
}

export function RandomPickerWheel() {
  const [raw, setRaw] = useState('Pizza\nSushi\nTacos\nBurgers\nSalad\nRamen');
  const [removeWinner, setRemoveWinner] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const velRef = useRef(0);
  const rafRef = useRef<number>();
  const confettiRef = useRef<Particle[]>([]);
  const confettiRafRef = useRef<number>();

  const items = raw.split('\n').map((s) => s.trim()).filter(Boolean);

  const sliceColor = (i: number, n: number) => `hsl(${Math.round((360 / Math.max(n, 1)) * i)}, 70%, 55%)`;

  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      const n = items.length;
      if (n === 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(R, R, R - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.font = '16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Add items below', R, R);
        return;
      }
      const seg = (Math.PI * 2) / n;
      for (let i = 0; i < n; i++) {
        const start = angle + i * seg;
        ctx.beginPath();
        ctx.moveTo(R, R);
        ctx.arc(R, R, R - 4, start, start + seg);
        ctx.closePath();
        ctx.fillStyle = sliceColor(i, n);
        ctx.fill();
        // label
        ctx.save();
        ctx.translate(R, R);
        ctx.rotate(start + seg / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 14px system-ui, sans-serif';
        const label = items[i].length > 16 ? items[i].slice(0, 15) + '…' : items[i];
        ctx.fillText(label, R - 18, 5);
        ctx.restore();
      }
      // hub
      ctx.beginPath();
      ctx.arc(R, R, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    },
    [items]
  );

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [drawWheel]);

  const runConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9'];
    confettiRef.current = Array.from({ length: 80 }, () => ({
      x: R,
      y: R,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));
    const step = () => {
      drawWheel(angleRef.current);
      let alive = false;
      confettiRef.current.forEach((p) => {
        p.vy += 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012;
        if (p.life > 0) {
          alive = true;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 7, 7);
          ctx.globalAlpha = 1;
        }
      });
      if (alive) confettiRafRef.current = requestAnimationFrame(step);
    };
    step();
  }, [drawWheel]);

  const spin = () => {
    if (spinning || items.length < 2) return;
    setWinner(null);
    setSpinning(true);
    velRef.current = 0.3 + Math.random() * 0.2;
    const friction = 0.991;
    const animate = () => {
      angleRef.current += velRef.current;
      velRef.current *= friction;
      drawWheel(angleRef.current);
      if (velRef.current > 0.002) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const n = items.length;
        const seg = (Math.PI * 2) / n;
        // Pointer sits at the top (-90°). Find which slice is under it.
        const normalized = ((angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const pointer = (Math.PI * 1.5 - normalized + Math.PI * 2) % (Math.PI * 2);
        const idx = Math.floor(pointer / seg) % n;
        const won = items[idx];
        setWinner(won);
        runConfetti();
        if (removeWinner) {
          setRaw(items.filter((_, i) => i !== idx).join('\n'));
        }
      }
    };
    animate();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (confettiRafRef.current) cancelAnimationFrame(confettiRafRef.current);
    };
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="flex flex-col items-center gap-5">
        <div className="relative" style={{ width: SIZE, maxWidth: '100%' }}>
          {/* pointer */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-1 z-10"
            style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '22px solid #0f172a' }}
          />
          <canvas ref={canvasRef} width={SIZE} height={SIZE} className="w-full h-auto" />
        </div>
        <button
          onClick={spin}
          disabled={spinning || items.length < 2}
          className="px-10 py-4 text-lg font-bold bg-accent text-white rounded-full hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg"
        >
          <Play size={22} /> {spinning ? 'Spinning…' : 'SPIN'}
        </button>
        {winner && (
          <div className="flex items-center gap-2 px-5 py-3 bg-accent/10 text-accent rounded-lg font-semibold">
            <Trophy size={20} /> Winner: {winner}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Entries (one per line)</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
          />
          <p className="text-xs text-muted-foreground">{items.length} entries</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={removeWinner} onChange={(e) => setRemoveWinner(e.target.checked)} className="accent-accent" />
          Remove the winner after each spin
        </label>
      </div>
    </div>
  );
}
