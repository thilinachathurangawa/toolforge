'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, X, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SitemapUrl {
  id: string;
  loc: string;
  priority: number;
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastMod: string;
}

export function SitemapGenerator() {
  const [urls, setUrls] = useState<SitemapUrl[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [defaultPriority, setDefaultPriority] = useState(0.5);
  const [defaultChangeFreq, setDefaultChangeFreq] = useState<'weekly'>('weekly');
  const [bulkImportText, setBulkImportText] = useState('');
  const [generatedXml, setGeneratedXml] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addUrl = useCallback(() => {
    if (!currentUrl.trim()) return;
    
    if (!validateUrl(currentUrl)) {
      setErrors([...errors, `Invalid URL: ${currentUrl}`]);
      return;
    }

    // Check for duplicates
    if (urls.some(u => u.loc === currentUrl)) {
      setErrors([...errors, `URL already exists: ${currentUrl}`]);
      return;
    }

    const newUrl: SitemapUrl = {
      id: Math.random().toString(36).substr(2, 9),
      loc: currentUrl,
      priority: defaultPriority,
      changeFreq: defaultChangeFreq,
      lastMod: new Date().toISOString().split('T')[0],
    };

    setUrls([...urls, newUrl]);
    setCurrentUrl('');
    setErrors([]);
  }, [currentUrl, urls, defaultPriority, defaultChangeFreq, errors]);

  const removeUrl = (id: string) => {
    setUrls(urls.filter(u => u.id !== id));
  };

  const updateUrl = (id: string, field: keyof SitemapUrl, value: any) => {
    const newUrls = urls.map(u => {
      if (u.id === id) {
        return { ...u, [field]: value };
      }
      return u;
    });
    setUrls(newUrls);
  };

  const importBulkUrls = useCallback(() => {
    const lines = bulkImportText.split('\n').filter(line => line.trim());
    const newUrls: SitemapUrl[] = [];
    const newErrors: string[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      if (!validateUrl(trimmedLine)) {
        newErrors.push(`Invalid URL: ${trimmedLine}`);
        return;
      }

      if (urls.some(u => u.loc === trimmedLine) || newUrls.some(u => u.loc === trimmedLine)) {
        newErrors.push(`URL already exists: ${trimmedLine}`);
        return;
      }

      newUrls.push({
        id: Math.random().toString(36).substr(2, 9),
        loc: trimmedLine,
        priority: defaultPriority,
        changeFreq: defaultChangeFreq,
        lastMod: new Date().toISOString().split('T')[0],
      });
    });

    setUrls([...urls, ...newUrls]);
    setErrors(newErrors);
    setBulkImportText('');
  }, [bulkImportText, urls, defaultPriority, defaultChangeFreq]);

  const generateSitemap = useCallback(() => {
    if (urls.length === 0) {
      setErrors(['No URLs to generate sitemap']);
      return;
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    urls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      if (url.lastMod) {
        xml += `    <lastmod>${url.lastMod}</lastmod>\n`;
      }
      xml += `    <changefreq>${url.changeFreq}</changefreq>\n`;
      xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    setGeneratedXml(xml);
    setErrors([]);
  }, [urls]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setUrls([]);
    setCurrentUrl('');
    setBulkImportText('');
    setGeneratedXml('');
    setErrors([]);
  };

  const downloadSitemap = () => {
    const blob = new Blob([generatedXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Single URL Input */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Add URL</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL</label>
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addUrl()}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <input
                type="number"
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Change Frequency</label>
              <select
                value={defaultChangeFreq}
                onChange={(e) => setDefaultChangeFreq(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="always">Always</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>

          <button
            onClick={addUrl}
            disabled={!currentUrl.trim()}
            className="w-full px-4 py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add URL
          </button>
        </div>

        {/* Bulk Import */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Bulk Import</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URLs (one per line)</label>
            <textarea
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
              rows={4}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none font-mono text-sm"
            />
          </div>

          <button
            onClick={importBulkUrls}
            disabled={!bulkImportText.trim()}
            className="w-full px-4 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Import URLs
          </button>
        </div>

        {/* URL List */}
        {urls.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">URL List ({urls.length})</h3>
              <button
                onClick={() => setUrls([])}
                className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {urls.map((url) => (
                <div key={url.id} className="p-3 bg-muted/50 rounded-lg border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={url.loc}
                      onChange={(e) => updateUrl(url.id, 'loc', e.target.value)}
                      className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono"
                    />
                    <button
                      onClick={() => removeUrl(url.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Priority</label>
                      <input
                        type="number"
                        value={url.priority}
                        onChange={(e) => updateUrl(url.id, 'priority', parseFloat(e.target.value))}
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Frequency</label>
                      <select
                        value={url.changeFreq}
                        onChange={(e) => updateUrl(url.id, 'changeFreq', e.target.value)}
                        className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="always">Always</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Last Modified</label>
                    <input
                      type="date"
                      value={url.lastMod}
                      onChange={(e) => updateUrl(url.id, 'lastMod', e.target.value)}
                      className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateSitemap}
          disabled={urls.length === 0}
          className="w-full px-4 py-3 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generate Sitemap
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Output Section */}
      {generatedXml && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Sitemap Preview</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                Size: {(generatedXml.length / 1024).toFixed(2)}KB | URLs: {urls.length}
              </span>
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
                  onClick={downloadSitemap}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <X size={16} />
                  Clear
                </button>
              </div>
            </div>
          </div>
          <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto max-h-96">
            <code className="text-xs text-foreground whitespace-pre-wrap font-mono">{generatedXml}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
