'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Check, X, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SERPSnippetPreview() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [showDate, setShowDate] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTitleCharCount(title.length);
    setDescCharCount(description.length);
  }, [title, description]);

  const getTitleStatus = () => {
    if (title.length === 0) return 'neutral';
    if (title.length <= 60) return 'optimal';
    if (title.length <= 70) return 'warning';
    return 'over';
  };

  const getDescStatus = () => {
    if (description.length === 0) return 'neutral';
    if (description.length <= 160) return 'optimal';
    if (description.length <= 170) return 'warning';
    return 'over';
  };

  const getTruncatedTitle = () => {
    if (title.length <= 60) return title;
    return title.substring(0, 57) + '...';
  };

  const getTruncatedDescription = () => {
    if (description.length <= 160) return description;
    return description.substring(0, 157) + '...';
  };

  const getDisplayUrl = () => {
    if (!url) return 'example.com/page';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  const handleCopy = () => {
    const text = `Title: ${title}\nDescription: ${description}\nURL: ${url}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setSiteName('');
    setFaviconUrl('');
    setShowDate(true);
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Preview Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              previewMode === 'desktop'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Monitor size={16} />
            Desktop
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              previewMode === 'mobile'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Smartphone size={16} />
            Mobile
          </button>
        </div>

        {/* Title Tag */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Title Tag</label>
            <span className={cn(
              "text-xs font-mono",
              titleStatus === 'optimal' ? "text-green-500" : 
              titleStatus === 'warning' ? "text-yellow-500" : 
              titleStatus === 'over' ? "text-red-500" : "text-muted-foreground"
            )}>
              {titleCharCount}/60
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

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Meta Description</label>
            <span className={cn(
              "text-xs font-mono",
              descStatus === 'optimal' ? "text-green-500" : 
              descStatus === 'warning' ? "text-yellow-500" : 
              descStatus === 'over' ? "text-red-500" : "text-muted-foreground"
            )}>
              {descCharCount}/160
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

        {/* URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Site Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Site Name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Example"
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Favicon URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Favicon URL (optional)</label>
          <input
            type="url"
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://example.com/favicon.ico"
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Show Date Toggle */}
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={showDate}
            onChange={(e) => setShowDate(e.target.checked)}
            className="rounded accent-accent"
          />
          Show date
        </label>

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

      {/* Google Search Preview */}
      {(title || description || url) && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="text-sm font-medium text-foreground">Google Search Preview</h3>
          
          <div className={cn(
            "p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700",
            previewMode === 'mobile' ? "max-w-sm mx-auto" : ""
          )}>
            {/* Site Name */}
            {siteName && (
              <div className="flex items-center gap-2 mb-1">
                {faviconUrl ? (
                  <img src={faviconUrl} alt="" className="w-4 h-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400">{siteName}</span>
              </div>
            )}
            
            {/* URL */}
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {getDisplayUrl()}
            </div>
            
            {/* Title */}
            <div className="text-lg text-blue-800 dark:text-blue-400 font-normal hover:underline cursor-pointer mb-1">
              {getTruncatedTitle() || 'Your Page Title'}
            </div>
            
            {/* Description */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getTruncatedDescription() || 'Your meta description will appear here...'}
            </div>
            
            {/* Date */}
            {showDate && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
