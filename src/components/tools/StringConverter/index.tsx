'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, ArrowUpDown } from 'lucide-react';

type CaseType = 'camelCase' | 'snake_case' | 'kebab-case' | 'PascalCase' | 'SCREAMING_SNAKE_CASE' | 'train-case' | 'dot.case' | 'space case' | 'lowercase' | 'UPPERCASE';

const CASES: { value: CaseType; label: string; example: string }[] = [
  { value: 'camelCase', label: 'camelCase', example: 'myVariableName' },
  { value: 'snake_case', label: 'snake_case', example: 'my_variable_name' },
  { value: 'kebab-case', label: 'kebab-case', example: 'my-variable-name' },
  { value: 'PascalCase', label: 'PascalCase', example: 'MyVariableName' },
  { value: 'SCREAMING_SNAKE_CASE', label: 'SCREAMING_SNAKE_CASE', example: 'MY_VARIABLE_NAME' },
  { value: 'train-case', label: 'train-case', example: 'My-Variable-Name' },
  { value: 'dot.case', label: 'dot.case', example: 'my.variable.name' },
  { value: 'space case', label: 'space case', example: 'my variable name' },
  { value: 'lowercase', label: 'lowercase', example: 'myvariablename' },
  { value: 'UPPERCASE', label: 'UPPERCASE', example: 'MYVARIABLENAME' },
];

export function StringConverter() {
  const [input, setInput] = useState('');
  const [fromCase, setFromCase] = useState<CaseType>('camelCase');
  const [toCase, setToCase] = useState<CaseType>('snake_case');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const convertCase = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    // First, normalize to words
    let words: string[] = [];

    switch (fromCase) {
      case 'camelCase':
        words = input.split(/(?=[A-Z])/).map(w => w.toLowerCase());
        break;
      case 'snake_case':
        words = input.split('_');
        break;
      case 'kebab-case':
        words = input.split('-');
        break;
      case 'PascalCase':
        words = input.split(/(?=[A-Z])/).map(w => w.toLowerCase());
        break;
      case 'SCREAMING_SNAKE_CASE':
        words = input.split('_').map(w => w.toLowerCase());
        break;
      case 'train-case':
        words = input.split('-').map(w => w.toLowerCase());
        break;
      case 'dot.case':
        words = input.split('.');
        break;
      case 'space case':
        words = input.split(' ');
        break;
      case 'lowercase':
        words = [input];
        break;
      case 'UPPERCASE':
        words = [input.toLowerCase()];
        break;
    }

    // Filter empty words
    words = words.filter(w => w.length > 0);

    // Convert to target case
    let result = '';
    switch (toCase) {
      case 'camelCase':
        result = words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
        break;
      case 'snake_case':
        result = words.join('_');
        break;
      case 'kebab-case':
        result = words.join('-');
        break;
      case 'PascalCase':
        result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        break;
      case 'SCREAMING_SNAKE_CASE':
        result = words.join('_').toUpperCase();
        break;
      case 'train-case':
        result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
        break;
      case 'dot.case':
        result = words.join('.');
        break;
      case 'space case':
        result = words.join(' ');
        break;
      case 'lowercase':
        result = words.join('');
        break;
      case 'UPPERCASE':
        result = words.join('').toUpperCase();
        break;
    }

    setOutput(result);
  }, [input, fromCase, toCase]);

  const swapCases = () => {
    const temp = fromCase;
    setFromCase(toCase);
    setToCase(temp);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    convertCase();
  }, [convertCase]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Input String</label>
          <textarea
            placeholder="Enter text to convert..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      </div>

      {/* Case Selection */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">From</label>
            <select
              value={fromCase}
              onChange={(e) => setFromCase(e.target.value as CaseType)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {CASES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={swapCases}
            className="mt-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown size={20} />
          </button>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">To</label>
            <select
              value={toCase}
              onChange={(e) => setToCase(e.target.value as CaseType)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              {CASES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Output</label>
            <button
              onClick={copy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4 border border-input rounded-md bg-background">
            <code className="text-sm font-mono text-foreground">{output}</code>
          </div>
        </div>
      )}
    </div>
  );
}
