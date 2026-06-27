'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { FileCode, Copy, Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type SchemaType = 'article' | 'product' | 'faq';

interface ArticleFields {
  headline: string;
  description: string;
  url: string;
  imageUrl: string;
  authorName: string;
  datePublished: string;
  publisherName: string;
  publisherLogoUrl: string;
}

interface ProductFields {
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  currency: string;
  ratingValue: string;
  reviewCount: string;
  brand: string;
  availability: string;
}

interface FaqPair {
  id: string;
  question: string;
  answer: string;
}

function buildArticleSchema(f: ArticleFields): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
  };
  if (f.headline) schema['headline'] = f.headline;
  if (f.description) schema['description'] = f.description;
  if (f.url) schema['url'] = f.url;
  if (f.imageUrl) schema['image'] = f.imageUrl;
  if (f.authorName) schema['author'] = { '@type': 'Person', name: f.authorName };
  if (f.datePublished) schema['datePublished'] = f.datePublished;
  if (f.publisherName) {
    schema['publisher'] = {
      '@type': 'Organization',
      name: f.publisherName,
      ...(f.publisherLogoUrl
        ? { logo: { '@type': 'ImageObject', url: f.publisherLogoUrl } }
        : {}),
    };
  }
  return schema;
}

function buildProductSchema(f: ProductFields): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
  };
  if (f.name) schema['name'] = f.name;
  if (f.description) schema['description'] = f.description;
  if (f.imageUrl) schema['image'] = f.imageUrl;
  if (f.brand) schema['brand'] = { '@type': 'Brand', name: f.brand };
  if (f.price || f.currency) {
    schema['offers'] = {
      '@type': 'Offer',
      ...(f.price ? { price: f.price } : {}),
      ...(f.currency ? { priceCurrency: f.currency } : {}),
      ...(f.availability
        ? { availability: `https://schema.org/${f.availability}` }
        : {}),
    };
  }
  if (f.ratingValue || f.reviewCount) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      ...(f.ratingValue ? { ratingValue: f.ratingValue } : {}),
      ...(f.reviewCount ? { reviewCount: f.reviewCount } : {}),
    };
  }
  return schema;
}

function buildFaqSchema(pairs: FaqPair[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs
      .filter(p => p.question || p.answer)
      .map(p => ({
        '@type': 'Question',
        name: p.question,
        acceptedAnswer: { '@type': 'Answer', text: p.answer },
      })),
  };
}

function wrapJsonLd(obj: object): string {
  return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'JPY'];
const AVAILABILITY = ['InStock', 'OutOfStock', 'PreOrder'];

const DEFAULT_ARTICLE: ArticleFields = {
  headline: '', description: '', url: '', imageUrl: '',
  authorName: '', datePublished: '', publisherName: '', publisherLogoUrl: '',
};

const DEFAULT_PRODUCT: ProductFields = {
  name: '', description: '', imageUrl: '', price: '',
  currency: 'USD', ratingValue: '', reviewCount: '', brand: '', availability: 'InStock',
};

function newFaq(): FaqPair {
  return { id: Math.random().toString(36).slice(2), question: '', answer: '' };
}

const inputClass =
  'w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/50';

const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

