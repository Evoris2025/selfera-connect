import { Heart, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionButtonProps {
  type: 'heart' | 'hug';
  count: number;
  active?: boolean;
  onClick?: () => void;
}

const reactionConfig = {
  heart: {
    icon: Heart,
    activeClass: 'text-rose-500 bg-rose-500/20 border-rose-500/30',
    hoverClass: 'hover:text-rose-500 hover:bg-rose-500/10',
  },
  hug: {
    icon: HeartHandshake,
    activeClass: 'text-amber-500 bg-amber-500/20 border-amber-500/30',
    hoverClass: 'hover:text-amber-500 hover:bg-amber-500/10',
  },
};

export function ReactionButton({ type, count, active, onClick }: ReactionButtonProps) {
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
      <Icon className={cn('h-4 w-4', active && 'fill-current')} />
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}
