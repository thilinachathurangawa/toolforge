'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Download, Check, X, TreeDeciduous, Code, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-json';

type Mode = 'formatted' | 'minified' | 'tree';

interface JsonNode {
  key?: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: JsonNode[];
}

export function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('formatted');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [treeData, setTreeData] = useState<JsonNode | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  // Format JSON
  const formatJSON = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setIsValid(true);
        setError(null);
        setErrorLine(null);
        return;
      }

      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setError(null);
      setErrorLine(null);
      setTreeData(buildTree(parsed));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setErrorLine(extractErrorLine(errorMessage, input));
      setIsValid(false);
    }
  }, [input]);

  // Minify JSON
  const minifyJSON = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setIsValid(true);
        setError(null);
        setErrorLine(null);
        return;
      }

      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setError(null);
      setErrorLine(null);
      setTreeData(buildTree(parsed));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setErrorLine(extractErrorLine(errorMessage, input));
      setIsValid(false);
    }
  }, [input]);

  // Validate JSON
  const validateJSON = useCallback(() => {
    try {
      if (!input.trim()) {
        setIsValid(true);
        setError(null);
        setErrorLine(null);
        return;
      }

      JSON.parse(input);
      setIsValid(true);
      setError(null);
      setErrorLine(null);
      setTreeData(buildTree(JSON.parse(input)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setErrorLine(extractErrorLine(errorMessage, input));
      setIsValid(false);
    }
  }, [input]);

  // Auto-detect and fix common errors
  const fixJSON = useCallback(() => {
    try {
      let fixed = input;

      // Fix single quotes to double quotes
      fixed = fixed.replace(/'/g, '"');

      // Fix unquoted keys
      fixed = fixed.replace(/(\w+):/g, '"$1":');

      // Fix trailing commas
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

      // Fix missing commas between objects
      fixed = fixed.replace(/}\s*{/g, '},{');
      fixed = fixed.replace(/]\s*\[/g, '],[');

      setInput(fixed);
      formatJSON();
    } catch (err) {
      // If fixing fails, keep original
    }
  }, [input, formatJSON]);

  // Build tree structure for JSON
  const buildTree = (data: any): JsonNode => {
    if (data === null) {
      return { value: null, type: 'null' };
    }

    if (Array.isArray(data)) {
      return {
        value: `Array(${data.length})`,
        type: 'array',
        children: data.map((item, index) => ({
          key: index.toString(),
          ...buildTree(item),
        })),
      };
    }

    if (typeof data === 'object') {
      return {
        value: 'Object',
        type: 'object',
        children: Object.entries(data).map(([key, value]) => ({
          key,
          ...buildTree(value),
        })),
      };
    }

    return {
      value: data,
      type: typeof data === 'string' ? 'string' : typeof data === 'number' ? 'number' : 'boolean',
    };
  };

  // Extract line number from error message
  const extractErrorLine = (errorMessage: string, jsonInput: string): number | null => {
    const match = errorMessage.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1], 10);
      const lines = jsonInput.substring(0, position).split('\n');
      return lines.length;
    }
    return null;
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as JSON file
  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Apply syntax highlighting
  useEffect(() => {
    if (outputRef.current && output) {
      Prism.highlightElement(outputRef.current);
    }
  }, [output, mode]);

  // Render tree node
  const renderTreeNode = (node: JsonNode, depth = 0): React.ReactNode => {
    const paddingLeft = depth * 16;

    const getValueColor = (type: string) => {
      switch (type) {
        case 'string':
          return 'text-green-400';
        case 'number':
          return 'text-blue-400';
        case 'boolean':
          return 'text-yellow-400';
        case 'null':
          return 'text-gray-400';
        default:
          return 'text-foreground';
      }
    };

    if (node.type === 'object' || node.type === 'array') {
      return (
        <div key={depth} style={{ paddingLeft }}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-purple-400">
              {node.key && <span className="text-blue-300">"{node.key}": </span>}
              {node.type === 'object' ? '{' : '['}
            </span>
            <span className="text-muted-foreground text-sm">{node.value}</span>
          </div>
          {node.children && (
            <div className="ml-4">
              {node.children.map((child, index) => (
                <div key={index}>{renderTreeNode(child, depth + 1)}</div>
              ))}
            </div>
          )}
          <div style={{ paddingLeft }}>
            <span className="font-medium text-purple-400">{node.type === 'object' ? '}' : ']'}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={depth} style={{ paddingLeft }} className="flex items-center gap-2">
        {node.key && <span className="text-blue-300">"{node.key}": </span>}
        <span className={getValueColor(node.type)}>
          {node.type === 'string' ? `"${node.value}"` : String(node.value)}
        </span>
      </div>
    );
  };

  // Add line numbers to output
  const renderOutputWithLineNumbers = () => {
    const lines = output.split('\n');
    return (
      <div className="flex">
        <div className="text-right pr-3 text-muted-foreground text-sm select-none border-r border-border">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="flex-1 pl-3 text-sm font-mono overflow-x-auto">
          <code ref={outputRef} className="language-json">
            {output}
          </code>
        </pre>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Input JSON</label>
          <textarea
            placeholder='{"name":"John","age":30}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={formatJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <Code size={16} />
            Format
          </button>
          <button
            onClick={minifyJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Minify
          </button>
          <button
            onClick={validateJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Validate
          </button>
          <button
            onClick={fixJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Auto Fix
          </button>
          <button
            onClick={() => {
              setInput('');
              setOutput('');
              setError(null);
              setErrorLine(null);
              setIsValid(true);
              setTreeData(null);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
            Clear
          </button>
        </div>

        {/* Error Display */}
        {!isValid && error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Invalid JSON</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
                {errorLine && (
                  <p className="text-xs text-destructive/60 mt-1">Error at line {errorLine}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Output Section */}
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Output</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode(mode === 'tree' ? 'formatted' : 'tree')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  mode === 'tree'
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <TreeDeciduous size={16} />
                Tree View
              </button>
            </div>
          </div>

          <div className="border border-input rounded-md bg-background">
            {mode === 'tree' && treeData ? (
              <div className="p-4 font-mono text-sm overflow-x-auto max-h-[400px] overflow-y-auto">
                {renderTreeNode(treeData)}
              </div>
            ) : (
              <div className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
                {renderOutputWithLineNumbers()}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
