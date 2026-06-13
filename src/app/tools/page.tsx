import React from 'react';
import type { Metadata } from 'next';
import { TOOLS, CATEGORIES, CALCULATOR_SUBCATEGORIES } from '@/lib/constants/tools';
import { siteConfig, adConfig } from '@/lib/constants/site';
import { ToolCard } from '@/components/shared/ToolCard';
import { AdBanner } from '@/components/ads';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { DynamicIcon } from '@/components/shared/DynamicIcon';

export const metadata: Metadata = {
  title: 'All Tools',
  description: `Browse all free online tools on ${siteConfig.name}. Image, text, developer, and security utilities — 100% browser-based.`,
  alternates: { canonical: '/tools' },
};

export default function ToolsIndexPage() {
  // Group tools by category
  const toolsByCategory = CATEGORIES.map(category => ({
    ...category,
    tools: TOOLS.filter(tool => tool.category === category.value)
  })).filter(category => category.tools.length > 0);

  // Group calculators by subcategory
  const calculatorsBySubcategory = CALCULATOR_SUBCATEGORIES.map(subcategory => ({
    ...subcategory,
    tools: TOOLS.filter(tool => tool.category === 'calculator' && tool.subcategory === subcategory.value)
  })).filter(subcategory => subcategory.tools.length > 0);

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

      <AdBanner position="top" adsterraKey={adConfig.adsterraBannerKey} />

      {/* Display tools by category */}
      {toolsByCategory.map((category) => (
        <div key={category.value} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <DynamicIcon name={category.icon} className="w-8 h-8 text-primary" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">
              {category.label}
            </h2>
            <span className="text-sm text-text-secondary">
              ({category.tools.length} tools)
            </span>
          </div>

          {/* Special handling for calculators - show subcategories */}
          {category.value === 'calculator' && calculatorsBySubcategory.length > 0 ? (
            <div className="space-y-8">
              {calculatorsBySubcategory.map((subcategory) => (
                <div key={subcategory.value} className="pl-4 border-l-2 border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <DynamicIcon name={subcategory.icon} className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold text-text-primary">
                      {subcategory.label}
                    </h3>
                    <span className="text-sm text-text-secondary">
                      ({subcategory.tools.length} tools)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subcategory.tools.map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Calculators without subcategory */}
              {TOOLS.filter(tool => tool.category === 'calculator' && !tool.subcategory).length > 0 && (
                <div className="pl-4 border-l-2 border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <DynamicIcon name="Calculator" className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold text-text-primary">
                      Other Calculators
                    </h3>
                    <span className="text-sm text-text-secondary">
                      ({TOOLS.filter(tool => tool.category === 'calculator' && !tool.subcategory).length} tools)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {TOOLS.filter(tool => tool.category === 'calculator' && !tool.subcategory).map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Regular category display */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          )}
        </div>
      ))}

      <AdBanner position="bottom" adsterraKey={adConfig.adsterraBannerKey} />
    </div>
  );
}
