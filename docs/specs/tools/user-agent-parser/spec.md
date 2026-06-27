# User Agent Parser — Spec

## Slug
`user-agent-parser`

## Category
`network`

## Component Location
`src/components/tools/UserAgentParser/index.tsx`

## Overview
Reads `navigator.userAgent` and parses it into structured browser/OS/device info using
regex matching. Also allows pasting a custom UA string to parse any user agent.
100% client-side — no server calls.

## UI Controls
- Raw UA string textarea (pre-filled with navigator.userAgent, editable for custom input)
- "Parse" button (also auto-parses on mount and on textarea change)
- "Use My UA" button — resets to navigator.userAgent
- Result cards:
  - Browser card: Name + Version + Engine
  - Operating System card: Name + Version
  - Device card: Type (Desktop/Mobile/Tablet) + Brand (if detectable)
- Copy UA string button

## Core Logic (regex-based, no library)
```ts
function parseUserAgent(ua: string): ParsedUA {
  // Browser detection order matters — Chrome before Safari, Edge before Chrome
  let browser = { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };
  let os = { name: 'Unknown', version: 'Unknown' };
  let device = { type: 'Desktop' as DeviceType, brand: '' };

  // Browser detection
  if (/Edg\/(\S+)/.test(ua)) { browser = { name: 'Edge', version: RegExp.$1, engine: 'Blink' }; }
  else if (/OPR\/(\S+)/.test(ua)) { browser = { name: 'Opera', version: RegExp.$1, engine: 'Blink' }; }
  else if (/Chrome\/(\S+)/.test(ua)) { browser = { name: 'Chrome', version: RegExp.$1, engine: 'Blink' }; }
  else if (/Firefox\/(\S+)/.test(ua)) { browser = { name: 'Firefox', version: RegExp.$1, engine: 'Gecko' }; }
  else if (/Safari\/(\S+)/.test(ua) && /Version\/(\S+)/.test(ua)) { browser = { name: 'Safari', version: RegExp.$1, engine: 'WebKit' }; }

  // OS detection
  if (/Windows NT (\d+\.\d+)/.test(ua)) { os = { name: 'Windows', version: windowsVersion(RegExp.$1) }; }
  else if (/Mac OS X ([\d_]+)/.test(ua)) { os = { name: 'macOS', version: RegExp.$1.replace(/_/g, '.') }; }
  else if (/Android (\d[\d.]*)/.test(ua)) { os = { name: 'Android', version: RegExp.$1 }; }
  else if (/(iPhone|iPad).*OS ([\d_]+)/.test(ua)) { os = { name: 'iOS', version: RegExp.$2.replace(/_/g, '.') }; }
  else if (/Linux/.test(ua)) { os = { name: 'Linux', version: '' }; }

  // Device detection
  if (/Mobile|Android.*Mobile|iPhone/.test(ua)) { device.type = 'Mobile'; }
  else if (/iPad|Tablet/.test(ua)) { device.type = 'Tablet'; }

  return { browser, os, device };
}
```

## TypeScript Interfaces
```ts
type DeviceType = 'Desktop' | 'Mobile' | 'Tablet';

interface BrowserInfo { name: string; version: string; engine: string; }
interface OsInfo { name: string; version: string; }
interface DeviceInfo { type: DeviceType; brand: string; }

interface ParsedUA {
  browser: BrowserInfo;
  os: OsInfo;
  device: DeviceInfo;
}
```

## SEO Keywords
- "user agent parser online"
- "what is my browser user agent"
- "device string analyzer"
- "browser detection tool"
- "parse user agent string"

## Content Outline
**Intro:** What a user agent is; why developers and QA engineers need to parse them.
**Steps:** Your UA auto-loads → read parsed cards → or paste a custom UA to decode it.
**Why:** Entirely client-side (no upload); accepts any pasted UA; clean structured output.
**FAQs:** What is a user agent string, can I spoof my user agent, why does Chrome say Safari,
what is the engine field.
**Related:** browser-screen-info, what-is-my-ip, http-headers-checker
