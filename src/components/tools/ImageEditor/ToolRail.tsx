'use client';

import React from 'react';
import {
  Crop,
  Eraser,
  Lasso,
  MousePointer2,
  PaintBucket,
  Paintbrush,
  Pipette,
  Shapes,
  Square,
  Type,
  Wand2,
  Droplet,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolId } from './types';
import type { UseImageEditorReturn } from './useImageEditor';

interface ToolDef {
  id: ToolId;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}

const TOOL_GROUPS: ToolDef[][] = [
  [{ id: 'select', icon: MousePointer2, label: 'Move / Select', shortcut: 'V' }],
  [{ id: 'crop', icon: Crop, label: 'Crop', shortcut: 'C' }],
  [
    { id: 'rect-select', icon: Square, label: 'Rectangle Select' },
    { id: 'ellipse-select', icon: Circle, label: 'Ellipse Select' },
    { id: 'lasso-select', icon: Lasso, label: 'Free Lasso' },
    { id: 'magic-wand', icon: Wand2, label: 'Magic Wand' },
  ],
  [
    { id: 'brush', icon: Paintbrush, label: 'Brush', shortcut: 'B' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { id: 'bucket', icon: PaintBucket, label: 'Paint Bucket' },
    { id: 'gradient', icon: Droplet, label: 'Gradient Fill' },
    { id: 'eyedropper', icon: Pipette, label: 'Eyedropper' },
  ],
  [
    { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    { id: 'shape', icon: Shapes, label: 'Shape' },
  ],
];

export function ToolRail({ editor }: { editor: UseImageEditorReturn }) {
  return (
    <div className="flex lg:flex-col flex-row lg:w-14 w-full shrink-0 items-center gap-1 border-b lg:border-b-0 lg:border-r border-border bg-muted/30 p-1.5 overflow-x-auto lg:overflow-y-auto">
      {TOOL_GROUPS.map((group, i) => (
        <div key={i} className="flex lg:flex-col flex-row gap-1 lg:border-b border-r lg:border-r-0 border-border/60 pb-1 lg:pb-1.5 mb-0 lg:mb-1.5 pr-1.5 lg:pr-0">
          {group.map(({ id, icon: Icon, label, shortcut }) => (
            <button
              key={id}
              type="button"
              onClick={() => editor.setActiveTool(id)}
              title={shortcut ? `${label} (${shortcut})` : label}
              aria-label={label}
              aria-pressed={editor.activeTool === id}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors',
                editor.activeTool === id
                  ? 'bg-accent text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
