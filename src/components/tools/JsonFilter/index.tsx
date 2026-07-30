'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Braces,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Filter,
  Key,
  Plus,
  Search,
  Sparkles,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type Combinator,
  type Condition,
  type FieldMode,
  type Indent,
  type Operator,
  type SortDirection,
  JSON_TYPES,
  OPERATORS,
  buildDiagnostics,
  collectKeys,
  compileConditions,
  detectCollections,
  formatBytes,
  operatorInfo,
  parseFieldList,
  parseJson,
  resolveSource,
  runPipeline,
  serialize,
} from './query';

/* ----------------------------- constants ----------------------------- */

const WARN_INPUT_SIZE = 2 * 1024 * 1024;
const MAX_INPUT_SIZE = 10 * 1024 * 1024;
const MAX_RENDER_LINES = 2000;
const DISPLAY_KEY = 'toolforge:json-filter:display';

const SAMPLE_JSON = `{
  "meta": { "generated": "2026-07-30", "page": 1 },
  "data": {
    "users": [
      { "id": 1, "name": "Ada Lovelace", "role": "admin", "logins": 142, "active": true,
        "profile": { "city": "London", "plan": "pro" }, "tags": ["founder", "math"] },
      { "id": 2, "name": "Grace Hopper", "role": "admin", "logins": 98, "active": true,
        "profile": { "city": "New York", "plan": "pro" }, "tags": ["navy", "compiler"] },
      { "id": 3, "name": "Linus Vega", "role": "editor", "logins": 12, "active": false,
        "profile": { "city": "Zürich", "plan": "free" }, "tags": ["docs"] },
      { "id": 4, "name": "Mina Osei", "role": "viewer", "logins": 3, "active": true,
        "profile": { "city": "Accra", "plan": "free" }, "tags": [] },
      { "id": 5, "name": "Yuki Tanaka", "role": "editor", "logins": 57, "active": true,
        "profile": { "city": "Osaka" }, "tags": ["design", "docs"] }
    ],
    "audit": [
      { "event": "login", "user": 1, "ok": true },
      { "event": "export", "user": 3, "ok": false }
    ]
  }
}`;

interface DisplayOptions {
  indent: Indent;
  minify: boolean;
  sortKeys: boolean;
  wrap: boolean;
  caseSensitive: boolean;
}

const DEFAULT_DISPLAY: DisplayOptions = {
  indent: 2,
  minify: false,
  sortKeys: false,
  wrap: false,
  caseSensitive: false,
};

let conditionSeq = 0;
function newCondition(path = '', operator: Operator = 'contains'): Condition {
  conditionSeq += 1;
  return { id: `condition-${conditionSeq}`, path, operator, value: '' };
}

/* ----------------------------- component ----------------------------- */

