import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { instagramAnimations, useReducedMotion, triggerHaptic } from '@/hooks/useInstagramAnimation';

interface HeartButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

interface Particle {
  id: number;
  angle: number;
  scale: number;
}

export function HeartButton({ count, active, onClick, size = 'md', layout = 'horizontal' }: HeartButtonProps) {
  const controls = useAnimationControls();
  const countControls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [displayCount, setDisplayCount] = useState(count);
  const [countDirection, setCountDirection] = useState<'up' | 'down' | null>(null);
  const prevActiveRef = useRef(active);
  const prevCountRef = useRef(count);
  const isFirstRender = useRef(true);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        angle: (360 / 8) * i,
        scale: 0.4 + Math.random() * 0.4,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 450);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevActiveRef.current = active;
      return;
    }

    if (prefersReducedMotion) {
      controls.start(instagramAnimations.reduced);
    } else if (active && !prevActiveRef.current) {
      controls.start(instagramAnimations.like);
      generateParticles();
    } else if (!active && prevActiveRef.current) {
      controls.start(instagramAnimations.unlike);
    }

    prevActiveRef.current = active;
  }, [active, controls, generateParticles, prefersReducedMotion]);

  useEffect(() => {
    if (count !== prevCountRef.current) {
      setCountDirection(count > prevCountRef.current ? 'up' : 'down');
      setDisplayCount(count);
      if (!prefersReducedMotion) {
        countControls.start(instagramAnimations.countBump);
      }
      const timer = setTimeout(() => setCountDirection(null), 200);
      prevCountRef.current = count;
      return () => clearTimeout(timer);
    }
  }, [count, countControls, prefersReducedMotion]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    onClick();
  };

  return (
    <motion.button
      animate={controls}
      onPointerDown={handlePointerDown}
      className={cn(
        "flex items-center relative touch-none select-none p-1",
        layout === 'vertical' ? 'flex-col gap-1' : 'gap-1.5'
      )}
      aria-label={active ? 'Unlike' : 'Like'}
      aria-pressed={active}
    >
      <div className="relative" style={{ overflow: 'visible' }}>
        <Heart 
          className={cn(
            sizeClasses[size],
            active ? 'text-primary fill-current' : 'text-foreground hover:text-primary/70'
          )}
        />
        
        <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: particle.scale,
                  x: Math.cos(particle.angle * Math.PI / 180) * 20,
                  y: Math.sin(particle.angle * Math.PI / 180) * 20,
                }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70"
              />
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {particles.length > 0 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-full rounded-full border-2 border-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <motion.div animate={countControls} className="overflow-hidden h-5 min-w-[1ch]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayCount}
            initial={{ y: countDirection === 'up' ? 20 : -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: countDirection === 'up' ? -20 : 20, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn('text-sm tabular-nums block', active ? 'text-primary' : 'text-foreground')}
          >
            {displayCount > 0 ? displayCount : ''}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
