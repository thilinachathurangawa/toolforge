# SPEC: Homepage (Landing Page)
**File:** `docs/specs/HOMEPAGE.md`  
**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026

---

## 1. Feature Overview

The **Homepage** is the primary landing page of **ToolForge**. It serves as a highly performant, visual directory of all available browser-based tools. It must drive user engagement, facilitate immediate tool search/filtering, and optimize organic SEO indexing.

### Core Value Propositions:
1. **Directory of Tools**: Showcase all registered tools from `src/lib/constants/tools.ts` with badges (Popular, New), categories, and short descriptions.
2. **Instant Search**: Provide an interactive live search bar allowing users to find tools by name, description, tags, or keywords.
3. **Seamless Category Filtering**: Smooth tabs allowing dynamic client-side filtering without page reloads.
4. **Ad Placement Integration**: Standardized slots for display advertising that prevent Cumulative Layout Shift (CLS).
5. **Private & Fast**: Fully static build (SSG) loading in < 2 seconds, emphasizing the 100% browser-based nature of the app.

---

## 2. Visual Design & Aesthetics

The homepage must have a premium, modern, state-of-the-art visual style.

### A. Ambient Background Grid
- A subtle, semi-transparent layout grid overlaid with two soft, blurred colored glowing blobs (`accent` color, e.g., indigo/violet) in the upper right and lower left.
- Tailored to transition seamlessly in dark mode.

### B. Glassmorphism Hero Section
- Bold, high-impact headline using the **Syne** display font.
- Dynamic gradient text for the brand name (e.g., `bg-gradient-to-r from-accent to-violet-500 bg-clip-text text-transparent`).
- Prominent search bar in the center of the hero section featuring a subtle glass background, ring active-states, and dynamic search icon.

### C. Responsive Categories Tabs
- Horizontal sliding tabs allowing navigation across categories (`All Tools`, `Image Tools`, `Developer Tools`, `Text Tools`, `Generators`, `Security`).
- Sleek hover micro-animations (e.g., sliding highlight underline or pill shape transition on active tab).

### D. Interactive Tool Grid & Cards
- Grid adjusts dynamically: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
- **ToolCard** specifications:
  - White surface background in light mode (`bg-card`), sleek dark border with glass-like effect in dark mode.
  - Custom category gradient behind the icon (e.g., light-purple for image tools, light-blue for dev tools).
  - Subtle shadows (`shadow-sm`) transitioning to lift shadow (`hover:shadow-md hover:-translate-y-1 hover:border-accent/40`) with `duration-300 transition-all`.
  - Display "New" badge (violet gradient) or "Popular" badge (amber/orange gradient) when flagged.

### E. Trust / Value Banner
- Centered grid with four value propositions:
  1. **50+ Tools**: Rich catalog of client utilities.
  2. **100% Client-Side**: No data leaves your machine.
  3. **No Registration**: Immediate access, no account required.
  4. **Super Fast**: Light, optimized bundle size.

---

## 3. SEO Implementation Requirements

The homepage is the single most important page for search engines. It must implement these guidelines strictly:
- **Title Tag**: `ToolForge — Free Online Tools | Fast & Private`
- **Meta Description**: `Discover ToolForge's suite of 50+ free browser-based tools for image editing, text formatting, security generation, and developer utilities. 100% private.`
- **Heading Hierarchy**:
  - `<h1>`: The main hero title. Only one allowed on the page.
  - `<h2>`: The tool directory title.
  - `<h3>`: Used for card headers.
- **JSON-LD Schema**:
  - `WebSite` schema mapping properties: `name`, `url`, `potentialAction` for search queries.
  - `WebApplication` schema for registered premium tools linked as site sections.
- **Dynamic Links**: Standard `<a>` HTML anchor elements must wrap cards to ensure search spiders can discover all tool routes easily.

---

## 4. Ad Placement Slots (Ad Strategy)

To maximize revenue while maintaining excellent layout stability and user experience:
1. **Slot 1 (Hero Bottom - Leaderboard)**:
   - Placement: Immediately below the hero section and value stats bar.
   - Layout: Standard size `728x90` on desktop, auto-adjusts to `320x50` on mobile.
2. **Slot 2 (Content Bottom - Leaderboard)**:
   - Placement: Above the footer, below the main tool grid.
   - Layout: `728x90` / `320x50` mobile unit.
3. **Cumulative Layout Shift (CLS) Safeguards**:
   - Ad containers **MUST** have pre-defined heights (`min-h-[90px]` for leaderboard on desktop, `min-h-[50px]` on mobile).
   - Render a custom styled dashed placeholder with "Advertisement" metadata inside before scripts fetch actual display ads.

---

## 5. Client-Side Interactions

- **Live Query Filter**: As the user types into the search box, the tool list is filtered instantly by matching against:
  - Tool `name`
  - Tool `shortDescription`
  - Tool `tags`
  - Tool `keywords`
- **Active Category Filter**: Selecting a category filter dynamically filters matching cards. It should work in tandem with the live query search box.
- **Animation States**: Grid cards fade and translate up slightly on render (`animate-slide-up`).

---

## 6. Acceptance Criteria

- [ ] Homepage fully loads with styling in under 2 seconds.
- [ ] Responsive layouts scale correctly on mobile (375px), tablet (768px), and desktop (1280px+).
- [ ] No layouts shift occurs due to ad placement placeholders.
- [ ] Dynamic live search updates the grid in < 50ms without visible lag.
- [ ] Category tabs click filters matching tools.
- [ ] Primary SEO H1, schema JSON-LD, and meta tags are loaded.
- [ ] Lighthouse scores achieve 90+ Performance and 100 SEO.
- [ ] HTML code builds and compiles with zero TypeScript errors.
