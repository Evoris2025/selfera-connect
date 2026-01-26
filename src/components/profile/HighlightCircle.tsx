import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Highlight {
  id: string;
  name: string;
  coverUrl: string;
  itemCount: number;
}

interface HighlightCircleProps {
  highlight?: Highlight;
  isCreateButton?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function HighlightCircle({ 
  highlight, 
  isCreateButton = false, 
  onClick,
  size = 'md',
}: HighlightCircleProps) {
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  if (isCreateButton) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex flex-col items-center gap-1.5"
      >
        <div className={cn(
          "rounded-full bg-secondary border-2 border-dashed border-muted-foreground/30 flex items-center justify-center",
          sizeClasses[size]
        )}>
          <Plus className="w-6 h-6 text-muted-foreground" />
        </div>
        <span className={cn("text-muted-foreground", textSizes[size])}>New</span>
      </motion.button>
    );
  }

  if (!highlight) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5"
    >
      <div className={cn(
        "rounded-full ring-2 ring-muted-foreground/30 overflow-hidden",
        sizeClasses[size]
      )}>
        <img
          src={highlight.coverUrl}
          alt={highlight.name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className={cn(
        "text-foreground font-medium max-w-[64px] truncate",
        textSizes[size]
      )}>
        {highlight.name}
      </span>
    </motion.button>
  );
}
