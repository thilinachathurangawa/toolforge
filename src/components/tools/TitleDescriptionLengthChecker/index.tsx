'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TitleDescriptionLengthChecker() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'bing' | 'yahoo'>('google');
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  const [titlePixelWidth, setTitlePixelWidth] = useState(0);
  const [descPixelWidth, setDescPixelWidth] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const limits = {
    google: { titleChars: 60, descChars: 160, titlePixels: 600, descPixels: 920 },
    bing: { titleChars: 60, descChars: 160, titlePixels: 600, descPixels: 920 },
    yahoo: { titleChars: 60, descChars: 160, titlePixels: 600, descPixels: 920 },
  };

  const calculatePixelWidth = useCallback((text: string, fontSize: number = 16) => {
    if (!canvasRef.current) return 0;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = `${fontSize}px Arial, sans-serif`;
    return context.measureText(text).width;
  }, []);

  useEffect(() => {
    setTitleCharCount(title.length);
    setDescCharCount(description.length);
    setTitlePixelWidth(calculatePixelWidth(title, 18));
    setDescPixelWidth(calculatePixelWidth(description, 14));
  }, [title, description, calculatePixelWidth]);

  const getTitleStatus = () => {
    const limit = limits[searchEngine].titleChars;
    if (title.length === 0) return { status: 'neutral', message: 'Enter a title' };
    if (title.length <= limit) return { status: 'optimal', message: 'Optimal length' };
    if (title.length <= limit + 10) return { status: 'warning', message: 'Slightly over limit' };
    return { status: 'over', message: 'Over limit' };
  };

  const getDescStatus = () => {
    const limit = limits[searchEngine].descChars;
    if (description.length === 0) return { status: 'neutral', message: 'Enter a description' };
    if (description.length <= limit) return { status: 'optimal', message: 'Optimal length' };
    if (description.length <= limit + 20) return { status: 'warning', message: 'Slightly over limit' };
    return { status: 'over', message: 'Over limit' };
  };

  const getTitlePercentage = () => {
    const limit = limits[searchEngine].titleChars;
    return Math.min((title.length / limit) * 100, 100);
  };

  const getDescPercentage = () => {
    const limit = limits[searchEngine].descChars;
    return Math.min((description.length / limit) * 100, 100);
  };

  const getTruncatedTitle = () => {
    const limit = limits[searchEngine].titleChars;
    if (title.length <= limit) return title;
    return title.substring(0, limit - 3) + '...';
  };

  const getTruncatedDescription = () => {
    const limit = limits[searchEngine].descChars;
    if (description.length <= limit) return description;
    return description.substring(0, limit - 3) + '...';
  };

  const handleCopy = () => {
    const text = `Title: ${title}\nDescription: ${description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
  };

  const currentLimit = limits[searchEngine];
  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  return (
    <div className="w-full space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Search Engine Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Search Engine</label>
          <select
            value={searchEngine}
            onChange={(e) => setSearchEngine(e.target.value as any)}
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="google">Google</option>
            <option value="bing">Bing</option>
            <option value="yahoo">Yahoo</option>
          </select>
        </div>

        {/* Title Tag */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Title Tag</label>
              <span className={cn(
                "text-xs font-mono",
                titleStatus.status === 'optimal' ? "text-green-500" : 
                titleStatus.status === 'warning' ? "text-yellow-500" : 
                titleStatus.status === 'over' ? "text-red-500" : "text-muted-foreground"
              )}>
                {titleCharCount}/{currentLimit.titleChars}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your page title"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  titleStatus.status === 'optimal' ? "bg-green-500" : 
                  titleStatus.status === 'warning' ? "bg-yellow-500" : 
                  titleStatus.status === 'over' ? "bg-red-500" : "bg-muted-foreground"
                )}
                style={{ width: `${getTitlePercentage()}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                titleStatus.status === 'optimal' ? "text-green-500" : 
                titleStatus.status === 'warning' ? "text-yellow-500" : 
                titleStatus.status === 'over' ? "text-red-500" : "text-muted-foreground"
              )}>
                {titleStatus.message}
              </span>
              <span className="text-muted-foreground">{getTitlePercentage().toFixed(0)}%</span>
            </div>
          </div>

          {/* Truncated Preview */}
          {title && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Truncated Preview:</p>
              <p className="text-sm text-foreground">"{getTruncatedTitle()}"</p>
            </div>
          )}
        </div>

        {/* Meta Description */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Meta Description</label>
              <span className={cn(
                "text-xs font-mono",
                descStatus.status === 'optimal' ? "text-green-500" : 
                descStatus.status === 'warning' ? "text-yellow-500" : 
                descStatus.status === 'over' ? "text-red-500" : "text-muted-foreground"
              )}>
                {descCharCount}/{currentLimit.descChars}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Your meta description"
              rows={3}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  descStatus.status === 'optimal' ? "bg-green-500" : 
                  descStatus.status === 'warning' ? "bg-yellow-500" : 
                  descStatus.status === 'over' ? "bg-red-500" : "bg-muted-foreground"
                )}
                style={{ width: `${getDescPercentage()}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                descStatus.status === 'optimal' ? "text-green-500" : 
                descStatus.status === 'warning' ? "text-yellow-500" : 
                descStatus.status === 'over' ? "text-red-500" : "text-muted-foreground"
              )}>
                {descStatus.message}
              </span>
              <span className="text-muted-foreground">{getDescPercentage().toFixed(0)}%</span>
            </div>
          </div>

          {/* Truncated Preview */}
          {description && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Truncated Preview:</p>
              <p className="text-sm text-foreground">"{getTruncatedDescription()}"</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={handleCopy}
            disabled={!title && !description}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {(title || description) && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground">Suggestions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {titleStatus.status === 'over' && (
              <li>• Your title is over the recommended limit. Consider shortening it.</li>
            )}
            {titleStatus.status === 'optimal' && (
              <li>• Your title is within the optimal range.</li>
            )}
            {descStatus.status === 'over' && (
              <li>• Your description is over the recommended limit. Consider shortening it.</li>
            )}
            {descStatus.status === 'optimal' && (
              <li>• Your description is within the optimal range.</li>
            )}
            {!title && (
              <li>• Add a title tag for better SEO.</li>
            )}
            {!description && (
              <li>• Add a meta description for better click-through rates.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
