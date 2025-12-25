import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

  const handleSelect = (type: ReactionType) => {
    onSelect(type);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute bottom-full left-0 mb-2 z-50"
        >
          <div className="flex items-center gap-1 px-3 py-2 bg-card/95 backdrop-blur-xl rounded-full shadow-elevated border border-border/30">
            {reactions.map((reaction, index) => (
              <motion.button
                key={reaction.type}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04, type: 'spring', stiffness: 500, damping: 20 }}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                onClick={() => handleSelect(reaction.type)}
                className={cn(
                  'relative p-1.5 rounded-full transition-colors',
                  currentReaction === reaction.type && 'bg-primary/20'
                )}
              >
                <motion.span
                  animate={{
                    scale: hoveredReaction === reaction.type ? 1.4 : 1,
                    y: hoveredReaction === reaction.type ? -8 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="text-2xl block"
                >
                  {reaction.emoji}
                </motion.span>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredReaction === reaction.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs font-medium rounded whitespace-nowrap"
                    >
                      {reaction.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selection burst animation */}
                {currentReaction === reaction.type && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: reaction.color }}
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
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setIsPickerOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    // Delay closing to allow moving to picker
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
      // Quick tap - toggle like
      onReact(currentReaction ? null : 'like');
    }
    setIsLongPressing(false);
  };

  const handleClick = () => {
    // Toggle reaction on click (desktop quick click)
    if (!isPickerOpen) {
      onReact(currentReaction ? null : 'like');
    }
  };

  const handleSelect = (type: ReactionType) => {
    onReact(currentReaction === type ? null : type);
    setIsPickerOpen(false);
  };

  const currentEmoji = currentReaction 
    ? reactions.find(r => r.type === currentReaction)?.emoji 
    : '❤️';

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
        whileTap={{ scale: 0.85 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 transition-colors group',
          currentReaction ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <motion.span
          key={currentReaction || 'default'}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="text-xl"
        >
          {currentReaction ? currentEmoji : (
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
        {count > 0 && (
          <span className="text-sm font-medium">{count >= 1000 ? `${(count/1000).toFixed(1)}K` : count}</span>
        )}
      </motion.button>
    </div>
  );
}
