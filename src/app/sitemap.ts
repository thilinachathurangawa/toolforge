// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { TOOLS, CATEGORIES, CALCULATOR_SUBCATEGORIES } from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  // 1. Core Homepage sitemap node
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. Core static pages (About, Privacy, Tools)
  // Note: /contact excluded as it's a client component without canonical metadata
  const staticPages = [
    { path: '/about', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFreq: 'yearly' as const },
    { path: '/tools', priority: 0.8, changeFreq: 'weekly' as const },
  ];

  staticPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.changeFreq,
      priority: page.priority,
    });
  });

  // 3. Tool Categories sitemap nodes (SEO internal discovery)
  CATEGORIES.forEach((cat) => {
    routes.push({
      url: `${baseUrl}/category/${cat.value}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // 3b. Calculator subcategory hub pages
  CALCULATOR_SUBCATEGORIES.forEach((sub) => {
    routes.push({
      url: `${baseUrl}/category/calculator/${sub.value}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // 4. Registered Client-Side Tool sitemap nodes
  TOOLS.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  return routes;
}
