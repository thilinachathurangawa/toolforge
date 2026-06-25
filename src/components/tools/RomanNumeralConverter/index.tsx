'use client';

import { useState, useCallback } from 'react';

// ── Conversion logic ──────────────────────────────────────────────────────────

const VALUES  = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const SYMBOLS = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

function toRoman(n: number): string {
  let result = '';
  for (let i = 0; i < VALUES.length; i++) {
    while (n >= VALUES[i]) {
      result += SYMBOLS[i];
      n -= VALUES[i];
    }
  }
  return result;
}

function fromRoman(s: string): number {
  const map: Record<string, number> = {
    M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1,
  };
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const curr = map[s[i]] ?? 0;
    const next = map[s[i + 1]] ?? 0;
    result += curr < next ? -curr : curr;
  }
  return result;
}

function isValidRoman(s: string): boolean {
  if (!s) return false;
  // Validate by round-tripping: convert to number and back, compare
  const trimmed = s.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(trimmed)) return false;
  const num = fromRoman(trimmed);
  if (num < 1 || num > 3999) return false;
  return toRoman(num) === trimmed;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ value, disabled }: { value: string; disabled: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value || disabled) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard not available
    }
  }, [value, disabled]);

  return (
    <button
      onClick={handleCopy}
      disabled={disabled || !value}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 14px',
        fontSize: '11px',
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: copied ? '#7C1E2E' : '#8C7B6B',
        background: copied ? 'rgba(124,30,46,0.08)' : 'transparent',
        border: `1px solid ${copied ? 'rgba(124,30,46,0.35)' : 'rgba(140,123,107,0.35)'}`,
        borderRadius: '4px',
        cursor: disabled || !value ? 'not-allowed' : 'pointer',
        opacity: disabled || !value ? 0.4 : 1,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#7C1E2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="1" width="7" height="8" rx="1" stroke="#8C7B6B" strokeWidth="1.3"/>
            <path d="M1 4h2v6a1 1 0 001 1h5v2" stroke="#8C7B6B" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// Inscription display — the monumental hero render
function InscriptionDisplay({ value, isError }: { value: string; isError: boolean }) {
  const isEmpty = !value;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '96px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E8E4DF 0%, #DDD8D1 40%, #E4E0DA 70%, #D8D3CB 100%)',
        borderRadius: '6px',
        border: '1px solid #C8BFB5',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08), inset 0 -1px 3px rgba(255,255,255,0.5)',
        overflow: 'hidden',
        padding: '16px 24px',
      }}
    >
      {/* Stone grain overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.04) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: isEmpty ? '15px' : value.length > 10 ? '26px' : value.length > 6 ? '34px' : '44px',
          letterSpacing: '0.12em',
          color: isError ? '#A04050' : isEmpty ? '#B0A89E' : '#1C1917',
          textShadow: isError ? 'none' : isEmpty ? 'none' : '0 1px 2px rgba(255,255,255,0.6), 0 -1px 1px rgba(0,0,0,0.15)',
          lineHeight: 1.1,
          textAlign: 'center',
          wordBreak: 'break-all',
          transition: 'font-size 0.15s ease, color 0.15s ease',
          position: 'relative',
        }}
      >
        {isEmpty ? '—' : value}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Direction = 'arabic' | 'roman' | null;

interface State {
  arabicInput: string;
  romanInput: string;
  arabicError: string;
  romanError: string;
  lastEdited: Direction;
}

export function RomanNumeralConverter() {
  const [state, setState] = useState<State>({
    arabicInput: '',
    romanInput: '',
    arabicError: '',
    romanError: '',
    lastEdited: null,
  });

  // Arabic → Roman
  const handleArabicChange = useCallback((raw: string) => {
    const trimmed = raw.trim();

    if (trimmed === '') {
      setState({ arabicInput: raw, romanInput: '', arabicError: '', romanError: '', lastEdited: 'arabic' });
      return;
    }

    const num = Number(trimmed);

    if (!/^\d+$/.test(trimmed) || isNaN(num)) {
      setState(s => ({ ...s, arabicInput: raw, romanInput: '', arabicError: 'Enter a whole number between 1 and 3999.', lastEdited: 'arabic' }));
      return;
    }

    if (num < 1) {
      setState(s => ({ ...s, arabicInput: raw, romanInput: '', arabicError: 'Must be at least 1.', lastEdited: 'arabic' }));
      return;
    }

    if (num > 3999) {
      setState(s => ({ ...s, arabicInput: raw, romanInput: '', arabicError: 'Roman numerals only go up to 3999 (MMMCMXCIX).', lastEdited: 'arabic' }));
      return;
    }

    const roman = toRoman(num);
    setState({ arabicInput: raw, romanInput: roman, arabicError: '', romanError: '', lastEdited: 'arabic' });
  }, []);

  // Roman → Arabic
  const handleRomanChange = useCallback((raw: string) => {
    const trimmed = raw.trim().toUpperCase();

    if (raw.trim() === '') {
      setState({ arabicInput: '', romanInput: raw, arabicError: '', romanError: '', lastEdited: 'roman' });
      return;
    }

    if (!/^[MDCLXVI]+$/i.test(trimmed)) {
      setState(s => ({ ...s, romanInput: raw, arabicInput: '', romanError: 'Only the letters M, D, C, L, X, V, I are valid.', lastEdited: 'roman' }));
      return;
    }

    if (!isValidRoman(trimmed)) {
      setState(s => ({ ...s, romanInput: raw, arabicInput: '', romanError: 'Not a valid Roman numeral. Check the order and repetition of letters.', lastEdited: 'roman' }));
      return;
    }

    const num = fromRoman(trimmed);
    setState({ arabicInput: String(num), romanInput: raw, arabicError: '', romanError: '', lastEdited: 'roman' });
  }, []);

  const arabicOutput = state.lastEdited === 'roman' && !state.romanError ? state.arabicInput : '';
  const romanOutput  = state.lastEdited === 'arabic' && !state.arabicError ? state.romanInput : '';

  const arabicDisplayError = !!state.arabicError;
  const romanDisplayError  = !!state.romanError;

  return (
    <div
      style={{
        '--ground':   '#F0EDEA',
        '--text':     '#1C1917',
        '--accent':   '#7C1E2E',
        '--muted':    '#8C7B6B',
        '--border':   '#D5CFC7',
        '--surface':  '#E8E4DF',
        fontFamily:  "'Inter', 'Helvetica Neue', Arial, sans-serif",
        color:        'var(--text)',
        maxWidth:     '780px',
        margin:       '0 auto',
        padding:      '0 4px',
      } as React.CSSProperties}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '12px',
          marginBottom: '6px',
        }}>
          <span style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>
            NUMERIS ROMANIS
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '0.01em',
          margin: 0,
          lineHeight: 1.15,
          color: 'var(--text)',
        }}>
          Roman Numeral Converter
        </h1>
        <p style={{
          marginTop: '8px',
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--muted)',
          maxWidth: '520px',
        }}>
          Type an Arabic integer or a Roman numeral — the other updates instantly.
          Covers 1 through 3999.
        </p>
      </div>

      {/* ── Converter grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
          gap: '0',
          alignItems: 'start',
        }}
      >
        {/* LEFT — Arabic → Roman */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '2px',
          }}>
            Arabic integer
          </label>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2024"
              value={state.arabicInput}
              onChange={e => handleArabicChange(e.target.value)}
              aria-label="Arabic integer input"
              aria-invalid={arabicDisplayError}
              aria-describedby={arabicDisplayError ? 'arabic-error' : undefined}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                fontSize: '18px',
                fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                fontWeight: 500,
                color: arabicDisplayError ? '#A04050' : 'var(--text)',
                background: '#FFFFFF',
                border: `1.5px solid ${arabicDisplayError ? '#C06070' : state.arabicInput && !arabicDisplayError ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: arabicDisplayError
                  ? '0 0 0 3px rgba(160,64,80,0.12)'
                  : state.arabicInput && !arabicDisplayError
                    ? '0 0 0 3px rgba(124,30,46,0.1)'
                    : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            />
          </div>

          {state.arabicError && (
            <p
              id="arabic-error"
              role="alert"
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: 1.45,
                color: '#A04050',
                fontWeight: 500,
              }}
            >
              {state.arabicError}
            </p>
          )}

          {/* Roman output display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}>
                Roman numeral
              </span>
              <CopyButton value={romanOutput} disabled={!romanOutput} />
            </div>
            <InscriptionDisplay
              value={romanOutput}
              isError={false}
            />
          </div>
        </div>

        {/* CENTER divider */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          paddingTop: '60px',
        }}>
          <div style={{
            width: '1px',
            height: '28px',
            background: 'linear-gradient(to bottom, transparent, var(--border))',
          }} />
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ground)',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="#8C7B6B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{
            width: '1px',
            height: '28px',
            background: 'linear-gradient(to top, transparent, var(--border))',
          }} />
          <div style={{ height: '12px' }} />
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ground)',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 7H3M7 3L3 7l4 4" stroke="#8C7B6B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* RIGHT — Roman → Arabic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '2px',
          }}>
            Roman numeral
          </label>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. MMXXIV"
              value={state.romanInput}
              onChange={e => handleRomanChange(e.target.value)}
              aria-label="Roman numeral input"
              aria-invalid={romanDisplayError}
              aria-describedby={romanDisplayError ? 'roman-error' : undefined}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                fontSize: '18px',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: romanDisplayError ? '#A04050' : 'var(--text)',
                background: '#FFFFFF',
                border: `1.5px solid ${romanDisplayError ? '#C06070' : state.romanInput && !romanDisplayError ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: romanDisplayError
                  ? '0 0 0 3px rgba(160,64,80,0.12)'
                  : state.romanInput && !romanDisplayError
                    ? '0 0 0 3px rgba(124,30,46,0.1)'
                    : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            />
          </div>

          {state.romanError && (
            <p
              id="roman-error"
              role="alert"
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: 1.45,
                color: '#A04050',
                fontWeight: 500,
              }}
            >
              {state.romanError}
            </p>
          )}

          {/* Arabic output display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}>
                Arabic integer
              </span>
              <CopyButton value={arabicOutput} disabled={!arabicOutput} />
            </div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '96px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #E8E4DF 0%, #DDD8D1 40%, #E4E0DA 70%, #D8D3CB 100%)',
                borderRadius: '6px',
                border: '1px solid #C8BFB5',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08), inset 0 -1px 3px rgba(255,255,255,0.5)',
                overflow: 'hidden',
                padding: '16px 24px',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 60%),
                    radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.04) 0%, transparent 50%)
                  `,
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  fontWeight: 300,
                  fontSize: arabicOutput ? '48px' : '15px',
                  letterSpacing: arabicOutput ? '-0.02em' : '0',
                  color: arabicOutput ? '#1C1917' : '#B0A89E',
                  textShadow: arabicOutput ? '0 1px 2px rgba(255,255,255,0.6), 0 -1px 1px rgba(0,0,0,0.15)' : 'none',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'font-size 0.15s ease, color 0.15s ease',
                }}
              >
                {arabicOutput || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reference table ── */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px 24px',
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '14px',
        }}>
          Base symbols
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}>
          {(['M','D','C','L','X','V','I'] as const).map((sym) => {
            const valMap: Record<string, number> = { M:1000, D:500, C:100, L:50, X:10, V:5, I:1 };
            return (
              <div
                key={sym}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  background: '#FFFFFF',
                  borderRadius: '5px',
                  border: '1px solid var(--border)',
                  cursor: 'default',
                }}
              >
                <span style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--accent)',
                  lineHeight: 1,
                }}>
                  {sym}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {valMap[sym].toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Subtractive pairs:</strong>{' '}
          IV = 4 · IX = 9 · XL = 40 · XC = 90 · CD = 400 · CM = 900
        </div>
      </div>

      <style>{`
        input:focus {
          border-color: #7C1E2E !important;
          box-shadow: 0 0 0 3px rgba(124,30,46,0.12) !important;
        }
        @media (max-width: 560px) {
          .rnc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
