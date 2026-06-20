import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  // Generate JSON-LD schema for breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: typeof window !== 'undefined' ? window.location.origin : 'https://www.toolforge.website',
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: item.href ? (typeof window !== 'undefined' ? `${window.location.origin}${item.href}` : `https://www.toolforge.website${item.href}`) : undefined,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={cn('flex items-center flex-wrap gap-1 text-xs text-text-secondary', className)}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-accent transition-colors"
        >
          <Home size={14} />
          <span className="sr-only sm:not-sr-only">Home</span>
        </Link>
        {items.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" aria-hidden />
            {item.href ? (
              <Link href={item.href} className="hover:text-accent transition-colors truncate max-w-[200px]">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary font-medium truncate max-w-[240px]" aria-current="page">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}
