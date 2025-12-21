import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { instagramAnimations, useReducedMotion, triggerHaptic } from '@/hooks/useInstagramAnimation';

interface BookmarkButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BookmarkButton({
  isSaved,
  onToggle,
  size = 'md',
  className,
}: BookmarkButtonProps) {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const prevSavedRef = useRef(isSaved);
  const isFirstRender = useRef(true);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevSavedRef.current = isSaved;
      return;
    }

    if (prefersReducedMotion) {
      controls.start(instagramAnimations.reduced);
    } else if (isSaved && !prevSavedRef.current) {
      // Saving animation: compression + drop effect
      controls.start(instagramAnimations.bookmarkSave);
    } else if (!isSaved && prevSavedRef.current) {
      // Unsaving animation: subtle compression
      controls.start(instagramAnimations.bookmarkUnsave);
    }

    prevSavedRef.current = isSaved;
  }, [isSaved, controls, prefersReducedMotion]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    onToggle();
  };

  return (
    <motion.button
      animate={controls}
      onPointerDown={handlePointerDown}
      className={cn(
        'relative flex items-center justify-center p-2 rounded-full',
        'touch-none select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'hover:opacity-80 transition-opacity duration-100',
        className
      )}
      aria-label={isSaved ? 'Remove from saved' : 'Save'}
      aria-pressed={isSaved}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isSaved ? 'saved' : 'unsaved'}
          initial={false}
        >
          <Bookmark
            className={cn(
              sizeClasses[size],
              isSaved
                ? 'fill-foreground text-foreground'
                : 'text-foreground hover:text-foreground/70'
            )}
          />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
