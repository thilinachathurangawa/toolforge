'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Copy, Check, X, Palette } from 'lucide-react';
import ColorThief from 'color-thief-browser';
import { cn } from '@/lib/utils';

interface ColorSwatch {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export function ColorPalette() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [numColors, setNumColors] = useState(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const handleImageUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    setImageFile(uploadedFile);
    setError(null);
    setColors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const extractPalette = useCallback(async () => {
    if (!imageRef.current || !imageUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(imageRef.current, numColors);

      const swatches: ColorSwatch[] = palette.map(([r, g, b]: [number, number, number]) => ({
        hex: rgbToHex(r, g, b),
        rgb: { r, g, b },
        hsl: rgbToHsl(r, g, b),
      }));

      setColors(swatches);
    } catch (err) {
      setError('Failed to extract colors. Please try a different image.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, numColors]);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadPaletteAsJson = () => {
    const data = JSON.stringify(colors, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPaletteAsPng = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const swatchWidth = 100;
    const swatchHeight = 100;
    const padding = 10;
    const textHeight = 60;

    canvas.width = colors.length * (swatchWidth + padding) + padding;
    canvas.height = swatchHeight + textHeight + padding * 2;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colors.forEach((color, index) => {
      const x = padding + index * (swatchWidth + padding);
      const y = padding;

      // Color swatch
      ctx.fillStyle = color.hex;
      ctx.fillRect(x, y, swatchWidth, swatchHeight);

      // HEX text
      ctx.fillStyle = '#000000';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.hex, x + swatchWidth / 2, y + swatchHeight + 20);
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.png';
    a.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      <div className="p-6 border border-border rounded-xl bg-card">
        <div className="space-y-4">
          <input
            type="file"
            id="image-upload"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP supported
            </p>
          </label>

          {imageFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium truncate">{imageFile.name}</span>
              <button
                onClick={() => {
                  setImageFile(null);
                  setImageUrl(null);
                  setColors([]);
                  setError(null);
                }}
                className="p-1 hover:bg-background rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview and Controls */}
      {imageUrl && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Image Preview</label>
            <div className="mt-2 border rounded-lg p-4 flex justify-center bg-muted/50 min-h-[300px]">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-[300px] object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Number of colors: {numColors}
              </label>
              <input
                type="range"
                min="3"
                max="12"
                value={numColors}
                onChange={(e) => setNumColors(parseInt(e.target.value))}
                className="w-48 accent-accent"
              />
            </div>

            <button
              onClick={extractPalette}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Palette size={18} />
              {isProcessing ? 'Extracting...' : 'Extract Palette'}
            </button>
          </div>
        </div>
      )}

      {/* Color Palette Display */}
      {colors.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="font-semibold text-foreground">Color Palette</h3>
          
          {/* Color Swatches */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {colors.map((color, index) => (
              <div
                key={index}
                className="space-y-2"
              >
                <button
                  onClick={() => handleCopy(color.hex)}
                  className="w-full aspect-square rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer relative group"
                  style={{ backgroundColor: color.hex }}
                  title="Click to copy HEX"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                    {copied === color.hex ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <Copy size={20} className="text-white" />
                    )}
                  </div>
                </button>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground">{color.hex}</span>
                    <button
                      onClick={() => handleCopy(color.hex)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {copied === color.hex ? (
                        <Check size={12} className="text-green-500" />
                      ) : (
                        <Copy size={12} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div>RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}</div>
                    <div>HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={downloadPaletteAsJson}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              Download JSON
            </button>
            <button
              onClick={downloadPaletteAsPng}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
