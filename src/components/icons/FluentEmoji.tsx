import { Modern } from 'react-fluentui-emoji';
import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

const emojiMap = {
  like: Modern.IconMRedHeart,
  relatable: Modern.IconMHandshake,
  inspiring: Modern.IconMSparkles,
  support: Modern.IconMPeopleHugging,
  curious: Modern.IconMThinkingFace,
} as const;

export function FluentEmoji({ type, size = 28, className }: FluentEmojiProps) {
  const EmojiComponent = emojiMap[type];
  
  return (
    <span 
      className={className}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <EmojiComponent />
    </span>
  );
}
