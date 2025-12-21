import { useEffect, useRef, useState } from 'react';
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

interface Particle {
  id: number;
  angle: number;
  distance: number;
}

function ParticleBurst({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    // Only burst when going from false to true (not following -> following)
    if (trigger && !prevTrigger.current) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 45) + (Math.random() * 20 - 10),
        distance: 20 + Math.random() * 15,
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 600);
    }
    prevTrigger.current = trigger;
  }, [trigger]);

  return (
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
                scale: 1, 
                opacity: 1 
              }}
              animate={{ 
                x: Math.cos(radians) * particle.distance,
                y: Math.sin(radians) * particle.distance,
                scale: 0,
                opacity: 0
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.32, 0, 0.67, 0] 
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary"
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

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
        'relative font-semibold rounded-md transition-colors duration-150',
        sizeClasses[size],
        isFollowing 
          ? 'bg-transparent border border-border text-foreground hover:bg-muted' 
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ overflow: 'visible' }}
    >
      <ParticleBurst trigger={isFollowing} />
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
