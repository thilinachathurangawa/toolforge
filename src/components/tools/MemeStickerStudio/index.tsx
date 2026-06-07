'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, Layers, Trash2, Plus, X, Undo, Redo, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Layer {
  id: string;
  type: 'image' | 'text' | 'sticker';
  visible: boolean;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface TextLayer extends Layer {
  type: 'text';
  text: string;
  font: string;
  size: number;
  color: string;
  hasStroke: boolean;
  strokeColor: string;
}

interface ImageLayer extends Layer {
  type: 'image' | 'sticker';
  src: string;
  image?: HTMLImageElement;
}

export function MemeStickerStudio() {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stickers = ['😀', '😂', '😎', '🎉', '❤️', '⭐', '🔥', '💯'];

  const addToHistory = (newLayers: Layer[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const newLayer: ImageLayer = {
          id: Date.now().toString(),
          type: 'image',
          visible: true,
          x: 0,
          y: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          src: event.target?.result as string,
          image: img,
        };
        
        // Set canvas size to match image if it's the first layer
        if (layers.length === 0) {
          setCanvasSize({ width: img.width, height: img.height });
        }
        
        const newLayers = [...layers, newLayer];
        setLayers(newLayers);
        setSelectedLayerId(newLayer.id);
        addToHistory(newLayers);
        setImagesLoaded(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      type: 'text',
      visible: true,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      text: 'TEXT',
      font: 'Impact',
      size: 48,
      color: '#FFFFFF',
      hasStroke: true,
      strokeColor: '#000000',
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setSelectedLayerId(newLayer.id);
    addToHistory(newLayers);
  };

  const addStickerLayer = (sticker: string) => {
    const newLayer: ImageLayer = {
      id: Date.now().toString(),
      type: 'sticker',
      visible: true,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      src: sticker,
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setSelectedLayerId(newLayer.id);
    addToHistory(newLayers);
  };

  const deleteLayer = (id: string) => {
    const newLayers = layers.filter((layer) => layer.id !== id);
    setLayers(newLayers);
    if (selectedLayerId === id) setSelectedLayerId(null);
    addToHistory(newLayers);
  };

  const toggleLayerVisibility = (id: string) => {
    const newLayers = layers.map((layer) =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    );
    setLayers(newLayers);
    addToHistory(newLayers);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex((layer) => layer.id === id);
    if (index === -1) return;

    const newLayers = [...layers];
    if (direction === 'up' && index < newLayers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    } else if (direction === 'down' && index > 0) {
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    }
    setLayers(newLayers);
    addToHistory(newLayers);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayers(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayers(history[historyIndex + 1]);
    }
  };

  const downloadCanvas = (format: 'jpg' | 'png' | 'webp') => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `meme-sticker.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.9);
    link.click();
  };

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render layers
    layers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scaleX, layer.scaleY);

      if (layer.type === 'text') {
        const textLayer = layer as TextLayer;
        ctx.font = `${textLayer.size}px ${textLayer.font}`;
        ctx.fillStyle = textLayer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (textLayer.hasStroke) {
          ctx.strokeStyle = textLayer.strokeColor;
          ctx.lineWidth = textLayer.size / 8;
          ctx.strokeText(textLayer.text, 0, 0);
        }
        ctx.fillText(textLayer.text, 0, 0);
      } else if (layer.type === 'image') {
        const imgLayer = layer as ImageLayer;
        if (imgLayer.image) {
          // Draw image centered at position
          ctx.drawImage(imgLayer.image, -imgLayer.image.width / 2, -imgLayer.image.height / 2);
        }
      } else if (layer.type === 'sticker') {
        const imgLayer = layer as ImageLayer;
        ctx.font = '80px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(imgLayer.src, 0, 0);
      }

      ctx.restore();
    });
  }, [canvasSize, layers]);

  React.useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Re-render canvas when images are loaded
  React.useEffect(() => {
    if (imagesLoaded) {
      renderCanvas();
    }
  }, [imagesLoaded, renderCanvas]);

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  return (
    <div className="w-full space-y-6">

      {/* Upload Section */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="flex gap-2">
          <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors">
            <Upload size={32} className="text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Upload Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <button
            onClick={addTextLayer}
            className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Plus size={32} className="text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Add Text</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Sticker Library */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <h3 className="font-semibold text-foreground">Sticker Library</h3>
        <div className="flex flex-wrap gap-2">
          {stickers.map((sticker) => (
            <button
              key={sticker}
              onClick={() => addStickerLayer(sticker)}
              className="text-4xl p-2 hover:bg-accent/10 rounded-lg transition-colors"
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>

      {/* Layers Panel */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Layers size={18} />
            Layers
          </h3>
          <div className="flex gap-1">
            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-muted rounded disabled:opacity-50">
              <Undo size={16} />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-muted rounded disabled:opacity-50">
              <Redo size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {layers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No layers yet. Upload an image or add text to get started.</p>
          ) : (
            layers.map((layer, index) => (
              <div
                key={layer.id}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border',
                  selectedLayerId === layer.id ? 'border-accent bg-accent/5' : 'border-border'
                )}
              >
                <button
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className={cn('p-1 rounded', layer.visible ? 'text-foreground' : 'text-muted-foreground')}
                >
                  {layer.visible ? '👁️' : '👁️‍🗨️'}
                </button>
                <span className="flex-1 text-sm text-foreground">
                  {layer.type === 'text' ? (layer as TextLayer).text : layer.type}
                </span>
                <button onClick={() => moveLayer(layer.id, 'up')} className="p-1 hover:bg-muted rounded" disabled={index === layers.length - 1}>
                  ↑
                </button>
                <button onClick={() => moveLayer(layer.id, 'down')} className="p-1 hover:bg-muted rounded" disabled={index === 0}>
                  ↓
                </button>
                <button onClick={() => deleteLayer(layer.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Canvas Preview */}
      {layers.length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Canvas</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-2 hover:bg-muted rounded">
                <ZoomOut size={16} />
              </button>
              <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="p-2 hover:bg-muted rounded">
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex justify-center bg-muted/50 overflow-auto">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <canvas
                ref={canvasRef}
                className="max-w-full border border-border"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => downloadCanvas('jpg')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
              <Download size={16} />
              Download JPG
            </button>
            <button onClick={() => downloadCanvas('png')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              <Download size={16} />
              Download PNG
            </button>
            <button onClick={() => downloadCanvas('webp')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              <Download size={16} />
              Download WebP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
