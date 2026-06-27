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
import { getToolContent } from '@/lib/content/tool-content';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { RelatedTools } from '@/components/shared/RelatedTools';
import { ToolContent } from '@/components/shared/ToolContent';
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
  'image-metadata-remover': dynamic(() => import('@/components/tools/ImageMetadataRemover').then(mod => ({ default: mod.ImageMetadataRemover })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-batch-resizer': dynamic(() => import('@/components/tools/ImageBatchResizer').then(mod => ({ default: mod.ImageBatchResizer })), {
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
  'unix-timestamp-converter': dynamic(() => import('@/components/tools/UnixTimestampConverter').then(mod => ({ default: mod.UnixTimestampConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'csv-to-json': dynamic(() => import('@/components/tools/CsvToJson').then(mod => ({ default: mod.CsvToJson })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'xml-to-json': dynamic(() => import('@/components/tools/XmlToJson').then(mod => ({ default: mod.XmlToJson })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'yaml-json-converter': dynamic(() => import('@/components/tools/YamlJsonConverter').then(mod => ({ default: mod.YamlJsonConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'html-entity-encoder': dynamic(() => import('@/components/tools/HtmlEntityEncoder').then(mod => ({ default: mod.HtmlEntityEncoder })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'csv-diff-viewer': dynamic(() => import('@/components/tools/CsvDiffViewer').then(mod => ({ default: mod.CsvDiffViewer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'rot13-caesar-cipher': dynamic(() => import('@/components/tools/Rot13CaesarCipher').then(mod => ({ default: mod.Rot13CaesarCipher })), {
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
  'internet-speed-test': dynamic(() => import('@/components/tools/InternetSpeedTest').then(mod => ({ default: mod.InternetSpeedTest })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'address-lookup': dynamic(() => import('@/components/tools/AddressLookup').then(mod => ({ default: mod.AddressLookup })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'dns-lookup': dynamic(() => import('@/components/tools/DnsLookup').then(mod => ({ default: mod.DnsLookup })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'http-headers-checker': dynamic(() => import('@/components/tools/HttpHeadersChecker').then(mod => ({ default: mod.HttpHeadersChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ssl-certificate-checker': dynamic(() => import('@/components/tools/SslCertificateChecker').then(mod => ({ default: mod.SslCertificateChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ping-tool': dynamic(() => import('@/components/tools/PingTool').then(mod => ({ default: mod.PingTool })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'port-checker': dynamic(() => import('@/components/tools/PortChecker').then(mod => ({ default: mod.PortChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'whois-lookup': dynamic(() => import('@/components/tools/WhoisLookup').then(mod => ({ default: mod.WhoisLookup })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'website-status-checker': dynamic(() => import('@/components/tools/WebsiteStatusChecker').then(mod => ({ default: mod.WebsiteStatusChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'url-redirect-tracer': dynamic(() => import('@/components/tools/UrlRedirectTracer').then(mod => ({ default: mod.UrlRedirectTracer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ascii-art-generator': dynamic(() => import('@/components/tools/AsciiArtGenerator').then(mod => ({ default: mod.AsciiArtGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'meme-generator': dynamic(() => import('@/components/tools/MemeGenerator').then(mod => ({ default: mod.MemeGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'meme-sticker-studio': dynamic(() => import('@/components/tools/MemeStickerStudio').then(mod => ({ default: mod.MemeStickerStudio })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'optical-illusion-lab': dynamic(() => import('@/components/tools/OpticalIllusionLab').then(mod => ({ default: mod.OpticalIllusionLab })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'filter-effect-studio': dynamic(() => import('@/components/tools/FilterEffectStudio').then(mod => ({ default: mod.FilterEffectStudio })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'loan-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/LoanCalculator').then(mod => ({ default: mod.LoanCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'emi-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/EMICalculator').then(mod => ({ default: mod.EMICalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'compound-interest-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/CompoundInterestCalculator').then(mod => ({ default: mod.CompoundInterestCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'simple-interest-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/SimpleInterestCalculator').then(mod => ({ default: mod.SimpleInterestCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'savings-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/SavingsCalculator').then(mod => ({ default: mod.SavingsCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'investment-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/InvestmentCalculator').then(mod => ({ default: mod.InvestmentCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'roi-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/ROICalculator').then(mod => ({ default: mod.ROICalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'discount-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/DiscountCalculator').then(mod => ({ default: mod.DiscountCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'percent-off-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/PercentOffCalculator').then(mod => ({ default: mod.PercentOffCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'sales-tax-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/SalesTaxCalculator').then(mod => ({ default: mod.SalesTaxCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'vat-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/VATCalculator').then(mod => ({ default: mod.VATCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'tip-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/TipCalculator').then(mod => ({ default: mod.TipCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'margin-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/MarginCalculator').then(mod => ({ default: mod.MarginCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'commission-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/CommissionCalculator').then(mod => ({ default: mod.CommissionCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'salary-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/SalaryCalculator').then(mod => ({ default: mod.SalaryCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'budget-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/BudgetCalculator').then(mod => ({ default: mod.BudgetCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'debt-payoff-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/DebtPayoffCalculator').then(mod => ({ default: mod.DebtPayoffCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'credit-card-payoff-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/CreditCardPayoffCalculator').then(mod => ({ default: mod.CreditCardPayoffCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'student-loan-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/StudentLoanCalculator').then(mod => ({ default: mod.StudentLoanCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'present-value-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/PresentValueCalculator').then(mod => ({ default: mod.PresentValueCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'future-value-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/FutureValueCalculator').then(mod => ({ default: mod.FutureValueCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'break-even-calculator': dynamic(() => import('@/components/tools/calculators/financial-calculators/BreakEvenCalculator').then(mod => ({ default: mod.BreakEvenCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'bmi-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/BMICalculator').then(mod => ({ default: mod.BMICalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'bmr-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/BMRCalculator').then(mod => ({ default: mod.BMRCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'tdee-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/TDEECalculator').then(mod => ({ default: mod.TDEECalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'calorie-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/CalorieCalculator').then(mod => ({ default: mod.CalorieCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ideal-weight-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/IdealWeightCalculator').then(mod => ({ default: mod.IdealWeightCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'body-fat-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/BodyFatCalculator').then(mod => ({ default: mod.BodyFatCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'lean-body-mass-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/LeanBodyMassCalculator').then(mod => ({ default: mod.LeanBodyMassCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'protein-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/ProteinCalculator').then(mod => ({ default: mod.ProteinCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'macro-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/MacroCalculator').then(mod => ({ default: mod.MacroCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'target-heart-rate-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/TargetHeartRateCalculator').then(mod => ({ default: mod.TargetHeartRateCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'one-rep-max-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/OneRepMaxCalculator').then(mod => ({ default: mod.OneRepMaxCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'pace-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/PaceCalculator').then(mod => ({ default: mod.PaceCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'calories-burned-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/CaloriesBurnedCalculator').then(mod => ({ default: mod.CaloriesBurnedCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'water-intake-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/WaterIntakeCalculator').then(mod => ({ default: mod.WaterIntakeCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'sleep-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/SleepCalculator').then(mod => ({ default: mod.SleepCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'age-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/AgeCalculator').then(mod => ({ default: mod.AgeCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'due-date-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/DueDateCalculator').then(mod => ({ default: mod.DueDateCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ovulation-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/OvulationCalculator').then(mod => ({ default: mod.OvulationCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'period-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/PeriodCalculator').then(mod => ({ default: mod.PeriodCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'bac-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/BACCalculator').then(mod => ({ default: mod.BACCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'body-surface-area-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/BodySurfaceAreaCalculator').then(mod => ({ default: mod.BodySurfaceAreaCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'fat-intake-calculator': dynamic(() => import('@/components/tools/calculators/health-fitness-calculators/FatIntakeCalculator').then(mod => ({ default: mod.FatIntakeCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'percentage-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/PercentageCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'fraction-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/FractionCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'average-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/AverageCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'mean-median-mode-range-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/MeanMedianModeRange'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'standard-deviation-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/StandardDeviationCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'percentage-error-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/PercentageErrorCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'exponent-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/ExponentCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'root-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/RootCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ratio-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/RatioCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'rounding-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/RoundingCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'gcf-lcm-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/GCFLCMCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'factor-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/FactorCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'prime-factorization-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/PrimeFactorizationCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'probability-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/ProbabilityCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'permutation-combination-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/PermutationCombinationCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'area-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/AreaCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'volume-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/VolumeCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'pythagorean-theorem-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/PythagoreanTheoremCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'quadratic-formula-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/QuadraticFormulaCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'scientific-notation-calculator': dynamic(() => import('@/components/tools/calculators/math-calculators/ScientificNotationCalculator'), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'velocity-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/VelocityCalculator').then(mod => ({ default: mod.VelocityCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'force-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/ForceCalculator').then(mod => ({ default: mod.ForceCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'kinetic-energy-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/KineticEnergyCalculator').then(mod => ({ default: mod.KineticEnergyCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ohms-law-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/OhmsLawCalculator').then(mod => ({ default: mod.OhmsLawCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ph-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/PHCalculator').then(mod => ({ default: mod.PHCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'molarity-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/MolarityCalculator').then(mod => ({ default: mod.MolarityCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'ideal-gas-law-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/IdealGasLawCalculator').then(mod => ({ default: mod.IdealGasLawCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'projectile-motion-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/ProjectileMotionCalculator').then(mod => ({ default: mod.ProjectileMotionCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'resistor-color-code-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/ResistorColorCodeCalculator').then(mod => ({ default: mod.ResistorColorCodeCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'density-calculator': dynamic(() => import('@/components/tools/calculators/science-calculators/DensityCalculator').then(mod => ({ default: mod.DensityCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'date-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/DateCalculator').then(mod => ({ default: mod.DateCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'time-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/TimeCalculator').then(mod => ({ default: mod.TimeCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'hours-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/HoursCalculator').then(mod => ({ default: mod.HoursCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'gpa-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/GPACalculator').then(mod => ({ default: mod.GPACalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'grade-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/GradeCalculator').then(mod => ({ default: mod.GradeCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'fuel-cost-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/FuelCostCalculator').then(mod => ({ default: mod.FuelCostCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'random-number-generator': dynamic(() => import('@/components/tools/calculators/other-calculators/RandomNumberGenerator').then(mod => ({ default: mod.RandomNumberGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'dice-roller': dynamic(() => import('@/components/tools/calculators/other-calculators/DiceRoller').then(mod => ({ default: mod.DiceRoller })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'shoe-size-converter': dynamic(() => import('@/components/tools/calculators/other-calculators/ShoeSizeConverter').then(mod => ({ default: mod.ShoeSizeConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'time-zone-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/TimeZoneCalculator').then(mod => ({ default: mod.TimeZoneCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'square-footage-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/SquareFootageCalculator').then(mod => ({ default: mod.SquareFootageCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'concrete-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/ConcreteCalculator').then(mod => ({ default: mod.ConcreteCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'tile-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/TileCalculator').then(mod => ({ default: mod.TileCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'wind-chill-heat-index-calculator': dynamic(() => import('@/components/tools/calculators/other-calculators/WindChillHeatIndexCalculator').then(mod => ({ default: mod.WindChillHeatIndexCalculator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'color-converter': dynamic(() => import('@/components/tools/ColorConverter').then(mod => ({ default: mod.ColorConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'temperature-converter': dynamic(() => import('@/components/tools/TemperatureConverter').then(mod => ({ default: mod.TemperatureConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'number-base-converter': dynamic(() => import('@/components/tools/NumberBaseConverter').then(mod => ({ default: mod.NumberBaseConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'data-storage-converter': dynamic(() => import('@/components/tools/DataStorageConverter').then(mod => ({ default: mod.DataStorageConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'timezone-converter': dynamic(() => import('@/components/tools/TimezoneConverter').then(mod => ({ default: mod.TimezoneConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'roman-numeral-converter': dynamic(() => import('@/components/tools/RomanNumeralConverter').then(mod => ({ default: mod.RomanNumeralConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'currency-converter': dynamic(() => import('@/components/tools/CurrencyConverter').then(mod => ({ default: mod.CurrencyConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'cooking-measurement-converter': dynamic(() => import('@/components/tools/CookingMeasurementConverter').then(mod => ({ default: mod.CookingMeasurementConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'number-to-words': dynamic(() => import('@/components/tools/NumberToWords').then(mod => ({ default: mod.NumberToWords })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'favicon-generator': dynamic(() => import('@/components/tools/FaviconGenerator').then(mod => ({ default: mod.FaviconGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'barcode-generator': dynamic(() => import('@/components/tools/BarcodeGenerator').then(mod => ({ default: mod.BarcodeGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'css-gradient-generator': dynamic(() => import('@/components/tools/CssGradientGenerator').then(mod => ({ default: mod.CssGradientGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'box-shadow-generator': dynamic(() => import('@/components/tools/BoxShadowGenerator').then(mod => ({ default: mod.BoxShadowGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'color-palette-generator': dynamic(() => import('@/components/tools/ColorPaletteGenerator').then(mod => ({ default: mod.ColorPaletteGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'avatar-generator': dynamic(() => import('@/components/tools/AvatarGenerator').then(mod => ({ default: mod.AvatarGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'signature-generator': dynamic(() => import('@/components/tools/SignatureGenerator').then(mod => ({ default: mod.SignatureGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'random-picker-wheel': dynamic(() => import('@/components/tools/RandomPickerWheel').then(mod => ({ default: mod.RandomPickerWheel })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'fake-data-generator': dynamic(() => import('@/components/tools/FakeDataGenerator').then(mod => ({ default: mod.FakeDataGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'case-converter': dynamic(() => import('@/components/tools/CaseConverter').then(mod => ({ default: mod.CaseConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'text-to-speech': dynamic(() => import('@/components/tools/TextToSpeech').then(mod => ({ default: mod.TextToSpeech })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'speech-to-text': dynamic(() => import('@/components/tools/SpeechToText').then(mod => ({ default: mod.SpeechToText })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'duplicate-line-remover': dynamic(() => import('@/components/tools/DuplicateLineRemover').then(mod => ({ default: mod.DuplicateLineRemover })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'find-and-replace': dynamic(() => import('@/components/tools/FindAndReplace').then(mod => ({ default: mod.FindAndReplace })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'text-sorter': dynamic(() => import('@/components/tools/TextSorter').then(mod => ({ default: mod.TextSorter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'word-frequency-counter': dynamic(() => import('@/components/tools/WordFrequencyCounter').then(mod => ({ default: mod.WordFrequencyCounter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'morse-binary-converter': dynamic(() => import('@/components/tools/MorseBinaryConverter').then(mod => ({ default: mod.MorseBinaryConverter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'social-media-image-resizer': dynamic(() => import('@/components/tools/SocialMediaImageResizer').then(mod => ({ default: mod.SocialMediaImageResizer })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'heic-to-jpg': dynamic(() => import('@/components/tools/HeicToJpg').then(mod => ({ default: mod.HeicToJpg })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'passport-photo-maker': dynamic(() => import('@/components/tools/PassportPhotoMaker').then(mod => ({ default: mod.PassportPhotoMaker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-collage-maker': dynamic(() => import('@/components/tools/ImageCollageMaker').then(mod => ({ default: mod.ImageCollageMaker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-to-pdf': dynamic(() => import('@/components/tools/ImageToPdf').then(mod => ({ default: mod.ImageToPdf })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'pdf-to-image': dynamic(() => import('@/components/tools/PdfToImage').then(mod => ({ default: mod.PdfToImage })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-splitter': dynamic(() => import('@/components/tools/ImageSplitter').then(mod => ({ default: mod.ImageSplitter })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'sprite-sheet-generator': dynamic(() => import('@/components/tools/SpriteSheetGenerator').then(mod => ({ default: mod.SpriteSheetGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'image-watermark': dynamic(() => import('@/components/tools/ImageWatermark').then(mod => ({ default: mod.ImageWatermark })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'password-strength-checker': dynamic(() => import('@/components/tools/PasswordStrengthChecker').then(mod => ({ default: mod.PasswordStrengthChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'file-hash-checker': dynamic(() => import('@/components/tools/FileHashChecker').then(mod => ({ default: mod.FileHashChecker })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'text-encrypt-decrypt': dynamic(() => import('@/components/tools/TextEncryptDecrypt').then(mod => ({ default: mod.TextEncryptDecrypt })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'schema-markup-generator': dynamic(() => import('@/components/tools/SchemaMarkupGenerator').then(mod => ({ default: mod.SchemaMarkupGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'hreflang-tag-generator': dynamic(() => import('@/components/tools/HreflangTagGenerator').then(mod => ({ default: mod.HreflangTagGenerator })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'what-is-my-ip': dynamic(() => import('@/components/tools/WhatIsMyIp').then(mod => ({ default: mod.WhatIsMyIp })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'user-agent-parser': dynamic(() => import('@/components/tools/UserAgentParser').then(mod => ({ default: mod.UserAgentParser })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'browser-screen-info': dynamic(() => import('@/components/tools/BrowserScreenInfo').then(mod => ({ default: mod.BrowserScreenInfo })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'svg-to-png': dynamic(() => import('@/components/tools/SvgToPng').then(mod => ({ default: mod.SvgToPng })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'drawing-pad': dynamic(() => import('@/components/tools/DrawingPad').then(mod => ({ default: mod.DrawingPad })), {
    loading: () => <div className="animate-pulse bg-muted min-h-[600px] rounded-lg" />,
    ssr: false,
  }),
  'pixel-art-maker': dynamic(() => import('@/components/tools/PixelArtMaker').then(mod => ({ default: mod.PixelArtMaker })), {
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

  const canonical = `${siteConfig.url}/tools/${tool.slug}`;

  return {
    title: `${tool.name} — Free Online Tool`,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical },
    openGraph: {
      title: `${tool.name} | ${siteConfig.name}`,
      description: tool.description,
      url: canonical,
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
  const content = getToolContent(slug);

  // Resolve the rich content's related links (slug -> Tool + note) for rendering.
  const contentRelated = content
    ? content.related
        .map(({ slug: relSlug, note }) => {
          const relTool = getTool(relSlug);
          return relTool ? { tool: relTool, note } : null;
        })
        .filter((r): r is { tool: NonNullable<ReturnType<typeof getTool>>; note: string } => r !== null)
    : [];

  // Prefer the long-form FAQs for structured data when present.
  const jsonLd = buildToolJsonLd(tool, content?.faqs ?? tool.faqs);

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

            {content ? (
              /* Long-form, unique editorial content (intro, steps, why, FAQ, related) */
              <ToolContent tool={tool} content={content} related={contentRelated} />
            ) : (
              <>
                <section className="prose-tool">
                  <h2 className="font-display text-xl font-bold text-text-primary mb-3">
                    How to Use
                  </h2>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary leading-relaxed">
                    {tool.howToUse && tool.howToUse.length > 0 ? (
                      tool.howToUse.map((step, index) => <li key={index}>{step}</li>)
                    ) : (
                      <>
                        <li>Open {tool.name} on this page — no account or install required.</li>
                        <li>Provide your input (paste text, upload a file, or adjust settings depending on the tool).</li>
                        <li>Run the tool — processing happens entirely in your browser.</li>
                        <li>Copy or download the result when you are done.</li>
                      </>
                    )}
                  </ol>
                </section>

                <section>
                  <h2 className="font-display text-xl font-bold text-text-primary mb-3">
                    About This Tool
                  </h2>
                  {tool.aboutContent ? (
                    <p className="text-sm text-text-secondary leading-relaxed">{tool.aboutContent}</p>
                  ) : (
                    <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
                  )}
                  {!tool.aboutContent && (
                    <p className="text-sm text-text-secondary leading-relaxed mt-3">
                      ToolForge runs {tool.name.toLowerCase()} client-side so your data never leaves your
                      device. It is free, requires no sign-up, and works on desktop and mobile browsers.
                    </p>
                  )}
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

                {tool.faqs && tool.faqs.length > 0 && (
                  <section>
                    <h2 className="font-display text-xl font-bold text-text-primary mb-4">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {tool.faqs.map((faq, index) => (
                        <div key={index} className="border border-border rounded-lg p-4 bg-surface">
                          <h3 className="font-medium text-text-primary mb-2">{faq.question}</h3>
                          <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

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
              </>
            )}
          </div>

          {/* Sidebar — desktop */}
          <div className="hidden lg:flex flex-col gap-8">
            <AdSidebar
              adseraRectKey={adConfig.adseraSidebarRectKey}
              adseraSkyscraperKey={adConfig.adseraSidebarSkyscraperKey}
            />
            {/* When rich content is present, its related block renders in the main column. */}
            {!content && <RelatedTools tools={relatedTools} />}
          </div>
        </div>

        <AdBanner position="bottom" adsterraKey={adConfig.adsterraBannerKey} />
      </div>
    </>
  );
}
