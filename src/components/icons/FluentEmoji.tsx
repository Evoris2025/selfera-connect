import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

// Twemoji – rich colorful rounded emoji renderings, hosted on jsDelivr.
const codepointMap: Record<ReactionType, string> = {
  like: '2764',        // ❤️
  relatable: '1f91d',  // 🤝
  inspiring: '2728',   // ✨
  support: '1f917',    // 🤗
  curious: '1f914',    // 🤔
};

const labelMap: Record<ReactionType, string> = {
  like: 'Love',
  relatable: 'Relatable',
  inspiring: 'Inspiring',
  support: 'Support',
  curious: 'Curious',
};

export function FluentEmoji({ type, size = 28, className }: FluentEmojiProps) {
  const cp = codepointMap[type];
  const src = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${cp}.png`;


  return (
    <img
      src={src}
      alt={labelMap[type]}
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      decoding="async"
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
        userSelect: 'none',
      }}
    />
  );
}

