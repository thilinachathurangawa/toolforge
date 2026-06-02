# SPEC: Hash Generator Tool
**File:** `docs/specs/tools/HASH_GENERATOR.md`  
**Status:** Completed  
**Slug:** `hash-generator`  
**Category:** security

---

## SEO

- **Title:** `Hash Generator — Generate MD5, SHA-1, SHA-256 Online Free | ToolForge`
- **Description:** `Generate MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes online for free. Instant hash generation with no data sent to server.`
- **Primary Keyword:** hash generator online
- **Secondary Keywords:** MD5 hash, SHA-256 generator, SHA-1 hash, cryptographic hash

---

## Functional Requirements

- [ ] Large text input area for input string
- [ ] Hash algorithm selector: MD5, SHA-1, SHA-256, SHA-512
- [ ] Generate hash button (or auto-generate on input)
- [ ] Display hash output in monospace font
- [ ] Copy hash to clipboard button
- [ ] Support multiple hash algorithms simultaneously
- [ ] Compare two hashes (optional feature)
- [ ] Uppercase/lowercase toggle for output
- [ ] No library needed (Web Crypto API)

---

## Library

No external library needed — use Web Crypto API (SubtleCrypto)

---

## UI Layout

```
┌─────────────────────────────────┐
│  Input Text:                    │
│  [_________________________]    │
│                                 │
│  Algorithms:                    │
│  [✓] MD5   [✓] SHA-1          │
│  [✓] SHA-256 [✓] SHA-512      │
│                                 │
│  [Generate Hash] button         │
├─────────────────────────────────┤
│  Results:                       │
│  MD5:     [Copy]               │
│  5d41402abc4b2a76b9719d911017c592│
│                                 │
│  SHA-256: [Copy]               │
│  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824│
│                                 │
│  [□] Uppercase                 │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface HashResult {
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';
  hash: string;
}

state: {
  inputText: string;
  selectedAlgorithms: string[];
  results: HashResult[];
  isUppercase: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Enter your text or string in the input field
2. Select which hash algorithms you want to use
3. Click "Generate Hash" to create the hash
4. Copy the hash result to your clipboard
5. Toggle uppercase if needed for your use case

---

## About Content (for SEO section)

Our free hash generator creates cryptographic hashes using MD5, SHA-1, SHA-256, and SHA-512 algorithms directly in your browser. No data is sent to any server — all processing happens locally on your device using the Web Crypto API. Perfect for checksums, password hashing, and data integrity verification.
