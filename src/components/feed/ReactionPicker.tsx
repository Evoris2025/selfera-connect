import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  springTransitions, 
  generateBurstParticles, 
  BurstParticle,
  buttonPressTransition 
} from '@/hooks/useMicroAnimations';

export type ReactionType = 'like' | 'relatable' | 'inspiring' | 'support' | 'curious';

interface Reaction {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}

const reactions: Reaction[] = [
  { type: 'like', emoji: '❤️', label: 'Like', color: 'hsl(0, 75%, 60%)' },
  { type: 'relatable', emoji: '🤝', label: 'Relatable', color: 'hsl(200, 80%, 55%)' },
  { type: 'inspiring', emoji: '✨', label: 'Inspiring', color: 'hsl(45, 90%, 55%)' },
  { type: 'support', emoji: '🫂', label: 'Support', color: 'hsl(155, 55%, 50%)' },
  { type: 'curious', emoji: '🤔', label: 'Curious', color: 'hsl(270, 60%, 60%)' },
];

interface ReactionPickerProps {
  isOpen: boolean;
  onSelect: (type: ReactionType) => void;
  currentReaction?: ReactionType | null;
  onClose: () => void;
}

export function ReactionPicker({ isOpen, onSelect, currentReaction, onClose }: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const [burstParticles, setBurstParticles] = useState<{ reactionType: ReactionType; particles: BurstParticle[] } | null>(null);

  const triggerBurst = useCallback((type: ReactionType, color: string) => {
    const particles = generateBurstParticles(10, color);
    setBurstParticles({ reactionType: type, particles });
    setTimeout(() => setBurstParticles(null), 500);
  }, []);

  const handleSelect = (type: ReactionType) => {
    const reaction = reactions.find(r => r.type === type);
    if (reaction) {
      triggerBurst(type, reaction.color);
    }
    // Small delay so burst animation starts before closing
    setTimeout(() => {
      onSelect(type);
      onClose();
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={springTransitions.bouncy}
          className="absolute bottom-full left-0 mb-2 z-50"
        >
          <div className="flex items-center gap-1.5 px-3 py-2.5 bg-card/95 backdrop-blur-xl rounded-full shadow-elevated border border-border/30">
            {reactions.map((reaction, index) => (
              <motion.button
                key={reaction.type}
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.035, 
                  ...springTransitions.elastic
                }}
                whileTap={{ scale: 0.85 }}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                onClick={() => handleSelect(reaction.type)}
                className={cn(
                  'relative p-2 rounded-full transition-colors',
                  currentReaction === reaction.type && 'bg-primary/20'
                )}
              >
                <motion.span
                  animate={{
                    scale: hoveredReaction === reaction.type ? 1.5 : 1,
                    y: hoveredReaction === reaction.type ? -10 : 0,
                    rotate: hoveredReaction === reaction.type ? [0, -10, 10, -5, 5, 0] : 0,
                  }}
                  transition={springTransitions.bouncy}
                  className="text-2xl block"
                >
                  {reaction.emoji}
                </motion.span>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredReaction === reaction.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={springTransitions.snappy}
                      className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-foreground text-background text-xs font-semibold rounded-md whitespace-nowrap shadow-lg"
                    >
                      {reaction.label}
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Particle burst on selection */}
                <AnimatePresence>
                  {burstParticles?.reactionType === reaction.type && (
                    <>
                      {burstParticles.particles.map((particle) => (
                        <motion.div
                          key={particle.id}
                          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            opacity: 0, 
                            scale: particle.scale,
                            x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                            y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                          }}
                          transition={{ 
                            duration: 0.4, 
                            delay: particle.delay,
                            ease: [0.25, 0.46, 0.45, 0.94] 
                          }}
                          className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                          style={{ backgroundColor: particle.color || reaction.color }}
                        />
                      ))}
                      {/* Ring burst */}
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0.9 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full border-2 pointer-events-none"
                        style={{ borderColor: reaction.color }}
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Current selection indicator */}
                {currentReaction === reaction.type && (
                  <motion.div
                    layoutId="selectedReaction"
                    className="absolute inset-0 rounded-full bg-primary/15 -z-10"
                    transition={springTransitions.smooth}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ReactionButtonProps {
  postId: string;
  currentReaction?: ReactionType | null;
  count: number;
  onReact: (type: ReactionType | null) => void;
}

export function ReactionButton({ postId, currentReaction, count, onReact }: ReactionButtonProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [localBurst, setLocalBurst] = useState<BurstParticle[] | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const buttonControls = useAnimationControls();

  const triggerLocalBurst = useCallback((color?: string) => {
    const particles = generateBurstParticles(8, color);
    setLocalBurst(particles);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([5, 30, 5]);
    setTimeout(() => setLocalBurst(null), 450);
  }, []);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setIsPickerOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTimeout(() => {
      if (!isLongPressing) {
        setIsPickerOpen(false);
      }
    }, 200);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setIsPickerOpen(true);
      if (navigator.vibrate) navigator.vibrate(10);
    }, 400);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!isLongPressing) {
      handleQuickTap();
    }
    setIsLongPressing(false);
  };

  const handleQuickTap = async () => {
    const newReaction = currentReaction ? null : 'like';
    if (newReaction === 'like') {
      triggerLocalBurst('hsl(0, 75%, 60%)');
      await buttonControls.start({
        scale: [1, 1.3, 0.9, 1.1, 1],
        transition: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 1] }
      });
    }
    onReact(newReaction);
  };

  const handleClick = () => {
    if (!isPickerOpen) {
      handleQuickTap();
    }
  };

  const handleSelect = (type: ReactionType) => {
    const reaction = reactions.find(r => r.type === type);
    if (reaction && type !== currentReaction) {
      triggerLocalBurst(reaction.color);
    }
    onReact(currentReaction === type ? null : type);
    setIsPickerOpen(false);
  };

  const currentEmoji = currentReaction 
    ? reactions.find(r => r.type === currentReaction)?.emoji 
    : null;

  const currentColor = currentReaction
    ? reactions.find(r => r.type === currentReaction)?.color
    : undefined;

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ReactionPicker
        isOpen={isPickerOpen}
        onSelect={handleSelect}
        currentReaction={currentReaction}
        onClose={() => setIsPickerOpen(false)}
      />

      <motion.button
        animate={buttonControls}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        transition={buttonPressTransition}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 transition-colors group relative',
          currentReaction ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <div className="relative">
          <motion.span
            key={currentReaction || 'default'}
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springTransitions.elastic}
            className="text-xl block"
          >
            {currentEmoji || (
              <svg
                className={cn(
                  'h-6 w-6 transition-colors',
                  currentReaction ? 'fill-current' : 'fill-none stroke-current'
                )}
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            )}
          </motion.span>

          {/* Burst particles */}
          <AnimatePresence>
            {localBurst && localBurst.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: particle.scale,
                  x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                  y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                }}
                transition={{ 
                  duration: 0.4, 
                  delay: particle.delay,
                  ease: [0.25, 0.46, 0.45, 0.94] 
                }}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{ backgroundColor: particle.color || currentColor || 'hsl(var(--primary))' }}
              />
            ))}
          </AnimatePresence>

          {/* Ring burst */}
          <AnimatePresence>
            {localBurst && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{ borderColor: currentColor || 'hsl(var(--primary))' }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Count with animated transition */}
        <AnimatePresence mode="popLayout">
          {count > 0 && (
            <motion.span 
              key={count}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="text-sm font-medium tabular-nums"
            >
              {count >= 1000 ? `${(count/1000).toFixed(1)}K` : count}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
