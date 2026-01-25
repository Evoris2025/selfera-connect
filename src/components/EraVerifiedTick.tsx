import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VerificationTier = 'pink' | 'green' | 'blue' | 'purple' | 'orange';

interface EraVerifiedTickProps {
  className?: string;
  size?: 'sm' | 'md';
  tier?: VerificationTier;
  /** Number of paid subscribers for automatic tier calculation */
  subscriberCount?: number;
  /** If true, always shows pink tier (paid client) */
  isClient?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

const tickSizeClasses = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
};

// Tier colors - fully colored circular badge with white tick
const tierClasses: Record<VerificationTier, string> = {
  orange: 'bg-orange-500', // 5M+ subscribers
  purple: 'bg-purple-500', // 1M+ subscribers
  blue: 'bg-blue-500',     // 250K+ subscribers
  green: 'bg-emerald-500', // Verified creator/pro/org with <250K subscribers
  pink: 'bg-pink-500',     // Paid client / general paid user
};

/**
 * Calculate verification tier based on subscriber count
 * Apply in descending order: Orange → Purple → Blue → Green → Pink
 */
export function calculateVerificationTier(
  subscriberCount: number = 0,
  isClient: boolean = false
): VerificationTier {
  // Clients always get pink tier
  if (isClient) return 'pink';
  
  // Apply tier logic in descending order
  if (subscriberCount >= 5_000_000) return 'orange';
  if (subscriberCount >= 1_000_000) return 'purple';
  if (subscriberCount >= 250_000) return 'blue';
  
  // Default for verified creators/professionals/organizations with <250K subscribers
  return 'green';
}

export const EraVerifiedTick = forwardRef<HTMLDivElement, EraVerifiedTickProps>(
  ({ className, size = 'md', tier, subscriberCount = 0, isClient = false }, ref) => {
    // Calculate tier if not explicitly provided
    const computedTier = tier || calculateVerificationTier(subscriberCount, isClient);
    
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          sizeClasses[size],
          tierClasses[computedTier],
          className
        )}
        title={`ERA Verified${computedTier !== 'pink' ? ` (${computedTier})` : ''}`}
      >
        <Check className={cn('text-white stroke-[3]', tickSizeClasses[size])} />
      </div>
    );
  }
);

EraVerifiedTick.displayName = 'EraVerifiedTick';
