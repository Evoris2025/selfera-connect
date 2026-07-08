import { useState, useRef, useCallback, type TouchEvent, type ReactNode } from 'react';
import { ICON_SIZE } from "@/lib/scale";
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  springTransitions, 
  generateBurstParticles, 
  BurstParticle,
  buttonPressTransition 
} from '@/hooks/useMicroAnimations';
import { FluentEmoji } from '@/components/icons/FluentEmoji';

export type ReactionType = 'like' | 'relatable' | 'inspiring' | 'support' | 'curious';

interface Reaction {
  type: ReactionType;
  label: string;
  color: string;
}

const reactions: Reaction[] = [
  { type: 'like', label: 'Like', color: 'hsl(0, 75%, 60%)' },
  { type: 'relatable', label: 'Relatable', color: 'hsl(200, 80%, 55%)' },
  { type: 'inspiring', label: 'Inspiring', color: 'hsl(45, 90%, 55%)' },
  { type: 'support', label: 'Support', color: 'hsl(155, 55%, 50%)' },
  { type: 'curious', label: 'Curious', color: 'hsl(270, 60%, 60%)' },
];

interface ReactionPickerProps {
  isOpen: boolean;
  onSelect: (type: ReactionType) => void;
  currentReaction?: ReactionType | null;
  onClose: () => void;
}

export function ReactionPicker({ isOpen, onSelect, currentReaction, onClose }: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
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
      setSelectedReaction(type);
      // Reset selection animation after it plays
      setTimeout(() => setSelectedReaction(null), 400);
    }
    // Close immediately and notify parent
    onSelect(type);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={springTransitions.bouncy}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          style={{ transformOrigin: 'bottom left' }}
          className="absolute bottom-full left-0 z-50 pb-2 pt-3 pr-6"
        >
          <div className="flex items-center gap-1 px-2.5 py-2 bg-card/95 backdrop-blur-2xl rounded-full shadow-[0_10px_40px_-8px_rgba(0,0,0,0.55),0_2px_6px_rgba(0,0,0,0.35)] ring-1 ring-white/10 border border-border/40 select-none touch-manipulation">
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
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(reaction.type);
                }}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                className={cn(
                  'relative p-2 rounded-full transition-colors',
                  currentReaction === reaction.type && 'bg-white/[0.1]'
                )}
              >
                <motion.div
                  animate={{
                    scale: selectedReaction === reaction.type 
                      ? [1, 1.6, 0.9, 1.3, 1]
                      : hoveredReaction === reaction.type ? 1.4 : 1,
                    y: hoveredReaction === reaction.type ? -8 : 0,
                    rotate: selectedReaction === reaction.type 
                      ? [0, -15, 15, -10, 10, -5, 5, 0]
                      : hoveredReaction === reaction.type ? [0, -8, 8, -4, 4, 0] : 0,
                  }}
                  transition={selectedReaction === reaction.type 
                    ? { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 1] }
                    : hoveredReaction === reaction.type
                      ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                    : springTransitions.bouncy
                  }
                  className="block"
                >
                  <FluentEmoji type={reaction.type} size={36} />
                </motion.div>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredReaction === reaction.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={springTransitions.snappy}
                      className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-foreground text-background text-label font-semibold rounded-md whitespace-nowrap shadow-lg"
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
                    className="absolute inset-0 rounded-full bg-white/[0.08] -z-10"
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
  size?: 'sm' | 'md' | 'lg';
}

export function ReactionButton({ postId, currentReaction, count, onReact, size = 'md' }: ReactionButtonProps) {
  const sizeMap = { sm: { box: 'w-5 h-5', svg: 'h-5 w-5', px: 18 }, md: { box: 'w-6 h-6', svg: 'h-6 w-6', px: 24 }, lg: { box: 'w-7 h-7', svg: 'h-7 w-7', px: 28 } } as const;
  const s = sizeMap[size];
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [localBurst, setLocalBurst] = useState<BurstParticle[] | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const suppressClickRef = useRef(false);
  const buttonControls = useAnimationControls();

  const triggerLocalBurst = useCallback((color?: string) => {
    const particles = generateBurstParticles(8, color);
    setLocalBurst(particles);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([5, 30, 5]);
    setTimeout(() => setLocalBurst(null), 450);
  }, []);

  const handleMouseEnter = () => {
    if (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setIsPickerOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (typeof navigator !== 'undefined' && (navigator.maxTouchPoints ?? 0) > 0) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    // Small close delay so the cursor can travel from the button up into the picker
    // without the popup collapsing between them.
    hoverTimer.current = setTimeout(() => {
      setIsPickerOpen(false);
      setIsLongPressing(false);
    }, 220);
  };


  const handleTouchStart = (e: TouchEvent<HTMLButtonElement>) => {
    suppressClickRef.current = true;
    e.preventDefault();
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setIsPickerOpen(true);
      if (navigator.vibrate) navigator.vibrate(10);
    }, 400);
  };

  const endTouchInteraction = () => {
    // Ignore the synthetic click that fires after touch
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!isLongPressing) {
      handleQuickTap();
    }
    setIsLongPressing(false);
    endTouchInteraction();
  };

  const handleTouchCancel = (e: TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setIsLongPressing(false);
    setIsPickerOpen(false);
    endTouchInteraction();
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
    if (suppressClickRef.current) return;
    if (!isPickerOpen) {
      handleQuickTap();
    }
  };

  const handleSelect = (type: ReactionType) => {
    // Clear timers to prevent interference
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    
    const reaction = reactions.find(r => r.type === type);
    if (reaction && type !== currentReaction) {
      triggerLocalBurst(reaction.color);
    }
    onReact(currentReaction === type ? null : type);
    setIsPickerOpen(false);
    setIsLongPressing(false);
  };

  const hasReaction = currentReaction 
    ? reactions.find(r => r.type === currentReaction) 
    : null;

  const currentColor = currentReaction
    ? reactions.find(r => r.type === currentReaction)?.color
    : undefined;

  return (
    <div 
      className={cn(
        'relative flex items-end transition-[padding] duration-150 ease-out',
        isPickerOpen && 'pt-[62px]'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => e.stopPropagation()}
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
        onTouchCancel={handleTouchCancel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 transition-colors group relative select-none touch-manipulation [-webkit-touch-callout:none]',
          currentReaction ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <div className={cn('relative flex items-center justify-center', s.box)}>
          <motion.div
            key={currentReaction || 'default'}
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springTransitions.elastic}
            className="flex items-center justify-center"
          >
            {hasReaction ? (
              <FluentEmoji type={currentReaction!} size={s.px} />
            ) : (
              <svg
                className={cn(
                  s.svg,
                  'transition-colors',
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
          </motion.div>

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
              className="text-body font-medium tabular-nums"
            >
              {count >= 1000 ? `${(count/1000).toFixed(1)}K` : count}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
