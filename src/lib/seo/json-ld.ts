import { Tool } from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';

export interface FAQ {
  question: string;
  answer: string;
}

export function buildToolJsonLd(tool: Tool, faqs?: FAQ[]) {
  const url = `${siteConfig.url}/tools/${tool.slug}`;

  const graph: any[] = [
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
  ];

  // Add FAQPage schema if FAQs are provided
  if (faqs && faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildCategoryJsonLd(
  category: { value: string; label: string; icon: string },
  tools: Tool[]
) {
  const url = `${siteConfig.url}/category/${category.value}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: category.label,
        description: `Explore our collection of free online ${category.label.toLowerCase()}. No sign-up required, works entirely in your browser.`,
        url,
        isPartOf: {
          '@type': 'WebSite',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        about: {
          '@type': 'Thing',
          name: category.label,
        },
        hasPart: tools.map((tool) => ({
          '@type': 'WebApplication',
          name: tool.name,
          description: tool.description,
          url: `${siteConfig.url}/tools/${tool.slug}`,
        })),
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
            name: category.label,
            item: url,
          },
        ],
      },
    ],
  };
}
