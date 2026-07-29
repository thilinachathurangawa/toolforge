'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GitCompare, AlertCircle, Upload, X, RotateCcw, FileText, Download, Search, Filter, Eye, EyeOff, ChevronDown, ChevronUp, Settings, Info } from 'lucide-react';
import Papa from 'papaparse';

type RowStatus = 'unchanged' | 'modified' | 'added' | 'removed';
type Delimiter = ',' | ';' | '\t' | '|' | 'custom';
type QuoteChar = '"' | "'" | 'custom';
type Encoding = 'UTF-8' | 'ASCII' | 'ISO-8859-1' | 'UTF-16';
type ViewMode = 'merged' | 'side-by-side';

interface DiffRow {
  status: RowStatus;
  original: string[];
  modified: string[];
  rowIndex?: number;
}

interface ComparisonStats {
  totalRows: number;
  totalColumns: number;
  origFileSize: number;
  modFileSize: number;
  processingTime: number;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  changePercentage: number;
}

interface ParseOptions {
  delimiter: Delimiter;
  customDelimiter: string;
  headerRow: boolean;
  autoDetectDelimiter: boolean;
  quoteChar: QuoteChar;
  customQuoteChar: string;
  encoding: Encoding;
  skipEmptyRows: boolean;
}

interface ComparisonOptions {
  keyColumn: number;
  caseSensitive: boolean;
  ignoreWhitespace: boolean;
  trimCells: boolean;
}

const SAMPLE_CSV = `name,age,city
Alice,30,New York
Bob,25,Los Angeles
Charlie,28,Chicago
David,35,Houston`;

const SAMPLE_CSV_MODIFIED = `name,age,city
Alice,31,New York
Charlie,28,Chicago
David,35,Houston
Eve,27,Phoenix`;

