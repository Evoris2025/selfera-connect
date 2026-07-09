import type { ReactionType } from '@/components/feed/ReactionPicker';

interface FluentEmojiProps {
  type: ReactionType;
  size?: number;
  className?: string;
}

/**
 * Microsoft Fluent Emoji 3D — MIT-licensed pre-rendered PNG set.
 * Served via jsDelivr from the official microsoft/fluentui-emoji repo.
 */
const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets';

const SOURCES: Record<ReactionType, { src: string; label: string }> = {
  like:      { src: `${CDN}/Red%20heart/3D/red_heart_3d.png`, label: 'Like' },
  care:      { src: `${CDN}/Smiling%20face%20with%20hearts/3D/smiling_face_with_hearts_3d.png`, label: 'Care' },
  laughing:  { src: `${CDN}/Face%20with%20tears%20of%20joy/3D/face_with_tears_of_joy_3d.png`, label: 'Laughing' },
  surprise:  { src: `${CDN}/Astonished%20face/3D/astonished_face_3d.png`, label: 'Surprise' },
  sad:       { src: `${CDN}/Crying%20face/3D/crying_face_3d.png`, label: 'Sad' },
  angry:     { src: `${CDN}/Angry%20face/3D/angry_face_3d.png`, label: 'Angry' },
  inspiring: { src: `${CDN}/Star-struck/3D/star-struck_3d.png`, label: 'Inspiring' },
  relatable: { src: `${CDN}/Weary%20face/3D/weary_face_3d.png`, label: 'Relatable' },
  // legacy fallbacks
  support:   { src: `${CDN}/Folded%20hands/3D/folded_hands_3d.png`, label: 'Support' },
  curious:   { src: `${CDN}/Thinking%20face/3D/thinking_face_3d.png`, label: 'Curious' },
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
      className={`select-none pointer-events-none drop-shadow-md ${className ?? ''}`}
      // Explicit width/height are required because Tailwind Preflight sets
      // `img { height: auto; max-width: 100% }`, which overrides the HTML
      // width/height attributes and collapses the emoji to 0×0 inside a
      // shrink-to-fit button.
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
