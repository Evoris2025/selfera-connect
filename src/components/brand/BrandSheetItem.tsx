import * as React from 'react';
import { cn } from '@/lib/utils';

interface BrandSheetItemProps {
  /** Gradient-stroked icon node — should reference url(#selfera-brand-gradient). */
  icon?: React.ReactNode;
  /** Primary label text. */
  title: React.ReactNode;
  /** Secondary line — timestamp, helper, count, etc. */
  meta?: React.ReactNode;
  /** Right-aligned slot — chevron, count, control. */
  right?: React.ReactNode;
  /**
   * Border/outline color. Accepts any valid CSS color string. Defaults to
   * the SelfERA primary token (HSL var). Pass a brand stop or per-category
   * color when context demands it.
   */
  accentColor?: string;
  /** Whole row click handler — renders as <button> when provided. */
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Canonical list-style row for sheets. Outline-only — dark surface with a
 * thin brand-tinted border. NO filled tints, NO heavy borders.
 */
export function BrandSheetItem({
  icon,
  title,
  meta,
  right,
  accentColor,
  onClick,
  className,
  ariaLabel,
}: BrandSheetItemProps) {
  const Comp: 'button' | 'div' = onClick ? 'button' : 'div';
  const accent = accentColor ?? 'hsl(var(--primary))';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left',
        'bg-white/[0.03] border transition-colors duration-150',
        onClick && 'hover:bg-white/[0.05] cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40',
        className,
      )}
      style={{ borderColor: `color-mix(in oklab, ${accent} 30%, transparent)` }}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="text-body font-semibold text-white truncate">{title}</span>
        {meta && (
          <span className="text-label text-white/50 mt-0.5 truncate">{meta}</span>
        )}
      </span>
      {right && <span className="shrink-0 flex items-center">{right}</span>}
    </Comp>
  );
}
