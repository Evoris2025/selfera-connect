import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Canonical screen-level section label.
 * C1 spec: text-caption font-medium uppercase tracking-[0.12em] text-white/55.
 * No bold. No icons. One component, no variants.
 */
export function BrandSectionLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'text-caption font-medium uppercase tracking-[0.12em] text-white/55',
        className,
      )}
    >
      {children}
    </p>
  );
}