export function CsvDiffViewer() {
  const [origInput, setOrigInput] = useState('');
  const [modInput, setModInput] = useState('');
  const [origFileName, setOrigFileName] = useState('');
  const [modFileName, setModFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DiffRow[]>([]);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [summary, setSummary] = useState<{ added: number; removed: number; modified: number } | null>(null);
  const [stats, setStats] = useState<ComparisonStats | null>(null);
  
  // Parse options
  const [parseOptions, setParseOptions] = useState<ParseOptions>({
    delimiter: ',',
    customDelimiter: ',',
    headerRow: true,
    autoDetectDelimiter: false,
    quoteChar: '"',
    customQuoteChar: '"',
    encoding: 'UTF-8',
    skipEmptyRows: true,
  });
  
  // Comparison options
  const [comparisonOptions, setComparisonOptions] = useState<ComparisonOptions>({
    keyColumn: 0,
    caseSensitive: false,
    ignoreWhitespace: true,
    trimCells: true,
  });
  
  // Display options
  const [viewMode, setViewMode] = useState<ViewMode>('merged');
  const [statusFilter, setStatusFilter] = useState<RowStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const origFileInputRef = useRef<HTMLInputElement>(null);
  const modFileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<'orig' | 'mod' | null>(null);

  const getDelimiter = () => {
    if (parseOptions.autoDetectDelimiter) return '';
    return parseOptions.delimiter === 'custom' ? parseOptions.customDelimiter : parseOptions.delimiter;
  };

  const getQuoteChar = () => {
    return parseOptions.quoteChar === 'custom' ? parseOptions.customQuoteChar : parseOptions.quoteChar;
  };

  const handleFileUpload = useCallback((file: File, isOriginal: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (isOriginal) {
        setOrigInput(content);
        setOrigFileName(file.name);
      } else {
        setModInput(content);
        setModFileName(file.name);
      }
    };
    reader.readAsText(file, parseOptions.encoding);
  }, [parseOptions.encoding]);

  const handleDragOver = (e: React.DragEvent, side: 'orig' | 'mod') => {
    e.preventDefault();
    setDragOver(side);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, side: 'orig' | 'mod') => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFileUpload(file, side === 'orig');
    }
  };

  const loadSampleData = () => {
    setOrigInput(SAMPLE_CSV);
    setModInput(SAMPLE_CSV_MODIFIED);
 setError('');
 setWarning('');
  };

  const clearInput = (side: 'orig' | 'mod') => {
    if (side === 'orig') {
      setOrigInput('');
      setOrigFileName('');
    } else {
      setModInput('');
      setModFileName('');
    }
  };

  const resetAll = () => {
    setOrigInput('');
    setModInput('');
    setOrigFileName('');
    setModFileName('');
    setHeaders([]);
    setRows([]);
    setError('');
    setWarning('');
    setSummary(null);
    setStats(null);
    setSearchQuery('');
    setStatusFilter('all');
    setHiddenColumns(new Set());
    setCurrentPage(1);
  };

  const normalizeCell = (cell: string): string => {
    let normalized = cell;
    if (comparisonOptions.trimCells) {
      normalized = normalized.trim();
    }
    if (comparisonOptions.ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ');
    }
    if (!comparisonOptions.caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    return normalized;
  };

  const diffCsv = useCallback((origData: string[][], modData: string[][]): DiffRow[] => {
    const rows: DiffRow[] = [];
    const keyCol = comparisonOptions.keyColumn;
    
    // Build maps for efficient lookup
    const origMap = new Map<string, { data: string[]; index: number }>();
    origData.forEach((row, idx) => {
      const key = normalizeCell(row[keyCol] || String(idx));
      origMap.set(key, { data: row, index: idx });
    });
    
    const modMap = new Map<string, { data: string[]; index: number }>();
    modData.forEach((row, idx) => {
      const key = normalizeCell(row[keyCol] || String(idx));
      modMap.set(key, { data: row, index: idx });
    });
    
    // Find added rows (in mod but not in orig)
    modMap.forEach((modEntry, key) => {
      if (!origMap.has(key)) {
        rows.push({ status: 'added', original: [], modified: modEntry.data, rowIndex: modEntry.index });
      }
    });
    
    // Find removed rows (in orig but not in mod)
    origMap.forEach((origEntry, key) => {
      if (!modMap.has(key)) {
        rows.push({ status: 'removed', original: origEntry.data, modified: [], rowIndex: origEntry.index });
      }
    });
    
    // Find modified rows (in both but different)
    origMap.forEach((origEntry, key) => {
      const modEntry = modMap.get(key);
      if (modEntry) {
        const changed = origEntry.data.some((cell, j) => {
          const origNorm = normalizeCell(cell);
          const modNorm = normalizeCell(modEntry.data[j] || '');
          return origNorm !== modNorm;
        });
        if (changed) {
          rows.push({ status: 'modified', original: origEntry.data, modified: modEntry.data, rowIndex: origEntry.index });
        } else {
          rows.push({ status: 'unchanged', original: origEntry.data, modified: modEntry.data, rowIndex: origEntry.index });
        }
      }
    });
    
    // Sort by original index for consistent ordering
    rows.sort((a, b) => (a.rowIndex || 0) - (b.rowIndex || 0));
    
    return rows;
  }, [comparisonOptions.keyColumn, comparisonOptions.caseSensitive, comparisonOptions.ignoreWhitespace, comparisonOptions.trimCells]);

  const compare = useCallback(() => {
    const startTime = performance.now();
    
    if (!origInput.trim() || !modInput.trim()) return;
    
    const delimiter = getDelimiter();
    const quoteChar = getQuoteChar();
    
    const origResult = Papa.parse<string[]>(origInput.trim(), {
      delimiter: delimiter || undefined,
      quoteChar: quoteChar as any,
      skipEmptyLines: parseOptions.skipEmptyRows,
    });
    
    const modResult = Papa.parse<string[]>(modInput.trim(), {
      delimiter: delimiter || undefined,
      quoteChar: quoteChar as any,
      skipEmptyLines: parseOptions.skipEmptyRows,
    });
    
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
    
    // Check row limit
    const maxRows = Math.max(origData.length, modData.length);
    if (maxRows > 1000) {
      setWarning(`Large CSV detected (${maxRows} rows). Performance may be affected.`);
    } else {
      setWarning('');
    }
    
    const firstOrigRow = origData[0] ?? [];
    const firstModRow = modData[0] ?? [];
    
    let hdrs: string[];
    let origRows: string[][];
    let modRows: string[][];
    
    if (parseOptions.headerRow) {
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
    const endTime = performance.now();
    
    setHeaders(hdrs);
    setRows(diffRows);
    setCurrentPage(1);
    
    const added = diffRows.filter(r => r.status === 'added').length;
    const removed = diffRows.filter(r => r.status === 'removed').length;
    const modified = diffRows.filter(r => r.status === 'modified').length;
    const unchanged = diffRows.filter(r => r.status === 'unchanged').length;
    const total = diffRows.length;
    
    setSummary({ added, removed, modified });
    setStats({
      totalRows: total,
      totalColumns: hdrs.length,
      origFileSize: origInput.length,
      modFileSize: modInput.length,
      processingTime: endTime - startTime,
      added,
      removed,
      modified,
      unchanged,
      changePercentage: total > 0 ? ((added + removed + modified) / total * 100).toFixed(1) : '0',
    });
  }, [origInput, modInput, parseOptions, comparisonOptions, getDelimiter, getQuoteChar, diffCsv]);

  const exportResults = (format: 'csv' | 'json') => {
    if (rows.length === 0) return;
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'csv') {
      const csvHeaders = ['Status', ...headers];
      const csvRows = rows.map(row => [
        row.status,
        ...row.modified.map(cell => `"${cell.replace(/"/g, '""')}"`)
      ]);
      content = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');
      filename = 'csv-diff-results.csv';
      mimeType = 'text/csv';
    } else {
      const jsonContent = {
        headers,
        rows: rows.map(row => ({
          status: row.status,
          original: row.original,
          modified: row.modified,
        })),
        summary,
        stats,
      };
      content = JSON.stringify(jsonContent, null, 2);
      filename = 'csv-diff-results.json';
      mimeType = 'application/json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportStats = () => {
    if (!stats) return;
    
    const content = JSON.stringify(stats, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csv-diff-stats.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumnVisibility = (colIndex: number) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(colIndex)) {
      newHidden.delete(colIndex);
    } else {
      newHidden.add(colIndex);
    }
    setHiddenColumns(newHidden);
  };

  const visibleHeaders = headers.filter((_, i) => !hiddenColumns.has(i));
  const visibleRows = rows.filter(row => {
    const matchesFilter = statusFilter === 'all' || row.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      row.original.some(cell => cell.toLowerCase().includes(searchQuery.toLowerCase())) ||
      row.modified.some(cell => cell.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });
  
  const totalPages = Math.ceil(visibleRows.length / rowsPerPage);
  const paginatedRows = visibleRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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

  const textareaCls = 'w-full min-h-[140px] px-3 py-2 text-xs font-mono bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
  const dropZoneCls = (side: 'orig' | 'mod') => `
    relative transition-all duration-200
    ${dragOver === side ? 'border-accent bg-accent/5' : 'border-border'}
  `;

  return (
    <div className="w-full space-y-5">
      {/* Settings Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={16} />
          {showSettings ? 'Hide Settings' : 'Show Settings'}
          {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={loadSampleData}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText size={16} />
            Load Sample
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw size={16} />
            Reset All
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 space-y-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground">CSV Parsing Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Delimiter</label>
              <select
                value={parseOptions.delimiter}
                onChange={e => setParseOptions({ ...parseOptions, delimiter: e.target.value as Delimiter })}
                className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {parseOptions.delimiter === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Custom Delimiter</label>
                <input
                  type="text"
                  value={parseOptions.customDelimiter}
                  onChange={e => setParseOptions({ ...parseOptions, customDelimiter: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                  maxLength={1}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Quote Character</label>
              <select
                value={parseOptions.quoteChar}
                onChange={e => setParseOptions({ ...parseOptions, quoteChar: e.target.value as QuoteChar })}
                className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value='"'>Double Quote (")</option>
                <option value="'">Single Quote (')</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {parseOptions.quoteChar === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Custom Quote</label>
                <input
                  type="text"
                  value={parseOptions.customQuoteChar}
                  onChange={e => setParseOptions({ ...parseOptions, customQuoteChar: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                  maxLength={1}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Encoding</label>
              <select
                value={parseOptions.encoding}
                onChange={e => setParseOptions({ ...parseOptions, encoding: e.target.value as Encoding })}
                className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="UTF-8">UTF-8</option>
                <option value="ASCII">ASCII</option>
                <option value="ISO-8859-1">ISO-8859-1</option>
                <option value="UTF-16">UTF-16</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="headerRow"
                checked={parseOptions.headerRow}
                onChange={e => setParseOptions({ ...parseOptions, headerRow: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="headerRow" className="text-xs font-medium text-muted-foreground">First row is header</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDetect"
                checked={parseOptions.autoDetectDelimiter}
                onChange={e => setParseOptions({ ...parseOptions, autoDetectDelimiter: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="autoDetect" className="text-xs font-medium text-muted-foreground">Auto-detect delimiter</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skipEmpty"
                checked={parseOptions.skipEmptyRows}
                onChange={e => setParseOptions({ ...parseOptions, skipEmptyRows: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="skipEmpty" className="text-xs font-medium text-muted-foreground">Skip empty rows</label>
            </div>
          </div>
          
          <h3 className="text-sm font-semibold text-foreground pt-2">Comparison Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Key Column for Matching</label>
              <select
                value={comparisonOptions.keyColumn}
                onChange={e => setComparisonOptions({ ...comparisonOptions, keyColumn: parseInt(e.target.value) })}
                className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {headers.map((h, i) => (
                  <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="caseSensitive"
                checked={comparisonOptions.caseSensitive}
                onChange={e => setComparisonOptions({ ...comparisonOptions, caseSensitive: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="caseSensitive" className="text-xs font-medium text-muted-foreground">Case sensitive</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ignoreWhitespace"
                checked={comparisonOptions.ignoreWhitespace}
                onChange={e => setComparisonOptions({ ...comparisonOptions, ignoreWhitespace: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="ignoreWhitespace" className="text-xs font-medium text-muted-foreground">Ignore whitespace</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="trimCells"
                checked={comparisonOptions.trimCells}
                onChange={e => setComparisonOptions({ ...comparisonOptions, trimCells: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="trimCells" className="text-xs font-medium text-muted-foreground">Trim cells</label>
            </div>
          </div>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`space-y-2 p-3 border-2 border-dashed rounded-lg ${dropZoneCls('orig')}`}
             onDragOver={e => handleDragOver(e, 'orig')}
             onDragLeave={handleDragLeave}
             onDrop={e => handleDrop(e, 'orig')}>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Original CSV</label>
            <div className="flex gap-1">
              <input
                ref={origFileInputRef}
                type="file"
                accept=".csv"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)}
                className="hidden"
              />
              <button
                onClick={() => origFileInputRef.current?.click()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                title="Upload CSV file"
              >
                <Upload size={14} />
              </button>
              {origInput && (
                <button
                  onClick={() => clearInput('orig')}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                  title="Clear input"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          {origFileName && (
            <p className="text-xs text-muted-foreground truncate">{origFileName}</p>
          )}
          <textarea
            value={origInput}
            onChange={e => setOrigInput(e.target.value)}
            placeholder={'name,age\nAlice,30\nBob,25'}
            className={textareaCls}
          />
        </div>
        
        <div className={`space-y-2 p-3 border-2 border-dashed rounded-lg ${dropZoneCls('mod')}`}
             onDragOver={e => handleDragOver(e, 'mod')}
             onDragLeave={handleDragLeave}
             onDrop={e => handleDrop(e, 'mod')}>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Modified CSV</label>
            <div className="flex gap-1">
              <input
                ref={modFileInputRef}
                type="file"
                accept=".csv"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)}
                className="hidden"
              />
              <button
                onClick={() => modFileInputRef.current?.click()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                title="Upload CSV file"
              >
                <Upload size={14} />
              </button>
              {modInput && (
                <button
                  onClick={() => clearInput('mod')}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                  title="Clear input"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          {modFileName && (
            <p className="text-xs text-muted-foreground truncate">{modFileName}</p>
          )}
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

      {warning && (
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">{warning}</p>
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-500/10 text-green-700 dark:text-green-400">{summary.added} added</span>
            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-500/10 text-red-700 dark:text-red-400">{summary.removed} removed</span>
            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">{summary.modified} modified</span>
            
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info size={14} />
                {showStats ? 'Hide' : 'Show'} Stats
              </button>
              <button
                onClick={() => exportResults('csv')}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download size={14} />
                CSV
              </button>
              <button
                onClick={() => exportResults('json')}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download size={14} />
                JSON
              </button>
            </div>
          </div>
          
          {showStats && stats && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Rows</p>
                  <p className="font-medium text-foreground">{stats.totalRows}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Columns</p>
                  <p className="font-medium text-foreground">{stats.totalColumns}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Original Size</p>
                  <p className="font-medium text-foreground">{(stats.origFileSize / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modified Size</p>
                  <p className="font-medium text-foreground">{(stats.modFileSize / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Processing Time</p>
                  <p className="font-medium text-foreground">{stats.processingTime.toFixed(2)} ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unchanged</p>
                  <p className="font-medium text-foreground">{stats.unchanged}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Change Percentage</p>
                  <p className="font-medium text-foreground">{stats.changePercentage}%</p>
                </div>
                <div>
                  <button
                    onClick={exportStats}
                    className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors"
                  >
                    <Download size={12} />
                    Export Stats
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 w-40"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as RowStatus | 'all')}
                className="px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="all">All Status</option>
                <option value="added">Added</option>
                <option value="removed">Removed</option>
                <option value="modified">Modified</option>
                <option value="unchanged">Unchanged</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'merged' ? 'side-by-side' : 'merged')}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye size={14} />
                {viewMode === 'merged' ? 'Side-by-Side' : 'Merged'}
              </button>
            </div>
          </div>
          
          {/* Column Visibility */}
          {headers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {headers.map((h, i) => (
                <button
                  key={i}
                  onClick={() => toggleColumnVisibility(i)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    hiddenColumns.has(i)
                      ? 'bg-muted text-muted-foreground line-through'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  {h || `Col ${i + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 font-medium text-left text-muted-foreground w-24">Status</th>
                  {viewMode === 'side-by-side' ? (
                    <>
                      <th className="px-3 py-2 font-medium text-left text-muted-foreground bg-red-500/5">Original</th>
                      <th className="px-3 py-2 font-medium text-left text-muted-foreground bg-green-500/5">Modified</th>
                    </>
                  ) : (
                    visibleHeaders.map((h, i) => (
                      <th key={i} className="px-3 py-2 font-medium text-left text-muted-foreground">{h}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, ri) => (
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
                    {viewMode === 'side-by-side' ? (
                      <>
                        <td className="px-3 py-1.5 font-mono bg-red-500/5">
                          {row.original.filter((_, i) => !hiddenColumns.has(i)).join(', ')}
                        </td>
                        <td className="px-3 py-1.5 font-mono bg-green-500/5">
                          {row.modified.filter((_, i) => !hiddenColumns.has(i)).join(', ')}
                        </td>
                      </>
                    ) : (
                      headers.map((_, ci) => {
                        if (hiddenColumns.has(ci)) return null;
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
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Next
              </button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            Showing {paginatedRows.length} of {visibleRows.length} rows (filtered from {rows.length} total)
          </p>
        </div>
      )}
    </div>
  );
}
