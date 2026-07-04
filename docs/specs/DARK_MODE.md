# SPEC: Dark Mode Theme Toggle
**File:** `docs/specs/DARK_MODE.md`  
**Status:** Draft  
**Version:** 1.0  
**Last Updated:** 2026-07-05

---

## 1. Feature Overview

The **Dark Mode** feature enables users to switch between light and dark color themes based on their preference. This improves accessibility, reduces eye strain in low-light environments, and provides a modern user experience that aligns with current design trends.

### Core Value Propositions:
1. **User Preference**: Users can choose their preferred theme (light/dark/system)
2. **System Awareness**: Respects user's OS-level theme preference by default
3. **Persistent Storage**: Theme preference is saved in localStorage and persists across sessions
4. **Smooth Transitions**: Theme changes animate smoothly without jarring transitions
5. **No Flash**: Prevents flash of incorrect theme on page load

---

## 2. Theme Options

### A. Theme Modes
- **Light Mode**: Default light theme with white backgrounds and dark text
- **Dark Mode**: Dark theme with dark backgrounds and light text
- **System Mode**: Automatically follows user's OS theme preference

### B. Default Behavior
- First-time visitors: Default to system preference
- If system preference unavailable: Default to light mode
- Returning visitors: Use saved preference from localStorage

---

## 3. Visual Design & UI/UX

### A. Theme Toggle Button
- **Icon**: 
  - Light mode: Lucide `Moon` icon (click to switch to dark)
  - Dark mode: Lucide `Sun` icon (click to switch to light)
  - System mode: Lucide `Monitor` icon (click to cycle to light)
- **Placement**: 
  - Navbar: Right side, before/about the "About" link
  - Mobile: In the mobile menu
- **Style**: 
  - Light mode: `bg-white border border-gray-200 hover:bg-gray-50 text-gray-700`
  - Dark mode: `bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200`
  - Rounded corners (md), subtle shadow, smooth transitions
  - Icon-only on mobile, icon + label on desktop (optional)
- **Size**: 40x40px (mobile), 44x44px (desktop)
- **Animation**: Icon rotation/scale on click (200ms duration)

### B. Theme Transition
- **Duration**: 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Properties**: Background color, text color, border color, shadow
- **Implementation**: CSS transition on `color` and `background-color` properties
- **No Flash**: Theme class applied to `<html>` element before render to prevent flash

### C. Theme Indicator (Optional Enhancement)
- Small tooltip or label showing current theme on hover
- "Switch to dark mode" / "Switch to light mode" aria-label
- Screen reader announcement when theme changes

---

## 4. Technical Implementation

### A. Theme Provider Structure

```
src/components/
├── layout/
│   ├── ThemeProvider.tsx       ← Theme context and provider
│   └── ThemeToggle.tsx         ← Toggle button component
```

### B. ThemeProvider Component

```typescript
// src/components/layout/ThemeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'system';
    setThemeState(initialTheme);
    setMounted(true);
  }, []);

  // Update actual theme based on theme preference and system preference
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    let resolvedTheme: 'light' | 'dark';

    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolvedTheme = theme;
    }

    root.classList.add(resolvedTheme);
    setActualTheme(resolvedTheme);
  }, [theme, mounted]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
      setActualTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### C. ThemeToggle Component

```typescript
// src/components/layout/ThemeToggle.tsx
'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />;
    }
    return actualTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
  };

  const getAriaLabel = () => {
    if (theme === 'system') {
      return 'Currently using system theme. Click to switch to light mode';
    }
    return actualTheme === 'light' 
      ? 'Currently in light mode. Click to switch to dark mode'
      : 'Currently in dark mode. Click to switch to system mode';
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
      className={cn(
        'relative inline-flex items-center justify-center rounded-md border transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        actualTheme === 'light'
          ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
          : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 shadow-sm'
      )}
      style={{ width: '40px', height: '40px' }}
    >
      {getIcon()}
    </button>
  );
}
```

### D. Tailwind Configuration

Update `tailwind.config.ts` to enable dark mode:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
};
```

### E. CSS Variables for Theme Colors

Update `src/styles/globals.css` with theme-aware CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    /* Dark mode colors */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
                color 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}
