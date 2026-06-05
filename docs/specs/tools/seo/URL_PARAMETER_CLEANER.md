# SPEC: URL Parameter Cleaner Tool
**File:** `docs/specs/tools/seo/URL_PARAMETER_CLEANER.md`
**Status:** Pending
**Slug:** `url-parameter-cleaner`
**Category:** seo

---

## SEO

- **Title:** `URL Parameter Cleaner — Remove Tracking Parameters Online Free | ToolForge`
- **Description:** `Clean URLs by removing tracking parameters, UTM tags, and unnecessary query strings. Create clean, SEO-friendly URLs for free.`
- **Primary Keyword:** URL parameter cleaner
- **Secondary Keywords:** URL cleaner, remove UTM parameters, strip tracking parameters, clean URL tool

---

## Functional Requirements

- [ ] URL input field
- [ ] Auto-detect and list all parameters
- [ ] Parameter list with checkboxes:
  - [ ] Show parameter name
  - [ ] Show parameter value
  - [ ] Toggle to keep or remove
- [ ] Common tracking parameters auto-select:
  - [ ] UTM parameters (utm_source, utm_medium, utm_campaign, etc.)
  - [ ] Facebook click identifiers (fbclid)
  - [ ] Google click identifiers (gclid)
  - [ ] Session IDs
  - [ ] Timestamps
- [ ] Custom parameter filter (add/remove patterns)
- [ ] Keep specific parameters (whitelist)
- [ ] Remove specific parameters (blacklist)
- [ ] Batch URL processing (one per line)
- [ ] Live preview of cleaned URL
- [ ] Copy cleaned URL(s) button
- [ ] Export cleaned URLs as list
- [ ] URL validation

---

## Library

No external library needed — use URL parsing and string manipulation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Input URL:                              │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=spring&fbclid=abc123&session=xyz789&id=123│
│  └─────────────────────────────────┘   │
│                                         │
│  [Clean URL]                            │
├─────────────────────────────────────────┤
│  Detected Parameters:                   │
│  ┌─────────────────────────────────┐   │
│  │ [✓] utm_source = google         │   │
│  │ [✓] utm_medium = cpc             │   │
│  │ [✓] utm_campaign = spring        │   │
│  │ [✓] fbclid = abc123              │   │
│  │ [✓] session = xyz789             │   │
│  │ [ ] id = 123                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Quick Actions:                          │
│  [Select All Tracking] [Deselect All]   │
│  [Keep All] [Remove All]                │
│                                         │
│  Custom Filter:                          │
│  Add pattern: [utm_*] [Add]              │
│  Whitelist: [id, ref]                    │
│  Blacklist: [fbclid, gclid]              │
├─────────────────────────────────────────┤
│  Cleaned URL:                            │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/page?id=123 │   │
│  └─────────────────────────────────┘   │
│  Removed: 5 parameters                  │
│                                         │
│  [Copy] [Clear]                         │
├─────────────────────────────────────────┤
│  Batch Processing [▼]                    │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/page1?...   │   │
│  │ https://example.com/page2?...   │   │
│  │ [Process Batch]                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
interface UrlParameter {
  name: string;
  value: string;
  isTracking: boolean;
  selected: boolean;
}

state: {
  inputUrl: string;
  parameters: UrlParameter[];
  cleanedUrl: string;
  whitelist: string[];
  blacklist: string[];
  batchInput: string;
  batchResults: string[];
}
```

---

## Common Tracking Parameters

```typescript
const trackingParameters = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'msclkid',
  'session_id', 'sessionid', 'sid',
  'timestamp', 'ts', 't',
  'ref', 'referrer',
  'click_id', 'clickid',
  'mc_cid', 'mc_eid',
];
```

---

## URL Cleaning Logic

```typescript
function cleanUrl(url: string, paramsToRemove: string[]): string {
  try {
    const urlObj = new URL(url);
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}
```

---

## How to Use Content (for SEO section)

1. Paste your URL with parameters into the input field
2. The tool automatically detects all parameters
3. Tracking parameters (UTM, fbclid, etc.) are pre-selected for removal
4. Uncheck any parameters you want to keep
5. Use quick actions to select/deselect all tracking parameters
6. Add custom filter patterns for specific use cases
7. Set whitelist/blacklist for automated filtering
8. Review the cleaned URL preview
9. Copy the cleaned URL or process multiple URLs in batch
10. Use clean URLs for sharing, SEO, and analytics

---

## About Content (for SEO section)

Our free URL parameter cleaner removes tracking parameters and unnecessary query strings from your URLs. Strip UTM tags, Facebook click IDs, Google click IDs, and other tracking parameters to create clean, SEO-friendly URLs. Perfect for cleaning up links before sharing or for canonical URL management. All processing happens in your browser with no data sent to any server.
