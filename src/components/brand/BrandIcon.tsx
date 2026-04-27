import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandIconProps {
  /** Any lucide-react icon component. */
  icon: LucideIcon;
  /** Pixel size. Default 22. */
  size?: number;
  /** Stroke width. Default 1.75. */
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Wraps any lucide icon with the canonical SelfERA brand-gradient stroke.
 * References the global <defs id="selfera-brand-gradient"> mounted in App.tsx
 * via <BrandGradientDefs />.
 *
 * No fills. No per-icon color overrides. Use this everywhere we'd otherwise
 * inline stroke="url(#selfera-brand-gradient)".
 */
export function BrandIcon({
  icon: Icon,
  size = 22,
  strokeWidth = 1.75,
  className,
  ariaLabel,
}: BrandIconProps) {
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      stroke="url(#selfera-brand-gradient)"
      fill="none"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn('shrink-0', className)}
    />
  );
}
