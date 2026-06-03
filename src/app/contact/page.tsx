import React from 'react';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants/site';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${siteConfig.name} team. We'd love to hear from you.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'Contact' }]} className="mb-6" />

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          Contact Us
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 max-w-2xl">
          Have questions or feedback? We&apos;d love to hear from you.
        </p>
      </header>

      <div className="max-w-2xl">
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 resize-none"
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors duration-200"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold text-text-primary mb-2">Email</h3>
            <p className="text-sm text-text-secondary">contact@toolforge.vercel.app</p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold text-text-primary mb-2">Response Time</h3>
            <p className="text-sm text-text-secondary">Usually within 24-48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
