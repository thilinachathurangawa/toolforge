'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Download, Play, Pause, Eye, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type IllusionType = 'archimedean' | 'logarithmic' | 'moire' | 'geometric' | 'motion';
type ColorScheme = 'grayscale' | 'rainbow' | 'custom';

export function OpticalIllusionLab() {
  const [illusionType, setIllusionType] = useState<IllusionType>('archimedean');
  const [density, setDensity] = useState(50);
  const [size, setSize] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('rainbow');
  const [customColors, setCustomColors] = useState(['#FF0000', '#0000FF']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef(0);

  const drawArchimedeanSpiral = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    const turns = density / 10;
    
    ctx.beginPath();
    for (let angle = 0; angle < turns * 2 * Math.PI; angle += 0.01) {
      const radius = (angle / (2 * Math.PI)) * (maxRadius / turns);
      const x = centerX + radius * Math.cos(angle + rotationRef.current);
      const y = centerY + radius * Math.sin(angle + rotationRef.current);
      
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = getColor(0);
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawLogarithmicSpiral = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    const b = density / 1000;
    
    ctx.beginPath();
    for (let angle = 0; angle < 10 * Math.PI; angle += 0.01) {
      const radius = Math.exp(b * angle) * (maxRadius / Math.exp(b * 10 * Math.PI));
      const x = centerX + radius * Math.cos(angle + rotationRef.current);
      const y = centerY + radius * Math.sin(angle + rotationRef.current);
      
      if (radius > maxRadius) break;
      
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = getColor(0);
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawMoirePattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const spacing = Math.max(5, 100 - density);
    
    // Draw first set of lines
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRef.current * 0.5);
    
    for (let i = -width; i < width * 2; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(i, -height);
      ctx.lineTo(i, height * 2);
      ctx.strokeStyle = getColor(0);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
    
    // Draw second set of lines
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-rotationRef.current * 0.5);
    
    for (let i = -width; i < width * 2; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(i, -height);
      ctx.lineTo(i, height * 2);
      ctx.strokeStyle = getColor(1);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawGeometricIllusion = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const shapes = Math.floor(density / 5);
    
    for (let i = 0; i < shapes; i++) {
      const angle = (i / shapes) * 2 * Math.PI + rotationRef.current;
      const radius = (size / 200) * Math.min(width, height) / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = getColor(i % 2);
      ctx.fill();
    }
  };

  const drawMotionIllusion = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const circles = Math.floor(density / 2);
    
    for (let i = 0; i < circles; i++) {
      const angle = (i / circles) * 2 * Math.PI;
      const radius = (size / 200) * Math.min(width, height) / 2;
      const offset = Math.sin(rotationRef.current + i * 0.5) * 20;
      
      const x = centerX + (radius + offset) * Math.cos(angle);
      const y = centerY + (radius + offset) * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = getColor(i % 2);
      ctx.fill();
    }
  };

  const getColor = (index: number): string => {
    if (colorScheme === 'grayscale') {
      return index === 0 ? '#000000' : '#666666';
    }
    if (colorScheme === 'rainbow') {
      const hue = (index * 180 + rotationRef.current * 50) % 360;
      return `hsl(${hue}, 70%, 50%)`;
    }
    return customColors[index % customColors.length];
  };

  const draw = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 600;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (illusionType) {
      case 'archimedean':
        drawArchimedeanSpiral(ctx, canvas.width, canvas.height);
        break;
      case 'logarithmic':
        drawLogarithmicSpiral(ctx, canvas.width, canvas.height);
        break;
      case 'moire':
        drawMoirePattern(ctx, canvas.width, canvas.height);
        break;
      case 'geometric':
        drawGeometricIllusion(ctx, canvas.width, canvas.height);
        break;
      case 'motion':
        drawMotionIllusion(ctx, canvas.width, canvas.height);
        break;
    }
  }, [illusionType, density, size, colorScheme, customColors]);

  const animate = () => {
    rotationRef.current += speed * 0.02;
    draw();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const downloadImage = (format: 'png' | 'jpg') => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `optical-illusion.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.9);
    link.click();
  };

  const resetRotation = () => {
    rotationRef.current = 0;
    setRotation(0);
    draw();
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls Section */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Illusion Type</label>
          <select
            value={illusionType}
            onChange={(e) => setIllusionType(e.target.value as IllusionType)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
          >
            <option value="archimedean">Archimedean Spiral</option>
            <option value="logarithmic">Logarithmic Spiral</option>
            <option value="moire">Moiré Pattern</option>
            <option value="geometric">Geometric Illusion</option>
            <option value="motion">Motion Illusion</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Density: {density}</label>
            <input
              type="range"
              min="1"
              max="100"
              value={density}
              onChange={(e) => setDensity(parseInt(e.target.value))}
              className="w-48 accent-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Size: {size}</label>
            <input
              type="range"
              min="10"
              max="200"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-48 accent-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Rotation: {Math.round(rotationRef.current * 180 / Math.PI)}°</label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => {
                setRotation(parseInt(e.target.value));
                rotationRef.current = parseInt(e.target.value) * Math.PI / 180;
                draw();
              }}
              className="w-48 accent-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Speed: {speed}x</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-48 accent-accent"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Color Scheme</label>
          <select
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
          >
            <option value="grayscale">Grayscale</option>
            <option value="rainbow">Rainbow</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {colorScheme === 'custom' && (
          <div className="flex gap-2">
            <input
              type="color"
              value={customColors[0]}
              onChange={(e) => setCustomColors([e.target.value, customColors[1]])}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="color"
              value={customColors[1]}
              onChange={(e) => setCustomColors([customColors[0], e.target.value])}
              className="w-12 h-10 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Eye size={18} />
            Illusion Preview
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={resetRotation}
              className="p-1.5 hover:bg-muted rounded transition-colors"
              title="Reset Rotation"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4 flex justify-center bg-muted/50">
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => downloadImage('png')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <Download size={16} />
            Download PNG
          </button>
          <button
            onClick={() => downloadImage('jpg')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Download size={16} />
            Download JPG
          </button>
        </div>
      </div>
    </div>
  );
}