export function JsonFilter() {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [sourcePath, setSourcePath] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([newCondition()]);
  const [combinator, setCombinator] = useState<Combinator>('all');
  const [invert, setInvert] = useState(false);
  const [search, setSearch] = useState('');

  const [fieldMode, setFieldMode] = useState<FieldMode>('all');
  const [fields, setFields] = useState('');
  const [sortPath, setSortPath] = useState('');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [limit, setLimit] = useState('');

  const [display, setDisplay] = useState<DisplayOptions>(DEFAULT_DISPLAY);
  const [hydrated, setHydrated] = useState(false);
  const [showOutputOptions, setShowOutputOptions] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [copied, setCopied] = useState(false);

  const [fileError, setFileError] = useState<string | null>(null);
  const pathInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const focusTarget = useRef<string | null>(null);

  const { indent, minify, sortKeys, wrap, caseSensitive } = display;

  const setDisplayOption = useCallback(
    <K extends keyof DisplayOptions>(key: K, value: DisplayOptions[K]) => {
      setDisplay((previous) => ({ ...previous, [key]: value }));
    },
    []
  );

  /* --------------------- persisted display preferences --------------------- */

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DISPLAY_KEY);
      if (stored) setDisplay((previous) => ({ ...previous, ...(JSON.parse(stored) as DisplayOptions) }));
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DISPLAY_KEY, JSON.stringify(display));
    } catch {
      /* ignore */
    }
  }, [display, hydrated]);

  /* ------------------------------ input side ------------------------------ */

  const inputBytes = useMemo(() => new TextEncoder().encode(input).length, [input]);
  const tooLarge = inputBytes > MAX_INPUT_SIZE;

  // Parse once per input change; condition edits never re-parse.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 200);
    return () => clearTimeout(timer);
  }, [input]);

  const parsed = useMemo(() => {
    if (!debouncedInput.trim() || new TextEncoder().encode(debouncedInput).length > MAX_INPUT_SIZE) {
      return null;
    }
    return parseJson(debouncedInput);
  }, [debouncedInput]);

  const data = parsed?.ok ? parsed.value : null;

  const loadText = useCallback((text: string, name: string | null) => {
    setInput(text);
    setFileName(name);
    setSourcePath('');
    setFileError(null);
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_INPUT_SIZE) {
        setFileError(
          `${file.name} is ${formatBytes(file.size)}, over the ${formatBytes(MAX_INPUT_SIZE)} limit.`
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => loadText(String(reader.result ?? ''), file.name);
      reader.onerror = () => setFileError(`Could not read ${file.name}.`);
      reader.readAsText(file);
    },
    [loadText]
  );

  const prettify = useCallback(() => {
    if (!parsed?.ok) return;
    setInput(serialize(parsed.value, { indent, minify: false, sortKeys: false }));
  }, [parsed, indent]);

  const clearAll = useCallback(() => {
    setInput('');
    setDebouncedInput('');
    setFileName(null);
    setSourcePath('');
    setSearch('');
    setConditions([newCondition()]);
  }, []);

  /* ------------------------------- querying ------------------------------- */

  const collections = useMemo(() => (data === null ? [] : detectCollections(data)), [data]);
  const source = useMemo(() => (data === null ? null : resolveSource(data, sourcePath)), [data, sourcePath]);

  const compiled = useMemo(() => compileConditions(conditions, caseSensitive), [conditions, caseSensitive]);
  const queryConfig = useMemo(
    () => ({ combinator, invert, search, caseSensitive }),
    [combinator, invert, search, caseSensitive]
  );

  const sampleItems = useMemo(() => {
    if (!source) return [];
    if (source.kind === 'array') return source.items;
    if (source.kind === 'object') return source.entries;
    return [];
  }, [source]);

  const keys = useMemo(() => (sampleItems.length ? collectKeys(sampleItems) : []), [sampleItems]);

  const pipelineOptions = useMemo(
    () => ({
      fieldMode,
      fields: parseFieldList(fields),
      sortPath,
      sortDir,
      limit: limit.trim() ? Math.max(0, Number(limit) || 0) : null,
    }),
    [fieldMode, fields, sortPath, sortDir, limit]
  );

  const result = useMemo(
    () => (source && source.kind !== 'invalid' ? runPipeline(source, compiled, queryConfig, pipelineOptions) : null),
    [source, compiled, queryConfig, pipelineOptions]
  );

  const outputText = useMemo(
    () => (result ? serialize(result.value, { indent, minify, sortKeys }) : ''),
    [result, indent, minify, sortKeys]
  );

  const diagnostics = useMemo(() => {
    if (!source || source.kind === 'invalid' || !result) return [];
    if (result.matched > 0 || result.total === 0) return [];
    return buildDiagnostics(sampleItems, compiled, queryConfig);
  }, [source, result, sampleItems, compiled, queryConfig]);

  const renderedOutput = useMemo(() => {
    if (!outputText) return { text: '', truncated: false, lines: 0 };
    const lines = outputText.split('\n');
    if (lines.length <= MAX_RENDER_LINES) return { text: outputText, truncated: false, lines: lines.length };
    return {
      text: lines.slice(0, MAX_RENDER_LINES).join('\n'),
      truncated: true,
      lines: lines.length,
    };
  }, [outputText]);

  const activeConditionCount = compiled.filter((entry) => !entry.error && !entry.incomplete).length;

  const summary = useMemo(() => {
    if (!result) return '';
    const unit = result.unit;
    const base = `${result.matched} of ${result.total} ${unit} matched`;
    const percent = result.total > 0 ? ` (${((result.matched / result.total) * 100).toFixed(1)}%)` : '';
    const trimmed = result.returned !== result.matched ? ` · showing ${result.returned}` : '';
    return `${base}${percent}${trimmed}`;
  }, [result]);

  /* ------------------------------- actions ------------------------------- */

  const updateCondition = useCallback((id: string, patch: Partial<Condition>) => {
    setConditions((previous) => previous.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }, []);

  const addCondition = useCallback((path = '') => {
    const condition = newCondition(path);
    focusTarget.current = condition.id;
    setConditions((previous) => [...previous, condition]);
  }, []);

  const useKey = useCallback(
    (path: string) => {
      const empty = conditions.find((entry) => !entry.path.trim());
      if (empty) {
        updateCondition(empty.id, { path });
        pathInputRefs.current[empty.id]?.focus();
        return;
      }
      addCondition(path);
    },
    [conditions, updateCondition, addCondition]
  );

  useEffect(() => {
    if (!focusTarget.current) return;
    pathInputRefs.current[focusTarget.current]?.focus();
    focusTarget.current = null;
  }, [conditions]);

  const copyOutput = useCallback(() => {
    if (!outputText) return;
    navigator.clipboard
      .writeText(outputText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  }, [outputText]);

  const downloadOutput = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'filtered.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, [outputText]);

  /* -------------------------------- render -------------------------------- */

  const parseFailure = parsed && !parsed.ok ? parsed.failure : null;
  const sourceError = source && source.kind === 'invalid' ? source.message : null;
  // Object sources keep their own key order, so sorting has nothing to act on.
  const sortDisabled = source?.kind === 'object';

  return (
    <div className="w-full space-y-6">
      <p className="sr-only" role="status" aria-live="polite">
        {summary}
      </p>

      {/* ------------------------------- Input ------------------------------- */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="json-filter-input" className="text-sm font-medium text-foreground">
            JSON Input
          </label>
          <span className="text-xs text-muted-foreground">
            {fileName ? `${fileName} · ` : ''}
            {inputBytes > 0 ? formatBytes(inputBytes) : 'paste, upload, or drop a .json file'}
          </span>
        </div>

        <textarea
          id="json-filter-input"
          placeholder='{"data":{"users":[{"name":"Ada","role":"admin"}]}}'
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={cn(
            'w-full min-h-[180px] px-3 py-2 text-sm font-mono bg-background border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
            isDragging ? 'border-accent bg-accent/5' : 'border-input'
          )}
        />

        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept=".json,.txt,application/json,text/plain"
            className="sr-only"
            id="json-filter-file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
              event.target.value = '';
            }}
          />
          <label
            htmlFor="json-filter-file"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            <Upload size={16} />
            Upload
          </label>
          <button
            onClick={() => loadText(SAMPLE_JSON, null)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Sparkles size={16} />
            Load example
          </button>
          <button
            onClick={prettify}
            disabled={!parsed?.ok}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 size={16} />
            Prettify
          </button>
          <button
            onClick={clearAll}
            disabled={!input}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X size={16} />
            Clear
          </button>
        </div>

        {fileError && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{fileError}</p>
          </div>
        )}

        {tooLarge && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">
              This input is {formatBytes(inputBytes)}, over the {formatBytes(MAX_INPUT_SIZE)} limit. Trim it
              down or filter it in a script instead.
            </p>
          </div>
        )}

        {!tooLarge && inputBytes > WARN_INPUT_SIZE && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 rounded-md">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {formatBytes(inputBytes)} of JSON — filtering still runs in your browser, but expect a short
              pause after each edit.
            </p>
          </div>
        )}

        {parseFailure && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">
                {parseFailure.line
                  ? `Line ${parseFailure.line}, column ${parseFailure.column}: ${parseFailure.message}`
                  : parseFailure.message}
              </p>
            </div>
            {parseFailure.excerpt && (
              <pre className="overflow-x-auto text-xs font-mono text-destructive/90 bg-destructive/5 p-2 rounded">
                {parseFailure.excerpt}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* ------------------------------- Filter ------------------------------- */}
      <section className="p-4 border border-border rounded-xl bg-card space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Filter size={16} />
          Filter
        </h3>

        {/* Source */}
        <div className="space-y-2">
          <label htmlFor="json-filter-source" className="block text-sm font-medium">
            Source path
          </label>
          <input
            id="json-filter-source"
            type="text"
            placeholder="leave blank for the whole document, or e.g. data.users"
            value={sourcePath}
            onChange={(event) => setSourcePath(event.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          {collections.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Detected:</span>
              {collections.map((collection) => (
                <button
                  key={collection.path || 'root'}
                  onClick={() => setSourcePath(collection.path)}
                  className={cn(
                    'px-2 py-1 text-xs font-mono rounded-md border transition-colors',
                    sourcePath.trim() === collection.path
                      ? 'bg-accent text-white border-accent'
                      : 'bg-background border-input hover:border-accent/60'
                  )}
                >
                  {collection.label} ({collection.count})
                </button>
              ))}
            </div>
          )}
          {sourceError && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{sourceError}</p>
            </div>
          )}
          {source?.kind === 'object' && (
            <p className="text-xs text-muted-foreground">
              This source is an object, so each entry is matched as{' '}
              <code className="font-mono">{'{ key, value }'}</code> — filter on{' '}
              <code className="font-mono">key</code> or <code className="font-mono">value.something</code>. The
              result keeps its object shape.
            </p>
          )}
        </div>

        {/* Conditions */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="json-filter-combinator" className="text-sm font-medium">
              Match
            </label>
            <select
              id="json-filter-combinator"
              value={combinator}
              onChange={(event) => setCombinator(event.target.value as Combinator)}
              className="px-3 py-1.5 text-sm bg-background border border-input rounded-md"
            >
              <option value="all">all</option>
              <option value="any">any</option>
            </select>
            <span className="text-sm text-muted-foreground">of these conditions</span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={invert}
                onChange={(event) => setInvert(event.target.checked)}
                className="rounded"
              />
              Invert
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(event) => setDisplayOption('caseSensitive', event.target.checked)}
                className="rounded"
              />
              Case sensitive
            </label>
          </div>

          <datalist id="json-filter-keys">
            {keys.map((key) => (
              <option key={key.path} value={key.path} />
            ))}
          </datalist>

          <ul className="space-y-2">
            {compiled.map(({ condition, error, incomplete }) => {
              const info = operatorInfo(condition.operator);
              return (
                <li key={condition.id} className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={(node) => {
                        pathInputRefs.current[condition.id] = node;
                      }}
                      type="text"
                      list="json-filter-keys"
                      aria-label="Key or path"
                      placeholder="key or path"
                      value={condition.path}
                      onChange={(event) => updateCondition(condition.id, { path: event.target.value })}
                      className="flex-1 min-w-[140px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                    <select
                      aria-label="Operator"
                      value={condition.operator}
                      onChange={(event) =>
                        updateCondition(condition.id, { operator: event.target.value as Operator })
                      }
                      className="px-2 py-2 text-sm bg-background border border-input rounded-md"
                    >
                      {OPERATORS.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      aria-label="Value"
                      placeholder={
                        condition.operator === 'typeIs'
                          ? JSON_TYPES.join(' | ')
                          : info.numeric
                            ? 'number'
                            : info.needsValue
                              ? 'value'
                              : 'no value needed'
                      }
                      disabled={!info.needsValue}
                      value={condition.value}
                      onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                      className="flex-1 min-w-[120px] px-3 py-2 text-sm font-mono bg-background border border-input rounded-md disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                    <button
                      onClick={() =>
                        setConditions((previous) => {
                          const next = previous.filter((entry) => entry.id !== condition.id);
                          return next.length ? next : [newCondition()];
                        })
                      }
                      aria-label={`Remove condition ${condition.path || '(empty)'}`}
                      className="p-2 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  {incomplete && condition.path.trim() && (
                    <p className="text-xs text-muted-foreground">
                      Add a value to activate this condition.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => addCondition()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Plus size={16} />
            Add condition
          </button>
        </div>

        {/* Deep search */}
        <div className="space-y-2">
          <label htmlFor="json-filter-search" className="block text-sm font-medium">
            Or search every value
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="json-filter-search"
              type="text"
              placeholder="text found anywhere inside an item, at any depth"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        {/* Key discovery */}
        {keys.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowKeys((value) => !value)}
              aria-expanded={showKeys}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Key size={16} />
              {showKeys ? 'Hide' : 'Show'} keys found ({keys.length})
              {showKeys ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showKeys && (
              <div className="flex flex-wrap gap-2">
                {keys.map((key) => (
                  <button
                    key={key.path}
                    onClick={() => useKey(key.path)}
                    title={`Use "${key.path}" in a condition`}
                    className="px-2 py-1 text-xs font-mono bg-background border border-input rounded-md hover:border-accent/60 transition-colors"
                  >
                    {key.path}
                    <span className="ml-1 text-muted-foreground">
                      {key.type} · {key.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ------------------------------- Output ------------------------------- */}
      <section className="border border-border rounded-xl bg-card">
        <button
          onClick={() => setShowOutputOptions((value) => !value)}
          aria-expanded={showOutputOptions}
          className="flex w-full items-center justify-between gap-2 p-4 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <Braces size={16} />
            Output options
          </span>
          {showOutputOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showOutputOptions && (
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <span className="block text-sm font-medium">Fields</span>
              <div className="flex flex-wrap gap-2">
                {(['all', 'include', 'exclude', 'pluck'] as FieldMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFieldMode(mode)}
                    aria-pressed={fieldMode === mode}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors',
                      fieldMode === mode
                        ? 'bg-accent text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <input
                type="text"
                aria-label="Field list"
                list="json-filter-keys"
                placeholder={
                  fieldMode === 'pluck' ? 'one path, e.g. profile.city' : 'comma-separated, e.g. name, role'
                }
                disabled={fieldMode === 'all'}
                value={fields}
                onChange={(event) => setFields(event.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md disabled:opacity-40"
              />
              <p className="text-xs text-muted-foreground">
                {fieldMode === 'include'
                  ? 'Only these keys survive; dotted paths are pulled up to a flat key of the same name.'
                  : fieldMode === 'exclude'
                    ? 'These top-level keys are removed from every item.'
                    : fieldMode === 'pluck'
                      ? 'Returns a flat array of that one path’s values.'
                      : 'Every field is kept as-is.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="json-filter-sort" className="block text-sm font-medium">
                  Sort by
                </label>
                <input
                  id="json-filter-sort"
                  type="text"
                  list="json-filter-keys"
                  placeholder={sortDisabled ? 'not used for objects' : 'path'}
                  disabled={sortDisabled}
                  value={sortPath}
                  onChange={(event) => setSortPath(event.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-background border border-input rounded-md disabled:opacity-40"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="json-filter-dir" className="block text-sm font-medium">
                  Direction
                </label>
                <select
                  id="json-filter-dir"
                  value={sortDir}
                  disabled={sortDisabled}
                  onChange={(event) => setSortDir(event.target.value as SortDirection)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md disabled:opacity-40"
                >
                  <option value="asc">ascending</option>
                  <option value="desc">descending</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="json-filter-limit" className="block text-sm font-medium">
                  Limit
                </label>
                <input
                  id="json-filter-limit"
                  type="number"
                  min={1}
                  placeholder="all"
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="json-filter-indent" className="text-sm font-medium">
                  Indent
                </label>
                <select
                  id="json-filter-indent"
                  value={String(indent)}
                  disabled={minify}
                  onChange={(event) =>
                    setDisplayOption('indent', event.target.value === 'tab' ? 'tab' : (Number(event.target.value) as 2 | 4))
                  }
                  className="px-2 py-1.5 text-sm bg-background border border-input rounded-md disabled:opacity-40"
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="tab">tab</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={minify}
                  onChange={(event) => setDisplayOption('minify', event.target.checked)}
                  className="rounded"
                />
                Minify
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sortKeys}
                  onChange={(event) => setDisplayOption('sortKeys', event.target.checked)}
                  className="rounded"
                />
                Sort keys
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={wrap}
                  onChange={(event) => setDisplayOption('wrap', event.target.checked)}
                  className="rounded"
                />
                Wrap lines
              </label>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------- Result ------------------------------- */}
      {result && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-foreground">Result</h3>
              <p className="text-xs text-muted-foreground">
                {summary}
                {activeConditionCount === 0 && !search.trim() ? ' · no active conditions' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyOutput}
                disabled={!outputText}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadOutput}
                disabled={!outputText}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                <Download size={16} />
                Download .json
              </button>
            </div>
          </div>

          {result.matched === 0 && result.total > 0 ? (
            <div className="p-4 border border-input rounded-md bg-background space-y-2">
              <p className="text-sm font-medium">
                Nothing matched — {result.total} {result.unit} scanned.
              </p>
              {invert && (
                <p className="text-sm text-muted-foreground">
                  Invert is on, so every {result.unit.replace(/s$/, '')} that satisfied the conditions below
                  was excluded.
                </p>
              )}
              {diagnostics.length > 0 ? (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {diagnostics.map((diagnostic) => (
                    <li key={diagnostic.label}>
                      <code className="font-mono text-foreground">{diagnostic.path}</code> exists on{' '}
                      {diagnostic.presentCount} of {result.total} — {diagnostic.matchCount} satisfy “
                      {diagnostic.label}”
                      {diagnostic.samples.length > 0 && (
                        <>
                          {' '}
                          · values seen:{' '}
                          <span className="font-mono">{diagnostic.samples.join(', ')}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {search.trim()
                    ? `No ${result.unit} contain “${search.trim()}”.`
                    : invert
                      ? 'Invert is on, so everything matched the conditions and was excluded.'
                      : 'Check the source path and the keys found above.'}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 border border-input rounded-md bg-background max-h-[460px] overflow-auto">
                <pre
                  className={cn(
                    'text-sm font-mono text-foreground',
                    wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
                  )}
                >
                  {renderedOutput.text}
                </pre>
              </div>
              {renderedOutput.truncated && (
                <p className="text-xs text-muted-foreground">
                  Showing the first {MAX_RENDER_LINES.toLocaleString()} of{' '}
                  {renderedOutput.lines.toLocaleString()} lines. Copy and Download still give you the whole
                  result.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
