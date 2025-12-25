import { forwardRef } from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const VerifiedBadge = forwardRef<SVGSVGElement, VerifiedBadgeProps>(
  ({ className, size = 'md' }, ref) => {
    return (
      <BadgeCheck 
        ref={ref}
        className={cn(sizeClasses[size], 'text-verified fill-verified/20', className)} 
      />
    );
  }
);

VerifiedBadge.displayName = 'VerifiedBadge';
