import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EraVerifiedTick, VerificationTier } from '@/components/EraVerifiedTick';
import { cn } from '@/lib/utils';

interface EraVerifiedTooltipProps {
  tier?: VerificationTier;
  subscriberCount?: number;
  isClient?: boolean;
  userEmail?: string;
  size?: 'sm' | 'md';
  className?: string;
  children?: ReactNode;
}

const tierDescriptions: Record<VerificationTier, { title: string; description: string }> = {
  orange: {
    title: 'ERA Verified · Legendary',
    description: 'This account has achieved legendary status with over 5 million subscribers.',
  },
  purple: {
    title: 'ERA Verified · Elite',
    description: 'This account is verified with over 1 million subscribers.',
  },
  blue: {
    title: 'ERA Verified · Established',
    description: 'This account is verified with over 250,000 subscribers.',
  },
  green: {
    title: 'ERA Verified · Professional',
    description: 'This account is verified as a professional, creator, or organization on SelfERA.',
  },
  pink: {
    title: 'ERA Verified · Member',
    description: 'This account is verified as a paid member of SelfERA.',
  },
};

export function EraVerifiedTooltip({
  tier = 'green',
  subscriberCount,
  isClient,
  userEmail,
  size = 'md',
  className,
  children,
}: EraVerifiedTooltipProps) {
  const { title, description } = tierDescriptions[tier];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex', className)}>
          {children || (
            <EraVerifiedTick
              tier={tier}
              subscriberCount={subscriberCount}
              isClient={isClient}
              userEmail={userEmail}
              size={size}
            />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-[250px] text-center"
      >
        <p className="font-semibold text-sm mb-1">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
