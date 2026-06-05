import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  TOOLS,
  getTool,
  getRelatedTools,
  CATEGORIES,
} from '@/lib/constants/tools';
import { siteConfig, adConfig } from '@/lib/constants/site';
import { buildToolJsonLd } from '@/lib/seo/json-ld';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { RelatedTools } from '@/components/shared/RelatedTools';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { ToolPlaceholder } from '@/components/tools/ToolPlaceholder';
import { AdBanner, AdInArticle, AdSidebar } from '@/components/ads';
import { ToolCard } from '@/components/shared/ToolCard';
import dynamic from 'next/dynamic';

interface ToolPageParams {
  params: { slug: string };
}

// Dynamic imports for tool components
const toolComponents: Record<string, React.ComponentType> = {
  'base64-encoder': dynamic(() => import('@/components/tools/Base64Encoder').then(mod => ({ default: mod.Base64Encoder })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'color-palette': dynamic(() => import('@/components/tools/ColorPalette').then(mod => ({ default: mod.ColorPalette })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-compressor': dynamic(() => import('@/components/tools/ImageCompressor').then(mod => ({ default: mod.ImageCompressor })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-cropper': dynamic(() => import('@/components/tools/ImageCropper').then(mod => ({ default: mod.ImageCropper })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-formatter': dynamic(() => import('@/components/tools/JSONFormatter').then(mod => ({ default: mod.JSONFormatter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'password-generator': dynamic(() => import('@/components/tools/PasswordGenerator').then(mod => ({ default: mod.PasswordGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'qr-generator': dynamic(() => import('@/components/tools/QRGenerator').then(mod => ({ default: mod.QRGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'word-counter': dynamic(() => import('@/components/tools/WordCounter').then(mod => ({ default: mod.WordCounter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-resizer': dynamic(() => import('@/components/tools/ImageResizer').then(mod => ({ default: mod.ImageResizer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-converter': dynamic(() => import('@/components/tools/ImageConverter').then(mod => ({ default: mod.ImageConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'hash-generator': dynamic(() => import('@/components/tools/HashGenerator').then(mod => ({ default: mod.HashGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'url-encoder': dynamic(() => import('@/components/tools/URLEncoder').then(mod => ({ default: mod.URLEncoder })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'unit-converter': dynamic(() => import('@/components/tools/UnitConverter').then(mod => ({ default: mod.UnitConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'markdown-previewer': dynamic(() => import('@/components/tools/MarkdownPreviewer').then(mod => ({ default: mod.MarkdownPreviewer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'lorem-ipsum': dynamic(() => import('@/components/tools/LoremIpsum').then(mod => ({ default: mod.LoremIpsum })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-to-csv': dynamic(() => import('@/components/tools/JsonToCsv').then(mod => ({ default: mod.JsonToCsv })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-diff': dynamic(() => import('@/components/tools/JsonDiff').then(mod => ({ default: mod.JsonDiff })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-path-finder': dynamic(() => import('@/components/tools/JsonPathFinder').then(mod => ({ default: mod.JsonPathFinder })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-escape': dynamic(() => import('@/components/tools/JsonEscape').then(mod => ({ default: mod.JsonEscape })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-stringify': dynamic(() => import('@/components/tools/JsonStringify').then(mod => ({ default: mod.JsonStringify })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-parse': dynamic(() => import('@/components/tools/JsonParse').then(mod => ({ default: mod.JsonParse })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-filter': dynamic(() => import('@/components/tools/JsonFilter').then(mod => ({ default: mod.JsonFilter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'json-schema-visualizer': dynamic(() => import('@/components/tools/JsonSchemaVisualizer').then(mod => ({ default: mod.JsonSchemaVisualizer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'regex-tester': dynamic(() => import('@/components/tools/RegexTester').then(mod => ({ default: mod.RegexTester })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'regex-explainer': dynamic(() => import('@/components/tools/RegexExplainer').then(mod => ({ default: mod.RegexExplainer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'uuid-generator': dynamic(() => import('@/components/tools/UuidGenerator').then(mod => ({ default: mod.UuidGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'jwt-decoder': dynamic(() => import('@/components/tools/JwtDecoder').then(mod => ({ default: mod.JwtDecoder })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'string-converter': dynamic(() => import('@/components/tools/StringConverter').then(mod => ({ default: mod.StringConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'sql-formatter': dynamic(() => import('@/components/tools/SqlFormatter').then(mod => ({ default: mod.SqlFormatter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'markdown-to-html': dynamic(() => import('@/components/tools/MarkdownToHtml').then(mod => ({ default: mod.MarkdownToHtml })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'text-diff': dynamic(() => import('@/components/tools/TextDiff').then(mod => ({ default: mod.TextDiff })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'html-viewer': dynamic(() => import('@/components/tools/HtmlViewer').then(mod => ({ default: mod.HtmlViewer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'code-minifier': dynamic(() => import('@/components/tools/CodeMinifier').then(mod => ({ default: mod.CodeMinifier })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'cron-builder': dynamic(() => import('@/components/tools/CronBuilder').then(mod => ({ default: mod.CronBuilder })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'css-grid-generator': dynamic(() => import('@/components/tools/CssGridGenerator').then(mod => ({ default: mod.CssGridGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'har-viewer': dynamic(() => import('@/components/tools/HarViewer').then(mod => ({ default: mod.HarViewer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'security-header-analyzer': dynamic(() => import('@/components/tools/SecurityHeaderAnalyzer').then(mod => ({ default: mod.SecurityHeaderAnalyzer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'meta-tag-generator': dynamic(() => import('@/components/tools/MetaTagGenerator').then(mod => ({ default: mod.MetaTagGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'keyword-density-checker': dynamic(() => import('@/components/tools/KeywordDensityChecker').then(mod => ({ default: mod.KeywordDensityChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'sitemap-generator': dynamic(() => import('@/components/tools/SitemapGenerator').then(mod => ({ default: mod.SitemapGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'url-encoder-decoder': dynamic(() => import('@/components/tools/URLEncoderDecoder').then(mod => ({ default: mod.URLEncoderDecoder })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'open-graph-preview-generator': dynamic(() => import('@/components/tools/OpenGraphPreviewGenerator').then(mod => ({ default: mod.OpenGraphPreviewGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'open-graph-image-generator': dynamic(() => import('@/components/tools/OpenGraphImageGenerator').then(mod => ({ default: mod.OpenGraphImageGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'serp-snippet-preview': dynamic(() => import('@/components/tools/SERPSnippetPreview').then(mod => ({ default: mod.SERPSnippetPreview })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'title-description-length-checker': dynamic(() => import('@/components/tools/TitleDescriptionLengthChecker').then(mod => ({ default: mod.TitleDescriptionLengthChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'robots-txt-generator': dynamic(() => import('@/components/tools/RobotsTxtGenerator').then(mod => ({ default: mod.RobotsTxtGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'readability-checker': dynamic(() => import('@/components/tools/ReadabilityChecker').then(mod => ({ default: mod.ReadabilityChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'url-parameter-cleaner': dynamic(() => import('@/components/tools/URLParameterCleaner').then(mod => ({ default: mod.URLParameterCleaner })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
};

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageParams): Promise<Metadata> {
  const { slug } = params;
  const tool = getTool(slug);

  if (!tool) {
    return { title: 'Tool Not Found' };
  }

  const canonical = `/tools/${tool.slug}`;

  return {
    title: `${tool.name} — Free Online Tool | ToolForge`,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical },
    openGraph: {
      title: `${tool.name} | ${siteConfig.name}`,
      description: tool.description,
      url: `${siteConfig.url}${canonical}`,
      type: 'website',
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description,
    },
  };
}

export default function ToolPage({ params }: ToolPageParams) {
  const { slug } = params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedTools(slug);
  const category = CATEGORIES.find((c) => c.value === tool.category);
  const jsonLd = buildToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AdBanner position="top" adsterraKey={adConfig.adsterraBannerKey} />

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-10 mt-4">
          {/* Main column */}
          <div className="min-w-0 flex flex-col gap-8">
            <header className="flex flex-col gap-4">
              <Breadcrumb
                items={[
                  { label: 'Tools', href: '/tools' },
                  ...(category
                    ? [{ label: category.label, href: `/category/${category.value}` }]
                    : []),
                  { label: tool.name },
                ]}
              />

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                  <DynamicIcon name={tool.icon} size={24} />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                    {tool.name}
                  </h1>
                  <p className="text-sm sm:text-base text-text-secondary mt-2 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>
              </div>
            </header>

            {toolComponents[tool.slug] ? (
              React.createElement(toolComponents[tool.slug])
            ) : (
              <ToolPlaceholder tool={tool} />
            )}

            <AdInArticle adsterraKey={adConfig.adsterraBannerKey} />

            <section className="prose-tool">
              <h2 className="font-display text-xl font-bold text-text-primary mb-3">
                How to Use
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary leading-relaxed">
                <li>Open {tool.name} on this page — no account or install required.</li>
                <li>
                  Provide your input (paste text, upload a file, or adjust settings depending on
                  the tool).
                </li>
                <li>Run the tool — processing happens entirely in your browser.</li>
                <li>Copy or download the result when you are done.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-text-primary mb-3">
                About This Tool
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
              <p className="text-sm text-text-secondary leading-relaxed mt-3">
                ToolForge runs {tool.name.toLowerCase()} client-side so your data never leaves your
                device. It is free, requires no sign-up, and works on desktop and mobile browsers.
              </p>
              {tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Related tools — visible on mobile; sidebar shows on desktop */}
            {relatedTools.length > 0 && (
              <section className="lg:hidden">
                <h2 className="font-display text-xl font-bold text-text-primary mb-4">
                  Related Tools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedTools.map((related) => (
                    <ToolCard key={related.slug} tool={related} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — desktop */}
          <div className="hidden lg:flex flex-col gap-8">
            <AdSidebar
              adseraRectKey={adConfig.adseraSidebarRectKey}
              adseraSkyscraperKey={adConfig.adseraSidebarSkyscraperKey}
            />
            <RelatedTools tools={relatedTools} />
          </div>
        </div>

        <AdBanner position="bottom" adsterraKey={adConfig.adsterraBannerKey} />
      </div>
    </>
  );
}
