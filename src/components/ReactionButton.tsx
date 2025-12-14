import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionButtonProps {
  type: 'heart';
  count: number;
  active?: boolean;
  onClick?: () => void;
}

export function ReactionButton({ count, active, onClick }: ReactionButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!active) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    }
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-colors duration-200',
        active ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'
      )}
    >
      <Heart 
        className={cn(
          'h-5 w-5 transition-colors duration-150',
          active && 'fill-rose-500 text-rose-500',
          isAnimating && 'animate-heart-pop'
        )} 
      />
      <span className={cn(
        'text-sm tabular-nums',
        active ? 'text-rose-500' : 'text-muted-foreground'
      )}>
        {count}
      </span>
    </button>
  );
}
