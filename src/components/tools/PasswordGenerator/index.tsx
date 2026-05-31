'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  quantity: number;
}

export function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    quantity: 1,
  });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [strength, setStrength] = useState<'weak' | 'fair' | 'strong' | 'very-strong'>('weak');
  const [copied, setCopied] = useState<number | null>(null);

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguous = '0O1l';

    let charset = '';
    if (options.uppercase) charset += uppercase;
    if (options.lowercase) charset += lowercase;
    if (options.numbers) charset += numbers;
    if (options.symbols) charset += symbols;

    if (options.excludeAmbiguous) {
      charset = charset.split('').filter(c => !ambiguous.includes(c)).join('');
    }

    if (charset.length === 0) {
      return '';
    }

    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);
    let password = '';
    for (let i = 0; i < options.length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }, [options]);

  const calculateStrength = useCallback((password: string) => {
    if (!password) return 'weak';
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'fair';
    if (score <= 5) return 'strong';
    return 'very-strong';
  }, []);

  const generatePasswords = useCallback(() => {
    const newPasswords: string[] = [];
    for (let i = 0; i < options.quantity; i++) {
      const password = generatePassword();
      newPasswords.push(password);
    }
    setPasswords(newPasswords);
    
    if (newPasswords.length > 0) {
      setStrength(calculateStrength(newPasswords[0]));
    }
  }, [options, generatePassword, calculateStrength]);

  const handleCopy = (password: string, index: number) => {
    navigator.clipboard.writeText(password);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    generatePasswords();
  }, []);

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'fair': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      case 'very-strong': return 'bg-emerald-500';
    }
  };

  const getStrengthLabel = () => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
    }
  };

  const getStrengthBars = () => {
    switch (strength) {
      case 'weak': return 1;
      case 'fair': return 2;
      case 'strong': return 3;
      case 'very-strong': return 4;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 border border-border rounded-xl bg-card space-y-6">
        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Length</label>
            <span className="text-sm font-mono text-accent">{options.length}</span>
          </div>
          <input
            type="range"
            min="8"
            max="128"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        {/* Character Type Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
              className="rounded accent-accent"
            />
            Uppercase (A-Z)
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
              className="rounded accent-accent"
            />
            Lowercase (a-z)
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
              className="rounded accent-accent"
            />
            Numbers (0-9)
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
              className="rounded accent-accent"
            />
            Symbols (!@#$%)
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })}
              className="rounded accent-accent"
            />
            Exclude ambiguous (0, O, l, 1)
          </label>
        </div>

        {/* Quantity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Quantity</label>
            <span className="text-sm font-mono text-accent">{options.quantity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={options.quantity}
            onChange={(e) => setOptions({ ...options, quantity: parseInt(e.target.value) })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePasswords}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <RefreshCw size={18} />
          Generate Passwords
        </button>
      </div>

      {/* Generated Passwords */}
      {passwords.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Generated Passwords</h3>
          <div className="space-y-3">
            {passwords.map((password, index) => (
              <div key={index} className="p-4 border border-border rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-foreground break-all flex-1 mr-4">
                    {password}
                  </code>
                  <button
                    onClick={() => handleCopy(password, index)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors shrink-0",
                      copied === index
                        ? "bg-green-500 text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {copied === index ? <Check size={16} /> : <Copy size={16} />}
                    {copied === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {index === 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Shield size={16} className="text-muted-foreground" />
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 w-8 rounded-full",
                            i < getStrengthBars() ? getStrengthColor() : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground ml-2">
                      {getStrengthLabel()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
