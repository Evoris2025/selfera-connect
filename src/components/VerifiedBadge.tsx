import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <BadgeCheck 
      className={cn('h-4 w-4 text-verified fill-verified/20', className)} 
    />
  );
}
