import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CATEGORIES,
  CALCULATOR_SUBCATEGORIES,
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
  const toolCount = getToolsByCategory(category.value).length;
  const description = `${toolCount} free online ${category.label.toLowerCase()} — no sign-up required, everything runs in your browser.`;

  return {
    title: `${category.label} — Free Online Tools`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${category.label} | ${siteConfig.name}`,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.label,
      description,
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

        {/* Calculator subcategory hubs */}
        {category.value === 'calculator' && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">
              Browse by Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CALCULATOR_SUBCATEGORIES.map((sub) => {
                const count = tools.filter((t) => t.subcategory === sub.value).length;
                if (count === 0) return null;
                return (
                  <Link
                    key={sub.value}
                    href={`/category/calculator/${sub.value}`}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-accent/5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent border border-accent/20">
                      <DynamicIcon name={sub.icon} size={20} />
                    </span>
                    <span>
                      <span className="block font-medium text-text-primary">{sub.label}</span>
                      <span className="block text-xs text-text-secondary mt-0.5">
                        {count} calculator{count !== 1 ? 's' : ''}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

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
