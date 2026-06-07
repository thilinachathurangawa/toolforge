# SPEC: URL Redirect Tracer Tool
**File:** `docs/specs/tools/network/URL_REDIRECT_TRACER.md`  
**Status:** Pending  
**Slug:** `url-redirect-tracer`  
**Category:** network

---

## SEO

- **Title:** `URL Redirect Tracer — Follow HTTP Redirects | ToolForge`
- **Description:** `Trace the full redirect chain for any URL. See all 301, 302, and other redirects with status codes and headers. Free redirect checker.`
- **Primary Keyword:** URL redirect tracer
- **Secondary Keywords:** redirect checker, follow redirects, HTTP redirect chain, URL tracer, 301 redirect

---

## Functional Requirements

- [ ] URL input field
- [ ] Trace redirects button
- [ ] Display complete redirect chain in order
- [ ] Show status code for each step
- [ ] Show redirect type (301, 302, 303, 307, 308)
- [ ] Show final destination URL
- [ ] Show response time for each step
- [ ] Show redirect headers (Location, etc.)
- [ ] Visual chain diagram
- [ ] Copy chain button
- [ ] Use fetch with redirect: 'manual' or similar approach

---

## Library

No external library needed — use fetch API with manual redirect following

---

## UI Layout

```
┌─────────────────────────────────┐
│  URL: [https://example.com]     │
│  [Trace Redirects]              │
├─────────────────────────────────┤
│  Redirect Chain:                │
│                                 │
│  1. https://short.ly/abc        │
│     → 301 Moved Permanently     │
│     Location: https://site.com  │
│     Time: 45ms                  │
│     ↓                           │
│  2. https://site.com            │
│     → 302 Found                 │
│     Location: https://site.com/ │
│     Time: 52ms                  │
│     ↓                           │
│  3. https://site.com/           │
│     → 200 OK (Final)            │
│     Time: 48ms                  │
│                                 │
│  Total redirects: 2             │
│  Total time: 145ms              │
│                                 │
│  [Copy Chain]                   │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface RedirectStep {
  url: string;
  statusCode: number;
  statusText: string;
  redirectType: string;
  location: string;
  responseTime: number;
  isFinal: boolean;
}

interface RedirectChain {
  steps: RedirectStep[];
  totalRedirects: number;
  totalTime: number;
}

state: {
  url: string;
  chain: RedirectChain | null;
  loading: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Enter a URL in the input field
2. Click "Trace Redirects" to follow the redirect chain
3. View each step of the redirect with status codes
4. See the final destination URL
5. Copy the redirect chain for analysis

---

## About Content (for SEO section)

Our URL redirect tracer follows the complete HTTP redirect chain for any URL. View each redirect step with status codes (301, 302, 303, 307, 308), redirect locations, and response times. Perfect for SEO professionals analyzing redirect chains, developers debugging URL routing, and anyone investigating URL redirects. The tool shows a visual chain diagram and calculates total redirects and time.
