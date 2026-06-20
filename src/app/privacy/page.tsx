import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/site';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Learn how ${siteConfig.name} protects your privacy and handles your data.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} className="mb-6" />

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 max-w-2xl">
          Your privacy is our priority. Learn how we protect your data.
        </p>
      </header>

      <div className="max-w-3xl space-y-8">
        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Data Processing Location
          </h2>
          <p className="text-text-secondary leading-relaxed">
            All tools on {siteConfig.name} run 100% in your browser. Your data never leaves your device. We do not collect, store, or transmit any of your files, images, text, or personal information to our servers.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Information We Collect
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            We collect minimal information solely to improve our service:
          </p>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Analytics Data:</strong> Anonymous usage statistics via Google Analytics and Vercel Analytics to understand how our tools are used</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Performance Data:</strong> Page load times and performance metrics via Vercel Speed Insights</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Contact Information:</strong> Only when you voluntarily submit our contact form</span>
            </li>
          </ul>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Cookies and Local Storage
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            We use cookies and local storage for:
          </p>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Analytics and performance tracking (with your consent where required)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Remembering your preferences (e.g., theme settings)</span>
            </li>
          </ul>
          <p className="text-text-secondary leading-relaxed mt-4">
            You can disable cookies in your browser settings, though this may affect some functionality.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Third-Party Services
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            We use the following third-party services:
          </p>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Google Analytics:</strong> For anonymous usage analytics</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Vercel Analytics & Speed Insights:</strong> For performance monitoring</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Resend:</strong> For sending contact form emails (when you submit the form)</span>
            </li>
          </ul>
          <p className="text-text-secondary leading-relaxed mt-4">
            These services have their own privacy policies, and we encourage you to review them.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Data Security
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Since your data never leaves your device when using our tools, the primary security measure is your own browser and device security. For contact form submissions, we use industry-standard encryption and secure transmission protocols.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Children&apos;s Privacy
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Changes to This Policy
          </h2>
          <p className="text-text-secondary leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page. You are advised to review this privacy policy periodically for any changes.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Contact Us
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            If you have any questions about this privacy policy or our data practices, please contact us.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors duration-200"
          >
            Contact Us
          </a>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <p className="text-sm text-text-secondary">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </section>
      </div>
    </div>
  );
}
