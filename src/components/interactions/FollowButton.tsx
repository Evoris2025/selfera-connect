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
  sm: 'h-7 text-xs px-3 min-w-[70px]',
  md: 'h-9 text-sm px-4 min-w-[90px]',
  lg: 'h-10 text-base px-5 min-w-[100px]',
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
  const wasFollowing = useRef(isFollowing);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only animate if state actually changed
    if (wasFollowing.current !== isFollowing) {
      // Quick scale pop on state change
      controls.start({
        scale: [0.95, 1.05, 1],
        transition: { 
          duration: 0.25, 
          times: [0, 0.6, 1],
          ease: "easeOut" 
        }
      });
    }
    
    wasFollowing.current = isFollowing;
  }, [isFollowing, controls]);
  
  const handleClick = () => {
    // Haptic feedback
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
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        'relative font-semibold rounded-lg transition-all duration-200',
        sizeClasses[size],
        isFollowing 
          ? 'bg-muted border border-border text-foreground hover:bg-muted/80' 
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isFollowing ? 'following' : 'follow'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="block"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
