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

  // 2. Tool Categories sitemap nodes (SEO internal discovery)
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