```

---

## 5. Integration Points

### A. Root Layout Integration
**File:** `src/app/layout.tsx`

Wrap the entire application with ThemeProvider:

```tsx
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning // Prevents hydration mismatch for theme
    >
      <body>
        <ThemeProvider>
          {/* Existing content */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### B. Navbar Integration
**File:** `src/components/layout/Navbar.tsx`

Add ThemeToggle button to navbar:

```tsx
import { ThemeToggle } from './ThemeToggle';

// In navbar component, add ThemeToggle button
<ThemeToggle />
```

### C. Mobile Menu Integration
**File:** `src/components/layout/Navbar.tsx`

Add ThemeToggle to mobile menu:

```tsx
// In mobile menu dropdown
<div className="flex items-center justify-between">
  <span>Theme</span>
  <ThemeToggle />
</div>
```

---

## 6. Color Scheme Updates

### A. Existing Components Requiring Dark Mode Styles

The following components need dark mode variants:

1. **Navbar** (`src/components/layout/Navbar.tsx`)
   - Background: `bg-background/80 backdrop-blur-md`
   - Border: `border-border`
   - Text: `text-foreground`
   - Links: `text-foreground hover:text-primary`

2. **Footer** (`src/components/layout/Footer.tsx`)
   - Background: `bg-background`
   - Border: `border-border`
   - Text: `text-muted-foreground`

3. **Cards** (various card components)
   - Background: `bg-card`
   - Border: `border-border`
   - Text: `text-card-foreground`

4. **Buttons** (various button components)
   - Primary: `bg-primary text-primary-foreground`
   - Secondary: `bg-secondary text-secondary-foreground`
   - Outline: `border-border hover:bg-accent`

5. **Inputs** (search bars, form inputs)
   - Background: `bg-background`
   - Border: `border-input`
   - Text: `text-foreground`
   - Placeholder: `text-muted-foreground`

### B. Tailwind Class Updates

Replace hardcoded colors with semantic CSS variables:

- `bg-white` → `bg-background`
- `bg-gray-50` → `bg-secondary` or `bg-accent`
- `text-gray-900` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `border-gray-200` → `border-border`
- `hover:bg-gray-100` → `hover:bg-accent`

---

## 7. Accessibility Requirements

- **Keyboard Navigation**: Theme toggle must be fully keyboard accessible
- **ARIA Labels**: 
  - Toggle button: Dynamic aria-label based on current theme
  - Announces theme change to screen readers
- **Focus Management**: Visible focus ring on toggle button
- **Color Contrast**: Meet WCAG AA standards (4.5:1 for text, 3:1 for UI components)
- **Reduced Motion**: Respect `prefers-reduced-motion` for theme transitions
- **No Flash**: Theme applied before render to prevent flash of incorrect theme
- **System Preference**: Respects user's OS-level theme preference by default

---

## 8. Performance Considerations

- **Client-Side Only**: Theme toggle is entirely client-side
- **LocalStorage**: Theme preference stored in localStorage (minimal overhead)
- **CSS Transitions**: CSS-based transitions (GPU accelerated)
- **No Layout Shift**: Toggle button has fixed dimensions
- **Minimal Bundle Impact**: Theme functionality adds < 3KB to bundle size
- **No External Dependencies**: Uses only Lucide icons (already in project)

---

## 9. Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **CSS Variables**: Supported in all modern browsers
- **LocalStorage**: Supported in all modern browsers
- **matchMedia**: Supported in all modern browsers
- **Fallback**: Graceful degradation - if localStorage unavailable, defaults to system theme

---

## 10. Acceptance Criteria

- [ ] Theme toggle button appears in navbar
- [ ] Theme toggle button appears in mobile menu
- [ ] Clicking toggle cycles through light → dark → system themes
- [ ] Icon changes based on current theme (Moon/Sun/Monitor)
- [ ] Theme preference is saved to localStorage
- [ ] Theme preference persists across page refreshes
- [ ] Theme preference persists across browser sessions
- [ ] System mode respects OS-level theme preference
- [ ] System mode updates when OS theme changes
- [ ] Theme transition is smooth (300ms duration)
- [ ] No flash of incorrect theme on page load
- [ ] All components have proper dark mode styling
- [ ] Color contrast meets WCAG AA standards in both themes
- [ ] Component is fully keyboard accessible
- [ ] Screen readers announce theme changes
- [ ] Theme toggle works on mobile (375px), tablet (768px), and desktop (1280px+)
- [ ] TypeScript compilation passes with zero errors
- [ ] No console errors related to theme functionality
- [ ] Lighthouse score remains 90+ Performance after implementation

---

## 11. Implementation Order

### Phase 1: Core Infrastructure
1. Update `tailwind.config.ts` to enable class-based dark mode
2. Create CSS variables for light and dark themes in `globals.css`
3. Create `ThemeProvider.tsx` component with theme context
4. Create `ThemeToggle.tsx` component with toggle button

### Phase 2: Integration
5. Wrap application with ThemeProvider in `layout.tsx`
6. Add ThemeToggle to Navbar component
7. Add ThemeToggle to mobile menu in Navbar
8. Test theme toggle functionality

### Phase 3: Component Styling Updates
9. Update Navbar component with dark mode classes
10. Update Footer component with dark mode classes
11. Update card components with dark mode classes
12. Update button components with dark mode classes
13. Update input/form components with dark mode classes
14. Update any other hardcoded color references

### Phase 4: Testing & Polish
15. Test theme persistence across page refreshes
16. Test system mode with OS theme changes
17. Accessibility audit (keyboard navigation, screen readers)
18. Cross-browser testing
19. Mobile responsive testing
20. Performance verification

---

## 12. Future Enhancements (Out of Scope)

- Custom theme colors (beyond light/dark)
- Theme presets (e.g., "blue dark", "purple dark")
- Automatic theme switching based on time of day
- Theme transition animations (more elaborate than simple fade)
- Per-tool theme preferences
- Theme sync across devices (requires backend)
- High contrast mode for accessibility
- Color blind friendly themes
