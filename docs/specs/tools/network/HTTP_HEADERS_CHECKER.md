# SPEC: HTTP Headers Checker Tool
**File:** `docs/specs/tools/network/HTTP_HEADERS_CHECKER.md`  
**Status:** Pending  
**Slug:** `http-headers-checker`  
**Category:** network

---

## SEO

- **Title:** `HTTP Headers Checker — View Response Headers | ToolForge`
- **Description:** `Check HTTP response headers for any URL. View security headers, caching, content type, and more using AllOrigins API.`
- **Primary Keyword:** HTTP headers checker
- **Secondary Keywords:** response headers, HTTP header analyzer, view headers, security headers

---

## Functional Requirements

- [ ] URL input field
- [ ] Check headers button
- [ ] Display all response headers in formatted list
- [ ] Highlight security headers (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Show status code
- [ ] Show content type
- [ ] Show content length
- [ ] Filter headers by type
- [ ] Copy headers button
- [ ] Use https://api.allorigins.win API

---

## Library

No external library needed — use fetch API with allorigins.win

---

## UI Layout

```
┌─────────────────────────────────┐
│  URL: [https://example.com]     │
│  [Check Headers]                │
├─────────────────────────────────┤
│  Status: 200 OK                 │
│  Content-Type: text/html        │
│  Content-Length: 1256           │
│                                 │
│  Response Headers:              │
│  🟢 content-security-policy     │
│  🟢 strict-transport-security   │
│  🟢 x-frame-options             │
│  ⚪ cache-control               │
│  ⚪ server                      │
│  ⚪ set-cookie                  │
│                                 │
│  [Copy Headers]                 │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface HeaderResult {
  name: string;
  value: string;
  isSecurityHeader: boolean;
}

state: {
  url: string;
  status: number;
  statusText: string;
  headers: HeaderResult[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'security' | 'caching' | 'other';
}
```

---

## How to Use Content (for SEO section)

1. Enter a URL in the input field
2. Click "Check Headers" to fetch the HTTP response headers
3. View all headers with security headers highlighted
4. Filter headers by type if needed
5. Copy headers to clipboard for analysis

---

## About Content (for SEO section)

Our HTTP headers checker uses the AllOrigins API to fetch and display HTTP response headers for any URL. View all headers including security headers like CSP, HSTS, and X-Frame-Options. Perfect for web developers, security professionals, and anyone analyzing HTTP responses. The tool highlights security-related headers for quick identification and supports filtering by header type.
