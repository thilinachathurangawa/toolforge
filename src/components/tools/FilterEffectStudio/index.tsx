'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, X, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  hueRotate: number;
  gaussianBlur: number;
  motionBlur: number;
  sharpen: number;
  unsharpMask: number;
  vignette: number;
  noise: number;
  filmGrain: number;
  pixelate: number;
  oilPaint: number;
  edgeDetection: number;
}

export function FilterEffectStudio() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    exposure: 100,
    grayscale: false,
    sepia: false,
    invert: false,
    hueRotate: 0,
    gaussianBlur: 0,
    motionBlur: 0,
    sharpen: 0,
    unsharpMask: 0,
    vignette: 0,
    noise: 0,
    filmGrain: 0,
    pixelate: 0,
    oilPaint: 0,
    edgeDetection: 0,
  });
  const [showOriginal, setShowOriginal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    setImageFile(uploadedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      setOriginalImageUrl(result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const applyFilters = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply CSS filters
    let filterString = '';
    filterString += `brightness(${filters.brightness}%) `;
    filterString += `contrast(${filters.contrast}%) `;
    filterString += `saturate(${filters.saturation}%) `;
    filterString += `brightness(${filters.exposure / 100}) `;
    
    if (filters.grayscale) filterString += 'grayscale(100%) ';
    if (filters.sepia) filterString += 'sepia(100%) ';
    if (filters.invert) filterString += 'invert(100%) ';
    filterString += `hue-rotate(${filters.hueRotate}deg) `;
    filterString += `blur(${filters.gaussianBlur}px) `;
    
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none';

    // Apply pixelate effect
    if (filters.pixelate > 0) {
      const pixelSize = Math.max(1, filters.pixelate);
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      tempCanvas.width = Math.ceil(w / pixelSize);
      tempCanvas.height = Math.ceil(h / pixelSize);
      
      tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
    }

    // Apply vignette
    if (filters.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Apply noise
    if (filters.noise > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const noiseAmount = filters.noise / 100 * 50;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseAmount;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Apply film grain
    if (filters.filmGrain > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const grainAmount = filters.filmGrain / 100 * 30;
      
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * grainAmount;
        data[i] = Math.min(255, Math.max(0, data[i] + grain));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Apply edge detection
    if (filters.edgeDetection > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      const output = ctx.createImageData(width, height);
      const outputData = output.data;
      
      const kernel = [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
      ];
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let r = 0, g = 0, b = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4;
              const kIdx = (ky + 1) * 3 + (kx + 1);
              r += data[idx] * kernel[kIdx];
              g += data[idx + 1] * kernel[kIdx];
              b += data[idx + 2] * kernel[kIdx];
            }
          }
          
          const idx = (y * width + x) * 4;
          const intensity = (filters.edgeDetection / 100);
          outputData[idx] = Math.min(255, Math.max(0, data[idx] * (1 - intensity) + r * intensity));
          outputData[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] * (1 - intensity) + g * intensity));
          outputData[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] * (1 - intensity) + b * intensity));
          outputData[idx + 3] = data[idx + 3];
        }
      }
      
      ctx.putImageData(output, 0, 0);
    }
  }, [imageUrl, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const updateFilter = (key: keyof FilterSettings, value: number | boolean) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 100,
      grayscale: false,
      sepia: false,
      invert: false,
      hueRotate: 0,
      gaussianBlur: 0,
      motionBlur: 0,
      sharpen: 0,
      unsharpMask: 0,
      vignette: 0,
      noise: 0,
      filmGrain: 0,
      pixelate: 0,
      oilPaint: 0,
      edgeDetection: 0,
    });
  };

  const downloadImage = (format: 'jpg' | 'png') => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `filtered-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.9);
    link.click();
  };

  const hasActiveFilters = Object.values(filters).some(
    (val) => typeof val === 'boolean' ? val : val !== 0 && val !== 100
  );

  return (
    <div className="w-full space-y-6">
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <img ref={imageRef} src={imageUrl || ''} alt="" className="hidden" crossOrigin="anonymous" onLoad={applyFilters} />

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
                  setOriginalImageUrl(null);
                  resetFilters();
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

      {/* Filters Section */}
      {imageUrl && (
        <>
          <div className="p-6 border border-border rounded-xl bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Wand2 size={18} />
                Filters & Effects
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw size={14} />
                  Reset All
                </button>
              )}
            </div>

            {/* Basic Adjustments */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Basic Adjustments</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Brightness: {filters.brightness}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.brightness}
                    onChange={(e) => updateFilter('brightness', parseInt(e.target.value))}
                    className="w-48 accent-accent"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Contrast: {filters.contrast}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.contrast}
                    onChange={(e) => updateFilter('contrast', parseInt(e.target.value))}
                    className="w-48 accent-accent"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Saturation: {filters.saturation}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={(e) => updateFilter('saturation', parseInt(e.target.value))}
                    className="w-48 accent-accent"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Exposure: {filters.exposure}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.exposure}
                    onChange={(e) => updateFilter('exposure', parseInt(e.target.value))}
                    className="w-48 accent-accent"
                  />
                </div>
              </div>
            </div>

            {/* Color Filters */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Color Filters</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('grayscale', !filters.grayscale)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md transition-colors',
                    filters.grayscale ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  Grayscale
                </button>
                <button
                  onClick={() => updateFilter('sepia', !filters.sepia)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md transition-colors',
                    filters.sepia ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  Sepia
                </button>
                <button
                  onClick={() => updateFilter('invert', !filters.invert)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md transition-colors',
                    filters.invert ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  Invert
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Hue Rotate: {filters.hueRotate}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={filters.hueRotate}
                  onChange={(e) => updateFilter('hueRotate', parseInt(e.target.value))}
                  className="w-48 accent-accent"
                />
              </div>
            </div>

            {/* Blur Effects */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Blur Effects</h4>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Gaussian Blur: {filters.gaussianBlur}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.gaussianBlur}
                  onChange={(e) => updateFilter('gaussianBlur', parseInt(e.target.value))}
                  className="w-48 accent-accent"
                />
              </div>
            </div>

            {/* Vintage Effects */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Vintage Effects</h4>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Vignette: {filters.vignette}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.vignette}
                  onChange={(e) => updateFilter('vignette', parseInt(e.target.value))}
                  className="w-48 accent-accent"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Noise: {filters.noise}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.noise}
                  onChange={(e) => updateFilter('noise', parseInt(e.target.value))}
                  className="w-48 accent-accent"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Film Grain: {filters.filmGrain}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.filmGrain}
                  onChange={(e) => updateFilter('filmGrain', parseInt(e.target.value))}
                  className="w-48 accent-accent"
                />
              </div>
            </div>

            {/* Artistic Effects */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Artistic Effects</h4>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Pixelate: {filters.pixelate}</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.pixelate}
                  onChange={(e) => updateFilter('pixelate', parseInt(e.target.value))}
                  className="w-48 accent-accent"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Edge Detection: {filters.edgeDetection}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.edgeDetection}
                  onChange={(e) => updateFilter('edgeDetection', parseInt(e.target.value))}
                  className="w-48 accent-accent"
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="p-6 border border-border rounded-xl bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Preview</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOriginal}
                  onChange={(e) => setShowOriginal(e.target.checked)}
                  className="accent-accent"
                />
                <span className="text-sm text-foreground">Show Original</span>
              </label>
            </div>

            <div className="border rounded-lg p-4 flex justify-center bg-muted/50 min-h-[300px]">
              <img
                src={showOriginal ? originalImageUrl || '' : canvasRef.current?.toDataURL() || imageUrl}
                alt="Preview"
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadImage('jpg')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                <Download size={16} />
                Download JPG
              </button>
              <button
                onClick={() => downloadImage('png')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                Download PNG
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
