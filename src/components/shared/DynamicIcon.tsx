// src/components/shared/DynamicIcon.tsx
import React from 'react';
import * as Lucide from 'lucide-react';

export type IconName = keyof typeof Lucide;

interface DynamicIconProps extends Omit<React.ComponentPropsWithoutRef<'svg'>, 'name'> {
  name: string;
  size?: number;
  className?: string;
}

export function DynamicIcon({ name, size = 24, className, ...props }: DynamicIconProps) {
  // Safe lookup with fallback to HelpCircle icon
  const IconComponent = (Lucide[name as IconName] || Lucide.HelpCircle) as React.ComponentType<{
    size?: number;
    className?: string;
  }>;

  return <IconComponent size={size} className={className} {...props} />;
}
