'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OpenGraphPreviewGenerator() {
  const [fetchUrl, setFetchUrl] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [ogUrl, setOgUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [ogType, setOgType] = useState<'website' | 'article' | 'product'>('website');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const getTitleCharCount = () => ogTitle.length;
  const getDescCharCount = () => ogDescription.length;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
        setOgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTags = useCallback(() => {
    const newWarnings: string[] = [];
    
    if (!ogTitle && !ogDescription) {
      newWarnings.push('Add title and description for better social sharing');
    }
    
    if (ogTitle && getTitleCharCount() > 60) {
      newWarnings.push('Title is over 60 characters - may be truncated');
    }
    
    if (ogDescription && getDescCharCount() > 160) {
      newWarnings.push('Description is over 160 characters - may be truncated');
    }
    
    if (!ogImage) {
      newWarnings.push('Add an image for better engagement');
    }
    
    setWarnings(newWarnings);
  }, [ogTitle, ogDescription, ogImage]);

  useEffect(() => {
    validateTags();
  }, [validateTags]);

  const generateMetaTags = useCallback(() => {
    let tags = [];
    
    if (ogTitle) tags.push(`<meta property="og:title" content="${ogTitle}">`);
    if (ogDescription) tags.push(`<meta property="og:description" content="${ogDescription}">`);
    if (ogImage) tags.push(`<meta property="og:image" content="${ogImage}">`);
    if (ogUrl) tags.push(`<meta property="og:url" content="${ogUrl}">`);
    if (siteName) tags.push(`<meta property="og:site_name" content="${siteName}">`);
    tags.push(`<meta property="og:type" content="${ogType}">`);
    
    return tags.join('\n');
  }, [ogTitle, ogDescription, ogImage, ogUrl, siteName, ogType]);

  const handleCopy = () => {
    const tags = generateMetaTags();
    navigator.clipboard.writeText(tags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setFetchUrl('');
    setOgTitle('');
    setOgDescription('');
    setOgImage('');
    setOgUrl('');
    setSiteName('');
    setOgType('website');
    setUploadedImage(null);
    setImagePreviewUrl('');
    setWarnings([]);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Fetch URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Enter URL to Fetch OG Tags</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={fetchUrl}
              onChange={(e) => setFetchUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={() => {/* TODO: Implement fetch */}}
              disabled={!fetchUrl.trim()}
              className="px-4 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Fetch Tags
            </button>
          </div>
        </div>

        {/* Manual Input */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Or Enter Manually</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">OG Title</label>
              <span className={cn("text-xs font-mono", getTitleCharCount() > 60 ? "text-red-500" : getTitleCharCount() > 50 ? "text-yellow-500" : "text-green-500")}>
                {getTitleCharCount()}/60
              </span>
            </div>
            <input
              type="text"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Your page title"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">OG Description</label>
              <span className={cn("text-xs font-mono", getDescCharCount() > 160 ? "text-red-500" : getDescCharCount() > 150 ? "text-yellow-500" : "text-green-500")}>
                {getDescCharCount()}/160
              </span>
            </div>
            <textarea
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Your page description"
              rows={3}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">OG Image URL</label>
            <input
              type="url"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Or Upload Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors"
              >
                <Upload size={16} />
                Upload Image
              </label>
              {uploadedImage && (
                <span className="text-xs text-muted-foreground">{uploadedImage.name}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">OG URL</label>
            <input
              type="url"
              value={ogUrl}
              onChange={(e) => setOgUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">OG Type</label>
            <select
              value={ogType}
              onChange={(e) => setOgType(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="website">Website</option>
              <option value="article">Article</option>
              <option value="product">Product</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={handleCopy}
            disabled={!ogTitle && !ogDescription}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Meta Tags'}
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

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <ul className="space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Live Previews */}
      {(ogTitle || ogDescription || ogImage) && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-6">
          <h3 className="text-sm font-medium text-foreground">Live Previews</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Facebook</h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                {imagePreviewUrl || ogImage ? (
                  <img
                    src={imagePreviewUrl || ogImage}
                    alt="OG Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    No image
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{siteName || 'example.com'}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                    {ogTitle || 'Your Page Title'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {ogDescription || 'Your page description will appear here...'}
                  </div>
                </div>
              </div>
            </div>

            {/* LinkedIn Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">LinkedIn</h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                {imagePreviewUrl || ogImage ? (
                  <img
                    src={imagePreviewUrl || ogImage}
                    alt="OG Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    No image
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                    {ogTitle || 'Your Page Title'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {ogDescription || 'Your page description will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Twitter Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Twitter (Large Card)</h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              {imagePreviewUrl || ogImage ? (
                <img
                  src={imagePreviewUrl || ogImage}
                  alt="OG Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  No image
                </div>
              )}
              <div className="p-3 space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                  {ogTitle || 'Your Page Title'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {ogDescription || 'Your page description will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
