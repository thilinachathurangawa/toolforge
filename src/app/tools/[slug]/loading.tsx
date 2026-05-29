import React from 'react';

export default function ToolPageLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 w-48 bg-muted rounded mb-6" />
      <div className="h-10 w-2/3 max-w-lg bg-muted rounded mb-3" />
      <div className="h-4 w-full max-w-xl bg-muted rounded mb-8" />
      <div className="h-[50px] md:h-[90px] max-w-[728px] mx-auto bg-muted rounded-xl mb-8" />
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
        <div className="hidden lg:block space-y-6">
          <div className="h-[250px] bg-muted rounded-xl" />
          <div className="h-[400px] bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
