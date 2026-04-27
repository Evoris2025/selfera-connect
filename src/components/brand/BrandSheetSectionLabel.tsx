import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Canonical section label used inside a brand sheet to group rows / tiles.
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
        'text-[11px] font-medium text-white/40 uppercase tracking-wider px-1 mt-5 mb-3',
        className,
      )}
    >
      {children}
    </p>
  );
}
