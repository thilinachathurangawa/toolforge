import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/site';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms and conditions for using ${siteConfig.name}'s free online tools.`,
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'Terms of Service' }]} className="mb-6" />

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          Terms of Service
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 max-w-2xl">
          The rules for using {siteConfig.name}, in plain language.
        </p>
      </header>

      <div className="max-w-3xl space-y-8">
        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Acceptance of These Terms
          </h2>
          <p className="text-text-secondary leading-relaxed">
            By accessing or using {siteConfig.name}, you agree to these Terms of Service. If you do not agree with any part of them, please do not use the site. We may update these terms from time to time; continued use of the site after changes are posted constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            The Service
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {siteConfig.name} provides free online utilities — calculators, converters, image tools, text tools, developer tools, and more. No account or registration is required, and the tools are provided free of charge. Most tools process your data entirely in your browser; some tools contact external services to function, as described on each tool&apos;s page and in our Privacy Policy. We may add, change, suspend, or remove tools at any time without notice.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Acceptable Use
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            You agree to use {siteConfig.name} only for lawful purposes. You must not:
          </p>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Use the tools to create, process, or distribute content that is unlawful, or to infringe the rights of others.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Attempt to disrupt, overload, or interfere with the operation of the site, or access it using automated means that place unreasonable load on our infrastructure.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Use the network utilities (such as lookup, ping, or status tools) against systems you do not own or have permission to test.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Circumvent, disable, or interfere with security features of the site.</span>
            </li>
          </ul>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Your Content
          </h2>
          <p className="text-text-secondary leading-relaxed">
            You retain all rights to the files, images, and text you process with our tools. Because most tools run in your browser, that content is never transmitted to us, and we claim no ownership of it or of the results the tools produce. You are responsible for ensuring you have the right to process any content you use with the tools.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            No Professional Advice
          </h2>
          <p className="text-text-secondary leading-relaxed">
            The results produced by our tools — including financial, health, legal, and engineering calculators — are estimates for general information only. They are not financial, medical, legal, or professional advice. Always verify important calculations independently and consult a qualified professional before making decisions based on a tool&apos;s output.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Disclaimer of Warranties
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {siteConfig.name} is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. We do not guarantee that the site will be uninterrupted, error-free, or that results will be accurate or reliable.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Limitation of Liability
          </h2>
          <p className="text-text-secondary leading-relaxed">
            To the maximum extent permitted by law, {siteConfig.name} and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, profits, or business, arising out of or related to your use of (or inability to use) the site or its tools, even if advised of the possibility of such damages.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Intellectual Property
          </h2>
          <p className="text-text-secondary leading-relaxed">
            The site&apos;s design, branding, editorial content, and code are the property of {siteConfig.name} or its licensors and are protected by applicable intellectual property laws. You may not copy, reproduce, or republish substantial portions of the site without permission. This does not restrict your rights to the output you generate with the tools.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Advertising and Third-Party Links
          </h2>
          <p className="text-text-secondary leading-relaxed">
            The site is supported by advertising and may display ads served by third-party networks such as Google AdSense. Ads and any third-party links are the responsibility of the respective advertiser or site owner; we do not endorse and are not responsible for third-party content, products, or services. See our Privacy Policy for how advertising cookies are used.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Termination
          </h2>
          <p className="text-text-secondary leading-relaxed">
            We may restrict or block access to the site for any user who violates these terms or misuses the service, without prior notice. You may stop using the site at any time; since no accounts exist, no further action is needed on your part.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Changes to These Terms
          </h2>
          <p className="text-text-secondary leading-relaxed">
            We may revise these Terms of Service from time to time. The current version will always be posted on this page with its last-updated date. Material changes take effect when posted.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary mb-4">
            Contact
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Questions about these terms? Get in touch and we&apos;ll be happy to clarify.
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
            Last updated: July 9, 2026
          </p>
        </section>
      </div>
    </div>
  );
}
