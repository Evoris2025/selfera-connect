import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Canonical section label used inside a brand sheet to group rows / tiles.
 * C1: text-caption font-medium uppercase tracking-[0.12em] text-white/55.
 *
 *   <BrandSheetSectionLabel>Recent</BrandSheetSectionLabel>
 */
export function BrandSheetSectionLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'text-caption font-medium uppercase tracking-[0.12em] text-white/55 px-1 mt-5 mb-3',
        className,
      )}
    >
      {children}
    </p>
  );
}
