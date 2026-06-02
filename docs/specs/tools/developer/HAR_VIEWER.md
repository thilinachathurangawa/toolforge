# SPEC: HAR Viewer Tool
**File:** `docs/specs/tools/developer/HAR_VIEWER.md`
**Status:** Completed
**Slug:** `har-viewer`
**Category:** developer

---

## SEO

- **Title:** `HAR Viewer — Analyze HTTP Archive Files Online | ToolForge`
- **Description:** `Upload and analyze HAR files to view network requests, responses, timings, and headers. No sign-up required.`
- **Primary Keyword:** har viewer
- **Secondary Keywords:** har file viewer, http archive viewer, network analyzer

---

## Functional Requirements

- [ ] File upload button (.har, .json)
- [ ] HAR content textarea (paste option)
- [ ] Parse HAR button
- [ ] Display HAR summary (version, entries, pages)
- [ ] Show request list (method, URL, status)
- [ ] Display request/response details
- [ ] Copy HAR data button
- [ ] No data sent to server

---

## UI Layout

```
┌─────────────────────────────────┐
│  [Upload HAR]                   │
│                                 │
│  Or paste HAR content:          │
│  ┌───────────────────────────┐  │
│  │ {"log": {"version": "1.2"│  │
│  │  ...}}                    │  │
│  └───────────────────────────┘  │
│                                 │
│  [Analyze]                      │
├─────────────────────────────────┤
│  Summary:                       │
│  ┌───────────────────────────┐  │
│  │ Version: 1.2              │  │
│  │ Entries: 45               │  │
│  │ Pages: 3                  │  │
│  └───────────────────────────┘  │
│                                 │
│  Requests:                      │
│  ┌───────────────────────────┐  │
│  │ GET https://api.example. │  │
│  │   com/users              │  │
│  │   Status: 200 OK         │  │
│  │ POST https://api.example.│  │
│  │   com/data               │  │
│  │   Status: 201 Created    │  │
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
  harData: any;
  error: string | null;
  copied: boolean;
}
```

---

## How to Use Content (for SEO section)

1. Upload a HAR file or paste HAR content
2. Click "Analyze" to parse the file
3. Review the summary (version, entries, pages)
4. Browse the list of network requests
5. View request methods, URLs, and status codes

---

## About Content (for SEO section)

Our HAR viewer analyzes HTTP Archive (HAR) files entirely in your browser. Upload HAR files exported from browser dev tools to view network activity. Analyze requests, responses, timings, and headers without sending data to any server. Perfect for debugging network issues, analyzing performance, or documenting API behavior. No data is sent to any server — all analysis happens locally on your device.
