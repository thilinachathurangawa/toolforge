# Password Strength Checker — Spec

## Slug
`password-strength-checker`

## Category
`security`

## Component Location
`src/components/tools/PasswordStrengthChecker/index.tsx`

## Overview
Client-side password strength analyzer. Replicates zxcvbn's 0–4 scoring model using
pure browser JavaScript (no external library needed). Displays a dynamic progress bar,
estimated crack times for three attack scenarios, and actionable feedback.

## UI Controls
- Large password `<input type="password">` with show/hide toggle (Eye icon)
- `Progress` bar (shadcn/ui style) with 5-level color gradient:
  - 0 = red (Very Weak)
  - 1 = orange (Weak)
  - 2 = amber (Fair)
  - 3 = lime (Strong)
  - 4 = green (Very Strong)
- Score label: "Very Weak / Weak / Fair / Strong / Very Strong"
- Estimated crack time panel (3 rows):
  - Offline (fast hash): ~10B guesses/s
  - Offline (slow hash): ~10k guesses/s
  - Online throttled: ~10 guesses/s
- Feedback list: actionable warnings and suggestions

## Core Logic (no external library)
Scoring (0–4) based on entropy estimate:
1. Calculate base entropy from charset size × log2(length)
2. Apply penalties for:
   - length < 8 → floor to 0
   - all lowercase only → -1
   - sequential keyboard runs (qwerty, 12345) → -1
   - common password list match (top 50) → floor to 0
   - repeated chars (aaa, 111) → -1
   - dictionary word only → floor to 1
3. Clamp result to 0–4
4. Crack time = entropy_seconds(score) displayed in human-readable form

Feedback rules:
- score < 2 and length < 8 → "Add more characters"
- score < 2 and no uppercase → "Mix in uppercase letters"
- score < 2 and no numbers → "Add numbers"
- score < 2 and no symbols → "Add symbols (!@#$...)"
- common password matched → "This is a commonly used password"
- keyboard pattern → "Avoid keyboard sequences"

## TypeScript Interfaces
```ts
interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;        // Tailwind bg class
  entropy: number;
  crackTimes: {
    offlineFastHash: string;   // "instant" | "X seconds" | "X minutes" etc.
    offlineSlowHash: string;
    onlineThrottled: string;
  };
  feedback: string[];
  warnings: string[];
}
```

## SEO Keywords
- "password strength checker online"
- "test password security"
- "how strong is my password"
- "password entropy calculator"

## Content Outline
**Intro:** Why length beats complexity for entropy; real-world breach statistics.
**Steps:** Type password → read score → review crack times → act on feedback.
**Why:** 100% client-side (nothing transmitted), instant feedback, explains the "why"
behind weak ratings, shows realistic crack time estimates.
**FAQs:** What is entropy, why 12+ chars, is my password sent anywhere, what makes a strong password.
**Related:** password-generator, hash-generator, text-encrypt-decrypt
