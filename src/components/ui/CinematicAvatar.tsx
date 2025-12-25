import { forwardRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

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

const iconSize = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-9 w-9',
  '2xl': 'h-11 w-11',
  '3xl': 'h-14 w-14',
};

const CinematicAvatar = forwardRef<HTMLDivElement, CinematicAvatarProps>(
  ({ src, alt, fallback, size = 'md', ring = 'none', className, interactive = false, onClick }, ref) => {
    const [imageError, setImageError] = useState(false);
    const hasRing = ring !== 'none';
    const showImage = src && !imageError;
    
    const ringClasses = {
      none: '',
      gradient: 'gradient-brand',
      primary: 'bg-primary',
      muted: 'bg-muted',
      unseen: 'gradient-brand animate-gradient-x bg-[length:200%_200%]',
    };

    const content = (
      <Avatar className={cn(sizeClasses[size], 'ring-2 ring-background', className)}>
        {showImage && (
          <AvatarImage 
            src={src} 
            alt={alt} 
            className="object-cover"
            loading="eager"
            onError={() => setImageError(true)}
          />
        )}
        <AvatarFallback 
          className="bg-gradient-to-br from-primary/60 to-secondary/80 text-primary-foreground flex items-center justify-center"
          delayMs={showImage ? 600 : 0}
        >
          <User className={cn(iconSize[size], 'opacity-70')} />
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
