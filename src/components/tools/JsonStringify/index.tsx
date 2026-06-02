'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Download } from 'lucide-react';

export function JsonStringify() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [spacing, setSpacing] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stringify = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }

      const parsed = eval(`(${input})`);
      const stringified = JSON.stringify(parsed, null, spacing);
      setOutput(stringified);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JavaScript object';
      setError(errorMessage);
      setOutput('');
    }
  }, [input, spacing]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stringified.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    stringify();
  }, [stringify]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JavaScript Object</label>
          <textarea
            placeholder='{ name: "John", age: 30 }'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">Spacing:</label>
          <input
            type="number"
            min="0"
            max="8"
            value={spacing}
            onChange={(e) => setSpacing(Math.min(8, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-20 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">JSON Output</label>
            <div className="flex items-center gap-2">
              <button
                onClick={copy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={download}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            <pre className="text-sm font-mono text-foreground">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
