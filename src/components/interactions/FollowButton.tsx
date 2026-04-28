import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  isFollowing: boolean;
  isPending?: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glass';
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'h-7 text-label px-3 min-w-[70px]',
  md: 'h-9 text-body px-4 min-w-[90px]',
  lg: 'h-11 text-body px-5 min-w-[100px]',
};

export function FollowButton({ 
  isFollowing, 
  isPending = false,
  onToggle, 
  size = 'md',
  variant = 'default',
  className,
  disabled = false,
}: FollowButtonProps) {
  const controls = useAnimationControls();
  const isFirstRender = useRef(true);
  const wasFollowing = useRef(isFollowing);
  const wasPending = useRef(isPending);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only animate if state actually changed
    if (wasFollowing.current !== isFollowing || wasPending.current !== isPending) {
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
    wasPending.current = isPending;
  }, [isFollowing, isPending, controls]);
  
  const handleClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onToggle();
  };

  // Variant-specific styles
  const getVariantClasses = () => {
    if (isFollowing) {
      // Following state - always glass/muted style
      return 'bg-secondary/80 backdrop-blur-sm border border-border/50 text-foreground hover:bg-secondary';
    }
    
    if (isPending) {
      // Pending state - muted with dashed border to indicate waiting
      return 'bg-muted/50 backdrop-blur-sm border border-dashed border-primary/50 text-muted-foreground hover:bg-muted/70';
    }
    
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-[1.02] border-0';
      case 'glass':
        return 'glass-heavy text-foreground border border-border/30 hover:bg-secondary/50';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  const getButtonText = () => {
    if (isFollowing) return 'Following';
    if (isPending) return 'Requested';
    return 'Follow';
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      animate={controls}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        'relative font-semibold rounded-xl transition-all duration-300',
        sizeClasses[size],
        getVariantClasses(),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isFollowing ? 'following' : isPending ? 'requested' : 'follow'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="block"
        >
          {getButtonText()}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
