# SPEC: Robots.txt Generator Tool
**File:** `docs/specs/tools/seo/ROBOTS_TXT_GENERATOR.md`
**Status:** Pending
**Slug:** `robots-txt-generator`
**Category:** seo

---

## SEO

- **Title:** `Robots.txt Generator — Create Robots.txt File Online Free | ToolForge`
**Description:** `Generate robots.txt files for your website instantly. Control crawler access, set sitemap location, and manage SEO indexing for free.`
- **Primary Keyword:** robots.txt generator
- **Secondary Keywords:** robots.txt creator, crawler control, SEO robots file, robots.txt builder

---

## Functional Requirements

- [ ] User-agent selector (Googlebot, Bingbot, *, custom)
- [ ] Allow/Disallow path input with wildcard support
- [ ] Add multiple rules per user-agent
- [ ] Crawl-delay input (seconds)
- [ ] Sitemap URL input
- [ ] Rule management:
  - [ ] Edit rule
  - [ ] Delete rule
  - [ ] Reorder rules
- [ ] Preset templates:
  - [ ] Allow all
  - [ ] Block all
  - [ ] Block specific folders
  - [ ] Block specific file types
  - [ ] WordPress default
- [ ] Live robots.txt preview
- [ ] Validation (check syntax)
- [ ] Download as robots.txt file
- [ ] Copy to clipboard
- [ ] Test with Google's robots.txt tester link
- [ ] Comments support (add # comments)

---

## Library

No external library needed — use template string generation

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Template: [Custom ▼]                    │
│  [Allow All] [Block All] [WordPress]     │
├─────────────────────────────────────────┤
│  User-Agent: [* ▼]  [+ Add User-Agent]   │
│                                         │
│  Rules for *:                            │
│  ┌─────────────────────────────────┐   │
│  │ ✓ Allow: /                     │   │
│  │   [Edit] [Delete] [Move Up]     │   │
│  ├─────────────────────────────────┤   │
│  │ ✓ Disallow: /admin/            │   │
│  │   [Edit] [Delete] [Move Down]   │   │
│  ├─────────────────────────────────┤   │
│  │ ✓ Disallow: /private/           │   │
│  │   [Edit] [Delete]               │   │
│  └─────────────────────────────────┘   │
│  [+ Add Rule]                          │
│                                         │
│  Crawl Delay: [1] seconds               │
│  Sitemap: [https://example.com/sitemap.xml]│
│                                         │
│  [Generate] [Clear]                      │
├─────────────────────────────────────────┤
│  robots.txt Preview:                     │
│  ┌─────────────────────────────────┐   │
│  │ User-agent: *                   │   │
│  │ Allow: /                        │   │
│  │ Disallow: /admin/               │   │
│  │ Disallow: /private/             │   │
│  │ Crawl-delay: 1                  │   │
│  │                                 │   │
│  │ Sitemap: https://example.com/...│   │
│  └─────────────────────────────────┘   │
│  ✓ Valid syntax                        │
│                                         │
│  [Download robots.txt] [Copy]           │
│  [Test with Google Tester]              │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
interface RobotsRule {
  id: string;
  type: 'allow' | 'disallow';
  path: string;
}

interface UserAgentConfig {
  userAgent: string;
  rules: RobotsRule[];
  crawlDelay?: number;
}

state: {
  userAgents: UserAgentConfig[];
  sitemapUrl: string;
  generatedRobotsTxt: string;
  template: 'custom' | 'allow-all' | 'block-all' | 'wordpress';
  isValid: boolean;
  errors: string[];
}
```

---

## Common User-Agents

- `*` - All crawlers
- `Googlebot` - Google
- `Bingbot` - Microsoft Bing
- `Slurp` - Yahoo
- `DuckDuckBot` - DuckDuckGo
- `Baiduspider` - Baidu

---

## Template Examples

**Allow All:**
```
User-agent: *
Allow: /
```

**Block All:**
```
User-agent: *
Disallow: /
```

**WordPress:**
```
User-agent: *
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-content/plugins/
Allow: /wp-content/uploads/
```

---

## How to Use Content (for SEO section)

1. Select a template or start from scratch
2. Add user-agents (use * for all crawlers)
3. Add allow/disallow rules for each user-agent
4. Use wildcards (*) to match patterns (e.g., /private/*)
5. Set crawl-delay if needed (in seconds)
6. Add your sitemap URL
7. Review the live robots.txt preview
8. Validate syntax and check for errors
9. Download the robots.txt file or copy to clipboard
10. Upload to your website's root directory

---

## About Content (for SEO section)

Our free robots.txt generator creates valid robots.txt files to control search engine crawler access. Use presets or custom rules to allow or disallow specific paths. Includes syntax validation, sitemap integration, and templates for common setups like WordPress. All generation happens in your browser with no data sent to any server.
