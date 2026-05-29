// src/types/index.ts
// Shared TypeScript interfaces across the project

export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  ogImage: string;
  author: string;
  twitter: string;
}

export interface AdConfig {
  adsenseClientId: string;
  adsterraBannerKey: string;
  adsterraSidebarKey: string;
  enabled: boolean;
}

// Tool page props
export interface ToolPageProps {
  params: {
    slug: string;
  };
}

// Reusable file state
export interface FileState {
  file: File | null;
  preview: string | null;
  error: string | null;
  isLoading: boolean;
}
