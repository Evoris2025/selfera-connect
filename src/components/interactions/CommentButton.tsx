import { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CommentButtonProps {
  count: number;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  hasNewComments?: boolean;
}

const springConfig = { type: "spring" as const, stiffness: 500, damping: 25 };

export function CommentButton({ count, onClick, size = 'md', hasNewComments = false }: CommentButtonProps) {
  const [displayCount, setDisplayCount] = useState(count);
  const [countDirection, setCountDirection] = useState<'up' | 'down'>('up');
  const [isPulsing, setIsPulsing] = useState(false);
  const prevCountRef = useRef(count);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  useEffect(() => {
    if (count !== prevCountRef.current) {
      setCountDirection(count > prevCountRef.current ? 'up' : 'down');
      setDisplayCount(count);
      
      // Pulse on new comments
      if (count > prevCountRef.current) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 300);
      }
      
      prevCountRef.current = count;
    }
  }, [count]);

  useEffect(() => {
    if (hasNewComments) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 300);
    }
  }, [hasNewComments]);

  const handleClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    onClick();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      transition={springConfig}
      onClick={handleClick}
      className="flex items-center gap-1.5"
    >
      <motion.div
        animate={isPulsing ? {
          scale: [1, 1.15, 1],
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <MessageCircle 
          className={cn(
            sizeClasses[size],
            'text-foreground hover:text-muted-foreground transition-colors',
            isPulsing && 'text-primary'
          )} 
        />
      </motion.div>
      
      {/* Animated count */}
      <div className="overflow-hidden h-5 min-w-[1ch]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayCount}
            initial={{ 
              y: countDirection === 'up' ? 20 : -20, 
              opacity: 0 
            }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ 
              y: countDirection === 'up' ? -20 : 20, 
              opacity: 0 
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm tabular-nums text-foreground block"
          >
            {displayCount > 0 ? displayCount : ''}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
