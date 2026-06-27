'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Copy, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HreflangRow {
  id: string;
  url: string;
  language: string;
  region: string;
}

const LANGUAGES = [
  { code: 'af', label: 'Afrikaans' }, { code: 'ar', label: 'Arabic' },
  { code: 'bg', label: 'Bulgarian' }, { code: 'bn', label: 'Bengali' },
  { code: 'cs', label: 'Czech' }, { code: 'da', label: 'Danish' },
  { code: 'de', label: 'German' }, { code: 'el', label: 'Greek' },
  { code: 'en', label: 'English' }, { code: 'es', label: 'Spanish' },
  { code: 'et', label: 'Estonian' }, { code: 'fi', label: 'Finnish' },
  { code: 'fr', label: 'French' }, { code: 'gu', label: 'Gujarati' },
  { code: 'he', label: 'Hebrew' }, { code: 'hi', label: 'Hindi' },
  { code: 'hr', label: 'Croatian' }, { code: 'hu', label: 'Hungarian' },
  { code: 'id', label: 'Indonesian' }, { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' }, { code: 'ko', label: 'Korean' },
  { code: 'lt', label: 'Lithuanian' }, { code: 'ms', label: 'Malay' },
  { code: 'nl', label: 'Dutch' }, { code: 'no', label: 'Norwegian' },
  { code: 'pl', label: 'Polish' }, { code: 'pt', label: 'Portuguese' },
  { code: 'ro', label: 'Romanian' }, { code: 'ru', label: 'Russian' },
  { code: 'sk', label: 'Slovak' }, { code: 'sv', label: 'Swedish' },
  { code: 'th', label: 'Thai' }, { code: 'tr', label: 'Turkish' },
  { code: 'uk', label: 'Ukrainian' }, { code: 'ur', label: 'Urdu' },
  { code: 'vi', label: 'Vietnamese' }, { code: 'zh', label: 'Chinese' },
];

const REGIONS = [
  { code: '', label: '— none —' },
  { code: 'AU', label: 'Australia (AU)' }, { code: 'CA', label: 'Canada (CA)' },
  { code: 'CN', label: 'China (CN)' }, { code: 'DE', label: 'Germany (DE)' },
  { code: 'ES', label: 'Spain (ES)' }, { code: 'FR', label: 'France (FR)' },
  { code: 'GB', label: 'United Kingdom (GB)' }, { code: 'HK', label: 'Hong Kong (HK)' },
  { code: 'IN', label: 'India (IN)' }, { code: 'IT', label: 'Italy (IT)' },
  { code: 'JP', label: 'Japan (JP)' }, { code: 'KR', label: 'South Korea (KR)' },
  { code: 'MX', label: 'Mexico (MX)' }, { code: 'MY', label: 'Malaysia (MY)' },
  { code: 'NG', label: 'Nigeria (NG)' }, { code: 'NZ', label: 'New Zealand (NZ)' },
  { code: 'PH', label: 'Philippines (PH)' }, { code: 'PK', label: 'Pakistan (PK)' },
  { code: 'RU', label: 'Russia (RU)' }, { code: 'SG', label: 'Singapore (SG)' },
  { code: 'TW', label: 'Taiwan (TW)' }, { code: 'US', label: 'United States (US)' },
  { code: 'ZA', label: 'South Africa (ZA)' },
];

function buildHreflangValue(lang: string, region: string): string {
  return region ? `${lang}-${region}` : lang;
}

function buildTag(url: string, hreflang: string): string {
  return `<link rel="alternate" hreflang="${hreflang}" href="${url}" />`;
}

let counter = 3;
function newId(): string {
  return `row-${++counter}`;
}

const DEFAULT_ROWS: HreflangRow[] = [
  { id: 'row-0', url: '', language: 'en', region: 'US' },
  { id: 'row-1', url: '', language: 'en', region: 'GB' },
  { id: 'row-2', url: '', language: '', region: '' },
];

const selectClass =
  'rounded-lg border border-border bg-secondary/40 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50';

export function HreflangTagGenerator() {
  const [rows, setRows] = useState<HreflangRow[]>(DEFAULT_ROWS);
  const [includeXDefault, setIncludeXDefault] = useState(false);
  const [xDefaultUrl, setXDefaultUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, { id: newId(), url: '', language: 'en', region: '' }]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateRow = useCallback(
    (id: string, field: keyof Omit<HreflangRow, 'id'>, value: string) => {
      setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    },
    []
  );

  const output = useMemo(() => {
    const lines: string[] = [];
    for (const row of rows) {
      if (!row.url || !row.language) continue;
      const hreflang = buildHreflangValue(row.language, row.region);
      lines.push(buildTag(row.url, hreflang));
    }
    if (includeXDefault && xDefaultUrl) {
      lines.push(buildTag(xDefaultUrl, 'x-default'));
    }
    return lines.join('\n');
  }, [rows, includeXDefault, xDefaultUrl]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Language Variants</span>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>

      <div className="space-y-3">
        <div className="hidden sm:grid grid-cols-[1fr_140px_160px_36px] gap-2 px-1">
          <span className="text-xs font-medium text-muted-foreground">URL</span>
          <span className="text-xs font-medium text-muted-foreground">Language</span>
          <span className="text-xs font-medium text-muted-foreground">Region</span>
          <span />
        </div>

        {rows.map(row => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_160px_36px] gap-2 items-center rounded-xl border border-border bg-secondary/20 p-3 sm:p-2 sm:bg-transparent sm:border-0 sm:rounded-none"
          >
            <input
              type="url"
              value={row.url}
              onChange={e => updateRow(row.id, 'url', e.target.value)}
              placeholder="https://example.com/page"
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/50"
            />
            <div className="flex gap-2 items-center sm:contents">
              <select
                value={row.language}
                onChange={e => updateRow(row.id, 'language', e.target.value)}
                className={cn(selectClass, 'flex-1 sm:flex-none')}
              >
                <option value="">— lang —</option>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.code} — {l.label}
                  </option>
                ))}
              </select>
              <select
                value={row.region}
                onChange={e => updateRow(row.id, 'region', e.target.value)}
                className={cn(selectClass, 'flex-1 sm:flex-none')}
              >
                {REGIONS.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                className={cn(
                  'p-1.5 rounded-lg transition-colors flex-shrink-0',
                  rows.length <= 1
                    ? 'text-muted-foreground/30 cursor-not-allowed'
                    : 'hover:bg-destructive/10 hover:text-destructive text-muted-foreground'
                )}
                aria-label="Remove row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={includeXDefault}
            onChange={e => setIncludeXDefault(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <span className="text-sm font-medium">Include x-default</span>
        </label>
        {includeXDefault && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              x-default URL
            </label>
            <input
              type="url"
              value={xDefaultUrl}
              onChange={e => setXDefaultUrl(e.target.value)}
              placeholder="https://example.com/"
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/50"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Output Tags</span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              output
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-secondary text-muted-foreground/50 cursor-not-allowed'
            )}
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy All'}
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Fill in at least one URL and language above…"
          rows={Math.max(3, output.split('\n').length + 1)}
          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-mono resize-none focus:outline-none placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
}
