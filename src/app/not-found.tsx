import React from 'react';
import Link from 'next/link';
import { DynamicIcon } from '@/components/shared/DynamicIcon';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20">
            <DynamicIcon name="SearchX" size={64} />
          </div>
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-text-primary mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-text-secondary mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            <DynamicIcon name="Home" size={18} />
            Go to Homepage
          </Link>
          
          <Link
            href="/tools"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            <DynamicIcon name="Wrench" size={18} />
            Browse Tools
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-text-secondary mb-4">Popular Tools</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/tools/image-compressor" className="text-sm text-accent hover:underline">
              Image Compressor
            </Link>
            <Link href="/tools/qr-generator" className="text-sm text-accent hover:underline">
              QR Generator
            </Link>
            <Link href="/tools/password-generator" className="text-sm text-accent hover:underline">
              Password Generator
            </Link>
            <Link href="/tools/json-formatter" className="text-sm text-accent hover:underline">
              JSON Formatter
            </Link>
            <Link href="/tools/word-counter" className="text-sm text-accent hover:underline">
              Word Counter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
