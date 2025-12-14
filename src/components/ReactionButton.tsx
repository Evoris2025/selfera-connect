import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionButtonProps {
  type: 'heart';
  count: number;
  active?: boolean;
  onClick?: () => void;
}

export function ReactionButton({ count, active, onClick }: ReactionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-all duration-200',
        active ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
      )}
    >
      <Heart className={cn('h-4 w-4', active && 'fill-current')} />
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}
