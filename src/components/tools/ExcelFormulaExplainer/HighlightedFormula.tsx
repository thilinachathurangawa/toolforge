'use client';

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { tokenize } from './tokenizer';
import type { Token } from './types';

/**
 * Syntax-highlighted formula input.
 *
 * A coloured `<pre>` sits behind a transparent `<textarea>`; both use identical
 * font, padding, and wrapping so the characters line up exactly. Typing, paste,
 * undo, and mobile keyboards all keep working because the real control is still
 * a textarea.
 */

interface Segment {
  text: string;
  className: string;
}

/** Cycled by nesting depth so matching parentheses share a colour. */
const PAREN_COLORS = [
  'text-sky-600 dark:text-sky-400',
  'text-fuchsia-600 dark:text-fuchsia-400',
  'text-amber-600 dark:text-amber-400',
  'text-teal-600 dark:text-teal-400',
];

function classForToken(token: Token, parenDepth: number): string {
  switch (token.kind) {
    case 'func':
      return 'text-indigo-600 dark:text-indigo-300 font-semibold';
    case 'ref':
      return 'text-emerald-700 dark:text-emerald-300';
    case 'string':
      return 'text-amber-700 dark:text-amber-300';
    case 'number':
      return 'text-violet-700 dark:text-violet-300';
    case 'boolean':
      return 'text-rose-700 dark:text-rose-300';
    case 'errorLiteral':
      return 'text-red-600 dark:text-red-400 font-semibold';
    case 'lparen':
    case 'rparen':
      return PAREN_COLORS[parenDepth % PAREN_COLORS.length];
    case 'lbrace':
    case 'rbrace':
      return 'text-teal-600 dark:text-teal-400';
    case 'separator':
    case 'arrayRowSep':
      return 'text-muted-foreground';
    case 'equals':
      return 'text-muted-foreground';
    default:
      return 'text-slate-600 dark:text-slate-300';
  }
}

function buildSegments(source: string): Segment[] {
  const { tokens } = tokenize(source);
  const segments: Segment[] = [];
  let cursor = 0;
  let depth = 0;

  tokens.forEach((token) => {
    if (token.start > cursor) {
      segments.push({ text: source.slice(cursor, token.start), className: '' });
    }
    if (token.kind === 'rparen') depth = Math.max(0, depth - 1);
    segments.push({ text: source.slice(token.start, token.end), className: classForToken(token, depth) });
    if (token.kind === 'lparen') depth += 1;
    cursor = token.end;
  });

  if (cursor < source.length) {
    segments.push({ text: source.slice(cursor), className: '' });
  }
  return segments;
}

/** Splits segments so the hovered sub-expression can be tinted. */
function applyHighlight(segments: Segment[], range: { start: number; end: number } | null): Segment[] {
  if (!range || range.end <= range.start) return segments;
  const marker = 'bg-accent/20 rounded-sm';
  const out: Segment[] = [];
  let offset = 0;

  segments.forEach((segment) => {
    const segStart = offset;
    const segEnd = offset + segment.text.length;
    offset = segEnd;

    if (segEnd <= range.start || segStart >= range.end) {
      out.push(segment);
      return;
    }
    const localStart = Math.max(0, range.start - segStart);
    const localEnd = Math.min(segment.text.length, range.end - segStart);
    if (localStart > 0) {
      out.push({ text: segment.text.slice(0, localStart), className: segment.className });
    }
    out.push({
      text: segment.text.slice(localStart, localEnd),
      className: cn(segment.className, marker),
    });
    if (localEnd < segment.text.length) {
      out.push({ text: segment.text.slice(localEnd), className: segment.className });
    }
  });

  return out;
}

interface HighlightedFormulaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  highlight?: { start: number; end: number } | null;
  placeholder?: string;
  id?: string;
}

const SHARED_TEXT = 'font-mono text-sm leading-6 whitespace-pre-wrap break-words';
const SHARED_BOX = 'w-full min-h-[104px] px-3 py-2 border rounded-md';

export function HighlightedFormula({
  value,
  onChange,
  onSubmit,
  highlight = null,
  placeholder,
  id,
}: HighlightedFormulaProps) {
  const segments = useMemo(() => applyHighlight(buildSegments(value), highlight), [value, highlight]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow the textarea to fit its content. Without this a long formula scrolls
  // inside the textarea while the highlight layer behind it does not, and the
  // colours drift away from the characters they belong to.
  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${node.scrollHeight}px`;
  }, [value]);

  return (
    <div className="relative">
      <pre
        aria-hidden="true"
        className={cn(
          SHARED_TEXT,
          SHARED_BOX,
          'absolute inset-0 m-0 overflow-hidden border-transparent pointer-events-none'
        )}
      >
        {segments.map((segment, index) => (
          <span key={index} className={segment.className}>
            {segment.text}
          </span>
        ))}
        {/* Keeps the box height in step with a trailing newline. */}
        {value.endsWith('\n') ? '\n' : ''}
      </pre>
      <textarea
        id={id}
        ref={textareaRef}
        rows={1}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (onSubmit && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        className={cn(
          SHARED_TEXT,
          SHARED_BOX,
          'relative bg-transparent text-transparent caret-foreground placeholder:text-muted-foreground',
          'border-input resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent'
        )}
      />
    </div>
  );
}
