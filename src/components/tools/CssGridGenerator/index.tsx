'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Grid3x3, AlertCircle } from 'lucide-react';

export function CssGridGenerator() {
  const [columns, setColumns] = useState('3');
  const [rows, setRows] = useState('3');
  const [gap, setGap] = useState('16px');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generateGrid = useCallback(() => {
    const css = `.grid-container {
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  gap: ${gap};
}

.grid-item {
  /* Your item styles */
}`;
    setOutput(css);
  }, [columns, rows, gap]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  const gridItems = Array.from({ length: parseInt(columns) * parseInt(rows) }, (_, i) => i + 1);

  return (
    <div className="w-full space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Columns</label>
          <input
            type="number"
            min="1"
            max="12"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Rows</label>
          <input
            type="number"
            min="1"
            max="12"
            value={rows}
            onChange={(e) => setRows(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Gap</label>
          <input
            type="text"
            value={gap}
            onChange={(e) => setGap(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      <button
        onClick={generateGrid}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
      >
        <Grid3x3 size={16} />
        Generate Grid
      </button>

      {/* Preview */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Preview</label>
        <div
          className="border border-input rounded-md p-4 bg-background"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: gap,
          }}
        >
          {gridItems.map((item) => (
            <div
              key={item}
              className="aspect-square bg-accent/20 border border-accent/30 rounded flex items-center justify-center text-sm font-medium text-accent"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">CSS Code</label>
          <button
            onClick={copy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-4 border border-input rounded-md bg-background">
          <pre className="text-sm font-mono text-foreground">{output}</pre>
        </div>
      </div>
    </div>
  );
}
