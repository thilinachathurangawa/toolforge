# SPEC: Social Media Sharing Functionality
**File:** `docs/specs/SHARE_FUNCTIONALITY.md`  
**Status:** Draft  
**Version:** 1.0  
**Last Updated:** 2026-07-05

---

## 1. Feature Overview

The **Social Media Sharing** feature enables users to easily share ToolForge's main page and individual tool pages across popular social media platforms. This increases organic reach, improves SEO through social signals, and drives referral traffic.

### Core Value Propositions:
1. **One-Click Sharing**: Users can share pages instantly to major social platforms without leaving the site
2. **Dual Placement**: Share buttons available on both the homepage and every individual tool page
3. **Rich Previews**: Optimized Open Graph metadata ensures attractive link previews when shared
4. **Copy Link**: Direct URL copying for platforms not supported via native sharing
5. **Mobile-Native**: Uses Web Share API on mobile devices for native sharing experience

---

## 2. Supported Platforms

### Primary Platforms (Native Sharing):
- **Twitter/X** - Share via `https://twitter.com/intent/tweet`
- **Facebook** - Share via `https://www.facebook.com/sharer/sharer.php`
- **LinkedIn** - Share via `https://www.linkedin.com/sharing/share-offsite`
- **WhatsApp** - Share via `https://wa.me/?text=`
- **Reddit** - Share via `https://www.reddit.com/submit`

### Secondary Platforms:
- **Copy Link** - Copy URL to clipboard with fallback for unsupported platforms
- **Email** - `mailto:` link with pre-filled subject and body
- **Web Share API** - Native mobile sharing on iOS/Android (fallback to platform links)

---

## 3. Visual Design & UI/UX

### A. Share Button Component
- **Icon**: Lucide `Share2` icon
- **Placement**: 
  - Homepage: In the hero section, right-aligned near the search bar
  - Tool pages: In the PageHeader component, right-aligned
- **Style**: 
  - Light mode: `bg-white border border-gray-200 hover:bg-gray-50`
  - Dark mode: `bg-gray-800 border border-gray-700 hover:bg-gray-700`
  - Rounded corners, subtle shadow, smooth transitions
  - Label: "Share" text next to icon on desktop, icon-only on mobile

### B. Share Modal/Popover
- **Trigger**: Clicking the share button opens a popover/dropdown
- **Layout**: Grid of platform buttons (3 columns on desktop, 2 on mobile)
- **Platform Buttons**:
  - Each button has platform-specific icon and color
  - Hover effects: scale up slightly, increase brightness
  - Twitter: Blue (`#1DA1F2`)
  - Facebook: Blue (`#1877F2`)
  - LinkedIn: Blue (`#0A66C2`)
  - WhatsApp: Green (`#25D366`)
  - Reddit: Orange (`#FF4500`)
  - Copy Link: Gray (`#6B7280`)
- **Close Behavior**: Click outside or ESC key closes the popover
- **Animation**: Fade in with scale effect (200ms duration)

### C. Copy Link Feedback
- When user clicks "Copy Link":
  - Button text changes to "Copied!" temporarily (2 seconds)
  - Toast notification appears: "Link copied to clipboard"
  - Icon changes from `Copy` to `Check` temporarily

---

## 4. Technical Implementation

### A. Component Structure

```
src/components/shared/
├── ShareButton.tsx          ← Main share button with popover
├── ShareModal.tsx           ← Platform grid modal
└── ShareIcons.tsx           ← Platform-specific icon components
```

### B. ShareButton Component Interface

```typescript
interface ShareButtonProps {
  url: string;              // Current page URL
  title: string;            // Page title for share text
  description?: string;      // Optional description for some platforms
  className?: string;        // Optional custom styling
}
```

### C. Platform Share URLs

```typescript
const shareUrls = {
  twitter: (url: string, title: string) => 
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  
  facebook: (url: string) => 
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  
  linkedin: (url: string, title: string) => 
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  
  whatsapp: (url: string, title: string) => 
    `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  
  reddit: (url: string, title: string) => 
    `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  
  email: (url: string, title: string) => 
    `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this tool: ${url}`)}`
};
```

### D. Web Share API Implementation

```typescript
const handleNativeShare = async (url: string, title: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        url: url,
      });
      return true;
    } catch (err) {
      // User cancelled or error - fallback to platform links
      return false;
    }
  }
  return false;
};
```

### E. Copy to Clipboard Implementation

```typescript
const copyToClipboard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};
```

---

## 5. Integration Points

### A. Homepage Integration
**File:** `src/app/HomePageClient.tsx`

```tsx
// In hero section, near search bar
<ShareButton 
  url="https://www.toolforge.website"
  title="ToolForge — Free Online Tools Platform"
  description="Discover 50+ free browser-based tools for image editing, text formatting, and more"
/>
```

### B. Tool Page Integration
**File:** `src/components/shared/PageHeader.tsx`

```tsx
// In PageHeader component
<ShareButton 
  url={`https://www.toolforge.website/tools/${tool.slug}`}
  title={tool.name}
  description={tool.shortDescription}
