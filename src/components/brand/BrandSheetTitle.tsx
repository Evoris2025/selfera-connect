import * as React from 'react';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface BrandSheetTitleProps {
  /** Lowercase setup word(s), e.g. "your" in "your WORK." */
  setup: string;
  /** Uppercase emphasis word, e.g. "WORK" — will be uppercased automatically. */
  emphasis: string;
  /**
   * Apply the brand gradient to the entire emphasis word in addition to the period.
   * Default false (only the period gets the gradient — the SelfERA logo pattern).
   */
  gradientEmphasis?: boolean;
  /** Optional subtitle — also serves as the a11y description. */
  subtitle?: React.ReactNode;
  /** Hidden a11y description (used when no visible subtitle is provided). */
  srDescription?: string;
  className?: string;
}

/**
 * Branded sheet title following the SelfERA logo's typographic logic:
 *   <setup> <EMPHASIS><gradient .>
 *
 * e.g. setup="your" emphasis="WORK" -> "your WORK." with the period in the
 * canonical brand gradient.
 */
export function BrandSheetTitle({
  setup,
  emphasis,
  gradientEmphasis = false,
  subtitle,
  srDescription,
  className,
}: BrandSheetTitleProps) {
  const upper = emphasis.toUpperCase();
  return (
    <SheetHeader className={cn('text-left mb-1 px-1', className)}>
      <SheetTitle className="text-lg font-extrabold tracking-tight text-white leading-tight">
        <span className="font-medium text-white/85">{setup} </span>
        <span className={cn('font-extrabold', gradientEmphasis && 'text-gradient-brand')}>
          {upper}
        </span>
        <span className="text-gradient-brand">.</span>
      </SheetTitle>
      {subtitle ? (
        <SheetDescription className="text-xs text-white/50 mt-0.5">
          {subtitle}
        </SheetDescription>
      ) : (
        <SheetDescription className="sr-only">
          {srDescription ?? `${setup} ${upper}`}
        </SheetDescription>
      )}
    </SheetHeader>
  );
}
