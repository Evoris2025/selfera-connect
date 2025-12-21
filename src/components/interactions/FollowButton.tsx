import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'h-7 text-xs px-3',
  md: 'h-9 text-sm px-4',
  lg: 'h-10 text-base px-5',
};

export function FollowButton({ 
  isFollowing, 
  onToggle, 
  size = 'md',
  className,
  disabled = false,
}: FollowButtonProps) {
  const controls = useAnimationControls();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Trigger pop animation on state change
    controls.start({
      scale: [1, 1.15, 1],
      transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
    });
  }, [isFollowing, controls]);
  
  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onToggle();
  };
  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      animate={controls}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        'relative font-semibold rounded-md overflow-hidden transition-colors duration-150',
        sizeClasses[size],
        isFollowing 
          ? 'bg-transparent border border-border text-foreground hover:bg-muted' 
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isFollowing ? 'following' : 'follow'}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="block"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
