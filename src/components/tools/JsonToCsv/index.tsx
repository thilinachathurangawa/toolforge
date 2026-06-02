'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, Download, AlertCircle } from 'lucide-react';

export function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const flattenObject = (obj: any, prefix = ''): any => {
    const result: any = {};
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
    return result;
  };

  const convertToCSV = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }

      const data = JSON.parse(input);
      const array = Array.isArray(data) ? data : [data];

      if (array.length === 0) {
        setError('No data to convert');
        setOutput('');
        return;
      }

      // Flatten objects and get all headers
      const flattened = array.map(item => flattenObject(item));
      const headers = Array.from(new Set(flattened.flatMap(Object.keys)));

      // Build CSV
      const csvRows: string[] = [];
      csvRows.push(headers.join(','));

      for (const row of flattened) {
        const values = headers.map(header => {
          const value = row[header];
          if (value === undefined || value === null) return '';
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma or quote
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvRows.push(values.join(','));
      }

      setOutput(csvRows.join('\n'));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setOutput('');
    }
  }, [input]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    convertToCSV();
  }, [convertToCSV]);

  return (
    <div className="w-full space-y-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSON Input</label>
          <textarea
            placeholder='[{"name":"John","age":30},{"name":"Jane","age":25}]'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[150px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
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

      {/* Output */}
      {output && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">CSV Output</label>
            <div className="flex items-center gap-2">
              <button
                onClick={copy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={download}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
          <div className="p-4 border border-input rounded-md bg-background max-h-[400px] overflow-y-auto">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
