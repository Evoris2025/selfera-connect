import { EraVerifiedTick, type VerificationTier } from '@/components/EraVerifiedTick';
import { cn } from '@/lib/utils';

// Re-export so Explore-only files can import the tier type from the wrapper
// module rather than reaching into the underlying badge component directly.
export type { VerificationTier };

/**
 * Explore-only wrapper around <EraVerifiedTick />.
 *
 * Single integration point for badge rendering inside Explore surfaces so we
 * have one file to swap when the real tier system gets fixed app-wide.
 *
 * - Pass-through `tier` (EraVerifiedTick already accepts `tier` directly).
 * - Renders nothing if tier is null.
 * - Sizing: 'sm' (12px, default — inline with text-body) or 'md' (14px).
 */

interface ExploreVerifiedTickProps {
  tier: VerificationTier | null;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses: Record<NonNullable<ExploreVerifiedTickProps['size']>, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
};

export function ExploreVerifiedTick({ tier, size = 'sm', className }: ExploreVerifiedTickProps) {
  if (tier === null) return null;
  return (
    <EraVerifiedTick
      tier={tier}
      className={cn(sizeClasses[size], 'flex-shrink-0', className)}
    />
  );
}
