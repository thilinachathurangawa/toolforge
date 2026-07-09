// src/app/page.tsx
import React, { Suspense } from 'react';
import { HomePageClient } from './HomePageClient';
import { siteConfig } from '@/lib/constants/site';
import { TOOLS } from '@/lib/constants/tools';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const toolCount = TOOLS.length;
  const dynamicDescription = `ToolForge offers ${toolCount}+ free online tools for image editing, text processing, developer utilities, and more. All tools work 100% in your browser — no data leaves your device.`;

  return {
    title: 'ToolForge — Free Online Tools | Fast & Private',
    description: dynamicDescription,
    openGraph: {
      title: 'ToolForge — Free Online Tools Platform',
      description: dynamicDescription,
      url: siteConfig.url,
      siteName: 'ToolForge',
      locale: 'en_US',
      type: 'website',
      // og:image comes from the file convention (src/app/opengraph-image.tsx).
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ToolForge — Free Online Tools Platform',
      description: dynamicDescription,
    },
    alternates: {
      canonical: siteConfig.url,
    },
  };
}

const jsonLd = (toolCount: number) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: siteConfig.name,
      description: `ToolForge offers ${toolCount}+ free online tools for image editing, text processing, developer utilities, and more. All tools work 100% in your browser — no data leaves your device.`,
      url: siteConfig.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/tools?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      description: `ToolForge offers ${toolCount}+ free online tools for image editing, text processing, developer utilities, and more. All tools work 100% in your browser — no data leaves your device.`,
      logo: `${siteConfig.url}/icon.svg`,
    },
  ],
});

export default function HomePage() {
  const toolCount = TOOLS.length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(toolCount)) }}
      />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="h-8 w-48 mx-auto rounded-lg bg-muted animate-pulse" />
          </div>
        }
      >
        <HomePageClient />
      </Suspense>
    </>
  );
}
