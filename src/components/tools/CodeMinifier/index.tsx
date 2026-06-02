'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Minimize2, AlertCircle } from 'lucide-react';

type CodeType = 'javascript' | 'css' | 'html';

export function CodeMinifier() {
  const [input, setInput] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('javascript');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const minifyCode = useCallback(() => {
    try {
      setError(null);

      if (!input.trim()) {
        setOutput('');
        return;
      }

      let minified = '';

      switch (codeType) {
        case 'javascript':
          minified = minifyJavaScript(input);
          break;
        case 'css':
          minified = minifyCSS(input);
          break;
        case 'html':
          minified = minifyHTML(input);
          break;
      }

      setOutput(minified);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error minifying code';
      setError(errorMessage);
      setOutput('');
    }
  }, [input, codeType]);

  const minifyJavaScript = (code: string): string => {
    // Remove single-line comments (but not URLs)
    let result = code.replace(/http:\/\/[^\s]+/g, (url) => `__URL_${url.length}__`);
    result = result.replace(/\/\/.*$/gm, '');
    result = result.replace(/__URL_\d+__/g, (match) => {
      const len = parseInt(match.replace('__URL_', '').replace('__', ''));
      return 'http' + '/'.repeat(len - 4);
    });

    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove whitespace
    result = result
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:<>=+\-*/])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .trim();

    return result;
  };

  const minifyCSS = (code: string): string => {
    // Remove comments
    let result = code.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove whitespace
    result = result
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};:,>~+])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .trim();

    return result;
  };

  const minifyHTML = (code: string): string => {
    // Remove comments
    let result = code.replace(/<!--[\s\S]*?-->/g, '');

    // Remove whitespace between tags
    result = result.replace(/>\s+</g, '><');

    // Remove whitespace at start and end
    result = result.trim();

    return result;
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    minifyCode();
  }, [minifyCode]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">Code Type:</label>
          <div className="flex gap-2">
            {(['javascript', 'css', 'html'] as CodeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setCodeType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  codeType === type
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Code Input</label>
          <textarea
            placeholder={`Enter ${codeType} code to minify...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <button
          onClick={minifyCode}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <Minimize2 size={16} />
          Minify
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Minified Output</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">{output}</pre>
          </div>
          <div className="text-sm text-muted-foreground">
            Original size: {input.length} bytes → Minified: {output.length} bytes ({Math.round((1 - output.length / input.length) * 100)}% reduction)
          </div>
        </div>
      )}
    </div>
  );
}
