import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandIcon } from './BrandIcon';

interface BrandStatPillProps {
  /** Any lucide-react icon component, rendered with the brand-gradient stroke. */
  icon: LucideIcon;
  /** Pre-formatted numeric label, e.g. "12.4K". */
  value: string;
  /** BrandIcon pixel size. Default 12. */
  size?: number;
  /** Extra wrapper classes (e.g. absolute positioning from caller). */
  className?: string;
  'aria-label'?: string;
  ariaLabel?: string;
}

/**
 * Small square-edged backing pill containing a BrandIcon + a numeric label.
 * Used for "icon + count" overlays on media (eye + views, heart + likes).
 */
export function BrandStatPill({
  icon,
  value,
  size = 12,
  className,
  ariaLabel,
  'aria-label': ariaLabelAttr,
}: BrandStatPillProps) {
  const label = ariaLabelAttr ?? ariaLabel;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 h-6 rounded-md bg-black/55 border border-white/10',
        className,
      )}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      <BrandIcon icon={icon} size={size} />
      <span className="text-[11px] font-medium text-white tabular-nums leading-none">
        {value}
      </span>
    </span>
  );
}
