// src/components/shared/ToolCard.tsx
import React from 'react';
import Link from 'next/link';
import { Tool } from '@/lib/constants/tools';
import { DynamicIcon } from './DynamicIcon';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  // Category-specific color mapping for custom gradient backdrops behind the icons
  const categoryThemes: Record<string, { bg: string; icon: string; border: string }> = {
    image: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
    },
    text: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
    },
    developer: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
    },
    converter: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/20',
    },
    generator: {
      bg: 'bg-pink-500/10 dark:bg-pink-500/20',
      icon: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/20',
    },
    security: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20',
    },
  };

  const theme = categoryThemes[tool.category] || {
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    icon: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  };

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col justify-between h-full bg-card rounded-xl border border-border p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-accent/40 overflow-hidden"
    >
      {/* Dynamic Background Mesh Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        {/* Card Top: Category Icon & Badges */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105", theme.bg, theme.border)}>
            <DynamicIcon name={tool.icon} size={20} className={theme.icon} />
          </div>

          <div className="flex gap-1.5">
            {tool.isPopular && (
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Flame size={10} className="fill-amber-600/30" />
                Popular
              </span>
            )}
            {tool.isNew && (
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/25">
                <Sparkles size={10} className="fill-accent/30" />
                New
              </span>
            )}
          </div>
        </div>

        {/* Card Middle: Content */}
        <div className="relative z-10">
          <h3 className="font-display text-base font-bold text-text-primary leading-tight tracking-tight mb-2 group-hover:text-accent transition-colors duration-200">
            {tool.name}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      {/* Card Bottom: Call to Action Arrow */}
      <div className="flex items-center justify-end mt-4 pt-4 border-t border-border/40 relative z-10">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent uppercase tracking-wider group-hover:gap-1.5 transition-all duration-200">
          Open Tool
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
