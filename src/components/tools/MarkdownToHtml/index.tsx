'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, FileCode, AlertCircle } from 'lucide-react';

// Simple markdown to HTML converter
const simpleMarkdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/___(.*?)___/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />');

  // Line breaks
  html = html.replace(/\n/gim, '<br />');

  return html;
};

export function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const convertToHtml = useCallback(() => {
    try {
      setError(null);

      if (!input.trim()) {
        setOutput('');
        return;
      }

      const html = simpleMarkdownToHtml(input);
      setOutput(html);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error converting markdown';
      setError(errorMessage);
      setOutput('');
    }
  }, [input]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    convertToHtml();
  }, [convertToHtml]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Markdown Input</label>
          <textarea
            placeholder="# Hello World\n\nThis is **bold** and *italic* text."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <button
          onClick={convertToHtml}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <FileCode size={16} />
          Convert
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
            <label className="text-sm font-medium text-foreground">HTML Output</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
