'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeftRight, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Currency registry ────────────────────────────────────────────────────────
// Exactly the currencies supported by the Frankfurter/ECB API.
const CURRENCIES: { code: string; name: string }[] = [
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'BGN', name: 'Bulgarian Lev' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'ILS', name: 'Israeli New Shekel' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'ISK', name: 'Icelandic Króna' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
];

// ── Searchable currency select ───────────────────────────────────────────────

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  id: string;
}

function CurrencySelect({ value, onChange, label, id }: CurrencySelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = CURRENCIES.find((c) => c.code === value);

  const filtered = query.trim()
    ? CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase())
      )
    : CURRENCIES;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleOpen() {
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSelect(code: string) {
    onChange(code);
    setOpen(false);
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0].code);
    }
  }

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </label>

      {/* Trigger */}
      <button
        id={id}
        type="button"
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm',
          'bg-background border border-input rounded-md',
          'hover:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
          'transition-colors text-left'
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-foreground shrink-0">{selected?.code}</span>
          <span className="text-muted-foreground truncate">{selected?.name}</span>
        </span>
        <svg
          className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={cn(
            'absolute z-50 mt-1 w-72 max-h-72 overflow-y-auto',
            'bg-background border border-input rounded-md shadow-lg',
            'flex flex-col'
          )}
        >
          {/* Search input */}
          <div className="sticky top-0 bg-background border-b border-input p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by code or name..."
              className={cn(
                'w-full px-2.5 py-1.5 text-sm bg-muted rounded',
                'focus:outline-none focus:ring-2 focus:ring-accent/20',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>

          {/* Options */}
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No currencies match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.code}
                role="option"
                aria-selected={c.code === value}
                type="button"
                onClick={() => handleSelect(c.code)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                  'hover:bg-secondary transition-colors',
                  c.code === value && 'bg-accent/10 text-accent font-medium'
                )}
              >
                <span className="font-semibold w-10 shrink-0">{c.code}</span>
                <span className="text-muted-foreground truncate">{c.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Formatting helper ────────────────────────────────────────────────────────

function formatResult(value: number, targetCode: string): string {
  // Currencies with zero decimal convention
  const noDecimalCurrencies = new Set([
    'JPY', 'KRW', 'IDR', 'VND', 'BIF', 'CLP', 'DJF', 'GNF', 'ISK',
    'KMF', 'MGA', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF',
  ]);

  const decimals = noDecimalCurrencies.has(targetCode) ? 0 : 4;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ── Main component ───────────────────────────────────────────────────────────

interface RateCache {
  [baseCurrency: string]: {
    rates: Record<string, number>;
    fetchedAt: number; // ms timestamp
  };
}

const rateCache: RateCache = {};
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes — rates are daily, no need to re-fetch constantly

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // resultKey increments on each successful fetch to trigger the fade-in animation
  const [resultKey, setResultKey] = useState<number>(0);

  // ── Fetch rates whenever fromCurrency changes ──────────────────────────────
  const fetchRates = useCallback(async (baseCurrency: string) => {
    // Return cached rates if still fresh
    const cached = rateCache[baseCurrency];
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setRates(cached.rates);
      setError(null);
      setResultKey((k) => k + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/exchange-rates?from=${encodeURIComponent(baseCurrency)}`
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Unexpected response format from Frankfurter API');
      }

      // Include the base currency itself (rate = 1) so the result display works uniformly
      const fullRates: Record<string, number> = { ...data.rates, [baseCurrency]: 1 };

      rateCache[baseCurrency] = { rates: fullRates, fetchedAt: Date.now() };
      setRates(fullRates);
      setResultKey((k) => k + 1);
    } catch {
      setError('Unable to fetch exchange rates. Please check your connection.');
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency, fetchRates]);

  // ── Computed result ────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0 && amount.trim() !== '';

  const convertedAmount: number | null =
    rates && isValidAmount && rates[toCurrency] != null
      ? parsedAmount * rates[toCurrency]
      : null;

  const unitRate: number | null =
    rates && rates[toCurrency] != null ? rates[toCurrency] : null;

  // ── Swap currencies ────────────────────────────────────────────────────────
  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // fromCurrency change triggers a new fetch; rates for the new base may already be cached
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-6">

      {/* ── Amount input ───────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label
          htmlFor="currency-amount"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Amount
        </label>
        <input
          id="currency-amount"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className={cn(
            'w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
            'transition-colors placeholder:text-muted-foreground',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />
      </div>

      {/* ── Currency selectors + swap ───────────────────────────────────── */}
      {/* Use relative positioning so the dropdowns stack above siblings */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div className="relative">
          <CurrencySelect
            id="from-currency"
            label="From"
            value={fromCurrency}
            onChange={setFromCurrency}
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap currencies"
          className={cn(
            'mb-0.5 p-2 rounded-md border border-input bg-background',
            'hover:bg-secondary hover:border-accent/40 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-accent/20',
            'text-muted-foreground hover:text-accent'
          )}
        >
          <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="relative">
          <CurrencySelect
            id="to-currency"
            label="To"
            value={toCurrency}
            onChange={setToCurrency}
          />
        </div>
      </div>

      {/* ── Result display ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'rounded-lg border border-input bg-muted/40 px-5 py-5',
          'min-h-[120px] flex flex-col justify-center'
        )}
      >
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Fetching live rates&hellip;</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && convertedAmount !== null && (
          // The key prop triggers React to remount this subtree on each new fetch,
          // which replays the CSS animation — giving the number a crisp fade-in
          // whenever a fresh rate arrives.
          <div
            key={resultKey}
            className="space-y-3"
            style={{ animation: 'cc-fadein 0.35s ease forwards' }}
          >
            {/* Primary converted amount */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {isValidAmount ? `${amount} ${fromCurrency} =` : `1 ${fromCurrency} =`}
              </p>
              <p className="text-3xl font-bold text-foreground leading-tight tabular-nums">
                {isValidAmount
                  ? formatResult(convertedAmount, toCurrency)
                  : unitRate !== null
                  ? formatResult(unitRate, toCurrency)
                  : '—'}
                <span className="ml-2 text-lg font-semibold text-accent">{toCurrency}</span>
              </p>
            </div>

            {/* Unit rate reference */}
            {unitRate !== null && isValidAmount && parsedAmount !== 1 && (
              <p className="text-xs text-muted-foreground">
                1&nbsp;{fromCurrency}&nbsp;=&nbsp;
                <span className="font-medium text-foreground tabular-nums">
                  {formatResult(unitRate, toCurrency)}
                </span>
                &nbsp;{toCurrency}
              </p>
            )}
          </div>
        )}

        {!loading && !error && convertedAmount === null && !amount && rates && (
          <p className="text-sm text-muted-foreground">Enter an amount above to see the conversion.</p>
        )}

        {!loading && !error && rates && amount && !isValidAmount && (
          <p className="text-sm text-muted-foreground">Enter a positive number to convert.</p>
        )}
      </div>

      {/* ── Refresh button ─────────────────────────────────────────────── */}
      {!loading && (
        <button
          type="button"
          onClick={() => {
            // Invalidate cache for current base and re-fetch
            delete rateCache[fromCurrency];
            fetchRates(fromCurrency);
          }}
          className={cn(
            'flex items-center gap-1.5 text-xs text-muted-foreground',
            'hover:text-accent transition-colors focus:outline-none focus:underline'
          )}
        >
          <RefreshCw className="w-3 h-3" aria-hidden="true" />
          Refresh rates
        </button>
      )}

      {/* ── Disclosure banner ──────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-start gap-2 rounded-md border border-input bg-muted/30 px-3 py-3',
          'text-xs text-muted-foreground'
        )}
      >
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          Exchange rates provided by the{' '}
          <span className="font-medium text-foreground">Frankfurter open-source API</span>.
          Rates are updated daily. Your currency code is sent to{' '}
          <span className="font-medium text-foreground">api.frankfurter.app</span> to
          retrieve rates.
        </p>
      </div>

      {/* ── Keyframe animation (inlined; no external stylesheet needed) ── */}
      <style>{`
        @keyframes cc-fadein {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes cc-fadein {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
