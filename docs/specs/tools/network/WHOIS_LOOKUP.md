# SPEC: WHOIS Lookup Tool
**File:** `docs/specs/tools/network/WHOIS_LOOKUP.md`  
**Status:** Pending  
**Slug:** `whois-lookup`  
**Category:** network

---

## SEO

- **Title:** `WHOIS Lookup — Domain Registration Info | ToolForge`
- **Description:** `Lookup WHOIS information for any domain. Find registrar, creation date, expiration, and owner details using WhoisJSON API.`
- **Primary Keyword:** WHOIS lookup
- **Secondary Keywords:** domain WHOIS, domain registration info, WHOIS search, domain owner lookup

---

## Functional Requirements

- [ ] Domain name input field
- [ ] Lookup button
- [ ] Display domain registrar
- [ ] Display registration date
- [ ] Display expiration date
- [ ] Display updated date
- [ ] Display domain status
- [ ] Display name servers
- [ ] Display registrant info (if available)
- [ ] Display admin/tech contacts (if available)
- [ ] Copy results button
- [ ] Use https://whoisjson.com API (free tier)

---

## Library

No external library needed — use fetch API with whoisjson.com

---

## UI Layout

```
┌─────────────────────────────────┐
│  Domain: [example.com    ]      │
│  [Lookup WHOIS]                 │
├─────────────────────────────────┤
│  Registrar: Example Registrar    │
│  Created: Jan 15, 2000          │
│  Updated: Dec 10, 2023          │
│  Expires: Jan 15, 2025          │
│  Status: clientTransferProhibited│
│                                 │
│  Name Servers:                  │
│  • ns1.example.com             │
│  • ns2.example.com             │
│                                 │
│  Registrant:                    │
│  Organization: Example Corp     │
│  Country: US                    │
│                                 │
│  [Copy Info]                    │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface WhoisInfo {
  domain: string;
  registrar: string;
  createdDate: Date;
  updatedDate: Date;
  expiresDate: Date;
  status: string[];
  nameServers: string[];
  registrant: {
    organization?: string;
    country?: string;
    state?: string;
  };
}

state: {
  domain: string;
  whoisInfo: WhoisInfo | null;
  loading: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Enter a domain name in the input field
2. Click "Lookup WHOIS" to retrieve domain registration information
3. View registrar details, important dates, and name servers
4. Check registrant information if available
5. Copy the information to clipboard if needed

---

## About Content (for SEO section)

Our WHOIS lookup tool uses the WhoisJSON API to retrieve domain registration information for any domain. View registrar details, creation and expiration dates, domain status, name servers, and available registrant contact information. Perfect for domain research, investigating domain ownership, and checking domain expiration dates. The tool uses the free tier of WhoisJSON for reliable WHOIS data.
