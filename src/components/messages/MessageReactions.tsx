import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
  isOwnMessage: boolean;
}

const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };

export function MessageReactions({ reactions, onReact, isOwnMessage }: MessageReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-1 mt-1",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.emoji}
          whileTap={{ scale: 0.85 }}
          onClick={() => onReact(reaction.emoji)}
          className={cn(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-label border",
            "bg-white/[0.06] border-white/10 hover:bg-white/[0.1] transition-colors",
            reaction.userReacted && "ring-1 ring-white/40"
          )}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span className="text-muted-foreground text-caption">{reaction.count}</span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}

interface ReactionPickerProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position: 'left' | 'right';
}

export function ReactionPicker({ isOpen, onSelect, onClose, position }: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={springPop}
            className={cn(
              "absolute bottom-full mb-2 z-50",
              "flex items-center gap-1 px-2 py-1.5 rounded-full",
              "bg-background/95 backdrop-blur-xl shadow-lg border border-border/50",
              position === 'right' ? "right-0" : "left-0"
            )}
          >
            {REACTION_EMOJIS.map((emoji, idx) => (
              <motion.button
                key={emoji}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springPop, delay: idx * 0.03 }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="text-headline p-1 hover:bg-secondary/50 rounded-full transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MessageBubbleWithReactionsProps {
  messageId: string;
  content: string;
  isOwnMessage: boolean;
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
  isRead?: boolean;
  readAt?: Date;
}

export function MessageBubbleWithReactions({
  messageId,
  content,
  isOwnMessage,
  reactions,
  onReact,
  isRead,
  readAt,
}: MessageBubbleWithReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimeoutRef = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    const timeout = setTimeout(() => {
      setShowPicker(true);
      setIsLongPressing(true);
    }, 500);
    longPressTimeoutRef[1](timeout);
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef[0]) {
      clearTimeout(longPressTimeoutRef[0]);
    }
    setIsLongPressing(false);
  };

  const handleDoubleClick = () => {
    onReact('❤️');
  };

  return (
    <div className={cn('relative', isOwnMessage ? 'flex flex-col items-end' : 'flex flex-col items-start')}>
      <motion.div
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'max-w-[78%] px-4 py-3 shadow-sm relative',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-[22px] rounded-br-md'
            : 'bg-secondary/80 text-foreground rounded-[22px] rounded-bl-md'
        )}
      >
        <p className="text-body leading-relaxed">{content}</p>
        
        <ReactionPicker
          isOpen={showPicker}
          onSelect={onReact}
          onClose={() => setShowPicker(false)}
          position={isOwnMessage ? 'right' : 'left'}
        />
      </motion.div>
      
      <MessageReactions
        reactions={reactions}
        onReact={onReact}
        isOwnMessage={isOwnMessage}
      />
    </div>
  );
}
