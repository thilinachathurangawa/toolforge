// src/app/page.tsx
import React, { Suspense } from 'react';
import { HomePageClient } from './HomePageClient';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="h-8 w-48 mx-auto rounded-lg bg-muted animate-pulse" />
        </div>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
