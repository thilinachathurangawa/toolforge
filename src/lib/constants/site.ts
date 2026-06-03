// src/lib/constants/site.ts

export const siteConfig = {
  name: 'ToolForge',
  tagline: 'Free Online Tools — Fast, Private, No Sign-up',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://toolforge-jet.vercel.app',
  description:
    'ToolForge offers 50+ free online tools for image editing, text processing, developer utilities, and more. All tools work 100% in your browser — no data leaves your device.',
  ogImage: '/og-default.png',
  author: 'ToolForge',
  twitter: '@toolforge',

  // Navigation
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'All Tools', href: '/tools' },
    { label: 'Contact', href: '/contact' },
    { label: 'About', href: '/about' },
  ],

  // Footer
  footerLinks: {
    tools: [
      { label: 'Image Compressor', href: '/tools/image-compressor' },
      { label: 'QR Generator', href: '/tools/qr-generator' },
      { label: 'Password Generator', href: '/tools/password-generator' },
      { label: 'JSON Formatter', href: '/tools/json-formatter' },
      { label: 'Word Counter', href: '/tools/word-counter' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Contact', href: '/contact' },
    ],
  },
};

export const adConfig = {
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
  adsterraBannerKey: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY || '',
  adsterraSidebarRectKey: process.env.NEXT_PUBLIC_ADSTERRA_SIDEBAR_RECT_KEY || '',
  adsterraSidebarSkyscraperKey: process.env.NEXT_PUBLIC_ADSTERRA_SIDEBAR_SKYSCRAPER_KEY || '',
  // Set to true when ad networks are configured
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
};
