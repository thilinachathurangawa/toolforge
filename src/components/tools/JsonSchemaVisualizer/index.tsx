'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Network, AlertCircle } from 'lucide-react';

export function JsonSchemaVisualizer() {
  const [input, setInput] = useState('');
  const [tree, setTree] = useState<SchemaNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  interface SchemaNode {
    key?: string;
    type: string;
    description?: string;
    children?: SchemaNode[];
  }

  const buildSchemaTree = (data: any, key?: string): SchemaNode => {
    if (data === null) {
      return { key, type: 'null' };
    }

    if (Array.isArray(data)) {
      const itemType = data.length > 0 ? typeof data[0] : 'any';
      return {
        key,
        type: 'array',
        description: `Array of ${itemType}`,
        children: data.slice(0, 5).map((item, i) => buildSchemaTree(item, `[${i}]`)),
      };
    }

    if (typeof data === 'object') {
      return {
        key,
        type: 'object',
        children: Object.entries(data).map(([k, v]) => buildSchemaTree(v, k)),
      };
    }

    return {
      key,
      type: typeof data,
    };
  };

  const visualize = useCallback(() => {
    try {
      setError(null);
      setTree(null);

      if (!input.trim()) {
        return;
      }

      const data = JSON.parse(input);
      const schemaTree = buildSchemaTree(data);
      setTree(schemaTree);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setTree(null);
    }
  }, [input]);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(tree, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    visualize();
  }, [visualize]);

  const renderTreeNode = (node: SchemaNode, depth = 0): React.ReactNode => {
    const paddingLeft = depth * 20;

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'object': return 'text-purple-400';
        case 'array': return 'text-blue-400';
        case 'string': return 'text-green-400';
        case 'number': return 'text-yellow-400';
        case 'boolean': return 'text-pink-400';
        case 'null': return 'text-gray-400';
        default: return 'text-foreground';
      }
    };

    return (
      <div key={depth}>
        <div style={{ paddingLeft }} className="flex items-center gap-2 py-1">
          <Network size={14} className="text-muted-foreground" />
          {node.key && <span className="text-blue-300 font-medium">{node.key}:</span>}
          <span className={`text-sm font-medium ${getTypeColor(node.type)}`}>{node.type}</span>
          {node.description && <span className="text-xs text-muted-foreground">({node.description})</span>}
        </div>
        {node.children && (
          <div className="ml-4">
            {node.children.map((child, i) => (
              <div key={i}>{renderTreeNode(child, depth + 1)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSON Input</label>
          <textarea
            placeholder='{"name":"John","age":30,"address":{"city":"NYC"}}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <button
          onClick={visualize}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <Network size={16} />
          Visualize Schema
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
      {tree && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Schema Tree</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            {renderTreeNode(tree)}
          </div>
        </div>
      )}
    </div>
  );
}
