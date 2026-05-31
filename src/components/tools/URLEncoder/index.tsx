'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'encode' | 'decode' | 'auto';

export function URLEncoder() {
  const [mode, setMode] = useState<Mode>('encode');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputCharCount, setInputCharCount] = useState(0);
  const [outputCharCount, setOutputCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Detect if text is URL-encoded
  const isURLEncoded = (text: string): boolean => {
    return /%[0-9A-Fa-f]{2}/.test(text);
  };

  // Encode URL
  const encodeURL = (str: string): string => {
    return encodeURIComponent(str);
  };

  // Decode URL
  const decodeURL = (str: string): string => {
    return decodeURIComponent(str);
  };

  // Process text based on mode
  const processText = useCallback(() => {
    try {
      setError(null);
      
      if (!inputText.trim()) {
        setOutputText('');
        return;
      }

      let result: string;

      if (mode === 'auto') {
        result = isURLEncoded(inputText) ? decodeURL(inputText) : encodeURL(inputText);
      } else if (mode === 'encode') {
        result = encodeURL(inputText);
      } else {
        result = decodeURL(inputText);
      }

      setOutputText(result);
    } catch (err) {
      setError('Error: Invalid input for selected mode');
      setOutputText('');
    }
  }, [inputText, mode]);

  // Update character counts
  useEffect(() => {
    setInputCharCount(inputText.length);
    setOutputCharCount(outputText.length);
  }, [inputText, outputText]);

  // Auto-process when in auto mode
  useEffect(() => {
    if (mode === 'auto') {
      processText();
    }
  }, [inputText, mode, processText]);

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear all
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
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
          <label className="text-sm font-medium text-foreground">Input</label>
          <textarea
            placeholder="Enter URL or text to encode/decode..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full min-h-[120px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <div className="text-xs text-muted-foreground">
            Characters: {inputCharCount}
          </div>
        </div>

        {/* Process Button (not shown in auto mode) */}
        {mode !== 'auto' && (
          <button
            onClick={processText}
            disabled={!inputText.trim()}
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

      {/* Output Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Output</label>
          <textarea
            readOnly
            value={outputText}
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
            disabled={!outputText}
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
  );
}
