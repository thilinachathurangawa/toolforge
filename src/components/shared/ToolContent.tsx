import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import type { Tool } from '@/lib/constants/tools';
import type { ToolLongContent, ToolExtraSection } from '@/lib/content/tool-content';
import { DynamicIcon } from './DynamicIcon';

interface ToolContentProps {
  tool: Tool;
  content: ToolLongContent;
  /** Resolved related links (slug already mapped to a Tool) with their notes. */
  related: { tool: Tool; note: string }[];
}

/** One optional H2 section: prose, an optional formula callout, examples, table. */
function ExtraSection({ sec }: { sec: ToolExtraSection }) {
  return (
    <section className="prose-tool">
      <h2 className="font-display text-xl font-bold text-text-primary mb-3">
        {sec.heading}
      </h2>
      <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
        {sec.body.map((para, j) => (
          <p key={j}>{para}</p>
        ))}
      </div>
      {sec.formula && (
        <div className="mt-3 rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-text-primary overflow-x-auto">
          {sec.formula}
        </div>
      )}
      {sec.examples && sec.examples.length > 0 && (
        <ul className="mt-3 list-disc list-inside space-y-2 text-sm text-text-secondary leading-relaxed">
          {sec.examples.map((ex, j) => (
            <li key={j}>{ex}</li>
          ))}
        </ul>
      )}
      {sec.table && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {sec.table.headers.map((h, j) => (
                  <th
                    key={j}
                    className="border border-border bg-surface px-3 py-2 text-left font-medium text-text-primary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sec.table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className="border border-border px-3 py-2 text-text-secondary"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/**
 * Renders the long-form editorial content for a tool page: intro, step-by-step
 * instructions, the ToolForge differentiator, FAQs, and related tools with
 * reasons. Driven entirely by per-tool data in tool-content.ts, so every page
 * renders unique text rather than a shared template.
 */
export function ToolContent({ tool, content, related }: ToolContentProps) {
  const sections = content.sections ?? [];
  const sectionsAt = (placement: NonNullable<ToolExtraSection['placement']>) =>
    sections
      .filter((s) => (s.placement ?? 'after-how-to-use') === placement)
      .map((sec, i) => <ExtraSection key={`${placement}-${i}`} sec={sec} />);

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

      {sectionsAt('after-about')}

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

      {sectionsAt('after-how-to-use')}

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

      {sectionsAt('after-why')}

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
