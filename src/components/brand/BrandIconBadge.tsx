import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandIcon } from './BrandIcon';

interface BrandIconBadgeProps {
  /** Any lucide-react icon component, rendered with the brand-gradient stroke. */
  icon: LucideIcon;
  /** BrandIcon pixel size. Default 12. */
  size?: number;
  /** Extra wrapper classes (e.g. absolute positioning from caller). */
  className?: string;
  'aria-label'?: string;
  ariaLabel?: string;
}

/**
 * Small square-edged backing pill containing a single BrandIcon.
 * Used for icon-only overlays on media (flame badges, hover play buttons).
 *
 * Default size: 24×24 (w-6 h-6). Override via className when needed
 * (e.g. centered hover Play button: `w-10 h-10`).
 */
export function BrandIconBadge({
  icon,
  size = 12,
  className,
  ariaLabel,
  'aria-label': ariaLabelAttr,
}: BrandIconBadgeProps) {
  const label = ariaLabelAttr ?? ariaLabel;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-md backdrop-blur-md bg-black/20 border border-white/15',
        className,
      )}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      <BrandIcon icon={icon} size={size} />
    </span>
  );
}
