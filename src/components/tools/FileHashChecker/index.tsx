'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, X, Copy, CheckCircle2, XCircle, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

interface HashState {
  file: File | null;
  algorithm: HashAlgorithm;
  hash: string;
  expectedHash: string;
  isCalculating: boolean;
  error: string | null;
}

type MatchResult = 'match' | 'no-match' | 'empty';

async function computeHash(file: File, algorithm: HashAlgorithm): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest(algorithm, buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getMatchResult(computed: string, expected: string): MatchResult {
  if (!expected.trim()) return 'empty';
  return computed.toLowerCase() === expected.trim().toLowerCase() ? 'match' : 'no-match';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const ALGORITHMS: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export function FileHashChecker() {
  const [state, setState] = useState<HashState>({
    file: null,
    algorithm: 'SHA-256',
    hash: '',
    expectedHash: '',
    isCalculating: false,
    error: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runHash = useCallback(async (file: File, algorithm: HashAlgorithm) => {
    setState(prev => ({ ...prev, isCalculating: true, error: null, hash: '' }));
    try {
      const result = await computeHash(file, algorithm);
      setState(prev => ({ ...prev, hash: result, isCalculating: false }));
    } catch {
      setState(prev => ({ ...prev, error: 'Failed to compute hash.', isCalculating: false }));
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    setState(prev => {
      runHash(file, prev.algorithm);
      return { ...prev, file, hash: '', error: null };
    });
  }, [runHash]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAlgorithmChange = useCallback((algo: HashAlgorithm) => {
    setState(prev => {
      if (prev.file) {
        runHash(prev.file, algo);
        return { ...prev, algorithm: algo, hash: '', error: null };
      }
      return { ...prev, algorithm: algo };
    });
  }, [runHash]);

  const handleRemoveFile = useCallback(() => {
    setState(prev => ({ ...prev, file: null, hash: '', error: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleCalculate = useCallback(() => {
    if (state.file && !state.isCalculating) {
      runHash(state.file, state.algorithm);
    }
  }, [state.file, state.algorithm, state.isCalculating, runHash]);

  const handleCopy = useCallback(() => {
    if (!state.hash) return;
    navigator.clipboard.writeText(state.hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [state.hash]);

  const matchResult: MatchResult = state.hash
    ? getMatchResult(state.hash, state.expectedHash)
    : 'empty';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-colors cursor-pointer',
          isDragOver
            ? 'border-accent bg-accent/10'
            : 'border-border hover:border-accent/60 bg-secondary/40'
        )}
      >
        <label htmlFor="file-hash-input" className="block cursor-pointer p-8">
          {state.file ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Hash className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{state.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(state.file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={e => { e.preventDefault(); handleRemoveFile(); }}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Drop any file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">All file types supported</p>
              </div>
            </div>
          )}
        </label>
        <input
          ref={fileInputRef}
          id="file-hash-input"
          type="file"
          className="sr-only"
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Hash Algorithm</p>
        <div className="flex flex-wrap gap-2">
          {ALGORITHMS.map(algo => (
            <button
              key={algo}
              type="button"
              onClick={() => handleAlgorithmChange(algo)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                state.algorithm === algo
                  ? 'bg-accent text-white'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              )}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={!state.file || state.isCalculating}
        className={cn(
          'w-full py-2.5 rounded-xl font-medium text-sm transition-colors',
          !state.file || state.isCalculating
            ? 'bg-secondary text-muted-foreground cursor-not-allowed'
            : 'bg-accent text-white hover:bg-accent/90'
        )}
      >
        {state.isCalculating ? 'Calculating…' : 'Calculate Hash'}
      </button>

      {state.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2.5">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Hash Output</label>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!state.hash}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors',
              state.hash
                ? 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                : 'text-muted-foreground/40 cursor-not-allowed'
            )}
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          readOnly
          rows={2}
          value={state.hash}
          placeholder={state.isCalculating ? 'Computing…' : 'Hash will appear here'}
          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-mono resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Paste expected hash to verify</label>
        <input
          type="text"
          value={state.expectedHash}
          onChange={e => setState(prev => ({ ...prev, expectedHash: e.target.value }))}
          placeholder="Enter expected hash value…"
          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      {state.hash && state.expectedHash.trim() && (
        <div
          className={cn(
            'flex items-center gap-2.5 px-4 py-3 rounded-xl font-medium text-sm',
            matchResult === 'match'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {matchResult === 'match' ? (
            <>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>✓ Match — the file is authentic</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>✗ No Match — hashes differ</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
