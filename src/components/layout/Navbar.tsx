// src/components/layout/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/constants/site';
import { Search, Menu, X, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync navbar search input with URL search params (e.g. if arriving from a direct search link)
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // If we are already on the homepage, we can live update the URL search param
    if (pathname === '/') {
      const params = new URLSearchParams(window.location.search);
      if (val) {
        params.set('search', val);
      } else {
        params.delete('search');
      }
      router.replace(`/?${params.toString()}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Wand2 size={20} className="animate-pulse-once" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:opacity-90">
            {siteConfig.name}
          </span>
        </Link>

        {/* Global Search Bar (Medium screen & up) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search 200+ free tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
            />
          </div>
        </form>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-text-secondary hover:text-accent transition-colors duration-200",
                pathname === link.href && "text-accent font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Search Trigger Button (Redirects to input or focuses) */}
          <form onSubmit={handleSearchSubmit} className="relative md:hidden w-40 sm:w-48">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-8 pl-8 pr-3 rounded-full border border-border bg-surface/50 text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all duration-200"
              />
            </div>
          </form>

          {/* Hamburger menu trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:bg-muted text-text-primary transition-colors duration-200"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-xl animate-fade-in">
          <nav className="flex flex-col p-4 gap-3">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-muted hover:text-accent transition-all duration-200",
                  pathname === link.href && "bg-accent/10 text-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg">
              <span className="text-sm font-medium text-text-secondary">Theme</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
