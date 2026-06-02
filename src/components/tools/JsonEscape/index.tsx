'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

export function JsonEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
  const [copied, setCopied] = useState(false);

  const escapeJson = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    const escaped = input
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\b/g, '\\b');
    setOutput(escaped);
  }, [input]);

  const unescapeJson = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    const unescaped = input
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\f/g, '\f')
      .replace(/\\b/g, '\b');
    setOutput(unescaped);
  }, [input]);

  const process = () => {
    if (mode === 'escape') {
      escapeJson();
    } else {
      unescapeJson();
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    process();
  }, [input, mode, process]);

  return (
    <div className="w-full space-y-6">
      {/* Mode Selection */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('escape')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'escape'
              ? 'bg-accent text-white'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Escape
        </button>
        <button
          onClick={() => setMode('unescape')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'unescape'
              ? 'bg-accent text-white'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Unescape
        </button>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {mode === 'escape' ? 'Input String' : 'Escaped String'}
          </label>
          <textarea
            placeholder={mode === 'escape' ? 'Enter string to escape...' : 'Enter escaped string...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === 'escape' ? 'Escaped Output' : 'Unescaped Output'}
            </label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
