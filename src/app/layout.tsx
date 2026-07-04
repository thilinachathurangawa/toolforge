// src/app/layout.tsx
import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '@/lib/constants/site';
import { TOOLS } from '@/lib/constants/tools';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdProvider } from '@/components/ads';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';

// Load Google Fonts and assign Tailwind custom CSS variable names
const fontSyne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const fontDMSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const fontJetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Configure Site-Wide Base SEO Metadata
export const metadata: Metadata = (() => {
  const toolCount = TOOLS.length;
  const description = `ToolForge offers ${toolCount}+ free online tools for image editing, text processing, developer utilities, and more. All tools work 100% in your browser — no data leaves your device.`;

  return {
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: siteConfig.url,
      languages: {
        'en': siteConfig.url,
        'x-default': siteConfig.url,
      },
    },
    icons: {
      icon: '/icon.svg',
      apple: '/icon.svg',
    },
    openGraph: {
      title: siteConfig.name,
      description,
      url: `${siteConfig.url}/`,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitter,
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
})();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        'scroll-smooth',
        fontSyne.variable,
        fontDMSans.variable,
        fontJetBrainsMono.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* Microsoft Clarity Tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xfje0imn28");
            `,
          }}
        />
      </head>
      <body className="relative min-h-screen bg-background text-foreground font-body antialiased flex flex-col overflow-x-hidden">
        <ThemeProvider>
        {/* Ambient Premium Backdrop: Grid Mesh + Glow Blobs */}
        <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
          {/* Linear grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          {/* Top-Right Soft Glow Orb */}
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-accent/8 dark:bg-accent/15 blur-[120px] animate-fade-in" />
          
          {/* Bottom-Left Soft Glow Orb */}
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-violet-500/8 dark:bg-violet-500/12 blur-[120px]" />
        </div>

        {/* Global Navigation */}
        <Suspense
          fallback={
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md h-16" />
          }
        >
          <Navbar />
        </Suspense>

        {/* Main Content Layout Wrapper */}
        <AdProvider>
          <main className="flex-1 flex flex-col w-full relative">
            {children}
          </main>
        </AdProvider>

        {/* Global Footer */}
        <Footer />

        {/* Buy Me a Coffee Button */}
        <div className="fixed bottom-4 right-4 z-50 animate-bounce hover:scale-105 transition-transform duration-300">
          <a
            href="https://www.buymeacoffee.com/thilinachai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png"
              alt="Buy Me a Coffee"
              loading="lazy"
              style={{ height: '35px !important', width: '120px !important' }}
            />
          </a>
        </div>

        {/* Google Analytics Script Hook */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            defer
          />
        )}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <script
            id="ga4-init"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
            defer
          />
        )}

        <Analytics />
        <SpeedInsights />

        </ThemeProvider>
      </body>
    </html>
  );
}
