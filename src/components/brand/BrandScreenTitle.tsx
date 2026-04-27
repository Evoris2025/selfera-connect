import * as React from 'react';
import { cn } from '@/lib/utils';

interface BrandScreenTitleProps {
  /** Lowercase setup word(s), e.g. "your" in "your INBOX." */
  setup: string;
  /** Emphasis word, rendered UPPERCASE, e.g. "INBOX". */
  emphasis: string;
  /** Optional subtitle line. Rendered lowercase per C4. */
  subtitle?: string;
  /** 'hero' = text-4xl, 'screen' = text-2xl. Default 'screen'. */
  size?: 'hero' | 'screen';
  className?: string;
}

/**
 * Screen-level brand title following the SelfERA logo's typographic logic:
 *   <setup> <EMPHASIS><gradient .>
 *
 * The brand gradient is reserved for the trailing period only.
 * For the sheet-scoped equivalent, use <BrandSheetTitle>.
 */
export function BrandScreenTitle({
  setup,
  emphasis,
  subtitle,
  size = 'screen',
  className,
}: BrandScreenTitleProps) {
  const upper = emphasis.toUpperCase();
  const sizeClass = size === 'hero' ? 'text-4xl' : 'text-2xl';
  return (
    <div className={cn('flex flex-col', className)}>
      <h1 className={cn(sizeClass, 'font-bold tracking-tight leading-tight')}>
        <span className="font-medium text-white">{setup} </span>
        <span className="font-extrabold text-white">{upper}</span>
        <span className="text-gradient-brand">.</span>
      </h1>
      {subtitle && (
        <p className="text-white/55 text-[13px] mt-1 lowercase">{subtitle}</p>
      )}
    </div>
  );
}