export function SchemaMarkupGenerator() {
  const [activeTab, setActiveTab] = useState<SchemaType>('article');
  const [article, setArticle] = useState<ArticleFields>(DEFAULT_ARTICLE);
  const [product, setProduct] = useState<ProductFields>(DEFAULT_PRODUCT);
  const [faqPairs, setFaqPairs] = useState<FaqPair[]>([newFaq()]);
  const [copied, setCopied] = useState(false);

  const updateArticle = useCallback(
    (field: keyof ArticleFields, value: string) =>
      setArticle(prev => ({ ...prev, [field]: value })),
    []
  );

  const updateProduct = useCallback(
    (field: keyof ProductFields, value: string) =>
      setProduct(prev => ({ ...prev, [field]: value })),
    []
  );

  const updateFaq = useCallback((id: string, field: 'question' | 'answer', value: string) => {
    setFaqPairs(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const addFaq = useCallback(() => setFaqPairs(prev => [...prev, newFaq()]), []);

  const removeFaq = useCallback(
    (id: string) => setFaqPairs(prev => prev.filter(p => p.id !== id)),
    []
  );

  const handleClear = useCallback(() => {
    if (activeTab === 'article') setArticle(DEFAULT_ARTICLE);
    if (activeTab === 'product') setProduct(DEFAULT_PRODUCT);
    if (activeTab === 'faq') setFaqPairs([newFaq()]);
  }, [activeTab]);

  const output = useMemo(() => {
    if (activeTab === 'article') return wrapJsonLd(buildArticleSchema(article));
    if (activeTab === 'product') return wrapJsonLd(buildProductSchema(product));
    return wrapJsonLd(buildFaqSchema(faqPairs));
  }, [activeTab, article, product, faqPairs]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const TABS: { key: SchemaType; label: string }[] = [
    { key: 'article', label: 'Article' },
    { key: 'product', label: 'Product' },
    { key: 'faq', label: 'FAQ' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex gap-2 border-b border-border pb-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'article' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Headline</label>
            <input className={inputClass} placeholder="Article title" value={article.headline}
              onChange={e => updateArticle('headline', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input className={inputClass} placeholder="Short description" value={article.description}
              onChange={e => updateArticle('description', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Article URL</label>
            <input className={inputClass} placeholder="https://example.com/article" value={article.url}
              onChange={e => updateArticle('url', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input className={inputClass} placeholder="https://example.com/image.jpg" value={article.imageUrl}
              onChange={e => updateArticle('imageUrl', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Author Name</label>
            <input className={inputClass} placeholder="Jane Doe" value={article.authorName}
              onChange={e => updateArticle('authorName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Date Published</label>
            <input className={inputClass} type="date" value={article.datePublished}
              onChange={e => updateArticle('datePublished', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Publisher Name</label>
            <input className={inputClass} placeholder="Acme Corp" value={article.publisherName}
              onChange={e => updateArticle('publisherName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Publisher Logo URL</label>
            <input className={inputClass} placeholder="https://example.com/logo.png" value={article.publisherLogoUrl}
              onChange={e => updateArticle('publisherLogoUrl', e.target.value)} />
          </div>
        </div>
      )}

      {activeTab === 'product' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Product Name</label>
            <input className={inputClass} placeholder="Widget Pro" value={product.name}
              onChange={e => updateProduct('name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input className={inputClass} placeholder="Product description" value={product.description}
              onChange={e => updateProduct('description', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input className={inputClass} placeholder="https://example.com/product.jpg" value={product.imageUrl}
              onChange={e => updateProduct('imageUrl', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input className={inputClass} placeholder="Acme" value={product.brand}
              onChange={e => updateProduct('brand', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input className={inputClass} placeholder="29.99" value={product.price}
              onChange={e => updateProduct('price', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select className={inputClass} value={product.currency}
              onChange={e => updateProduct('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Availability</label>
            <select className={inputClass} value={product.availability}
              onChange={e => updateProduct('availability', e.target.value)}>
              {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rating Value (0–5)</label>
            <input className={inputClass} placeholder="4.5" value={product.ratingValue}
              onChange={e => updateProduct('ratingValue', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Review Count</label>
            <input className={inputClass} placeholder="128" value={product.reviewCount}
              onChange={e => updateProduct('reviewCount', e.target.value)} />
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-4">
          {faqPairs.map((pair, idx) => (
            <div key={pair.id} className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Q&amp;A {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFaq(pair.id)}
                  disabled={faqPairs.length <= 1}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    faqPairs.length <= 1
                      ? 'text-muted-foreground/30 cursor-not-allowed'
                      : 'hover:bg-destructive/10 hover:text-destructive text-muted-foreground'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className={labelClass}>Question</label>
                <input className={inputClass} placeholder="What is…?" value={pair.question}
                  onChange={e => updateFaq(pair.id, 'question', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Answer</label>
                <input className={inputClass} placeholder="The answer is…" value={pair.answer}
                  onChange={e => updateFaq(pair.id, 'answer', e.target.value)} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-accent/60 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Generated JSON-LD</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <pre className="overflow-auto rounded-xl border border-border bg-secondary/40 p-4 text-xs font-mono leading-relaxed max-h-80">
          {output}
        </pre>
      </div>
    </div>
  );
}
