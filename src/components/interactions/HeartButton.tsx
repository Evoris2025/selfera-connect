import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const springConfig = { type: "spring" as const, stiffness: 500, damping: 25 };

export function HeartButton({ count, active, onClick, size = 'md' }: HeartButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);
  const [countDirection, setCountDirection] = useState<'up' | 'down'>('up');
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
      prevCountRef.current = count;
    }
  }, [count]);

  const handleClick = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (!active) {
      setIsAnimating(true);
      setShowBurst(true);
      setTimeout(() => setIsAnimating(false), 400);
      setTimeout(() => setShowBurst(false), 400);
    }
    
    onClick();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      transition={springConfig}
      onClick={handleClick}
      className="flex items-center gap-1.5 relative"
    >
      <div className="relative">
        <motion.div
          animate={isAnimating ? {
            scale: [1, 1.35, 0.9, 1.1, 0.95, 1],
          } : {}}
          transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        >
          <Heart 
            className={cn(
              sizeClasses[size],
              'transition-colors duration-100',
              active 
                ? 'fill-rose-500 text-rose-500' 
                : 'text-foreground hover:text-rose-500'
            )} 
          />
        </motion.div>
        
        {/* Micro burst effect */}
        <AnimatePresence>
          {showBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-full rounded-full border-2 border-rose-500/50" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
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
            className={cn(
              'text-sm tabular-nums block',
              active ? 'text-rose-500' : 'text-foreground'
            )}
          >
            {displayCount > 0 ? displayCount : ''}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
