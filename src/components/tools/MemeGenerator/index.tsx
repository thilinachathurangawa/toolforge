'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, Plus, Trash2, Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  font: string;
  size: number;
  color: string;
  hasStroke: boolean;
  strokeColor: string;
}

export function MemeGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    { id: '1', text: 'TOP TEXT', x: 50, y: 50, font: 'Impact', size: 48, color: '#FFFFFF', hasStroke: true, strokeColor: '#000000' },
    { id: '2', text: 'BOTTOM TEXT', x: 50, y: 90, font: 'Impact', size: 48, color: '#FFFFFF', hasStroke: true, strokeColor: '#000000' },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fonts = ['Impact', 'Arial', 'Comic Sans MS', 'Times New Roman', 'Courier New'];

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
      
      // Pre-load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setLoadedImage(img);
      };
      img.src = result;
    };
    reader.readAsDataURL(uploadedFile);
  };

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: 'NEW TEXT',
      x: 50,
      y: 50,
      font: 'Impact',
      size: 48,
      color: '#FFFFFF',
      hasStroke: true,
      strokeColor: '#000000',
    };
    setTextLayers([...textLayers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const deleteTextLayer = (id: string) => {
    setTextLayers(textLayers.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(textLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)));
  };

  const downloadMeme = (format: 'jpg' | 'png') => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `meme.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.9);
    link.click();
  };

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;

    // Draw image
    ctx.drawImage(loadedImage, 0, 0);

    // Draw text layers
    textLayers.forEach((layer) => {
      ctx.font = `${layer.size}px ${layer.font}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const x = (layer.x / 100) * canvas.width;
      const y = (layer.y / 100) * canvas.height;

      // Draw stroke
      if (layer.hasStroke) {
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = layer.size / 8;
        ctx.strokeText(layer.text, x, y);
      }

      // Draw text
      ctx.fillText(layer.text, x, y);
    });
  }, [loadedImage, textLayers]);

  React.useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Re-render canvas when image is loaded
  React.useEffect(() => {
    if (loadedImage) {
      renderCanvas();
    }
  }, [loadedImage, renderCanvas]);

  const selectedLayer = textLayers.find((layer) => layer.id === selectedLayerId);

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

      {/* Text Layers Section */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Text Layers</h3>
          <button
            onClick={addTextLayer}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} />
            Add Layer
          </button>
        </div>

        <div className="space-y-3">
          {textLayers.map((layer) => (
            <div
              key={layer.id}
              className={cn(
                'p-4 border rounded-lg space-y-3',
                selectedLayerId === layer.id ? 'border-accent bg-accent/5' : 'border-border'
              )}
              onClick={() => setSelectedLayerId(layer.id)}
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={layer.text}
                  onChange={(e) => updateTextLayer(layer.id, { text: e.target.value })}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTextLayer(layer.id);
                  }}
                  className="ml-2 p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {selectedLayerId === layer.id && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Font</label>
                    <select
                      value={layer.font}
                      onChange={(e) => updateTextLayer(layer.id, { font: e.target.value })}
                      className="w-full px-2 py-1.5 bg-background border border-border rounded-md text-sm text-foreground"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Size: {layer.size}px</label>
                    <input
                      type="range"
                      min="16"
                      max="120"
                      value={layer.size}
                      onChange={(e) => updateTextLayer(layer.id, { size: parseInt(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                    <input
                      type="color"
                      value={layer.color}
                      onChange={(e) => updateTextLayer(layer.id, { color: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Stroke Color</label>
                    <input
                      type="color"
                      value={layer.strokeColor}
                      onChange={(e) => updateTextLayer(layer.id, { strokeColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Position X: {layer.x}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.x}
                      onChange={(e) => updateTextLayer(layer.id, { x: parseInt(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Position Y: {layer.y}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.y}
                      onChange={(e) => updateTextLayer(layer.id, { y: parseInt(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`stroke-${layer.id}`}
                      checked={layer.hasStroke}
                      onChange={(e) => updateTextLayer(layer.id, { hasStroke: e.target.checked })}
                      className="accent-accent"
                    />
                    <label htmlFor={`stroke-${layer.id}`} className="text-sm text-foreground">
                      Add Stroke
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      {loadedImage && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="font-semibold text-foreground">Preview</h3>
          <div className="border rounded-lg p-4 flex justify-center bg-muted/50 min-h-[300px]">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[500px] object-contain border border-border"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => downloadMeme('jpg')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              <Download size={16} />
              Download JPG
            </button>
            <button
              onClick={() => downloadMeme('png')}
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
