import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getToolsByCategory,
  CALCULATOR_SUBCATEGORIES,
} from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';
import { buildCategoryJsonLd } from '@/lib/seo/json-ld';
import { getSubcategoryContent } from '@/lib/content/category-content';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ToolCard } from '@/components/shared/ToolCard';
import { DynamicIcon } from '@/components/shared/DynamicIcon';

interface SubcategoryPageParams {
  params: { subcategory: string };
}

export async function generateStaticParams() {
  return CALCULATOR_SUBCATEGORIES.map((sub) => ({ subcategory: sub.value }));
}

export async function generateMetadata({ params }: SubcategoryPageParams): Promise<Metadata> {
  const sub = CALCULATOR_SUBCATEGORIES.find((s) => s.value === params.subcategory);
  if (!sub) return { title: 'Category Not Found' };

  const canonical = `${siteConfig.url}/category/calculator/${sub.value}`;
  const description = `Free online ${sub.label.toLowerCase()} — no sign-up, works entirely in your browser.`;

  return {
    title: `${sub.label} — Free Online Calculators`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${sub.label} | ${siteConfig.name}`,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: sub.label, description },
  };
}

export default function CalculatorSubcategoryPage({ params }: SubcategoryPageParams) {
  const sub = CALCULATOR_SUBCATEGORIES.find((s) => s.value === params.subcategory);
  if (!sub) {
    notFound();
  }

  const tools = getToolsByCategory('calculator').filter(
    (t) => t.subcategory === sub.value
  );
  const content = getSubcategoryContent(sub.value);

  // Reuse the category JSON-LD shape, treating the subcategory as a collection.
  const jsonLd = buildCategoryJsonLd(
    { value: `calculator/${sub.value}`, label: sub.label, icon: sub.icon },
    tools,
    content?.faqs
  );

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
            { label: 'Calculators', href: '/category/calculator' },
            { label: sub.label },
          ]}
        />

        <div className="mt-8">
          <header className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
              <DynamicIcon name={sub.icon} size={28} />
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                {sub.label}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary mt-2">
                {tools.length} free online calculator{tools.length !== 1 ? 's' : ''}
              </p>
            </div>
          </header>

          {content && (
            <section className="mb-8 bg-surface border border-border rounded-lg p-6">
              <h2 className="font-display text-xl font-bold text-text-primary mb-3">
                About {sub.label}
              </h2>
              <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                {content.intro.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {tools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-secondary text-lg">No calculators found here yet.</p>
              <Link
                href="/category/calculator"
                className="inline-block mt-4 px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                Browse All Calculators
              </Link>
            </div>
          )}

          {/* Other calculator subcategories */}
          <section className="mt-10 bg-surface border border-border rounded-lg p-6">
            <h2 className="font-display text-lg font-bold text-text-primary mb-4">
              Other Calculator Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {CALCULATOR_SUBCATEGORIES.filter((s) => s.value !== sub.value).map((other) => (
                <Link
                  key={other.value}
                  href={`/category/calculator/${other.value}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-accent hover:text-white text-sm font-medium text-text-secondary transition-all duration-200"
                >
                  <DynamicIcon name={other.icon} size={14} />
                  {other.label}
                </Link>
              ))}
            </div>
          </section>

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
