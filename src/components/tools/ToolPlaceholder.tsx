'use client';

import React from 'react';
import { Tool } from '@/lib/constants/tools';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { Wrench } from 'lucide-react';

interface ToolPlaceholderProps {
  tool: Tool;
}

/**
 * Shown on tool pages until the Phase 2 tool UI is implemented.
 */
export function ToolPlaceholder({ tool }: ToolPlaceholderProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/20">
          <DynamicIcon name={tool.icon} size={28} />
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-3">
        <Wrench size={12} />
        Coming in Phase 2
      </div>
      <h2 className="font-display text-lg font-bold text-text-primary mb-2">
        {tool.name} is on the way
      </h2>
      <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
        The interactive {tool.name.toLowerCase()} UI is being built. This page is ready for SEO,
        ads, and navigation — check back soon for the full browser-based tool.
      </p>
    </div>
  );
}
