import { Tool } from '@/lib/constants/tools';
import { siteConfig } from '@/lib/constants/site';

export interface FAQ {
  question: string;
  answer: string;
}

export function buildToolJsonLd(tool: Tool, faqs?: FAQ[], categoryLabel?: string) {
  const url = `${siteConfig.url}/tools/${tool.slug}`;

  const graph: any[] = [
    {
      '@type': 'SoftwareApplication',
      '@id': `${url}#app`,
      name: tool.name,
      description: tool.description,
      url,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: tool.tags,
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteConfig.url,
        },
        ...(categoryLabel
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: categoryLabel,
                item: `${siteConfig.url}/category/${tool.category}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: categoryLabel ? 3 : 2,
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
      '@id': `${url}#faq`,
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
  tools: Tool[],
  faqs?: FAQ[]
) {
  const url = `${siteConfig.url}/category/${category.value}`;

  const graph: any[] = [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collection`,
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
          '@type': 'SoftwareApplication',
          '@id': `${siteConfig.url}/tools/${tool.slug}#app`,
          name: tool.name,
          description: tool.description,
          url: `${siteConfig.url}/tools/${tool.slug}`,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          isAccessibleForFree: true,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
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
  ];

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
