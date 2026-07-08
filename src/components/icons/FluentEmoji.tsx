import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

// Google Noto Color Emoji – rich, rounded, glossy 3D-style renderings.
// Served from Google Fonts CDN as static PNGs, no bundle cost.
const codepointMap: Record<ReactionType, string> = {
  like: '2764_fe0f',   // ❤️
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
  const src = `https://fonts.gstatic.com/s/e/notoemoji/latest/${cp}/512.png`;

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

