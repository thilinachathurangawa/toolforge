'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Eraser, PenLine, Type } from 'lucide-react';

type Mode = 'draw' | 'type';

const CANVAS_W = 600;
const CANVAS_H = 220;

const FONTS = [
  { label: 'Dancing Script', css: '"Dancing Script", cursive' },
  { label: 'Caveat', css: '"Caveat", cursive' },
  { label: 'Pacifico', css: '"Pacifico", cursive' },
  { label: 'Satisfy', css: '"Satisfy", cursive' },
];

export function SignatureGenerator() {
  const [mode, setMode] = useState<Mode>('draw');
  const [penColor, setPenColor] = useState('#1e293b');
  const [penWidth, setPenWidth] = useState(3);
  const [typedText, setTypedText] = useState('Your Name');
  const [font, setFont] = useState(FONTS[0].css);
  const [typeSize, setTypeSize] = useState(72);
  const [fontsReady, setFontsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Load cursive web fonts from Google Fonts for the "type" mode only.
  useEffect(() => {
    const id = 'signature-cursive-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Caveat:wght@600&family=Pacifico&family=Satisfy&display=swap';
      document.head.appendChild(link);
    }
    if (typeof document !== 'undefined' && 'fonts' in document) {
      Promise.allSettled(
        FONTS.map((f) => (document as Document).fonts.load(`64px ${f.css}`))
      ).then(() => setFontsReady(true));
    } else {
      setFontsReady(true);
    }
  }, []);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const clear = useCallback(() => {
    const ctx = getCtx();
    if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const renderTyped = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = penColor;
    ctx.font = `${typeSize}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedText || ' ', CANVAS_W / 2, CANVAS_H / 2);
  }, [typedText, font, typeSize, penColor]);

  useEffect(() => {
    if (mode === 'type' && fontsReady) renderTyped();
  }, [mode, fontsReady, renderTyped]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (mode !== 'draw') return;
    drawing.current = true;
    last.current = pos(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || mode !== 'draw') return;
    const ctx = getCtx();
    const p = pos(e);
    if (ctx && last.current) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    last.current = p;
  };

  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    clear();
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'signature.png';
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex gap-2">
        <button
          onClick={() => switchMode('draw')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
            mode === 'draw' ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <PenLine size={16} /> Draw
        </button>
        <button
          onClick={() => switchMode('type')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
            mode === 'type' ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <Type size={16} /> Type
        </button>
      </div>

      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="w-full touch-none block"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, cursor: mode === 'draw' ? 'crosshair' : 'default' }}
        />
      </div>

      {mode === 'draw' ? (
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Pen color</label>
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 min-w-[180px]">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">Thickness: {penWidth}</label>
            <input type="range" min={1} max={12} value={penWidth} onChange={(e) => setPenWidth(+e.target.value)} className="flex-1 accent-accent" />
          </div>
          <button onClick={clear} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
            <Eraser size={16} /> Clear board
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type your signature"
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Font</label>
              <select value={font} onChange={(e) => setFont(e.target.value)} className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20">
                {FONTS.map((f) => (
                  <option key={f.label} value={f.css}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 min-w-[180px]">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">Size: {typeSize}</label>
              <input type="range" min={32} max={120} value={typeSize} onChange={(e) => setTypeSize(+e.target.value)} className="flex-1 accent-accent" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="w-10 h-9 border border-border rounded cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      <button onClick={download} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
        <Download size={16} /> Download transparent PNG
      </button>
    </div>
  );
}
