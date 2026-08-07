'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExplainedNode } from './types';

/**
 * The nested breakdown. Renders as real nested lists so screen readers convey
 * the hierarchy, with each argument sitting under the function that uses it and
 * any argument that is itself a call expanding in place.
 */

interface Range {
  start: number;
  end: number;
}

interface TreeProps {
  nodes: ExplainedNode[];
  detailed: boolean;
  onHover: (range: Range | null) => void;
  functionHref?: (name: string) => string | undefined;
  level?: number;
}

export function FormulaTree({ nodes, detailed, onHover, functionHref, level = 0 }: TreeProps) {
  if (!nodes.length) return null;
  return (
    <ul className={cn('space-y-2', level > 0 && 'mt-2 border-l border-border pl-3 sm:pl-4')}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          detailed={detailed}
          onHover={onHover}
          functionHref={functionHref}
          level={level}
        />
      ))}
    </ul>
  );
}

interface NodeProps {
  node: ExplainedNode;
  detailed: boolean;
  onHover: (range: Range | null) => void;
  functionHref?: (name: string) => string | undefined;
  level: number;
}

function TreeNode({ node, detailed, onHover, functionHref, level }: NodeProps) {
  const [open, setOpen] = useState(level < 4);
  const isCall = node.node.type === 'call';
  const hasDetail = isCall ? node.args.length > 0 : node.children.length > 0;
  const href = isCall && functionHref ? functionHref(node.label) : undefined;

  return (
    <li
      className="rounded-md bg-background p-3 border border-border"
      onMouseEnter={() => onHover({ start: node.start, end: node.end })}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start gap-2">
        {hasDetail ? (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${node.label}`}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-4" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-accent break-all">{node.label}</span>
            <span className="text-xs text-muted-foreground">{node.kind}</span>
            {href && (
              <a
                href={href}
                className="text-xs text-accent underline underline-offset-2 hover:no-underline"
              >
                reference
              </a>
            )}
          </div>

          <p className="text-sm text-foreground">{node.description}</p>

          {detailed && node.syntax && (
            <div className="overflow-x-auto">
              <code className="text-xs font-mono text-muted-foreground whitespace-pre">{node.syntax}</code>
            </div>
          )}
        </div>
      </div>

      {open && isCall && node.args.length > 0 && (
        <ul className="mt-2 space-y-2 border-l border-border pl-3 sm:pl-4">
          {node.args.map((arg, index) => (
            <li
              key={index}
              onMouseEnter={(e) => {
                e.stopPropagation();
                onHover({ start: arg.node.start, end: arg.node.end });
              }}
              // Leaving an argument returns the highlight to its parent call
              // rather than clearing it, since the pointer is still inside it.
              onMouseLeave={(e) => {
                e.stopPropagation();
                onHover({ start: node.start, end: node.end });
              }}
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <code className="font-mono text-xs text-emerald-700 dark:text-emerald-300 break-all">
                  {arg.text}
                </code>
                <span className="text-xs font-medium text-foreground">→ {arg.paramName}</span>
                {arg.optional && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">optional</span>}
              </div>
              {detailed && (
                <p className="text-xs text-muted-foreground mt-0.5">{arg.paramDescription}</p>
              )}
              {arg.child && (
                <FormulaTree
                  nodes={[arg.child]}
                  detailed={detailed}
                  onHover={onHover}
                  functionHref={functionHref}
                  level={level + 1}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {open && !isCall && node.children.length > 0 && (
        <FormulaTree
          nodes={node.children}
          detailed={detailed}
          onHover={onHover}
          functionHref={functionHref}
          level={level + 1}
        />
      )}
    </li>
  );
}
