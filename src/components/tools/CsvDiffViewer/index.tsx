'use client';

import React, { useState, useCallback } from 'react';
import { GitCompare, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

type RowStatus = 'unchanged' | 'modified' | 'added' | 'removed';

interface DiffRow {
  status: RowStatus;
  original: string[];
  modified: string[];
}

function diffCsv(origData: string[][], modData: string[][]): DiffRow[] {
  const rows: DiffRow[] = [];
  const maxLen = Math.max(origData.length, modData.length);
  for (let i = 0; i < maxLen; i++) {
    const orig = origData[i] ?? null;
    const mod = modData[i] ?? null;
    if (!orig) {
      rows.push({ status: 'added', original: [], modified: mod });
    } else if (!mod) {
      rows.push({ status: 'removed', original: orig, modified: [] });
    } else {
      const changed = orig.some((cell, j) => cell !== (mod[j] ?? ''));
      rows.push({ status: changed ? 'modified' : 'unchanged', original: orig, modified: mod });
    }
  }
  return rows;
}

const statusColors: Record<RowStatus, string> = {
  unchanged: '',
  modified: '',
  added: 'bg-green-500/10',
  removed: 'bg-red-500/10',
};

const cellColors = (orig: string, mod: string, status: RowStatus) => {
  if (status === 'added') return 'bg-green-500/15 text-green-700 dark:text-green-400';
  if (status === 'removed') return 'bg-red-500/15 text-red-700 dark:text-red-400';
  if (status === 'modified' && orig !== mod) return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400';
  return '';
};

export function CsvDiffViewer() {
  const [origInput, setOrigInput] = useState('');
  const [modInput, setModInput] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DiffRow[]>([]);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<{ added: number; removed: number; modified: number } | null>(null);

  const compare = useCallback(() => {
    if (!origInput.trim() || !modInput.trim()) return;
    const origResult = Papa.parse<string[]>(origInput.trim(), { skipEmptyLines: true });
    const modResult = Papa.parse<string[]>(modInput.trim(), { skipEmptyLines: true });
    if (origResult.errors.length && !origResult.data.length) {
      setError('Original CSV: ' + origResult.errors[0].message);
      return;
    }
    if (modResult.errors.length && !modResult.data.length) {
      setError('Modified CSV: ' + modResult.errors[0].message);
      return;
    }
    setError('');

    const origData = origResult.data as string[][];
    const modData = modResult.data as string[][];

    const firstOrigRow = origData[0] ?? [];
    const firstModRow = modData[0] ?? [];
    const hasHeaders = firstOrigRow.length > 0 && isNaN(Number(firstOrigRow[0]));

    let hdrs: string[];
    let origRows: string[][];
    let modRows: string[][];

    if (hasHeaders) {
      hdrs = firstOrigRow;
      origRows = origData.slice(1);
      modRows = modData.slice(1);
    } else {
      const maxCols = Math.max(firstOrigRow.length, firstModRow.length);
      hdrs = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
      origRows = origData;
      modRows = modData;
    }

    const diffRows = diffCsv(origRows, modRows);
    setHeaders(hdrs);
    setRows(diffRows);
    setSummary({
      added: diffRows.filter(r => r.status === 'added').length,
      removed: diffRows.filter(r => r.status === 'removed').length,
      modified: diffRows.filter(r => r.status === 'modified').length,
    });
  }, [origInput, modInput]);

  const textareaCls = 'w-full min-h-[140px] px-3 py-2 text-xs font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';

  return (
    <div className="w-full space-y-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Original CSV</label>
          <textarea
            value={origInput}
            onChange={e => setOrigInput(e.target.value)}
            placeholder={'name,age\nAlice,30\nBob,25'}
            className={textareaCls}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Modified CSV</label>
          <textarea
            value={modInput}
            onChange={e => setModInput(e.target.value)}
            placeholder={'name,age\nAlice,31\nCharlie,28'}
            className={textareaCls}
          />
        </div>
      </div>

      <button
        onClick={compare}
        disabled={!origInput.trim() || !modInput.trim()}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <GitCompare size={16} />
        Compare
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {summary && (
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-500/10 text-green-700 dark:text-green-400">{summary.added} added</span>
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-500/10 text-red-700 dark:text-red-400">{summary.removed} removed</span>
          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">{summary.modified} modified</span>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted">
                <th className="px-3 py-2 font-medium text-left text-muted-foreground w-24">Status</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 font-medium text-left text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={`border-t border-border ${statusColors[row.status]}`}>
                  <td className="px-3 py-1.5 capitalize font-medium">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                      row.status === 'added' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                      row.status === 'removed' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                      row.status === 'modified' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                      'text-muted-foreground'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  {headers.map((_, ci) => {
                    const origCell = row.original[ci] ?? '';
                    const modCell = row.modified[ci] ?? '';
                    const displayCell = row.status === 'removed' ? origCell : modCell;
                    const cls = cellColors(origCell, modCell, row.status);
                    return (
                      <td key={ci} className={`px-3 py-1.5 font-mono ${cls}`}>
                        {row.status === 'modified' && origCell !== modCell ? (
                          <span>
                            <span className="line-through text-red-600 dark:text-red-400 mr-1">{origCell}</span>
                            <span className="text-green-600 dark:text-green-400">{modCell}</span>
                          </span>
                        ) : displayCell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
