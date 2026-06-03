import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/site';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn more about ${siteConfig.name} and our mission to provide free online tools.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'About' }]} className="mb-6" />

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          About {siteConfig.name}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 max-w-2xl">
          Free online tools that respect your privacy and work entirely in your browser.
        </p>
      </header>

      <div className="max-w-3xl space-y-8">
        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Our Mission
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {siteConfig.name} was built with a simple goal: to provide powerful, free online tools that anyone can use without signing up or worrying about their data privacy. All our tools run 100% in your browser, meaning your data never leaves your device.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Privacy First
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Unlike many online tools, we don&apos;t collect, store, or transmit your data. Every image you compress, every password you generate, and every text you process stays on your device. We believe privacy shouldn&apos;t be a premium feature—it should be the standard.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            What We Offer
          </h2>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Image tools: compress, convert, resize, and crop images without uploading them</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Developer utilities: JSON formatters, encoders, hash generators, and more</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Text tools: word counters, lorem ipsum generators, markdown previewers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Security tools: password generators, QR code generators</span>
            </li>
          </ul>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Open Source
          </h2>
          <p className="text-text-secondary leading-relaxed">
            We believe in transparency. Our code is open source, and we welcome contributions from the community. Check out our repository to see how our tools work or contribute improvements.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Have questions, suggestions, or want to report a bug? We&apos;d love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors duration-200"
          >
            Contact Us
          </a>
        </section>
      </div>
    </div>
  );
}
