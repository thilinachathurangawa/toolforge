import React from 'react';
import type { Metadata } from 'next';
import { TOOLS } from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';
import { ToolCard } from '@/components/shared/ToolCard';
import { AdBanner } from '@/components/ads';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export const metadata: Metadata = {
  title: 'All Tools',
  description: `Browse all free online tools on ${siteConfig.name}. Image, text, developer, and security utilities — 100% browser-based.`,
  alternates: { canonical: '/tools' },
};

export default function ToolsIndexPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'All Tools' }]} className="mb-6" />

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          All Tools
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 max-w-2xl">
          {TOOLS.length} free utilities — private, fast, and no sign-up required.
        </p>
      </header>

      <AdBanner position="top" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      <AdBanner position="bottom" />
    </div>
  );
}
