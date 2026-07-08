import { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { instagramAnimations, useReducedMotion, triggerHaptic } from '@/hooks/useInstagramAnimation';

interface RepostButtonProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  onToggle?: (reposted: boolean) => void;
}

export function RepostButton({ count = 0, size = 'md', onToggle }: RepostButtonProps) {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const [reposted, setReposted] = useState(false);
  const [localCount, setLocalCount] = useState(count);

  const sizeClasses = { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-7 w-7' };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    if (!prefersReducedMotion) controls.start(instagramAnimations.tap);
    const next = !reposted;
    setReposted(next);
    setLocalCount((c) => c + (next ? 1 : -1));
    onToggle?.(next);
  };

  return (
    <motion.button
      animate={controls}
      onPointerDown={handlePointerDown}
      className="flex items-center gap-1.5 touch-none select-none p-1"
      aria-label="Repost"
    >
      <Repeat2
        className={cn(
          sizeClasses[size],
          reposted ? 'text-primary' : 'text-foreground hover:text-foreground/70'
        )}
      />
      <div className="overflow-hidden h-5 min-w-[1ch]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={localCount}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-body tabular-nums text-foreground block"
          >
            {localCount > 0 ? localCount : ''}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
