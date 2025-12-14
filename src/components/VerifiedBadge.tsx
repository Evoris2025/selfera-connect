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

export function VerifiedBadge({ className, size = 'md' }: VerifiedBadgeProps) {
  return (
    <BadgeCheck 
      className={cn(sizeClasses[size], 'text-verified fill-verified/20', className)} 
    />
  );
}
