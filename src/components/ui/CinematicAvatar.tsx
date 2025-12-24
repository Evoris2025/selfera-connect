import { forwardRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface CinematicAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  ring?: 'none' | 'gradient' | 'primary' | 'muted' | 'unseen';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'h-7 w-7',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
  '2xl': 'h-24 w-24',
  '3xl': 'h-32 w-32',
};

const ringPadding = {
  xs: 'p-[2px]',
  sm: 'p-[2px]',
  md: 'p-[2.5px]',
  lg: 'p-[3px]',
  xl: 'p-[3.5px]',
  '2xl': 'p-[4px]',
  '3xl': 'p-[5px]',
};

const fallbackTextSize = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
  '2xl': 'text-3xl',
  '3xl': 'text-4xl',
};

const CinematicAvatar = forwardRef<HTMLDivElement, CinematicAvatarProps>(
  ({ src, alt, fallback, size = 'md', ring = 'none', className, interactive = false, onClick }, ref) => {
    const hasRing = ring !== 'none';
    
    const ringClasses = {
      none: '',
      gradient: 'gradient-brand',
      primary: 'bg-primary',
      muted: 'bg-muted',
      unseen: 'gradient-brand animate-gradient-x bg-[length:200%_200%]',
    };

    const content = (
      <Avatar className={cn(sizeClasses[size], 'ring-2 ring-background', className)}>
        <AvatarImage src={src} alt={alt} className="object-cover" />
        <AvatarFallback className={cn('bg-secondary text-secondary-foreground font-medium', fallbackTextSize[size])}>
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
    );

    if (!hasRing) {
      if (interactive) {
        return (
          <motion.div
            ref={ref}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="cursor-pointer"
          >
            {content}
          </motion.div>
        );
      }
      return <div ref={ref}>{content}</div>;
    }

    const wrappedContent = (
      <div
        ref={ref}
        className={cn(
          'rounded-full',
          ringPadding[size],
          ringClasses[ring],
          'shadow-soft'
        )}
      >
        {content}
      </div>
    );

    if (interactive) {
      return (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="cursor-pointer"
        >
          {wrappedContent}
        </motion.div>
      );
    }

    return wrappedContent;
  }
);

CinematicAvatar.displayName = 'CinematicAvatar';

export { CinematicAvatar };
