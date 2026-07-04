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
