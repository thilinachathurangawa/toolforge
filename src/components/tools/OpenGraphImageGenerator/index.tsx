'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, X, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OgImageConfig {
  background: {
    type: 'solid' | 'gradient' | 'image';
    color: string;
    gradientEnd?: string;
    imageUrl?: string;
  };
  title: {
    text: string;
    font: string;
    size: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
  description: {
    text: string;
    font: string;
    size: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
  logo: {
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: number;
  };
}

export function OpenGraphImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<OgImageConfig>({
    background: {
      type: 'solid',
      color: '#3B82F6',
    },
    title: {
      text: 'Your Amazing Title',
      font: 'Arial',
      size: 48,
      color: '#FFFFFF',
      align: 'center',
    },
    description: {
      text: 'A compelling description for your content',
      font: 'Arial',
      size: 24,
      color: '#E5E7EB',
      align: 'center',
    },
    logo: {
      position: 'top-left',
      size: 80,
    },
  });
  const [template, setTemplate] = useState<'blog' | 'product' | 'article' | 'custom'>('custom');
  const [copied, setCopied] = useState(false);

  const applyTemplate = useCallback((tmpl: 'blog' | 'product' | 'article' | 'custom') => {
    if (tmpl === 'custom') return;

    const templates: Record<string, Partial<OgImageConfig>> = {
      blog: {
        background: { type: 'gradient', color: '#3B82F6', gradientEnd: '#1E40AF' },
        title: { text: 'Your Blog Post Title', font: 'Arial', size: 48, color: '#FFFFFF', align: 'center' },
        description: { text: 'A compelling blog post description', font: 'Arial', size: 24, color: '#E5E7EB', align: 'center' },
      },
      product: {
        background: { type: 'solid', color: '#10B981' },
        title: { text: 'Amazing Product Name', font: 'Arial', size: 48, color: '#FFFFFF', align: 'center' },
        description: { text: 'Product description goes here', font: 'Arial', size: 24, color: '#E5E7EB', align: 'center' },
      },
      article: {
        background: { type: 'gradient', color: '#8B5CF6', gradientEnd: '#6D28D9' },
        title: { text: 'Article Headline Here', font: 'Arial', size: 48, color: '#FFFFFF', align: 'center' },
        description: { text: 'Article summary or subtitle', font: 'Arial', size: 24, color: '#E5E7EB', align: 'center' },
      },
    };

    setConfig({ ...config, ...templates[tmpl] });
    setTemplate(tmpl);
  }, [config]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (OG standard: 1200x630)
    canvas.width = 1200;
    canvas.height = 630;

    // Draw background
    if (config.background.type === 'solid') {
      ctx.fillStyle = config.background.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (config.background.type === 'gradient' && config.background.gradientEnd) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, config.background.color);
      gradient.addColorStop(1, config.background.gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (config.background.type === 'image' && config.background.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = config.background.imageUrl;
    }

    // Draw logo if present
    if (config.logo.imageUrl) {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        const size = config.logo.size;
        let x = 20, y = 20;
        
        if (config.logo.position === 'top-right') x = canvas.width - size - 20;
        if (config.logo.position === 'bottom-left') y = canvas.height - size - 20;
        if (config.logo.position === 'bottom-right') {
          x = canvas.width - size - 20;
          y = canvas.height - size - 20;
        }
        
        ctx.drawImage(logoImg, x, y, size, size);
      };
      logoImg.src = config.logo.imageUrl;
    }

    // Draw title
    ctx.font = `bold ${config.title.size}px ${config.title.font}`;
    ctx.fillStyle = config.title.color;
    ctx.textAlign = config.title.align;
    
    let titleX = canvas.width / 2;
    if (config.title.align === 'left') titleX = 60;
    if (config.title.align === 'right') titleX = canvas.width - 60;
    
    ctx.fillText(config.title.text, titleX, canvas.height / 2 - 50);

    // Draw description
    ctx.font = `${config.description.size}px ${config.description.font}`;
    ctx.fillStyle = config.description.color;
    ctx.textAlign = config.description.align;
    
    let descX = canvas.width / 2;
    if (config.description.align === 'left') descX = 60;
    if (config.description.align === 'right') descX = canvas.width - 60;
    
    ctx.fillText(config.description.text, descX, canvas.height / 2 + 30);
  }, [config]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `og-image.${format}`;
    link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.9);
    link.click();
  };

  const handleCopy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({
          ...config,
          logo: { ...config.logo, imageUrl: reader.result as string }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({
          ...config,
          background: { ...config.background, type: 'image', imageUrl: reader.result as string }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Template</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTemplate('custom')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                template === 'custom' ? "bg-accent text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Custom
            </button>
            <button
              onClick={() => applyTemplate('blog')}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Blog Post
            </button>
            <button
              onClick={() => applyTemplate('product')}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Product
            </button>
            <button
              onClick={() => applyTemplate('article')}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Article
            </button>
          </div>
        </div>

        {/* Background */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Background</h3>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={config.background.type === 'solid'}
                onChange={() => setConfig({ ...config, background: { ...config.background, type: 'solid' } })}
                className="accent-accent"
              />
              Solid
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={config.background.type === 'gradient'}
                onChange={() => setConfig({ ...config, background: { ...config.background, type: 'gradient' } })}
                className="accent-accent"
              />
              Gradient
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={config.background.type === 'image'}
                onChange={() => setConfig({ ...config, background: { ...config.background, type: 'image' } })}
                className="accent-accent"
              />
              Image
            </label>
          </div>

          {config.background.type === 'solid' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <input
                type="color"
                value={config.background.color}
                onChange={(e) => setConfig({ ...config, background: { ...config.background, color: e.target.value } })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          )}

          {config.background.type === 'gradient' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Start Color</label>
                <input
                  type="color"
                  value={config.background.color}
                  onChange={(e) => setConfig({ ...config, background: { ...config.background, color: e.target.value } })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">End Color</label>
                <input
                  type="color"
                  value={config.background.gradientEnd || '#1E40AF'}
                  onChange={(e) => setConfig({ ...config, background: { ...config.background, gradientEnd: e.target.value } })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {config.background.type === 'image' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Upload Background Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Title</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Text</label>
            <input
              type="text"
              value={config.title.text}
              onChange={(e) => setConfig({ ...config, title: { ...config.title, text: e.target.value } })}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Font</label>
              <select
                value={config.title.font}
                onChange={(e) => setConfig({ ...config, title: { ...config.title, font: e.target.value } })}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Size</label>
              <input
                type="number"
                value={config.title.size}
                onChange={(e) => setConfig({ ...config, title: { ...config.title, size: parseInt(e.target.value) } })}
                min="20"
                max="80"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <input
                type="color"
                value={config.title.color}
                onChange={(e) => setConfig({ ...config, title: { ...config.title, color: e.target.value } })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Align</label>
              <select
                value={config.title.align}
                onChange={(e) => setConfig({ ...config, title: { ...config.title, align: e.target.value as any } })}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Description</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Text</label>
            <input
              type="text"
              value={config.description.text}
              onChange={(e) => setConfig({ ...config, description: { ...config.description, text: e.target.value } })}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Font</label>
              <select
                value={config.description.font}
                onChange={(e) => setConfig({ ...config, description: { ...config.description, font: e.target.value } })}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Size</label>
              <input
                type="number"
                value={config.description.size}
                onChange={(e) => setConfig({ ...config, description: { ...config.description, size: parseInt(e.target.value) } })}
                min="12"
                max="48"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color</label>
              <input
                type="color"
                value={config.description.color}
                onChange={(e) => setConfig({ ...config, description: { ...config.description, color: e.target.value } })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Align</label>
              <select
                value={config.description.align}
                onChange={(e) => setConfig({ ...config, description: { ...config.description, align: e.target.value as any } })}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Logo</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Upload Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Position</label>
              <select
                value={config.logo.position}
                onChange={(e) => setConfig({ ...config, logo: { ...config.logo, position: e.target.value as any } })}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Size</label>
              <input
                type="number"
                value={config.logo.size}
                onChange={(e) => setConfig({ ...config, logo: { ...config.logo, size: parseInt(e.target.value) } })}
                min="20"
                max="200"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        {/* Regenerate Button */}
        <button
          onClick={drawCanvas}
          className="w-full px-4 py-3 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Regenerate Preview
        </button>
      </div>

      {/* Canvas Preview */}
      <div className="p-6 border border-border rounded-xl bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Preview (1200x630)</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => handleDownload('png')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              PNG
            </button>
            <button
              onClick={() => handleDownload('jpg')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              JPG
            </button>
          </div>
        </div>
        <div className="flex justify-center bg-muted/50 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto border border-border rounded"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}
