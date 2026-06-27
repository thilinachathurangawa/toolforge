# Text Encrypt / Decrypt Tool — Spec

## Slug
`text-encrypt-decrypt`

## Category
`security`

## Component Location
`src/components/tools/TextEncryptDecrypt/index.tsx`

## Overview
AES-GCM text encryption/decryption using the native Web Crypto API. The passphrase
is processed through PBKDF2 (100 000 iterations, SHA-256, 256-bit key) to derive the
encryption key. Ciphertext is Base64-encoded for easy sharing.

## UI Controls
- Mode toggle buttons: "Encrypt" | "Decrypt" (toggle state)
- Input `<textarea>`: plain text (Encrypt mode) or Base64 ciphertext (Decrypt mode)
- Passphrase `<input type="password">` with show/hide toggle
- "Encrypt" / "Decrypt" action button
- Output `<textarea readonly>`: Base64 ciphertext (Encrypt) or plain text (Decrypt)
- Copy button for output
- Swap button: move output back to input
- Warning banner: "Losing your passphrase makes decryption permanently impossible."

## Core Logic
**Key derivation (PBKDF2):**
```ts
const keyMaterial = await crypto.subtle.importKey(
  'raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']
);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false, ['encrypt'] // or ['decrypt']
);
```
**Encrypt:**
- Generate random 16-byte salt + 12-byte IV
- Encrypt with AES-GCM
- Pack output: `salt (16) + iv (12) + ciphertext`
- Base64-encode the concatenated buffer

**Decrypt:**
- Base64-decode input → split salt/IV/ciphertext
- Derive key with same salt
- Decrypt with AES-GCM
- Return UTF-8 string

## TypeScript Interfaces
```ts
type Mode = 'encrypt' | 'decrypt';

interface EncryptState {
  mode: Mode;
  inputText: string;
  passphrase: string;
  showPassphrase: boolean;
  outputText: string;
  isProcessing: boolean;
  error: string | null;
}
```

## SEO Keywords
- "encrypt text with password online"
- "AES-256 text encryption online"
- "secure message encryption tool"
- "decrypt text with passphrase"
- "end to end text encryption"

## Content Outline
**Intro:** When you need to share sensitive text safely; difference between AES-256-GCM
and symmetric encryption vs hashing.
**Steps:** Choose mode → enter text → enter passphrase → click action → copy output.
**Why:** AES-256-GCM is military-grade; PBKDF2 slows brute-force; nothing leaves the
browser; Base64 output works anywhere.
**FAQs:** Can I decrypt without the passphrase, is AES-GCM safe, what is PBKDF2,
can I store the ciphertext anywhere.
**Related:** hash-generator, base64-encoder, password-strength-checker
