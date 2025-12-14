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
    setIsAnimating(true);
    onClick?.();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1.5 text-sm transition-all duration-200',
        active ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
      )}
    >
      <Heart 
        className={cn(
          'h-4 w-4 transition-transform duration-300',
          active && 'fill-current',
          isAnimating && 'scale-125'
        )} 
      />
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}
