import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CATEGORIES,
  getToolsByCategory,
  type ToolCategory,
} from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';
import { buildCategoryJsonLd } from '@/lib/seo/json-ld';
import { getCategoryContent } from '@/lib/content/category-content';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ToolCard } from '@/components/shared/ToolCard';
import { DynamicIcon } from '@/components/shared/DynamicIcon';

interface CategoryPageParams {
  params: { slug: string };
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.value }));
}

export async function generateMetadata({ params }: CategoryPageParams): Promise<Metadata> {
  const { slug } = params;
  const category = CATEGORIES.find((c) => c.value === slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const canonical = `${siteConfig.url}/category/${category.value}`;

  return {
    title: `${category.label} — Free Online Tools`,
    description: `Explore our collection of free online ${category.label.toLowerCase()}. No sign-up required, works entirely in your browser.`,
    alternates: { canonical },
    openGraph: {
      title: `${category.label} | ${siteConfig.name}`,
      description: `Explore our collection of free online ${category.label.toLowerCase()}. No sign-up required, works entirely in your browser.`,
      url: canonical,
      type: 'website',
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.label,
      description: `Explore our collection of free online ${category.label.toLowerCase()}. No sign-up required, works entirely in your browser.`,
    },
  };
}

export default function CategoryPage({ params }: CategoryPageParams) {
  const { slug } = params;
  const category = CATEGORIES.find((c) => c.value === slug);

  if (!category) {
    notFound();
  }

  const tools = getToolsByCategory(slug as ToolCategory);
  const content = getCategoryContent(category.value);
  const jsonLd = buildCategoryJsonLd(category, tools, content?.faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: 'Tools', href: '/tools' },
          { label: category.label },
        ]}
      />

      <div className="mt-8">
        <header className="flex items-center gap-4 mb-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
            <DynamicIcon name={category.icon} size={28} />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              {category.label}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-2">
              {tools.length} free online tool{tools.length !== 1 ? 's' : ''}
            </p>
          </div>
        </header>

        <section className="mb-8 bg-surface border border-border rounded-lg p-6">
          <h2 className="font-display text-xl font-bold text-text-primary mb-3">
            About {category.label}
          </h2>
          {content ? (
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              {content.intro.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed">
              {category.description}
            </p>
          )}
        </section>

        {/* Popular Tools in this Category */}
        {tools.filter(t => t.isPopular).length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">
              Popular {category.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.filter(t => t.isPopular).map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* Related Categories */}
        <section className="mb-8 bg-surface border border-border rounded-lg p-6">
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Related Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => c.value !== category.value).map((relatedCategory) => (
              <Link
                key={relatedCategory.value}
                href={`/category/${relatedCategory.value}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-accent hover:text-white text-sm font-medium text-text-secondary transition-all duration-200"
              >
                <DynamicIcon name={relatedCategory.icon} size={14} />
                {relatedCategory.label}
              </Link>
            ))}
          </div>
        </section>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-secondary text-lg">
              No tools found in this category yet.
            </p>
            <Link
              href="/tools"
              className="inline-block mt-4 px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
            >
              Browse All Tools
            </Link>
          </div>
        )}

        {content && content.faqs.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {content.faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-surface">
                  <h3 className="font-medium text-text-primary mb-2">{faq.question}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
}
