// src/app/HomePageClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TOOLS, CATEGORIES, Tool } from '@/lib/constants/tools';
import { cn } from '@/lib/utils';
import { ToolCard } from '@/components/shared/ToolCard';
import { AdBanner } from '@/components/ads';
import { Search, Sparkles, Shield, Cpu, Zap, Mail, X } from 'lucide-react';

export function HomePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filteredTools, setFilteredTools] = useState<Tool[]>(TOOLS);

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);

    const category = searchParams.get('category') || 'all';
    setActiveCategory(category);
  }, [searchParams]);

  useEffect(() => {
    let result = TOOLS;

    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    }

    setFilteredTools(result);
  }, [searchQuery, activeCategory]);

  const clearSearch = () => {
    setSearchQuery('');
    updateQueryParams('', activeCategory);
  };

  const updateQueryParams = (searchVal: string, catVal: string) => {
    const params = new URLSearchParams();
    if (searchVal) params.set('search', searchVal);
    if (catVal && catVal !== 'all') params.set('category', catVal);
    router.replace(`/?${params.toString()}`);
  };

  const handleCategorySelect = (categoryVal: string) => {
    setActiveCategory(categoryVal);
    updateQueryParams(searchQuery, categoryVal);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateQueryParams(val, activeCategory);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-12 sm:gap-16">

      <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6 animate-slide-up">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent uppercase tracking-wider">
          <Sparkles size={13} className="fill-accent/20 animate-pulse" />
          Fast, Private & 100% Browser-Based
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-text-primary">
          Free Online Tools <br className="hidden sm:inline" />
          Without the{' '}
          <span className="bg-gradient-to-r from-accent via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            Data Uploads
          </span>
        </h1>

        <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
          ToolForge packs essential developer utilities, image optimization, and converters into one premium, clean platform. Zero signup. Zero tracking. Your files never leave your browser.
        </p>

        <div className="w-full max-w-xl mt-4 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-violet-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none" />
          <div className="relative flex items-center bg-card border border-border shadow-md rounded-2xl p-1.5 hover:border-accent/40 transition-all duration-300">
            <Search className="text-muted-foreground ml-3 shrink-0" size={20} />
            <input
              type="text"
              placeholder="What tool do you need? (e.g. compress image, generate qr, password)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-12 pl-3 pr-10 text-sm sm:text-base bg-transparent border-0 focus:outline-none focus:ring-0 text-text-primary"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-text-primary transition-colors"
                aria-label="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <AdBanner position="top" className="animate-fade-in relative z-10" />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-accent/20 transition-all duration-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Shield size={18} />
          </div>
          <h3 className="text-sm font-bold text-text-primary">100% Private</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Data is parsed fully client-side. No network queries carry your documents.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-accent/20 transition-all duration-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Zap size={18} />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Instant Execution</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Fast WASM & browser API compiler results are delivered in sub-seconds.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-accent/20 transition-all duration-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <Cpu size={18} />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Fully Static Page</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Requires zero accounts or complex setup blocks. Instant run on click.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-accent/20 transition-all duration-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Mail size={18} />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Free Request Setup</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Need a tool we don&apos;t have yet? Send a request and our AI builds it!
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6" id="tools-directory">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">
              All Available Tools
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Select a category or search dynamically to isolate tools.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none shrink-0 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => handleCategorySelect('all')}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border border-transparent",
                activeCategory === 'all'
                  ? 'bg-accent text-white shadow-sm shadow-accent/20'
                  : 'bg-muted hover:bg-muted/80 text-text-secondary hover:text-text-primary'
              )}
            >
              All Tools
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border border-transparent",
                  activeCategory === cat.value
                    ? 'bg-accent text-white shadow-sm shadow-accent/20'
                    : 'bg-muted hover:bg-muted/80 text-text-secondary hover:text-text-primary'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-card/50 max-w-lg mx-auto w-full animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
              <Search size={22} />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">No Tools Found</h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm mb-6">
              We couldn&apos;t find any tool matching &quot;{searchQuery}&quot; in our current registry.
            </p>

            <div className="p-4 rounded-xl bg-muted/60 border border-border/80 w-full flex items-center justify-between gap-3 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase text-accent tracking-wider block mb-0.5">Need a feature?</span>
                <span className="text-xs font-bold text-text-primary leading-none">Request this tool!</span>
              </div>
              <a
                href="mailto:support@toolforge.com?subject=Tool%20Request"
                className="px-3.5 py-1.5 rounded-lg bg-accent text-[11px] font-semibold text-white hover:bg-accent/90 transition-colors shadow-sm"
              >
                Submit Request
              </a>
            </div>
          </div>
        )}
      </section>

      <AdBanner position="bottom" className="border-t border-border/40 relative z-10" />

    </div>
  );
}
