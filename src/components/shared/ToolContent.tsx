import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import type { Tool } from '@/lib/constants/tools';
import type { ToolLongContent } from '@/lib/content/tool-content';
import { DynamicIcon } from './DynamicIcon';

interface ToolContentProps {
  tool: Tool;
  content: ToolLongContent;
  /** Resolved related links (slug already mapped to a Tool) with their notes. */
  related: { tool: Tool; note: string }[];
}

/**
 * Renders the long-form editorial content for a tool page: intro, step-by-step
 * instructions, the ToolForge differentiator, FAQs, and related tools with
 * reasons. Driven entirely by per-tool data in tool-content.ts, so every page
 * renders unique text rather than a shared template.
 */
export function ToolContent({ tool, content, related }: ToolContentProps) {
  return (
    <>
      {/* Intro — what it does, who needs it, real-world use cases */}
      <section className="prose-tool">
        <h2 className="font-display text-xl font-bold text-text-primary mb-3">
          About the {tool.name}
        </h2>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          {content.intro.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* How to use — numbered, tool-specific */}
      <section className="prose-tool">
        <h2 className="font-display text-xl font-bold text-text-primary mb-3">
          How to Use the {tool.name}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary leading-relaxed">
          {content.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Why ToolForge — genuine differentiators */}
      <section>
        <h2 className="font-display text-xl font-bold text-text-primary mb-4">
          Why Use ToolForge&rsquo;s {tool.name}
        </h2>
        <ul className="space-y-3">
          {content.why.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20">
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="text-sm text-text-secondary leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      {content.faqs.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {content.faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-surface">
                <h3 className="font-medium text-text-primary mb-2">{faq.question}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related tools with reasons */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">
            Related Tools
          </h2>
          <div className="flex flex-col gap-3">
            {related.map(({ tool: rel, note }) => (
              <Link
                key={rel.slug}
                href={`/tools/${rel.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-accent/5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent border border-accent/20">
                  <DynamicIcon name={rel.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    {rel.name}
                    <ArrowRight
                      size={14}
                      className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                    />
                  </span>
                  <span className="block text-sm text-text-secondary leading-relaxed mt-0.5">
                    {note}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
