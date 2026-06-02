# SPEC: Security Header Analyzer Tool
**File:** `docs/specs/tools/developer/SECURITY_HEADER_ANALYZER.md`
**Status:** Completed
**Slug:** `security-header-analyzer`
**Category:** developer

---

## SEO

- **Title:** `Security Header Analyzer — Analyze HTTP Security Headers Online | ToolForge`
- **Description:** `Analyze HTTP security headers like CSP, HSTS, X-Frame-Options. Get recommendations for improving security. No sign-up required.`
- **Primary Keyword:** security header analyzer
- **Secondary Keywords:** http security headers, csp analyzer, security headers check

---

## Functional Requirements

- [ ] HTTP headers input textarea
- [ ] Analyze button
- [ ] Security score display (0-100%)
- [ ] Header analysis list (present/missing)
- [ ] Severity levels (critical, high, medium, low)
- [ ] Recommendations for each header
- [ ] Copy analysis button
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  HTTP Headers:                  │
│  ┌───────────────────────────┐  │
│  │ Content-Security-Policy:  │  │
│  │ default-src 'self'        │  │
│  │ Strict-Transport-Security:│  │
│  │ max-age=31536000          │  │
│  └───────────────────────────┘  │
│                                 │
│  [Analyze]                      │
├─────────────────────────────────┤
│  Security Score: 75%            │
│  ████████████░░░░░░░░           │
│                                 │
│  Header Analysis:               │
│  ┌───────────────────────────┐  │
│  │ ✓ Content-Security-Policy │  │
│  │   [critical] Implement a  │  │
│  │   strict CSP              │  │
│  │                           │  │
│  │ ✓ Strict-Transport-Securi│  │
│  │   ty [high] Enable HSTS   │  │
│  │                           │  │
│  │ ✗ X-Frame-Options [high] │  │
│  │   Use to prevent          │  │
│  │   clickjacking            │  │
│  └───────────────────────────┘  │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  input: string;
  analyses: HeaderAnalysis[];
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste your HTTP headers into the input textarea
2. Click "Analyze" to check security headers
3. Review the security score (0-100%)
4. See which headers are present or missing
5. Read recommendations for improving security

---

## About Content (for SEO section)

Our security header analyzer checks HTTP security headers entirely in your browser. Analyze CSP, HSTS, X-Frame-Options, and other security headers. Get a security score and recommendations for each header. Perfect for auditing web applications, improving security posture, or learning about HTTP security. No data is sent to any server — all analysis happens locally on your device.
