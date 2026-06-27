// src/components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/constants/site';
import { CATEGORIES } from '@/lib/constants/tools';
import { ShieldCheck, Heart, Wand2, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-surface/30 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet-600 text-white shadow-sm transition-transform duration-300">
                <Wand2 size={16} />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-text-primary">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
              {siteConfig.tagline}
            </p>
            {/* Privacy Badge */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-accent/5 border border-accent/15 max-w-sm mt-2 animate-pulse-once">
              <ShieldCheck className="text-accent shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-text-secondary leading-normal">
                <span className="font-semibold text-accent block mb-0.5">100% Client-Side Privacy</span>
                All processing happens in your browser. No files, passwords, or data are ever uploaded.
              </div>
            </div>
          </div>

          {/* Quick Tools Column */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-text-primary">
              Popular Tools
            </h3>
            <ul className="flex flex-col gap-2.5">
              {siteConfig.footerLinks.tools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-xs font-medium text-text-secondary hover:text-accent transition-colors duration-150 flex items-center gap-1 group"
                  >
                    {tool.label}
                    <ArrowUpRight size={10} className="opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-text-primary">
              Categories
            </h3>
            <ul className="flex flex-col gap-2.5">
              {CATEGORIES.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/category/${category.value}`}
                    className="text-xs font-medium text-text-secondary hover:text-accent transition-colors duration-150"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Company Column */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-text-primary">
              Legal & Support
            </h3>
            <ul className="flex flex-col gap-2.5">
              {siteConfig.footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium text-text-secondary hover:text-accent transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Directory Badges Section */}
        <div className="border-t border-border mt-8 pt-8">
          <h4 className="text-xs font-semibold tracking-wide uppercase text-text-primary mb-4">
            Featured On
          </h4>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Product Hunt Badge */}
            <a
              href="https://www.producthunt.com/products/toolforge-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-toolforge-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="ToolForge - 200+ free tools that run 100% in your browser. No sign-up. | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1182550&theme=dark&t=1782589546937"
                className="h-[54px] w-auto"
              />
            </a>
            {/* TheSaaSDir Badge - Add after submission */}
            {/* <a href="https://thesaasdir.com/product/toolforge?ref=badge" rel="dofollow" target="_blank" rel="noopener noreferrer">
              <img src="https://thesaasdir.com/badge/toolforge.svg" alt="Featured on TheSaaSDir" width="160" height="44" className="h-11 w-auto" />
            </a> */}
          </div>
        </div>

        {/* Lower Border & Copyright */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            &copy; {currentYear} {siteConfig.name}. Built with privacy and speed.
          </p>
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <span>Made with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>for the web community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
