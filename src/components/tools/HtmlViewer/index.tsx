'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Eye, AlertCircle } from 'lucide-react';

export function HtmlViewer() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const validateHTML = useCallback(() => {
    try {
      setError(null);

      if (!input.trim()) {
        return;
      }

      // Basic HTML validation - check for unclosed tags
      const tagStack: string[] = [];
      const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
      let match;

      while ((match = tagRegex.exec(input)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();

        if (fullTag.startsWith('</')) {
          // Closing tag
          if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
            setError(`Unclosed or mismatched tag: ${tagName}`);
            return;
          }
          tagStack.pop();
        } else if (!fullTag.match(/\/>$/)) {
          // Opening tag (not self-closing)
          const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr'];
          if (!voidTags.includes(tagName)) {
            tagStack.push(tagName);
          }
        }
      }

      if (tagStack.length > 0) {
        setError(`Unclosed tags: ${tagStack.join(', ')}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error validating HTML';
      setError(errorMessage);
    }
  }, [input]);

  const copy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    validateHTML();
  }, [validateHTML]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">HTML Input</label>
          <textarea
            placeholder="<h1>Hello World</h1><p>This is a paragraph.</p>"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={validateHTML}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={copy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
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

      {/* Preview */}
      {input && !error && (
        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">Live Preview</label>
          <div className="border border-input rounded-md bg-background p-4">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: input }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
