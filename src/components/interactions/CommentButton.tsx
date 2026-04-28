import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { instagramAnimations, useReducedMotion, triggerHaptic } from '@/hooks/useInstagramAnimation';

interface CommentButtonProps {
  count: number;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  hasNewComments?: boolean;
}

export function CommentButton({ count, onClick, size = 'md', hasNewComments = false }: CommentButtonProps) {
  const controls = useAnimationControls();
  const countControls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const [displayCount, setDisplayCount] = useState(count);
  const [countDirection, setCountDirection] = useState<'up' | 'down' | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevCountRef = useRef(count);

  const sizeClasses = { sm: 'h-5 w-5', md: 'h-6 w-6', lg: 'h-7 w-7' };

  useEffect(() => {
    if (count !== prevCountRef.current) {
      setCountDirection(count > prevCountRef.current ? 'up' : 'down');
      setDisplayCount(count);
      if (!prefersReducedMotion) countControls.start(instagramAnimations.countBump);
      const timer = setTimeout(() => setCountDirection(null), 200);
      prevCountRef.current = count;
      return () => clearTimeout(timer);
    }
  }, [count, countControls, prefersReducedMotion]);

  useEffect(() => {
    if (hasNewComments) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }
  }, [hasNewComments]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    if (!prefersReducedMotion) controls.start(instagramAnimations.tap);
    onClick();
  };

  return (
    <motion.button
      animate={controls}
      onPointerDown={handlePointerDown}
      className="flex items-center gap-1.5 touch-none select-none p-1"
      aria-label="Comment"
    >
      <div className="relative">
        <MessageCircle className={cn(sizeClasses[size], 'text-foreground hover:text-foreground/70', isPulsing && 'text-primary')} />
        {isPulsing && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: 2 }}
            className="absolute inset-0 rounded-full bg-white/[0.2] pointer-events-none"
          />
        )}
      </div>
      <motion.div animate={countControls} className="overflow-hidden h-5 min-w-[1ch]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayCount}
            initial={{ y: countDirection === 'up' ? 20 : -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: countDirection === 'up' ? -20 : 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-body tabular-nums text-foreground block"
          >
            {displayCount > 0 ? displayCount : ''}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
