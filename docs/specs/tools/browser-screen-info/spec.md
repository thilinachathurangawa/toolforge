# Browser & Screen Info Checker — Spec

## Slug
`browser-screen-info`

## Category
`network`

## Component Location
`src/components/tools/BrowserScreenInfo/index.tsx`

## Overview
Reads browser and screen properties using `window.screen` and `navigator` APIs and
presents them in a clean dashboard grid. 100% client-side — no server calls.

## UI Controls
- Dashboard grid of info cards (2 columns on desktop, 1 on mobile)
- "Copy All" button: copies a formatted JSON summary
- Refresh button: re-reads live values (viewport can change if resized)

## Data Points
**Screen:**
- Screen Resolution: `screen.width × screen.height`
- Available Screen: `screen.availWidth × screen.availHeight`
- Color Depth: `screen.colorDepth` bits
- Pixel Depth: `screen.pixelDepth` bits
- Device Pixel Ratio: `window.devicePixelRatio`

**Viewport:**
- Viewport Size: `window.innerWidth × window.innerHeight`
- Outer Window: `window.outerWidth × window.outerHeight`

**Browser:**
- Browser Language: `navigator.language`
- All Languages: `navigator.languages.join(', ')`
- Cookies Enabled: `navigator.cookieEnabled` → Yes/No badge
- Online Status: `navigator.onLine` → badge
- Platform: `navigator.platform`
- Hardware Concurrency (CPU threads): `navigator.hardwareConcurrency`
- Max Touch Points: `navigator.maxTouchPoints`
- Do Not Track: `navigator.doNotTrack` → on/off/unset

## Core Logic
All values read synchronously from browser APIs on component mount and on window resize
event. Use `useEffect` with a resize listener to update viewport values dynamically.

## TypeScript Interfaces
```ts
interface BrowserInfo {
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  outerWidth: number;
  outerHeight: number;
  language: string;
  languages: string[];
  cookiesEnabled: boolean;
  onlineStatus: boolean;
  platform: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  doNotTrack: string | null;
}
```

## SEO Keywords
- "check my screen resolution online"
- "what is my viewport size"
- "browser fingerprint info checker"
- "browser information tool"
- "device pixel ratio checker"

## Content Outline
**Intro:** What browser environment data is; use cases (responsive design debugging, QA).
**Steps:** Open page → all values load instantly → resize window to see viewport update.
**Why:** All client-side; updates live on resize; shows full info other tools skip.
**FAQs:** What is device pixel ratio, what is viewport vs screen resolution,
what is hardware concurrency, does this tool track me.
**Related:** user-agent-parser, what-is-my-ip, internet-speed-test
