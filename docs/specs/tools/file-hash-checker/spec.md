# File Hash Checker — Spec

## Slug
`file-hash-checker`

## Category
`security`

## Component Location
`src/components/tools/FileHashChecker/index.tsx`

## Overview
Calculate cryptographic hash of any file directly in the browser using the native
`window.crypto.subtle.digest` API. Supports SHA-1, SHA-256, SHA-384, SHA-512.
Optional expected-hash field enables instant Match / No Match verification.

## UI Controls
- File drag-and-drop zone (accepts any file, shows name + size)
- Algorithm `<select>`: SHA-1 | SHA-256 (default) | SHA-384 | SHA-512
- "Calculate Hash" button (or auto on drop)
- Hash output: monospace `<textarea readonly>` + Copy button
- Expected hash `<input>` labeled "Paste expected hash to verify"
- Comparison badge: green "Match ✓" or red "No Match ✗"

## Core Logic
```ts
async function hashFile(file: File, algo: string): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest(algo, buffer);
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex;
}
```
- algo values: "SHA-1", "SHA-256", "SHA-384", "SHA-512"
- Comparison: `computed.toLowerCase() === expected.trim().toLowerCase()`
- Large files: process in single call (SubtleCrypto handles streaming internally)

## TypeScript Interfaces
```ts
interface HashState {
  file: File | null;
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
  hash: string;
  expectedHash: string;
  isCalculating: boolean;
  error: string | null;
}

type MatchResult = 'match' | 'no-match' | 'empty';
```

## SEO Keywords
- "file hash checker online"
- "SHA256 file verifier"
- "verify download integrity free"
- "checksum calculator online"
- "MD5 SHA256 hash file"

## Content Outline
**Intro:** Why verifying file integrity matters (malware, corruption, man-in-the-middle).
Use cases: verifying ISO downloads, checking source tarballs, audit trails.
**Steps:** Drop file → select algorithm → copy hash → optionally paste expected to verify.
**Why:** Never leaves the browser (even large files), all major algorithms, instant comparison.
**FAQs:** What is a hash/checksum, which algo to use, can files be recovered from hashes, 
why does my hash not match.
**Related:** hash-generator, base64-encoder, text-encrypt-decrypt
