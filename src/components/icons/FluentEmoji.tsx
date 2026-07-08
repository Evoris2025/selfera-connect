import { useState } from 'react';
import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

// High-quality color emoji from Google's Noto Emoji (used by Android / Gmail).
// Delivered as color-vector WebP with soft 3D shading — visually consistent
// with Facebook / Instagram reaction icons.
const EMOJI_MAP: Record<ReactionType, { codepoint: string; fallback: string; label: string }> = {
  like:      { codepoint: '2764_fe0f', fallback: '❤️', label: 'Love' },
  relatable: { codepoint: '1fac2',     fallback: '🫂', label: 'Relatable' },
  inspiring: { codepoint: '1f929',     fallback: '🤩', label: 'Inspiring' },
  support:   { codepoint: '1f64f',     fallback: '🙏', label: 'Support' },
  curious:   { codepoint: '1f914',     fallback: '🤔', label: 'Curious' },
};

export function FluentEmoji({ type, size = 28, className }: FluentEmojiProps) {
  const { codepoint, fallback, label } = EMOJI_MAP[type];
  const [errored, setErrored] = useState(false);

  const src = `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/512.webp`;

  if (errored) {
    return (
      <span
        role="img"
        aria-label={label}
        className={className}
        style={{
          fontSize: size * 0.9,
          lineHeight: 1,
          display: 'inline-block',
          width: size,
          height: size,
          textAlign: 'center',
          filter: 'drop-shadow(0 4px 5px rgba(0,0,0,0.35))',
          userSelect: 'none',
        }}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      width={size}
      height={size}
      draggable={false}
      onError={() => setErrored(true)}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
        userSelect: 'none',
        WebkitUserDrag: 'none' as unknown as string,
      }}
    />
  );
}
