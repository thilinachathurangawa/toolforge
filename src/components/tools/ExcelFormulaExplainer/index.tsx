'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Info,
  Link2,
  ListOrdered,
  Sparkles,
  Trash2,
  Wand2,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeFormula, toMarkdown, toPlainText } from './analyze';
import { minify, prettyPrint } from './format';
import { FormulaTree } from './FormulaTree';
import { HighlightedFormula } from './HighlightedFormula';
import type { Diagnostic, ExplainResult } from './types';

const HISTORY_KEY = 'toolforge:excel-formula-explainer:history';
const HISTORY_LIMIT = 10;
const DEBOUNCE_MS = 250;

const EXAMPLE_FORMULAS: Array<{ label: string; formula: string }> = [
  { label: 'VLOOKUP with fallback', formula: '=IFERROR(VLOOKUP(A1,B:C,2,FALSE),"Not found")' },
  { label: 'INDEX / MATCH', formula: '=INDEX(C2:C100,MATCH(F1,A2:A100,0))' },
  { label: 'Two-condition INDEX/MATCH', formula: '=INDEX(A2:A100,MATCH(1,(B2:B100=F1)*(C2:C100=F2),0))' },
  { label: 'Nested IF', formula: '=IF(A1>90,"A",IF(A1>80,"B",IF(A1>70,"C","F")))' },
  { label: 'SUMIFS', formula: '=SUMIFS(D2:D500,A2:A500,"North",B2:B500,">=2026-01-01")' },
  { label: 'Dynamic array FILTER', formula: '=SORT(FILTER(A2:C500,C2:C500>1000,"No rows"),3,-1)' },
  { label: 'Text cleanup', formula: '=TRIM(PROPER(SUBSTITUTE(A1,"_"," ")))' },
  { label: 'Date difference', formula: '=DATEDIF(A1,B1,"Y")' },
];

type DetailLevel = 'simple' | 'detailed';
type CopyTarget = 'text' | 'markdown' | 'share' | 'pretty' | 'minified' | string;

function severityIcon(severity: Diagnostic['severity']) {
  if (severity === 'error') return <XCircle size={16} className="text-error shrink-0 mt-0.5" />;
  if (severity === 'warning') return <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />;
  return <Info size={16} className="text-muted-foreground shrink-0 mt-0.5" />;
}

function severityBox(severity: Diagnostic['severity']): string {
  if (severity === 'error') return 'border-error/40 bg-error/5';
  if (severity === 'warning') return 'border-warning/40 bg-warning/5';
  return 'border-border bg-muted/40';
}

