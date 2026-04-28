import { cn } from '@/lib/utils';
import { Building2, Briefcase, Sparkles, User } from 'lucide-react';

export type AccountType = 'individual' | 'creator' | 'professional' | 'organization';

interface AccountTypeBadgeProps {
  type: AccountType;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const typeConfig: Record<AccountType, { label: string; icon: typeof User; colorClass: string }> = {
  individual: {
    label: 'Personal',
    icon: User,
    colorClass: 'text-muted-foreground bg-muted/50',
  },
  creator: {
    label: 'Creator',
    icon: Sparkles,
    colorClass: 'text-primary bg-primary/10',
  },
  professional: {
    label: 'Professional',
    icon: Briefcase,
    colorClass: 'text-verified bg-verified/10',
  },
  organization: {
    label: 'Organisation',
    icon: Building2,
    colorClass: 'text-accent-foreground bg-accent/50',
  },
};

export function AccountTypeBadge({ 
  type, 
  size = 'sm', 
  showIcon = true,
  className 
}: AccountTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.individual;
  const Icon = config.icon;

  // Don't show badge for personal/individual accounts (default state)
  if (type === 'individual') {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'text-caption px-1.5 py-0.5' : 'text-label px-2 py-1',
        config.colorClass,
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />}
      {config.label}
    </span>
  );
}
