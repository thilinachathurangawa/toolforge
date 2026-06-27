'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import yaml from 'js-yaml';

type Mode = 'yaml-to-json' | 'json-to-yaml';

export function YamlJsonConverter() {
  const [mode, setMode] = useState<Mode>('yaml-to-json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      if (mode === 'yaml-to-json') {
        const parsed = yaml.load(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(input);
        setOutput(yaml.dump(parsed, { indent: 2 }));
      }
      setError('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Parse error';
      setError(msg);
      setOutput('');
    }
  }, [input, mode]);

  useEffect(() => { convert(); }, [convert]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setInput('');
    setOutput('');
    setError('');
  };

  const textareaCls = 'w-full min-h-[260px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  const examples: Record<Mode, string> = {
    'yaml-to-json': 'name: Alice\nage: 30\ncity: London\nhobbies:\n  - reading\n  - coding',
    'json-to-yaml': '{\n  "name": "Alice",\n  "age": 30,\n  "city": "London",\n  "hobbies": ["reading", "coding"]\n}',
  };

  return (
    <div className="w-full space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(['yaml-to-json', 'json-to-yaml'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              mode === m
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {m === 'yaml-to-json' ? 'YAML → JSON' : 'JSON → YAML'}
          </button>
        ))}
      </div>

      {/* Split pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
            </label>
            <button
              onClick={() => setInput(examples[mode])}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >
              Load example
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={examples[mode]}
            className={textareaCls}
          />
          {error && (
            <div className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle size={14} className="text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive font-mono break-all whitespace-pre-wrap">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}
            </label>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            className={`${textareaCls} bg-muted`}
            placeholder="Output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
