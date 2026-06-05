'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'encode' | 'decode' | 'auto';

export function URLEncoderDecoder() {
  const [mode, setMode] = useState<Mode>('encode');
  const [inputUrl, setInputUrl] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [inputCharCount, setInputCharCount] = useState(0);
  const [outputCharCount, setOutputCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // SEO options
  const [toLowerCase, setToLowercase] = useState(true);
  const [replaceSpaces, setReplaceSpaces] = useState(true);
  const [removeSpecialChars, setRemoveSpecialChars] = useState(false);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [extractedParams, setExtractedParams] = useState<Record<string, string>>({});

  const isURLEncoded = (text: string): boolean => {
    return /%[0-9A-Fa-f]{2}/.test(text);
  };

  const encodeURL = (str: string): string => {
    return encodeURIComponent(str);
  };

  const decodeURL = (str: string): string => {
    return decodeURIComponent(str);
  };

  const makeSeoFriendly = (url: string): string => {
    let processed = url;
    
    if (toLowerCase) {
      processed = processed.toLowerCase();
    }
    
    if (replaceSpaces) {
      processed = processed.replace(/\s+/g, '-');
    }
    
    if (removeSpecialChars) {
      processed = processed.replace(/[^a-z0-9\-]/gi, '');
    }
    
    if (removeStopWords) {
      const stopWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'for', 'it', 'on'];
      processed = processed.split('-').filter(word => !stopWords.includes(word.toLowerCase())).join('-');
    }
    
    return processed;
  };

  const extractUrlParams = (url: string): Record<string, string> => {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    } catch {
      return {};
    }
  };

  const processUrl = useCallback(() => {
    try {
      setError(null);
      
      if (!inputUrl.trim()) {
        setOutputUrl('');
        setExtractedParams({});
        return;
      }

      let result: string;

      if (mode === 'auto') {
        result = isURLEncoded(inputUrl) ? decodeURL(inputUrl) : encodeURL(inputUrl);
      } else if (mode === 'encode') {
        result = encodeURL(inputUrl);
      } else {
        result = decodeURL(inputUrl);
      }

      setOutputUrl(result);
      setExtractedParams(extractUrlParams(inputUrl));
    } catch (err) {
      setError('Error: Invalid URL for selected mode');
      setOutputUrl('');
      setExtractedParams({});
    }
  }, [inputUrl, mode]);

  const applySeoSuggestions = () => {
    const seoFriendly = makeSeoFriendly(inputUrl);
    setInputUrl(seoFriendly);
  };

  useEffect(() => {
    setInputCharCount(inputUrl.length);
    setOutputCharCount(outputUrl.length);
  }, [inputUrl, outputUrl]);

  useEffect(() => {
    if (mode === 'auto') {
      processUrl();
    }
  }, [inputUrl, mode, processUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputUrl('');
    setOutputUrl('');
    setError(null);
    setExtractedParams({});
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Mode Selection */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setMode('encode')}
            className={cn(
              'flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all',
              mode === 'encode'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={cn(
              'flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all',
              mode === 'decode'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            Decode
          </button>
          <button
            onClick={() => setMode('auto')}
            className={cn(
              'flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all',
              mode === 'auto'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            Auto-detect
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Input URL</label>
            <textarea
              placeholder="Enter URL to encode/decode..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Characters: {inputCharCount}</span>
              {inputUrl && (
                <span className={cn(isValidUrl(inputUrl) ? "text-green-500" : "text-red-500")}>
                  {isValidUrl(inputUrl) ? '✓ Valid' : '✗ Invalid'}
                </span>
              )}
            </div>
          </div>

          {/* Process Button */}
          {mode !== 'auto' && (
            <button
              onClick={processUrl}
              disabled={!inputUrl.trim()}
              className="w-full px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
        </div>

        {/* SEO URL Suggestions */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">SEO URL Suggestions</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={toLowerCase}
                onChange={(e) => setToLowercase(e.target.checked)}
                className="rounded accent-accent"
              />
              Convert to lowercase
            </label>
            
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={replaceSpaces}
                onChange={(e) => setReplaceSpaces(e.target.checked)}
                className="rounded accent-accent"
              />
              Replace spaces with hyphens
            </label>
            
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={removeSpecialChars}
                onChange={(e) => setRemoveSpecialChars(e.target.checked)}
                className="rounded accent-accent"
              />
              Remove special characters
            </label>
            
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={removeStopWords}
                onChange={(e) => setRemoveStopWords(e.target.checked)}
                className="rounded accent-accent"
              />
              Remove stop words
            </label>
          </div>

          <button
            onClick={applySeoSuggestions}
            disabled={!inputUrl.trim()}
            className="w-full px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Suggestions
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <textarea
              readOnly
              value={outputUrl}
              placeholder="Output will appear here..."
              className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-muted border border-input rounded-md resize-none"
            />
            <div className="text-xs text-muted-foreground">
              Characters: {outputCharCount}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!outputUrl}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* URL Parameters */}
      {Object.keys(extractedParams).length > 0 && (
        <div className="p-6 border border-border rounded-xl bg-card space-y-4">
          <h3 className="text-sm font-medium text-foreground">URL Parameters</h3>
          <div className="space-y-2">
            {Object.entries(extractedParams).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <span className="text-sm font-mono text-foreground">{key}:</span>
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
