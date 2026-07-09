import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

/**
 * Animated Fluent Emojis (Microsoft Fluent set as looping APNGs).
 * Native APNG plays automatically in every modern browser — no JS runtime,
 * no Lottie, no GIF quality loss. This is the same technique Facebook /
 * Instagram use to make their reaction bar feel "alive".
 *
 * Source: github.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis (MIT)
 */
const CDN =
  'https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis';

const SOURCES: Record<ReactionType, { src: string; label: string }> = {
  // Like → clean red heart (pulses via our CSS; no "beat" sonar lines)
  like:      { src: `${CDN}/Smilies/Red%20Heart.png`, label: 'Like' },
  // Care → smiling face with hearts orbiting
  care:      { src: `${CDN}/Smilies/Smiling%20Face%20with%20Hearts.png`, label: 'Care' },
  // Laughing → rolling on the floor laughing (more expressive & modern than tears-of-joy)
  laughing:  { src: `${CDN}/Smilies/Rolling%20on%20the%20Floor%20Laughing.png`, label: 'Laughing' },
  // Surprise → astonished face (full jaw-drop head, not half like exploding head)
  surprise:  { src: `${CDN}/Smilies/Astonished%20Face.png`, label: 'Wow' },
  // Sad → single teardrop, calmer expression
  sad:       { src: `${CDN}/Smilies/Crying%20Face.png`, label: 'Sad' },
  // Angry → enraged face (fully red, steam from nose)
  angry:     { src: `${CDN}/Smilies/Enraged%20Face.png`, label: 'Angry' },
  // Inspiring → star-struck, stars twinkling
  inspiring: { src: `${CDN}/Smilies/Star-Struck.png`, label: 'Inspiring' },
  // Relatable → two hearts, "same / me too"
  relatable: { src: `${CDN}/Smilies/Two%20Hearts.png`, label: 'Relatable' },

  // Legacy fallbacks (kept for older stored reactions)
  support:   { src: `${CDN}/Hand%20gestures/Folded%20Hands.png`, label: 'Support' },
  curious:   { src: `${CDN}/Smilies/Thinking%20Face.png`, label: 'Curious' },
};

export function FluentEmoji({ type, size = 28, className }: FluentEmojiProps) {
  const entry = SOURCES[type];
  if (!entry) return null;
  return (
    <img
      src={entry.src}
      alt={entry.label}
      width={size}
      height={size}
      draggable={false}
      loading="eager"
      decoding="async"
      className={`select-none pointer-events-none drop-shadow-md ${className ?? ''}`}
      // Explicit inline size beats Tailwind Preflight's `img { height: auto }`,
      // which would otherwise collapse the emoji to 0×0 inside a shrink-to-fit
      // button.
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
    />
  );
}