/** Renders the caret line that points at the offending characters. */
function CaretLine({ formula, diagnostic }: { formula: string; diagnostic: Diagnostic }) {
  const start = Math.max(0, Math.min(diagnostic.start, formula.length));
  const end = Math.max(start + 1, Math.min(diagnostic.end, formula.length));
  return (
    <div className="mt-1 overflow-x-auto">
      <pre className="text-xs font-mono leading-5 text-muted-foreground whitespace-pre">
        {formula}
        {'\n'}
        {' '.repeat(start)}
        <span className="text-error">{'^'.repeat(Math.max(1, end - start))}</span>
      </pre>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  count,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <section className="p-4 bg-muted/50 rounded-lg space-y-3">
      <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
        {icon}
        {title}
        {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
      </h3>
      {children}
    </section>
  );
}

export function ExcelFormulaExplainer() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [detail, setDetail] = useState<DetailLevel>('simple');
  const [highlight, setHighlight] = useState<{ start: number; end: number } | null>(null);
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ------------------------------------------------- restore shared state */

  useEffect(() => {
    try {
      const shared = new URLSearchParams(window.location.search).get('f');
      if (shared) setFormula(shared);
      const stored = window.localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setHistory(parsed.filter((v): v is string => typeof v === 'string'));
      }
    } catch {
      // A blocked or corrupt localStorage must not stop the tool working.
    }
  }, []);

  /* ------------------------------------------------------- live explaining */

  useEffect(() => {
    const handle = setTimeout(() => {
      setResult(analyzeFormula(formula));
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [formula]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const flashCopied = useCallback((target: CopyTarget) => {
    setCopied(target);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(null), 2000);
  }, []);

  const copyText = useCallback(
    async (text: string, target: CopyTarget) => {
      try {
        await navigator.clipboard.writeText(text);
        flashCopied(target);
      } catch {
        // Clipboard permission denied — nothing useful to recover.
      }
    },
    [flashCopied]
  );

  const rememberFormula = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, HISTORY_LIMIT);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode, quota) — history stays in memory.
      }
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Nothing to do.
    }
  }, []);

  /* ------------------------------------------------------------- actions */

  const handleClear = () => {
    setFormula('');
    setResult(null);
    setHighlight(null);
  };

  const handleFormat = () => {
    if (!result?.ast) return;
    setFormula(prettyPrint(result.ast, result.separator));
  };

  const handleMinify = () => {
    if (!result?.ast) return;
    setFormula(minify(result.ast, result.separator));
  };

  const handleShare = async () => {
    if (!formula.trim()) return;
    const url = `${window.location.origin}${window.location.pathname}?f=${encodeURIComponent(formula.trim())}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Excel formula breakdown', url });
        return;
      } catch {
        // Share sheet dismissed — fall back to the clipboard.
      }
    }
    await copyText(url, 'share');
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([toMarkdown(result)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formula-explanation.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const functionHref = useCallback(
    (name: string) => `/tools/excel-function-reference?fn=${encodeURIComponent(name.toUpperCase())}`,
    []
  );

  /* -------------------------------------------------------------- derived */

  const fatal = useMemo(
    () => result?.diagnostics.filter((d) => d.severity === 'error') ?? [],
    [result]
  );
  const advisory = useMemo(
    () => result?.diagnostics.filter((d) => d.severity !== 'error') ?? [],
    [result]
  );
  const references = result?.references;
  const hasReferenceContent =
    !!references &&
    (references.cells.length > 0 ||
      references.ranges.length > 0 ||
      references.wholeColumnsOrRows.length > 0 ||
      references.tables.length > 0 ||
      references.names.length > 0);

  const detailed = detail === 'detailed';

  return (
    <div className="w-full space-y-6">
      {/* ------------------------------------------------------------ input */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="formula-input" className="text-sm font-medium text-foreground">
            Paste your Excel or Google Sheets formula
          </label>
          <div className="flex items-center gap-2">
            {result && (
              <span className="text-xs text-muted-foreground">
                Argument separator: <span className="font-mono">{result.separator}</span>
              </span>
            )}
            <div className="inline-flex rounded-md border border-input overflow-hidden" role="group" aria-label="Detail level">
              {(['simple', 'detailed'] as DetailLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDetail(level)}
                  aria-pressed={detail === level}
                  className={cn(
                    'px-3 py-1 text-xs capitalize transition-colors',
                    detail === level
                      ? 'bg-accent text-white'
                      : 'bg-background text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <HighlightedFormula
          id="formula-input"
          value={formula}
          onChange={setFormula}
          onSubmit={() => rememberFormula(formula)}
          highlight={highlight}
          placeholder="=IFERROR(VLOOKUP(A1,B:C,2,FALSE),&quot;Not found&quot;)"
        />
        <p className="text-xs text-muted-foreground">
          The breakdown updates as you type. Nothing is uploaded — the formula is parsed entirely in your browser.
        </p>
      </div>

      {/* --------------------------------------------------------- examples */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Try an example</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_FORMULAS.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => setFormula(example.formula)}
              title={example.formula}
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleFormat}
          disabled={!result?.ast}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <ListOrdered size={16} />
          Format
        </button>
        <button
          type="button"
          onClick={handleMinify}
          disabled={!result?.ast}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <Wand2 size={16} />
          Single line
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={!formula.trim()}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          {copied === 'share' ? <Check size={16} /> : <Link2 size={16} />}
          {copied === 'share' ? 'Link copied' : 'Share'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!formula}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <X size={16} />
          Clear
        </button>
      </div>

      {/* ---------------------------------------------------------- history */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Recent formulas</span>
            <button
              type="button"
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFormula(item)}
                className="max-w-full truncate px-2 py-1 text-xs font-mono bg-background border border-input rounded-md hover:bg-muted/60 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- results */}
      <div aria-live="polite" className="space-y-4">
        {result && (
          <>
            {/* Syntax errors first — everything below is derived from a parse. */}
            {fatal.length > 0 && (
              <Section title="This formula could not be read" icon={<XCircle size={16} className="text-error" />}>
                <div className="space-y-3">
                  {fatal.map((diagnostic, index) => (
                    <div key={index} className={cn('p-3 rounded-md border', severityBox(diagnostic.severity))}>
                      <p className="text-sm text-foreground">{diagnostic.message}</p>
                      <CaretLine formula={result.formula} diagnostic={diagnostic} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.narrative && (
              <Section title="In plain English" icon={<Sparkles size={16} className="text-accent" />}>
                <p className="text-sm text-foreground leading-relaxed">{result.narrative}</p>
              </Section>
            )}

            {result.unknownFunctions.length > 0 && (
              <Section title="Functions we do not recognise">
                <p className="text-sm text-muted-foreground">
                  {result.unknownFunctions.join(', ')} {result.unknownFunctions.length === 1 ? 'is' : 'are'} not in our
                  reference, so the description above leaves {result.unknownFunctions.length === 1 ? 'it' : 'them'}{' '}
                  unexplained. Everything else in the formula is still broken down below. Custom functions, add-in
                  functions, and LAMBDA names defined in your workbook will always land here.
                </p>
              </Section>
            )}

            {result.tree.length > 0 && (
              <Section title="Breakdown">
                <FormulaTree
                  nodes={result.tree}
                  detailed={detailed}
                  onHover={setHighlight}
                  functionHref={functionHref}
                />
              </Section>
            )}

            {result.steps.length > 1 && (
              <Section title="Evaluation order" icon={<ListOrdered size={16} className="text-accent" />}>
                <ol className="space-y-2">
                  {result.steps.map((step) => (
                    <li
                      key={step.order}
                      className="flex gap-3"
                      onMouseEnter={() => setHighlight({ start: step.start, end: step.end })}
                      onMouseLeave={() => setHighlight(null)}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-medium text-accent">
                        {step.order}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <code className="block text-xs font-mono text-foreground break-all">{step.expression}</code>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {advisory.length > 0 && (
              <Section title="Things to check" count={advisory.length}>
                <ul className="space-y-2">
                  {advisory.map((diagnostic, index) => (
                    <li
                      key={index}
                      className={cn('flex gap-2 p-3 rounded-md border', severityBox(diagnostic.severity))}
                      onMouseEnter={() => setHighlight({ start: diagnostic.start, end: diagnostic.end })}
                      onMouseLeave={() => setHighlight(null)}
                    >
                      {severityIcon(diagnostic.severity)}
                      <p className="text-sm text-foreground">{diagnostic.message}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {result.suggestions.length > 0 && (
              <Section title="Modernize" count={result.suggestions.length}>
                <ul className="space-y-3">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="p-3 rounded-md bg-background border border-border space-y-2">
                      <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                      {suggestion.formula && (
                        <div className="flex items-start gap-2">
                          <code className="flex-1 min-w-0 text-xs font-mono text-foreground break-all">
                            {suggestion.formula}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyText(suggestion.formula!, `suggestion-${index}`)}
                            className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                          >
                            {copied === `suggestion-${index}` ? <Check size={12} /> : <Copy size={12} />}
                            {copied === `suggestion-${index}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{suggestion.note}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {result.compatibility.length > 0 && (
              <Section title="Excel and Google Sheets compatibility">
                <ul className="space-y-1">
                  {result.compatibility.map((note) => (
                    <li key={note.functionName} className="text-sm text-muted-foreground">
                      {note.message}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {result.operators.length > 0 && detailed && (
              <Section title="Operators used">
                <ul className="space-y-2">
                  {result.operators.map((operator) => (
                    <li key={operator.symbol} className="flex flex-wrap items-baseline gap-2">
                      <code className="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">
                        {operator.symbol}
                      </code>
                      <span className="text-sm font-medium text-foreground">{operator.name}</span>
                      <span className="text-xs text-muted-foreground">{operator.description}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {(hasReferenceContent || references!.volatileFunctions.length > 0) && (
              <Section title="What this formula depends on">
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Cells', items: references!.cells },
                    { label: 'Ranges', items: references!.ranges },
                    { label: 'Whole columns and rows', items: references!.wholeColumnsOrRows },
                    { label: 'Table references', items: references!.tables },
                    { label: 'Defined names', items: references!.names },
                  ]
                    .filter((group) => group.items.length > 0)
                    .map((group) => (
                      <div key={group.label} className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground w-full sm:w-auto">
                          {group.label}:
                        </span>
                        {group.items.map((ref) => (
                          <span
                            key={ref.raw}
                            title={ref.description}
                            className="px-2 py-1 text-xs font-mono bg-background border border-border rounded-md"
                          >
                            {ref.raw}
                            {detailed && <span className="ml-1 font-sans text-muted-foreground">({ref.description})</span>}
                          </span>
                        ))}
                      </div>
                    ))}

                  {references!.sheets.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Sheets referenced: {references!.sheets.join(', ')}
                    </p>
                  )}
                  {references!.workbooks.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      External workbooks: {references!.workbooks.join(', ')}. The formula breaks if those files move or
                      are closed.
                    </p>
                  )}
                  {references!.volatileFunctions.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Volatile functions: {references!.volatileFunctions.join(', ')}. These recalculate on every change
                      anywhere in the workbook.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {result.functionsUsed.length} distinct function
                    {result.functionsUsed.length === 1 ? '' : 's'}, nested {result.maxDepth} level
                    {result.maxDepth === 1 ? '' : 's'} deep, {references!.literalCount} hard-coded value
                    {references!.literalCount === 1 ? '' : 's'}.
                  </p>
                </div>
              </Section>
            )}

            {/* --------------------------------------------------- exporting */}
            {(result.narrative || result.tree.length > 0) && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    copyText(toPlainText(result), 'text');
                    rememberFormula(formula);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {copied === 'text' ? <Check size={16} /> : <Copy size={16} />}
                  {copied === 'text' ? 'Copied!' : 'Copy explanation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyText(toMarkdown(result), 'markdown');
                    rememberFormula(formula);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {copied === 'markdown' ? <Check size={16} /> : <Copy size={16} />}
                  {copied === 'markdown' ? 'Copied!' : 'Copy as Markdown'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  <Download size={16} />
                  Download .md
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
