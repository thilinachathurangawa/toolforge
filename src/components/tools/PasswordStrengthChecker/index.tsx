'use client';

import { useState, useMemo } from 'react';
import { Eye, EyeOff, Shield, Lock, Globe, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type StrengthLabel = 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: StrengthLabel;
  entropy: number;
  crackTimes: {
    offlineFastHash: string;
    offlineSlowHash: string;
    onlineThrottled: string;
  };
  feedback: string[];
  warnings: string[];
}

const COMMON_PASSWORDS = [
  'password', '123456', 'qwerty', 'abc123', 'letmein', 'monkey', '1111111',
  'dragon', 'master', 'login', 'welcome', 'shadow', 'sunshine', 'princess',
  'admin', 'passw0rd', 'football', 'iloveyou', 'password1', '12345678',
];

function emptyResult(): StrengthResult {
  return {
    score: 0,
    label: 'Very Weak',
    entropy: 0,
    crackTimes: {
      offlineFastHash: 'Instant',
      offlineSlowHash: 'Instant',
      onlineThrottled: 'Instant',
    },
    feedback: [],
    warnings: [],
  };
}

function entropyToTime(bits: number, guessesPerSec: number): string {
  const combinations = Math.pow(2, bits);
  const seconds = combinations / (2 * guessesPerSec);
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  return 'Centuries';
}

function analyzePassword(password: string): StrengthResult {
  if (!password) return emptyResult();

  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 30;

  let entropy = len * Math.log2(charsetSize || 26);

  const feedback: string[] = [];
  const warnings: string[] = [];

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    entropy = 0;
    warnings.push('This is an extremely common password.');
  }
  if (/(.)\1{2,}/.test(password)) {
    entropy *= 0.5;
    feedback.push('Avoid repeating characters.');
  }
  if (
    /(?:012|123|234|345|456|567|678|789|890|qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i.test(
      password
    )
  ) {
    entropy *= 0.7;
    feedback.push('Avoid keyboard sequences.');
  }

  if (!hasUpper) feedback.push('Add uppercase letters.');
  if (!hasDigit) feedback.push('Add numbers.');
  if (!hasSymbol) feedback.push('Add symbols (e.g. !@#$).');
  if (len < 8) {
    entropy *= 0.3;
    feedback.push('Use at least 8 characters.');
  } else if (len < 12) {
    feedback.push('12+ characters is much stronger.');
  }

  let score: 0 | 1 | 2 | 3 | 4;
  if (entropy < 28) score = 0;
  else if (entropy < 36) score = 1;
  else if (entropy < 60) score = 2;
  else if (entropy < 100) score = 3;
  else score = 4;

  return {
    score,
    label: (['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'] as const)[score],
    entropy: Math.round(entropy),
    crackTimes: {
      offlineFastHash: entropyToTime(entropy, 1e10),
      offlineSlowHash: entropyToTime(entropy, 1e4),
      onlineThrottled: entropyToTime(entropy, 10),
    },
    feedback,
    warnings,
  };
}

const scoreColorBar: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-red-500',
  1: 'bg-orange-500',
  2: 'bg-amber-500',
  3: 'bg-lime-500',
  4: 'bg-green-600',
};

const scoreColorText: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'text-red-500',
  1: 'text-orange-500',
  2: 'text-amber-500',
  3: 'text-lime-500',
  4: 'text-green-600',
};

export function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const result = useMemo(() => analyzePassword(password), [password]);

  const barWidth = password
    ? `${Math.max(10, (result.score / 4) * 100)}%`
    : '0%';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-6">

        {/* Password Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to check its strength"
              className="w-full pr-12 pl-4 py-3 text-base rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Strength Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Strength
            </span>
            {password && (
              <span className={cn('text-sm font-semibold', scoreColorText[result.score])}>
                {result.label} &mdash; {Math.round((result.score / 4) * 100)}%
              </span>
            )}
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', scoreColorBar[result.score])}
              style={{ width: barWidth }}
            />
          </div>
          {password && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Entropy: <span className="font-medium text-gray-700 dark:text-gray-300">{result.entropy} bits</span>
            </p>
          )}
        </div>

        {/* Crack Times */}
        {password && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated crack time</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <Shield size={16} className="text-red-500 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  Offline fast hash <span className="text-xs text-gray-400 dark:text-gray-500">(~10B guesses/s)</span>
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {result.crackTimes.offlineFastHash}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <Lock size={16} className="text-orange-500 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  Offline slow hash <span className="text-xs text-gray-400 dark:text-gray-500">(~10K guesses/s)</span>
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {result.crackTimes.offlineSlowHash}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <Globe size={16} className="text-blue-500 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  Online throttled <span className="text-xs text-gray-400 dark:text-gray-500">(~10 guesses/s)</span>
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {result.crackTimes.onlineThrottled}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {password && result.warnings.length > 0 && (
          <div className="space-y-2">
            {result.warnings.map((warning, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3"
              >
                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-400">{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Feedback */}
        {password && result.feedback.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions</p>
            <ul className="space-y-1.5">
              {result.feedback.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {!password && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
            Start typing to analyze your password.
          </p>
        )}
      </div>
    </div>
  );
}
