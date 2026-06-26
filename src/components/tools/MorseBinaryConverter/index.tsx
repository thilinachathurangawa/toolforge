'use client';

import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

type Mode = 'morse' | 'binary';

const MORSE: Record<string, string> = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---',
  k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-',
  u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....',
  '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.',
  ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
  '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};
const MORSE_REV: Record<string, string> = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

function textToMorse(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => (ch === ' ' ? '/' : MORSE[ch] ?? ''))
    .filter((x) => x !== '')
    .join(' ')
    .replace(/\s*\/\s*/g, ' / ');
}

function morseToText(morse: string): { text: string; error: boolean } {
  const words = morse.trim().split(/\s*\/\s*/);
  let error = false;
  const decoded = words
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((sym) => {
          if (MORSE_REV[sym]) return MORSE_REV[sym];
          error = true;
          return '';
        })
        .join('')
    )
    .join(' ');
  return { text: decoded.toUpperCase(), error };
}

function textToBinary(text: string): string {
  return Array.from(text)
    .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

function binaryToText(bin: string): { text: string; error: boolean } {
  const parts = bin.trim().split(/\s+/).filter(Boolean);
  let error = false;
  const text = parts
    .map((p) => {
      if (!/^[01]+$/.test(p)) {
        error = true;
        return '';
      }
      return String.fromCharCode(parseInt(p, 2));
    })
    .join('');
  return { text, error };
}

export function MorseBinaryConverter() {
  const [mode, setMode] = useState<Mode>('morse');
  const [text, setText] = useState('SOS');
  const [code, setCode] = useState(textToMorse('SOS'));
  const [decodeError, setDecodeError] = useState(false);
  const [copiedSide, setCopiedSide] = useState<'text' | 'code' | null>(null);

  const onTextChange = (value: string) => {
    setText(value);
    setCode(mode === 'morse' ? textToMorse(value) : textToBinary(value));
    setDecodeError(false);
  };

  const onCodeChange = (value: string) => {
    setCode(value);
    const res = mode === 'morse' ? morseToText(value) : binaryToText(value);
    setText(res.text);
    setDecodeError(res.error && value.trim() !== '');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setCode(m === 'morse' ? textToMorse(text) : textToBinary(text));
    setDecodeError(false);
  };

  const copy = (which: 'text' | 'code') => {
    navigator.clipboard.writeText(which === 'text' ? text : code);
    setCopiedSide(which);
    setTimeout(() => setCopiedSide(null), 2000);
  };

  const codeLabel = mode === 'morse' ? 'Morse code' : 'Binary';

  return (
    <div className="w-full space-y-5">
      <div className="flex gap-2">
        {(['morse', 'binary'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              mode === m ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {m === 'morse' ? 'Text ↔ Morse' : 'Text ↔ Binary'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Text</label>
            <button onClick={() => copy('text')} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
              {copiedSide === 'text' ? <Check size={12} /> : <Copy size={12} />} Copy
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type plain text…"
            rows={10}
            className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">{codeLabel}</label>
            <button onClick={() => copy('code')} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
              {copiedSide === 'code' ? <Check size={12} /> : <Copy size={12} />} Copy
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder={mode === 'morse' ? 'Type Morse: ... --- ...' : 'Type binary: 01001000 ...'}
            rows={10}
            className={`w-full px-4 py-3 text-sm font-mono bg-background border rounded-lg focus:outline-none focus:ring-2 resize-y ${
              decodeError ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:ring-accent/20 focus:border-accent'
            }`}
          />
        </div>
      </div>

      {decodeError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          <AlertCircle size={16} />
          {mode === 'morse'
            ? 'The Morse input contains symbols that could not be decoded. Use dots, dashes, spaces between letters, and / between words.'
            : 'The binary input contains values other than 0 and 1. Separate each 8-bit byte with a space.'}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {mode === 'morse'
          ? 'Letters are separated by a single space and words by a forward slash (/). Decoding is case-insensitive.'
          : 'Each character is encoded as an 8-bit byte from its character code. Bytes are separated by spaces.'}
      </p>
    </div>
  );
}
