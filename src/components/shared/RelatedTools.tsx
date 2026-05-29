import React from 'react';
import { Tool } from '@/lib/constants/tools';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  tools: Tool[];
  title?: string;
  className?: string;
}

export function RelatedTools({
  tools,
  title = 'Related Tools',
  className,
}: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="font-display text-lg font-bold text-text-primary mb-4">{title}</h2>
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
