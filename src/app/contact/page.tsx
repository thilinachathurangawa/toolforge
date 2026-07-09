'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: 'Contact' }]} className="mb-6" />

      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          Contact Us
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 max-w-2xl mx-auto">
          Have questions or feedback? We&apos;d love to hear from you.
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
                placeholder="Your name"
                required
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
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 resize-none"
                placeholder="Your message..."
                required
              />
            </div>

            {submitStatus === 'success' && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold text-text-primary mb-2">Email</h3>
            <p className="text-sm text-text-secondary">toolforgewebsite@gmail.com</p>
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
