import { Tool } from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';

export function buildToolJsonLd(tool: Tool) {
  const url = `${siteConfig.url}/tools/${tool.slug}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.name,
        description: tool.description,
        url,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: tool.tags,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteConfig.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tools',
            item: `${siteConfig.url}/tools`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: url,
          },
        ],
      },
    ],
  };
}
