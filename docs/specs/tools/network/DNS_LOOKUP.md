# SPEC: DNS Lookup Tool
**File:** `docs/specs/tools/network/DNS_LOOKUP.md`  
**Status:** Pending  
**Slug:** `dns-lookup`  
**Category:** network

---

## SEO

- **Title:** `DNS Lookup — Query DNS Records Online | ToolForge`
- **Description:** `Perform DNS lookups for A, AAAA, MX, TXT, NS, CNAME records using Google's DNS API. Free DNS query tool.`
- **Primary Keyword:** DNS lookup
- **Secondary Keywords:** DNS query, DNS records, dig online, nslookup, DNS checker

---

## Functional Requirements

- [ ] Domain name input field
- [ ] Record type selector (A, AAAA, MX, TXT, NS, CNAME, SOA)
- [ ] Lookup button
- [ ] Display DNS records in formatted table
- [ ] Show query time
- [ ] Show response status
- [ ] Copy results button
- [ ] Support multiple record types at once
- [ ] Use https://dns.google/resolve API

---

## Library

No external library needed — use fetch API with dns.google/resolve

---

## UI Layout

```
┌─────────────────────────────────┐
│  Domain: [example.com    ]      │
│  Record Types:                  │
│  [✓] A  [✓] AAAA  [✓] MX       │
│  [✓] TXT [✓] NS    [✓] CNAME   │
│  [ ] SOA                         │
│  [Lookup]                       │
├─────────────────────────────────┤
│  Query Time: 45ms               │
│  Status: NOERROR                │
│                                 │
│  A Records:                     │
│  93.184.216.34                  │
│                                 │
│  MX Records:                    │
│  10 mail.example.com            │
│                                 │
│  [Copy Results]                 │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface DNSRecord {
  name: string;
  type: string;
  TTL: number;
  data: string;
}

interface DNSResponse {
  Status: number;
  Answer?: DNSRecord[];
  Question: Array<{ name: string; type: number }>;
}

state: {
  domain: string;
  selectedTypes: string[];
  results: Map<string, DNSRecord[]>;
  queryTime: number;
  loading: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Enter a domain name in the input field
2. Select the DNS record types you want to query
3. Click "Lookup" to perform the DNS query
4. View the results for each record type
5. Copy the results to clipboard if needed

---

## About Content (for SEO section)

Our DNS lookup tool uses Google's public DNS API (dns.google) to query DNS records for any domain. Look up A, AAAA, MX, TXT, NS, CNAME, and SOA records instantly. Perfect for developers, system administrators, and anyone troubleshooting DNS issues. The tool shows query time and response status for comprehensive DNS analysis.
