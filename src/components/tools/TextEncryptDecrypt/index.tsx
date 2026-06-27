'use client';

import React, { useState, useCallback } from 'react';
import { Lock, Unlock, Eye, EyeOff, Copy, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'encrypt' | 'decrypt';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const ITERATIONS = 100_000;

async function deriveKey(passphrase: string, salt: Uint8Array, usage: KeyUsage[]): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(saltBuffer), iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, usage
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return window.btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = window.atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encryptText(plaintext: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt, ['encrypt']);
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, enc.encode(plaintext)
  );
  const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + cipherBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, SALT_LENGTH);
  combined.set(new Uint8Array(cipherBuffer), SALT_LENGTH + IV_LENGTH);
  return arrayBufferToBase64(combined.buffer);
}

async function decryptText(cipherBase64: string, passphrase: string): Promise<string> {
  const combined = base64ToUint8Array(cipherBase64);
  if (combined.length < SALT_LENGTH + IV_LENGTH) throw new Error('Invalid ciphertext');
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const cipherData = combined.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(passphrase, salt, ['decrypt']);
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, cipherData
  );
  return new TextDecoder().decode(plainBuffer);
}

export function TextEncryptDecrypt() {
  const [mode, setMode] = useState<Mode>('encrypt');
  const [inputText, setInputText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    setOutputText('');
    setError(null);
  }, []);

  const handleAction = useCallback(async () => {
    if (!inputText.trim() || !passphrase) {
      setError('Both text and passphrase are required.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      if (mode === 'encrypt') {
        setOutputText(await encryptText(inputText, passphrase));
      } else {
        setOutputText(await decryptText(inputText, passphrase));
      }
    } catch {
      setError(mode === 'decrypt' ? 'Decryption failed. Wrong passphrase or corrupted data.' : 'Encryption failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, passphrase, mode]);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText]);

  const handleSwap = useCallback(() => {
    setInputText(outputText);
    setOutputText('');
    setError(null);
    setMode(prev => (prev === 'encrypt' ? 'decrypt' : 'encrypt'));
  }, [outputText]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => handleModeChange('encrypt')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
            mode === 'encrypt'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          )}
        >
          <Lock className="w-4 h-4" />
          Encrypt
        </button>
        <button
          onClick={() => handleModeChange('decrypt')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
            mode === 'decrypt'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          )}
        >
          <Unlock className="w-4 h-4" />
          Decrypt
        </button>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-3 flex gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          Warning: If you forget your passphrase, the encrypted data cannot be recovered. There is no reset option.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext (Base64)'}
        </label>
        <textarea
          rows={6}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={mode === 'encrypt' ? 'Enter text to encrypt…' : 'Paste Base64 ciphertext here…'}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Passphrase
        </label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            placeholder="Enter a strong passphrase…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => setShowPass(prev => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPass ? 'Hide passphrase' : 'Show passphrase'}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleAction}
        disabled={isProcessing}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed'
        )}
      >
        {isProcessing ? (
          <span className="animate-pulse">Processing…</span>
        ) : mode === 'encrypt' ? (
          <>
            <Lock className="w-4 h-4" />
            Encrypt Text
          </>
        ) : (
          <>
            <Unlock className="w-4 h-4" />
            Decrypt Text
          </>
        )}
      </button>

      {outputText && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === 'encrypt' ? 'Ciphertext (Base64)' : 'Decrypted Text'}
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
                title="Swap to input"
              >
                <ArrowUpDown className="w-3 h-3" />
                Swap to input
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            rows={6}
            readOnly
            value={outputText}
            className="w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm resize-none font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
    </div>
  );
}
