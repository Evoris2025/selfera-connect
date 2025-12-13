import { Heart, Info, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ReactionButtonProps {
  type: 'support' | 'informative' | 'relatable';
  count: number;
  active?: boolean;
  onClick?: () => void;
}

const reactionConfig = {
  support: {
    icon: Heart,
    activeClass: 'text-support bg-support/20 border-support/30',
    hoverClass: 'hover:text-support hover:bg-support/10',
  },
  informative: {
    icon: Info,
    activeClass: 'text-informative bg-informative/20 border-informative/30',
    hoverClass: 'hover:text-informative hover:bg-informative/10',
  },
  relatable: {
    icon: Users,
    activeClass: 'text-relatable bg-relatable/20 border-relatable/30',
    hoverClass: 'hover:text-relatable hover:bg-relatable/10',
  },
};

export function ReactionButton({ type, count, active, onClick }: ReactionButtonProps) {
  const { t } = useTranslation();
  const config = reactionConfig[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium transition-all duration-200',
        active ? config.activeClass : `text-muted-foreground ${config.hoverClass}`
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{t(`reactions.${type}`)}</span>
      {count > 0 && <span className="text-xs opacity-70">{count}</span>}
    </button>
  );
}
