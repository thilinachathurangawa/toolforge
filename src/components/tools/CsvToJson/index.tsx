'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Copy, Check, Upload, X, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export function CsvToJson() {
  const [csvInput, setCsvInput] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [skipEmpty, setSkipEmpty] = useState(true);
  const [parseTypes, setParseTypes] = useState(true);
  const [output, setOutput] = useState('');
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback((csv: string) => {
    if (!csv.trim()) { setOutput(''); setError(''); setRowCount(null); return; }
    const result = Papa.parse(csv, {
      header: hasHeader,
      skipEmptyLines: skipEmpty,
      dynamicTyping: parseTypes,
    });
    if (result.errors.length > 0 && result.data.length === 0) {
      setError(result.errors[0].message);
      setOutput('');
      setRowCount(null);
      return;
    }
    setError('');
    const json = JSON.stringify(result.data, null, 2);
    setOutput(json);
    setRowCount(result.data.length);
  }, [hasHeader, skipEmpty, parseTypes]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setCsvInput(text);
      convert(text);
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => { setCsvInput(''); setOutput(''); setError(''); setRowCount(null); };

  React.useEffect(() => { convert(csvInput); }, [csvInput, convert]);

  const textareaCls = 'w-full min-h-[160px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  return (
    <div className="w-full space-y-5">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">CSV Input</label>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Upload size={12} />
            Upload File
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative rounded-md transition-colors ${dragging ? 'ring-2 ring-accent bg-accent/5' : ''}`}
        >
          <textarea
            value={csvInput}
            onChange={e => setCsvInput(e.target.value)}
            placeholder={'name,age,city\nAlice,30,London\nBob,25,Paris'}
            className={textareaCls}
          />
          {dragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent/10 rounded-md pointer-events-none">
              <p className="text-sm font-medium text-accent">Drop CSV file here</p>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Has Header Row', value: hasHeader, set: setHasHeader },
          { label: 'Skip Empty Lines', value: skipEmpty, set: setSkipEmpty },
          { label: 'Parse Numbers & Booleans', value: parseTypes, set: setParseTypes },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={opt.value}
              onChange={e => opt.set(e.target.checked)}
              className="rounded border-input accent-accent"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              JSON Output
              {rowCount !== null && <span className="ml-2 text-xs text-muted-foreground">({rowCount} rows)</span>}
            </label>
            <div className="flex gap-2">
              <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button onClick={clear} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                <X size={12} />
                Clear
              </button>
            </div>
          </div>
          <textarea readOnly value={output} className={`${textareaCls} min-h-[200px] bg-muted`} />
        </div>
      )}
    </div>
  );
}
