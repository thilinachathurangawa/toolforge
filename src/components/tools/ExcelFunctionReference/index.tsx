'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  EXCEL_CATEGORIES,
  EXCEL_FUNCTIONS,
  type ExcelFunctionDef,
} from '@/lib/data/excel-functions';

// The function database lives in src/lib/data/excel-functions.ts and is shared
// with the Excel Formula Explainer, so both tools describe a function the same
// way and gain new entries at the same time.
type FunctionInfo = ExcelFunctionDef;

const CATEGORIES = ['All', ...EXCEL_CATEGORIES];

export function ExcelFunctionReference() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFunction, setSelectedFunction] = useState<FunctionInfo | null>(null);
  const [copied, setCopied] = useState(false);

  // The Formula Explainer links here with ?fn=NAME to open a specific entry.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('fn');
    if (!requested) return;
    const match = EXCEL_FUNCTIONS[requested.toUpperCase()];
    if (match) {
      setSelectedFunction(match);
      setSearchQuery(match.name);
    }
  }, []);

  const filteredFunctions = useMemo(() => {
    return Object.values(EXCEL_FUNCTIONS).filter((func) => {
      const matchesSearch =
        func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        func.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        func.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'All' || func.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = () => {
    if (selectedFunction) {
      navigator.clipboard.writeText(selectedFunction.syntax);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRelatedFunctions = (currentFunc: FunctionInfo) => {
    return Object.values(EXCEL_FUNCTIONS)
      .filter((f) => f.category === currentFunc.category && f.name !== currentFunc.name)
      .slice(0, 3);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search functions by name or keyword..."
            className="w-full pl-10 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors',
                selectedCategory === category
                  ? 'bg-accent text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Function List */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {filteredFunctions.length} function{filteredFunctions.length !== 1 ? 's' : ''} found
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredFunctions.map((func) => (
            <button
              key={func.name}
              onClick={() => setSelectedFunction(func)}
              className={cn(
                'p-3 text-left rounded-md transition-colors border',
                selectedFunction?.name === func.name
                  ? 'bg-accent text-white border-accent'
                  : 'bg-background border-input hover:bg-muted/50'
              )}
            >
              <div className="font-medium">{func.name}</div>
              <div className="text-xs opacity-80">{func.category}</div>
              <div className="text-xs opacity-70 mt-1 line-clamp-2">{func.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Function Details */}
      {selectedFunction && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{selectedFunction.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedFunction.category}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Syntax'}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">{selectedFunction.description}</p>
            <div className="p-2 bg-background rounded-md">
              <code className="text-sm font-mono">{selectedFunction.syntax}</code>
            </div>
          </div>

          {selectedFunction.arguments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Arguments</h4>
              <div className="space-y-1">
                {selectedFunction.arguments.map((arg, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-mono font-medium">{arg.name}</span>
                    <span className="text-muted-foreground">: {arg.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Functions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Related Functions</h4>
            <div className="flex flex-wrap gap-2">
              {getRelatedFunctions(selectedFunction).map((func) => (
                <button
                  key={func.name}
                  onClick={() => setSelectedFunction(func)}
                  className="px-2 py-1 text-xs bg-background border border-input rounded-md hover:bg-muted/50 transition-colors"
                >
                  {func.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
