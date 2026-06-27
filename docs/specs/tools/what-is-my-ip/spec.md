# What Is My IP — Spec

## Slug
`what-is-my-ip`

## Category
`network`

## Component Location
`src/components/tools/WhatIsMyIp/index.tsx`

## Overview
Fetches and displays the user's public IP address on page load. Uses the free
ipify.org public API (`https://api.ipify.org?format=json` for IPv4 and
`https://api64.ipify.org?format=json` for IPv4/IPv6). Clean typographic display
with copy button and refresh capability.

**Privacy note:** The user's IP is sent to ipify.org servers to retrieve it — this
must be disclosed in the content.

## UI Controls
- Large hero text displaying the IP address (or loading skeleton)
- "Copy IP" button with clipboard icon
- "Refresh" icon button to re-fetch
- IP version badge: "IPv4" or "IPv6"
- Minimal info below: ISP/location is NOT fetched here (separate tool: address-lookup)
- Error state message if fetch fails

## Core Logic
```ts
async function fetchMyIp(): Promise<string> {
  // Try ipify64 first (returns IPv6 if available, else IPv4)
  const res = await fetch('https://api64.ipify.org?format=json');
  const data: { ip: string } = await res.json();
  return data.ip;
}
```
- On mount: call fetchMyIp → set ipAddress state
- Detect IPv4 vs IPv6 by checking for `:` in the address

## TypeScript Interfaces
```ts
interface IpState {
  ipAddress: string | null;
  isLoading: boolean;
  error: string | null;
  isIPv6: boolean;
}
```

## SEO Keywords
- "what is my IP address"
- "find my public IP"
- "check my IP online"
- "my IP address lookup"
- "what is my IPv4 address"

## Content Outline
**Intro:** What a public IP is vs private IP; why you might need to know yours (VPN check,
server whitelisting, remote access troubleshooting).
**Steps:** Open the page → IP displays automatically → copy with one click.
**Why:** Instant display on load; shows IPv4 or IPv6; single-purpose (not cluttered).
IMPORTANT: Be honest — "Your IP address is sent to the ipify.org API to retrieve it;
this is a publicly known address by design."
**FAQs:** What is a public IP, will this show my exact home location, what is IPv6,
can a VPN hide my IP.
**Related:** address-lookup, dns-lookup, website-status-checker
