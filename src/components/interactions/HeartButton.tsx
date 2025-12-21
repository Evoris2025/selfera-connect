import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

export function HeartButton({ count, active, onClick, size = 'md' }: HeartButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [displayCount, setDisplayCount] = useState(count);
  const [countDirection, setCountDirection] = useState<'up' | 'down'>('up');
  const prevCountRef = useRef(count);
  const prevActiveRef = useRef(active);
  const isFirstRender = useRef(true);
  const controls = useAnimationControls();

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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Animate when liking (not active -> active)
    if (active && !prevActiveRef.current) {
      // Instagram-style scale bounce - snappy squish, dramatic overshoot, quick settle
      controls.start({
        scale: [1, 0.7, 1.35, 0.9, 1.1, 1],
        transition: { 
          duration: 0.5, 
          times: [0, 0.12, 0.32, 0.52, 0.72, 1],
          ease: [0.215, 0.61, 0.355, 1]
        }
      });

      // Create particle burst
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 60) + (Math.random() * 30 - 15),
        distance: 18 + Math.random() * 12,
        size: 4 + Math.random() * 3,
        delay: Math.random() * 0.05,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 500);
    }

    // Animate when unliking (active -> not active)
    if (!active && prevActiveRef.current) {
      controls.start({
        scale: [1, 0.9, 1],
        transition: { duration: 0.2, ease: "easeOut" }
      });
    }

    prevActiveRef.current = active;
  }, [active, controls]);

  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.75 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={handleClick}
      className="flex items-center gap-1.5 relative"
    >
      <div className="relative" style={{ overflow: 'visible' }}>
        <motion.div animate={controls}>
          <Heart 
            className={cn(
              sizeClasses[size],
              active 
                ? 'fill-rose-500 text-rose-500' 
                : 'text-foreground hover:text-rose-500/70'
            )} 
          />
        </motion.div>
        
        {/* Instagram-style particle burst */}
        <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
          <AnimatePresence>
            {particles.map((particle) => {
              const radians = (particle.angle * Math.PI) / 180;
              return (
                <motion.div
                  key={particle.id}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    x: Math.cos(radians) * particle.distance,
                    y: Math.sin(radians) * particle.distance,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 0.4,
                    delay: particle.delay,
                    ease: [0.32, 0, 0.67, 0]
                  }}
                  style={{
                    width: particle.size,
                    height: particle.size,
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500"
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Ring burst effect */}
        <AnimatePresence>
          {particles.length > 0 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-full rounded-full border-2 border-rose-500" />
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
