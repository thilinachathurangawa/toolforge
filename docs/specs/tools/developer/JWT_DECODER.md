# SPEC: JWT Decoder Tool
**File:** `docs/specs/tools/developer/JWT_DECODER.md`
**Status:** Completed
**Slug:** `jwt-decoder`
**Category:** developer

---

## SEO

- **Title:** `JWT Decoder — Decode JSON Web Tokens Online | ToolForge`
- **Description:** `Decode JWT tokens to view header, payload, and signature. Verify token structure and expiration. No sign-up required.`
- **Primary Keyword:** jwt decoder
- **Secondary Keywords:** decode jwt, jwt token decoder, json web token decoder

---

## Functional Requirements

- [ ] JWT token input
- [ ] Decode button
- [ ] Display decoded header
- [ ] Display decoded payload
- [ ] Show signature
- [ ] Display expiration time (if present)
- [ ] Display issued at time (if present)
- [ ] Copy header/payload button
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  JWT Token:                     │
│  ┌───────────────────────────┐  │
│  │ eyJhbGciOiJIUzI1NiIs...  │  │
│  └───────────────────────────┘  │
│                                 │
│  [Decode]                       │
├─────────────────────────────────┤
│  Header:                        │
│  ┌───────────────────────────┐  │
│  │ {                         │  │
│  │   "alg": "HS256",         │  │
│  │   "typ": "JWT"            │  │
│  │ }                         │  │
│  └───────────────────────────┘  │
│                                 │
│  Payload:                       │
│  ┌───────────────────────────┐  │
│  │ {                         │  │
│  │   "sub": "1234567890",    │  │
│  │   "exp": 1516239022       │  │
│  │ }                         │  │
│  └───────────────────────────┘  │
│  Expires at: [date]            │
│                                 │
│  [Copy]                         │
└─────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  token: string;
  header: any;
  payload: any;
  signature: string;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Paste your JWT token into the input textarea
2. Click "Decode" to view the token contents
3. Review the header, payload, and signature
4. Check expiration and issued at timestamps
5. Copy the decoded data for debugging

---

## About Content (for SEO section)

Our JWT decoder decodes JSON Web Tokens entirely in your browser. View the header, payload, and signature without sending data to any server. Check token expiration, issuer information, and claims. Perfect for debugging authentication, verifying API tokens, or learning JWT structure. No data is sent to any server — all decoding happens locally on your device.
