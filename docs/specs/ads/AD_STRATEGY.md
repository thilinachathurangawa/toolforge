# SPEC: Ad Revenue Strategy
**File:** `docs/specs/ads/AD_STRATEGY.md`  
**Status:** Active  
**Version:** 1.0

---

## 1. Revenue Goal

| Timeline | Monthly Revenue Target |
|---|---|
| Month 1–2 | $0–$20 (building traffic) |
| Month 3–4 | $20–$100 (Adsterra live) |
| Month 6 | $100–$300 (AdSense approved) |
| Month 12 | $500–$1,500 (Ezoic) |
| Month 18+ | $1,500+ (Raptive) |

---

## 2. Ad Network Progression

### Stage 1: Adsterra (Launch immediately)
- No minimum traffic requirement
- Apply as soon as site is live
- CPM: $0.50–$3.00
- Ad formats: Banner, Popunder, Native

### Stage 2: Google AdSense (Month 3–4)
- Requirements: Original content, good UX, some traffic
- CPM: $1.00–$5.00 (higher for dev/tech audience)
- CRITICAL: Must have GA4 set up first
- Must NOT use popunder ads when applying

### Stage 3: Media.net (alongside AdSense)
- Yahoo/Bing ad network
- Good for English-speaking traffic
- CPM: $1.00–$4.00

### Stage 4: Ezoic (Month 6+)
- Requires 10,000 sessions/month
- Uses AI to optimize ad placement
- CPM: $3.00–$8.00
- Replaces Adsterra when approved

### Stage 5: Raptive/AdThrive (Month 12–18+)
- Requires 100,000 pageviews/month
- Premium network, highest CPM
- CPM: $8.00–$15.00+

---

## 3. Ad Unit Specifications

### AdBanner (Top / Bottom)
```
Desktop: 728x90 (Leaderboard)
Mobile:  320x50 (Mobile Banner)
Placement: Top of page content, bottom of page
```

### AdSidebar
```
Desktop only (hidden on mobile)
Sizes: 300x250 (Medium Rectangle) + 300x600 (Half Page)
Placement: Right sidebar, sticky on scroll
```

### AdInArticle
```
Desktop: 468x60 or 728x90
Mobile:  320x50 or 300x250
Placement: Between tool input and tool output
```

### AdNative (Phase 4)
```
Matches site content style
Placement: Below related tools section
```

---

## 4. Ad Component Implementation

### AdBanner Component
```tsx
// src/components/ads/AdBanner.tsx
// Props: position ('top' | 'bottom'), className
// Renders different sizes based on viewport
// Uses 'use client' directive
// Lazy loads ad script
// Shows placeholder skeleton while loading
```

### AdSidebar Component
```tsx
// src/components/ads/AdSidebar.tsx
// Desktop only (md:block hidden)
// Sticky positioning
// Two ad units stacked
```

### AdInArticle Component
```tsx
// src/components/ads/AdInArticle.tsx
// Placed between tool UI sections
// Labeled "Advertisement" for compliance
```

---

## 5. Ad Compliance Rules

- [ ] Every ad unit labeled "Advertisement" or "Sponsored"
- [ ] No ads that auto-play sound
- [ ] No ads covering main content
- [ ] Ads don't interfere with tool functionality
- [ ] Mobile ads don't block scroll
- [ ] AdSense policy: max 3 content ads per page
- [ ] Never click your own ads (AdSense ban risk)

---

## 6. Ad Layout Per Page (Desktop)

```
┌──────────────────────────────────────────────┐
│  NAVBAR                                       │
├──────────────────────────────────────────────┤
│  [AD BANNER TOP - 728x90]                     │
├─────────────────────────────┬────────────────┤
│  Breadcrumb                 │                │
│  H1 Title                   │  [AD SIDEBAR] │
│  Description                │  300x250      │
│                             │               │
│  [TOOL INPUT UI]            │  [AD SIDEBAR] │
│                             │  300x600      │
│  [AD IN-ARTICLE]            │               │
│                             │  Related      │
│  [TOOL OUTPUT/RESULTS]      │  Tools List   │
│                             │               │
│  How to Use (H2)            │               │
│  About This Tool (H2)       │               │
├─────────────────────────────┴────────────────┤
│  [AD BANNER BOTTOM - 728x90]                  │
├──────────────────────────────────────────────┤
│  FOOTER                                       │
└──────────────────────────────────────────────┘
```

---

## 7. Revenue Tracking

- GA4 events for ad impressions and interactions
- Monthly revenue review per network
- A/B test ad placements quarterly
- Track RPM (Revenue per 1000 pageviews) per tool page
