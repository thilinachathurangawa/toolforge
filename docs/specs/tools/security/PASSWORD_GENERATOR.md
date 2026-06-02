# SPEC: Password Generator Tool
**File:** `docs/specs/tools/PASSWORD_GENERATOR.md`  
**Status:** Completed  
**Slug:** `password-generator`  
**Category:** security

---

## SEO

- **Title:** `Password Generator — Create Strong Secure Passwords | ToolForge`
- **Description:** `Generate strong, random, secure passwords instantly. Customize length, symbols, numbers, and more. Free online password generator.`
- **Primary Keyword:** strong password generator
- **Secondary Keywords:** random password generator, secure password, password maker

---

## Functional Requirements

- [ ] Length slider (8–128 characters)
- [ ] Toggle: Uppercase letters
- [ ] Toggle: Lowercase letters
- [ ] Toggle: Numbers
- [ ] Toggle: Symbols
- [ ] Toggle: Exclude ambiguous characters (0, O, l, 1)
- [ ] Password strength indicator (Weak / Fair / Strong / Very Strong)
- [ ] Generate button (regenerate on click)
- [ ] Copy to clipboard button
- [ ] Generate multiple passwords (1–10)
- [ ] No library needed (Web Crypto API)

---

## Library

No external library needed — uses Web Crypto API

---

## UI Layout

```
┌─────────────────────────────────┐
│  Length: [────────●────] 16      │
│                                 │
│  [✓] Uppercase (A-Z)           │
│  [✓] Lowercase (a-z)           │
│  [✓] Numbers (0-9)             │
│  [✓] Symbols (!@#$%)           │
│  [ ] Exclude ambiguous (0,O,l,1)│
│                                 │
│  Quantity: [──●────] 1         │
│                                 │
│  [Generate Passwords]           │
├─────────────────────────────────┤
│  Generated Passwords:           │
│  ┌───────────────────────────┐  │
│  │ K9#mP2$vL5@xR8&nQ         │  │
│  │ [Copy]                    │  │
│  └───────────────────────────┘  │
│                                 │
│  Strength: ████████░░ Strong    │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  quantity: number;
}

state: {
  options: PasswordOptions;
  passwords: string[];
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Adjust the length slider to set your desired password length (8–128 characters)
2. Check the boxes for character types you want to include (uppercase, lowercase, numbers, symbols)
3. Optionally exclude ambiguous characters like 0, O, l, 1
4. Set the quantity if you need multiple passwords
5. Click "Generate Passwords" to create secure random passwords
6. Click the copy button to copy a password to your clipboard

---

## About Content (for SEO section)

Our password generator uses the Web Crypto API to create cryptographically secure random passwords. Customize length, character types, and quantity to generate passwords that meet your specific security requirements. All generation happens locally in your browser — no data is sent to any server. Perfect for creating strong passwords for accounts, WiFi, encryption keys, and more.
