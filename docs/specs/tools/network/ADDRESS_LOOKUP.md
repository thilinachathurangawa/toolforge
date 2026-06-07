# SPEC: Address Lookup Tool
**File:** `docs/specs/tools/network/ADDRESS_LOOKUP.md`  
**Status:** Pending  
**Slug:** `address-lookup`  
**Category:** network

---

## SEO

- **Title:** `IP Address Lookup — Get Location & ISP Info | ToolForge`
- **Description:** `Lookup any IP address to find location, ISP, timezone, and more. Free IP geolocation service using ipapi.co.`
- **Primary Keyword:** IP address lookup
- **Secondary Keywords:** IP geolocation, find IP location, IP info, ISP lookup, IP tracker

---

## Functional Requirements

- [ ] IP address input field (auto-detect current IP)
- [ ] Lookup button
- [ ] Display IP address
- [ ] Display city, region, country
- [ ] Display ISP/organization
- [ ] Display timezone
- [ ] Display coordinates (latitude, longitude)
- [ ] Display postal code
- [ ] Map visualization (optional)
- [ ] Copy all info button
- [ ] Use https://ipapi.co/json API

---

## Library

No external library needed — use fetch API with ipapi.co

---

## UI Layout

```
┌─────────────────────────────────┐
│  IP Address: [_____________]    │
│  [Lookup] [My IP]               │
├─────────────────────────────────┤
│  IP: 192.168.1.1                │
│  City: San Francisco            │
│  Region: California             │
│  Country: United States (US)    │
│  ISP: Cloudflare Inc.           │
│  Timezone: America/Los_Angeles  │
│  Lat/Lon: 37.7749, -122.4194    │
│  Postal: 94102                  │
│                                 │
│  [Copy Info]                    │
└─────────────────────────────────┘
```

---

## Component State

```typescript
interface IPInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  org: string;
  timezone: string;
  latitude: number;
  longitude: number;
  postal: string;
}

state: {
  inputIP: string;
  ipInfo: IPInfo | null;
  loading: boolean;
  error: string | null;
}
```

---

## How to Use Content (for SEO section)

1. Enter an IP address in the input field or click "My IP" to use your current IP
2. Click "Lookup" to retrieve information about the IP address
3. View the location, ISP, timezone, and other details
4. Click "Copy Info" to copy all details to clipboard

---

## About Content (for SEO section)

Our IP address lookup tool uses the ipapi.co service to provide detailed geolocation and network information for any IP address. Discover the city, region, country, ISP, timezone, and coordinates associated with an IP. Perfect for cybersecurity professionals, developers, and anyone curious about network location data. The tool automatically detects your current IP address for quick lookup.
