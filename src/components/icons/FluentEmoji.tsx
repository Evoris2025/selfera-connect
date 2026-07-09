import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
  /** Render a static PNG instead of the looping APNG. Useful for inline
   *  counters where motion is distracting. */
  static?: boolean;
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

/**
 * Static Fluent Emoji fallback (Microsoft Fluent PNG set).
 * Used for the compact reaction counter so the selected emoji stays still.
 *
 * Source: github.com/bignutty/fluent-emoji (static, unicode-named PNGs)
 */
const STATIC_CDN =
  'https://cdn.jsdelivr.net/gh/bignutty/fluent-emoji@main/static';

const SOURCES: Record<ReactionType, { animated: string; static: string; label: string }> = {
  // Like → clean red heart (pulses via our CSS; no "beat" sonar lines)
  like:      { animated: `${CDN}/Smilies/Red%20Heart.png`, static: `${STATIC_CDN}/2764-fe0f.png`, label: 'Like' },
  // Care → smiling face with hearts orbiting
  care:      { animated: `${CDN}/Smilies/Smiling%20Face%20with%20Hearts.png`, static: `${STATIC_CDN}/1f970.png`, label: 'Care' },
  // Laughing → rolling on the floor laughing (more expressive & modern than tears-of-joy)
  laughing:  { animated: `${CDN}/Smilies/Rolling%20on%20the%20Floor%20Laughing.png`, static: `${STATIC_CDN}/1f923.png`, label: 'Laughing' },
  // Surprise → astonished face (full jaw-drop head, not half like exploding head)
  surprise:  { animated: `${CDN}/Smilies/Astonished%20Face.png`, static: `${STATIC_CDN}/1f632.png`, label: 'Wow' },
  // Sad → single teardrop, calmer expression
  sad:       { animated: `${CDN}/Smilies/Crying%20Face.png`, static: `${STATIC_CDN}/1f622.png`, label: 'Sad' },
  // Angry → enraged face (fully red, steam from nose)
  angry:     { animated: `${CDN}/Smilies/Enraged%20Face.png`, static: `${STATIC_CDN}/1f621.png`, label: 'Angry' },
  // Inspiring → star-struck, stars twinkling
  inspiring: { animated: `${CDN}/Smilies/Star-Struck.png`, static: `${STATIC_CDN}/1f929.png`, label: 'Inspiring' },
  // Relatable → two hearts, "same / me too"
  relatable: { animated: `${CDN}/Smilies/Two%20Hearts.png`, static: `${STATIC_CDN}/1f495.png`, label: 'Relatable' },

  // Legacy fallbacks (kept for older stored reactions)
  support:   { animated: `${CDN}/Hand%20gestures/Folded%20Hands.png`, static: `${STATIC_CDN}/1f64f.png`, label: 'Support' },
  curious:   { animated: `${CDN}/Smilies/Thinking%20Face.png`, static: `${STATIC_CDN}/1f914.png`, label: 'Curious' },
};

// Preload every animated + static emoji once, at module load, so the first
// paint after a reaction change is instant instead of triggering a network
// fetch. Browsers keep these in the HTTP cache; the <img> tag then hits it
// synchronously.
if (typeof window !== 'undefined') {
  const seen = new Set<string>();
  for (const entry of Object.values(SOURCES)) {
    for (const url of [entry.animated, entry.static]) {
      if (seen.has(url)) continue;
      seen.add(url);
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    }
  }
}

export function FluentEmoji({ type, size = 28, className, static: isStatic }: FluentEmojiProps) {
  const entry = SOURCES[type];
  if (!entry) return null;
  return (
    <img
      src={isStatic ? entry.static : entry.animated}
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
        // Tint the two-hearts emoji fully green while keeping the rest untouched.
        filter: type === 'relatable' ? 'sepia(1) saturate(3) hue-rotate(90deg) brightness(0.95)' : undefined,
      }}
    />
  );
}
