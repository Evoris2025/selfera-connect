import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

// Native emoji map - lightweight, no external dependencies
const emojiMap: Record<ReactionType, string> = {
  like: '❤️',
  relatable: '🤝',
  inspiring: '✨',
  support: '🤗',
  curious: '🤔',
};

export function FluentEmoji({ type, size = 28, className }: FluentEmojiProps) {
  const emoji = emojiMap[type];
  
  return (
    <span 
      className={className}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize: size * 0.85,
        lineHeight: 1,
      }}
      role="img"
      aria-label={type}
    >
      {emoji}
    </span>
  );
}
