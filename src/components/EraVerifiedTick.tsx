import { forwardRef } from 'react';
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
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
};

// Tier colors - fill colors for the shield
const tierColors: Record<VerificationTier, string> = {
  orange: '#f97316', // 5M+ subscribers
  purple: '#a855f7', // 1M+ subscribers
  blue: '#3b82f6',   // 250K+ subscribers
  green: '#10b981',  // Verified creator/pro/org with <250K subscribers
  pink: '#ec4899',   // Paid client / general paid user
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
    const fillColor = tierColors[computedTier];
    
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center', sizeClasses[size], className)}
        title={`ERA Verified${computedTier !== 'pink' ? ` (${computedTier})` : ''}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Shield shape */}
          <path
            d="M12 2L4 5.5V11C4 16.25 7.4 21.15 12 22.5C16.6 21.15 20 16.25 20 11V5.5L12 2Z"
            fill={fillColor}
          />
          {/* White checkmark */}
          <path
            d="M10.5 14.5L8 12L9.41 10.59L10.5 11.67L14.59 7.59L16 9L10.5 14.5Z"
            fill="white"
          />
        </svg>
      </div>
    );
  }
);

EraVerifiedTick.displayName = 'EraVerifiedTick';
