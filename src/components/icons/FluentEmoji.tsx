import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

/**
 * Self-contained, guaranteed-render reaction icons.
 *
 * Previous version depended on Google's Noto Emoji CDN and showed a blank tray
 * whenever the network request stalled or was blocked. These are inline SVGs
 * with soft 3D-ish shading — visually consistent with Facebook / Instagram
 * reaction pills and available offline.
 */

const LABELS: Record<ReactionType, string> = {
  like: 'Like',
  care: 'Care',
  laughing: 'Laughing',
  surprise: 'Surprise',
  sad: 'Sad',
  angry: 'Angry',
  inspiring: 'Inspiring',
  relatable: 'Relatable',
  support: 'Support',
  curious: 'Curious',
};

function Face({
  size,
  gradientId,
  from,
  to,
  children,
  className,
  label,
}: {
  size: number;
  gradientId: string;
  from: string;
  to: string;
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={{
        display: 'inline-block',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
        userSelect: 'none',
      }}
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${gradientId})`} />
      {/* Glossy highlight */}
      <ellipse cx="22" cy="18" rx="12" ry="6" fill="rgba(255,255,255,0.35)" />
      {children}
    </svg>
  );
}

export function FluentEmoji({ type, size = 28, className }: FluentEmojiProps) {
  const label = LABELS[type];

  switch (type) {
    case 'like':
      // Facebook-style red heart
      return (
        <svg
          role="img"
          aria-label={label}
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={className}
          style={{
            display: 'inline-block',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
            userSelect: 'none',
          }}
        >
          <defs>
            <radialGradient id="fe-heart" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#ff6b81" />
              <stop offset="100%" stopColor="#e0245e" />
            </radialGradient>
          </defs>
          <path
            d="M32 56s-22-12.2-22-28a12 12 0 0 1 22-6.6A12 12 0 0 1 54 28c0 15.8-22 28-22 28z"
            fill="url(#fe-heart)"
          />
          <path
            d="M20 16c-3 1.5-5.5 4.5-6 8.5"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    case 'relatable':
      // Warm hug: yellow face with hands
      return (
        <Face
          size={size}
          className={className}
          label={label}
          gradientId="fe-rel"
          from="#ffe17a"
          to="#f0a800"
        >
          {/* eyes */}
          <path d="M20 30q3 -5 6 0" stroke="#2b1700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M38 30q3 -5 6 0" stroke="#2b1700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* smile */}
          <path d="M22 40q10 8 20 0" stroke="#2b1700" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* hands */}
          <circle cx="10" cy="46" r="8" fill="#f0a800" />
          <circle cx="54" cy="46" r="8" fill="#f0a800" />
          <circle cx="10" cy="46" r="6" fill="#ffcc4d" />
          <circle cx="54" cy="46" r="6" fill="#ffcc4d" />
        </Face>
      );

    case 'inspiring':
      // Star-struck face
      return (
        <Face
          size={size}
          className={className}
          label={label}
          gradientId="fe-insp"
          from="#ffe17a"
          to="#f5a623"
        >
          {/* star eyes */}
          <path
            d="M22 30 L24 24 L26 30 L32 30 L27 34 L29 40 L22 36 L15 40 L17 34 L12 30 Z"
            fill="#ffd400"
            stroke="#c47c00"
            strokeWidth="1.2"
          />
          <path
            d="M42 30 L44 24 L46 30 L52 30 L47 34 L49 40 L42 36 L35 40 L37 34 L32 30 Z"
            fill="#ffd400"
            stroke="#c47c00"
            strokeWidth="1.2"
          />
          {/* open smile */}
          <path d="M20 44q12 12 24 0 q-12 6 -24 0z" fill="#2b1700" />
          <path d="M22 46q10 8 20 0 z" fill="#ff5a5f" />
        </Face>
      );

    case 'support':
      // Praying hands / gratitude — soft peach hands
      return (
        <svg
          role="img"
          aria-label={label}
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={className}
          style={{
            display: 'inline-block',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
            userSelect: 'none',
          }}
        >
          <defs>
            <radialGradient id="fe-sup" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#ffd8b0" />
              <stop offset="100%" stopColor="#d98a5a" />
            </radialGradient>
          </defs>
          {/* left hand */}
          <path
            d="M30 6c-2 0-3 2-3 4v34c0 8 4 14 12 14V22c0-3-2-6-5-8l-4-8z"
            fill="url(#fe-sup)"
          />
          {/* right hand mirrored */}
          <path
            d="M34 6c2 0 3 2 3 4v34c0 8-4 14-12 14V22c0-3 2-6 5-8l4-8z"
            fill="url(#fe-sup)"
          />
          {/* sparkle */}
          <circle cx="14" cy="14" r="2" fill="#fff8d0" />
          <circle cx="52" cy="18" r="1.5" fill="#fff8d0" />
        </svg>
      );

    case 'curious':
      // Thinking face
      return (
        <Face
          size={size}
          className={className}
          label={label}
          gradientId="fe-cur"
          from="#ffe17a"
          to="#e5a010"
        >
          {/* raised brow */}
          <path d="M16 24q6 -6 14 -2" stroke="#2b1700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M38 22q4 -2 10 2" stroke="#2b1700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* eyes */}
          <circle cx="24" cy="32" r="2.2" fill="#2b1700" />
          <circle cx="44" cy="32" r="2.2" fill="#2b1700" />
          {/* pursed mouth */}
          <path d="M24 44q8 -4 16 0" stroke="#2b1700" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* thinking hand */}
          <path
            d="M40 46c4 2 8 2 12 -2c2 -2 0 -6 -3 -5c-3 1 -6 3 -9 7z"
            fill="#f0a800"
            stroke="#c47c00"
            strokeWidth="1"
          />
        </Face>
      );

    default:
      return null;
  }
}
