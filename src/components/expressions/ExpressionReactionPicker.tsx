import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ExpressionReaction {
  emoji: string;
  label: string;
}

const reactions: ExpressionReaction[] = [
  { emoji: '❤️', label: 'love' },
  { emoji: '🔥', label: 'fire' },
  { emoji: '😍', label: 'heart eyes' },
  { emoji: '😮', label: 'wow' },
  { emoji: '😢', label: 'sad' },
  { emoji: '👏', label: 'clap' },
];

interface ExpressionReactionPickerProps {
  expressionId: string;
  authorName: string;
  onReact?: (emoji: string) => void;
}

export function ExpressionReactionPicker({
  expressionId,
  authorName,
  onReact,
}: ExpressionReactionPickerProps) {
  const [sentEmoji, setSentEmoji] = useState<string | null>(null);

  const handleReact = (reaction: ExpressionReaction) => {
    setSentEmoji(reaction.emoji);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    
    // Callback
    onReact?.(reaction.emoji);
    
    // Show toast notification (simulating sending to author)
    toast({
      description: `Sent ${reaction.emoji} to ${authorName}`,
    });

    // Reset after animation
    setTimeout(() => setSentEmoji(null), 1000);
  };

  return (
    <div className="relative">
      {/* Reaction buttons row */}
      <div className="flex items-center gap-3">
        {reactions.map((reaction, index) => (
          <motion.button
            key={reaction.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 400 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              handleReact(reaction);
            }}
            className={cn(
              "text-2xl transition-transform hover:scale-125 active:scale-90",
              "drop-shadow-lg"
            )}
            aria-label={`React with ${reaction.label}`}
          >
            {reaction.emoji}
          </motion.button>
        ))}
      </div>

      {/* Floating emoji animation */}
      <AnimatePresence>
        {sentEmoji && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ 
              opacity: 0, 
              y: -150, 
              scale: 2,
              rotate: [0, -10, 10, -5, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 text-5xl pointer-events-none z-50"
          >
            {sentEmoji}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle burst effect */}
      <AnimatePresence>
        {sentEmoji && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0.5,
                  x: 0,
                  y: 0,
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 0,
                  x: Math.cos((i * 45 * Math.PI) / 180) * 60,
                  y: Math.sin((i * 45 * Math.PI) / 180) * -60,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute left-1/2 bottom-4 w-2 h-2 rounded-full bg-primary pointer-events-none"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