/>
```

### C. Dynamic URL Generation
- Use `useRouter` hook to get current URL
- Fallback to `NEXT_PUBLIC_SITE_URL` environment variable
- Ensure canonical URLs are used (no query parameters in share URLs)

---

## 6. Open Graph Metadata Requirements

### A. Homepage OG Tags
**File:** `src/app/page.tsx` (metadata export)

```typescript
export const metadata = {
  openGraph: {
    title: 'ToolForge — Free Online Tools Platform',
    description: 'Discover 50+ free browser-based tools for image editing, text formatting, security generation, and developer utilities. 100% private.',
    url: 'https://www.toolforge.website',
    siteName: 'ToolForge',
    images: [
      {
        url: 'https://www.toolforge.website/og-images/homepage.png',
        width: 1200,
        height: 630,
        alt: 'ToolForge Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ToolForge — Free Online Tools Platform',
    description: 'Discover 50+ free browser-based tools',
    images: ['https://www.toolforge.website/og-images/homepage.png'],
  },
};
```

### B. Tool Page OG Tags
**File:** `src/app/tools/[slug]/page.tsx` (generateMetadata function)

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const tool = getTool(params.slug);
  return {
    openGraph: {
      title: `${tool.name} — Free Online Tool | ToolForge`,
      description: tool.description,
      url: `https://www.toolforge.website/tools/${tool.slug}`,
      siteName: 'ToolForge',
      images: [
        {
          url: `https://www.toolforge.website/og-images/${tool.slug}.png`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} — Free Online Tool`,
      description: tool.shortDescription,
      images: [`https://www.toolforge.website/og-images/${tool.slug}.png`],
    },
  };
}
```

### C. OG Image Requirements
- **Dimensions**: 1200x630 pixels (1.91:1 aspect ratio)
- **Format**: PNG (recommended) or JPG
- **File Size**: Under 5MB
- **Content**: 
  - ToolForge logo/branding
  - Tool name (for tool pages)
  - Category icon or relevant visual
  - Clean, professional design
- **Location**: `public/og-images/` directory
- **Naming**: `{slug}.png` for tools, `homepage.png` for main page

---

## 7. Analytics & Tracking

### A. Event Tracking (Google Analytics 4)
Track share interactions to measure engagement:

```typescript
// Track share button click
gtag('event', 'share_button_click', {
  page_url: window.location.href,
  page_title: document.title,
});

// Track platform-specific shares
gtag('event', 'share_platform', {
  platform: 'twitter', // or 'facebook', 'linkedin', etc.
  page_url: window.location.href,
  page_title: document.title,
});

// Track copy link
gtag('event', 'share_copy_link', {
  page_url: window.location.href,
  page_title: document.title,
});
```

### B. UTM Parameters (Optional)
Add UTM parameters to shared URLs for tracking:

```typescript
const addUtmParams = (url: string, platform: string) => {
  const urlObj = new URL(url);
  urlObj.searchParams.set('utm_source', platform);
  urlObj.searchParams.set('utm_medium', 'social');
  urlObj.searchParams.set('utm_campaign', 'toolforge_share');
  return urlObj.toString();
};
```

---

## 8. Accessibility Requirements

- **Keyboard Navigation**: Share button and modal must be fully keyboard accessible
- **ARIA Labels**: 
  - Share button: `aria-label="Share this page"`
  - Platform buttons: `aria-label="Share on Twitter"`, etc.
- **Focus Management**: When modal opens, focus moves to first platform button
- **Screen Reader Support**: Platform names announced when buttons are focused
- **Color Contrast**: Meet WCAG AA standards (4.5:1 for text, 3:1 for icons)
- **Reduced Motion**: Respect `prefers-reduced-motion` for animations

---

## 9. Performance Considerations

- **Lazy Loading**: Share icons load only when share button is clicked
- **Code Splitting**: Share component should be in its own chunk
- **No External Scripts**: Use Lucide icons (already in project), no third-party share widgets
- **Minimal Bundle Impact**: Share functionality should add < 5KB to bundle size
- **Client-Side Only**: Share component is entirely client-side (no SSR needed)

---

## 10. Acceptance Criteria

- [ ] Share button appears on homepage hero section
- [ ] Share button appears on every tool page in PageHeader
- [ ] Clicking share button opens platform selection modal
- [ ] All 6 platform buttons (Twitter, Facebook, LinkedIn, WhatsApp, Reddit, Copy Link) are present
- [ ] Clicking platform buttons opens correct share intent in new tab
- [ ] Copy Link functionality copies URL to clipboard and shows feedback
- [ ] Web Share API is used on supported mobile devices
- [ ] Open Graph metadata is correctly set for homepage
- [ ] Open Graph metadata is correctly set for tool pages
- [ ] OG images exist for homepage and all tools
- [ ] Share events are tracked in Google Analytics
- [ ] Component is fully keyboard accessible
- [ ] Component passes WCAG AA contrast requirements
- [ ] No layout shift when share modal opens
- [ ] Share functionality works on mobile (375px), tablet (768px), and desktop (1280px+)
- [ ] TypeScript compilation passes with zero errors
- [ ] Lighthouse score remains 90+ Performance after implementation

---

## 11. Implementation Order

1. **Phase 1: Core Component**
   - Create `ShareButton.tsx` component
   - Create `ShareModal.tsx` component
   - Implement platform share URLs
   - Add copy to clipboard functionality
   - Add Web Share API support

2. **Phase 2: Integration**
   - Integrate ShareButton into homepage
   - Integrate ShareButton into PageHeader component
   - Test on both homepage and tool pages

3. **Phase 3: Metadata & Images**
   - Verify/update homepage OG metadata
   - Verify/update tool page OG metadata
   - Create OG images for homepage
   - Create OG images for all tools (or generate dynamically)

4. **Phase 4: Analytics & Polish**
   - Add GA4 event tracking
   - Add UTM parameter support (optional)
   - Accessibility audit and fixes
   - Cross-browser testing
   - Performance optimization

---

## 12. Future Enhancements (Out of Scope)

- QR code generation for easy mobile sharing
- Custom share text editing before sharing
- Share history/frequent platforms
- Social media preview testing tool
- A/B testing different share button placements
- Integration with more platforms (Pinterest, Telegram, etc.)
