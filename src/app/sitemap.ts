// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { TOOLS, CATEGORIES } from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // 1. Core Homepage sitemap node
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. Core static pages (About, Contact, Privacy, Tools)
  const staticPages = [
    { path: '/about', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/contact', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFreq: 'yearly' as const },
    { path: '/tools', priority: 0.8, changeFreq: 'weekly' as const },
  ];

  staticPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}${page.path}`,
      changeFrequency: page.changeFreq,
      priority: page.priority,
    });
  });

  // 3. Tool Categories sitemap nodes (SEO internal discovery)
  CATEGORIES.forEach((cat) => {
    routes.push({
      url: `${baseUrl}/category/${cat.value}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // 3. Registered Client-Side Tool sitemap nodes
  TOOLS.forEach((tool) => {
    routes.push({
      url: `${baseUrl}/tools/${tool.slug}`,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  return routes;
}
