'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Download, Trash2, Eye, Edit, Split, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'highlight.js/styles/github-dark.css';

type ViewMode = 'split' | 'editor' | 'preview';

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('markdown-previewer-content');
    if (saved) {
      setMarkdown(saved);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!markdown) return;
    
    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem('markdown-previewer-content', markdown);
      setLastSaved(new Date());
      setIsAutoSaving(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [markdown]);

  const handleCopyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [markdown]);

  const handleCopyHTML = useCallback(async () => {
    try {
      // Create a temporary div to render the markdown
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = document.querySelector('.markdown-preview')?.innerHTML || '';
      await navigator.clipboard.writeText(tempDiv.innerHTML);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  }, [markdown]);

  const handleDownloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  const handleDownloadHTML = useCallback(() => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Preview</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { background: #f6f8fa; padding: 2px 4px; border-radius: 3px; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 4px solid #d0d7de; padding-left: 16px; color: #656d76; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: 8px 12px; }
    th { background: #f6f8fa; }
  </style>
</head>
<body>
${document.querySelector('.markdown-preview')?.innerHTML || ''}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  const handleClear = useCallback(() => {
    setMarkdown('');
    localStorage.removeItem('markdown-previewer-content');
    setLastSaved(null);
  }, []);

  const getLineNumbers = useCallback((text: string) => {
    return text.split('\n').map((_, i) => i + 1);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border border-border rounded-xl bg-card">
        <div className="flex items-center gap-2">
          <ViewModeButton
            mode="split"
            current={viewMode}
            onClick={() => setViewMode('split')}
            icon={<Split size={16} />}
          />
          <ViewModeButton
            mode="editor"
            current={viewMode}
            onClick={() => setViewMode('editor')}
            icon={<Edit size={16} />}
          />
          <ViewModeButton
            mode="preview"
            current={viewMode}
            onClick={() => setViewMode('preview')}
            icon={<Eye size={16} />}
          />
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="flex items-center gap-1 text-xs text-text-secondary mr-2">
              <Save size={12} />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          <ActionButton
            onClick={handleCopyMarkdown}
            icon={<Copy size={16} />}
            label="Copy MD"
            disabled={!markdown}
          />
          <ActionButton
            onClick={handleCopyHTML}
            icon={<Copy size={16} />}
            label="Copy HTML"
            disabled={!markdown}
          />
          <ActionButton
            onClick={handleDownloadMarkdown}
            icon={<Download size={16} />}
            label="Download MD"
            disabled={!markdown}
          />
          <ActionButton
            onClick={handleDownloadHTML}
            icon={<Download size={16} />}
            label="Download HTML"
            disabled={!markdown}
          />
          <ActionButton
            onClick={handleClear}
            icon={<Trash2 size={16} />}
            label="Clear"
            disabled={!markdown}
            variant="destructive"
          />
        </div>
      </div>

      {/* Editor and Preview */}
      <div
        className={cn(
          'border border-border rounded-xl overflow-hidden bg-card min-h-[600px]',
          viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : 'grid grid-cols-1'
        )}
      >
        {/* Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className="flex flex-col border-r border-border">
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <span className="text-xs font-medium text-text-secondary">Editor</span>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Line Numbers */}
              <div className="flex flex-col items-end px-2 py-3 bg-muted/30 text-xs text-text-secondary select-none overflow-hidden">
                {getLineNumbers(markdown).map((num) => (
                  <div key={num} className="leading-6">
                    {num}
                  </div>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write your Markdown here..."
                className="flex-1 px-4 py-3 text-sm bg-transparent resize-none focus:outline-none font-mono leading-6"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <span className="text-xs font-medium text-text-secondary">Preview</span>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="markdown-preview prose prose-sm max-w-none dark:prose-invert">
                {markdown ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {markdown}
                  </ReactMarkdown>
                ) : (
                  <div className="text-text-secondary text-sm">
                    Preview will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewModeButton({
  mode,
  current,
  onClick,
  icon,
}: {
  mode: ViewMode;
  current: ViewMode;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        current === mode
          ? 'bg-accent text-accent-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      )}
    >
      {icon}
      <span className="capitalize">{mode}</span>
    </button>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  disabled,
  variant = 'default',
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        variant === 'destructive'
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
