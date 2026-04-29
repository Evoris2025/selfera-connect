import { Video, Image, Film } from 'lucide-react';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';

interface ComposerBarProps {
  onOpenComposer: (mode?: 'text' | 'video' | 'image' | 'reel') => void;
}

const SHRINK_THRESHOLD = 24;   // name length that triggers font shrink
const TRUNCATE_THRESHOLD = 32; // name length that triggers ellipsis truncation
const TRUNCATE_KEEP = 28;      // chars kept from name when truncating

export function ComposerBar({ onOpenComposer }: ComposerBarProps) {
  const { displayName } = useCurrentUserAvatar();

  const nameLen = displayName?.length ?? 0;
  const shouldTruncate = nameLen > TRUNCATE_THRESHOLD;
  const shouldShrink = nameLen > SHRINK_THRESHOLD;

  const renderedName = shouldTruncate
    ? `${displayName.slice(0, TRUNCATE_KEEP)}…`
    : displayName;

  const placeholder = `What's on your mind, ${renderedName}?`;

  const placeholderSize = shouldShrink ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-card rounded-xl min-h-[44px]">
      <button
        onClick={() => onOpenComposer('text')}
        className="flex-1 min-w-0 text-left px-4 py-1.5 bg-secondary rounded-2xl text-muted-foreground hover:bg-secondary/80 transition-colors"
      >
        <span
          className={`block ${placeholderSize} tracking-tight leading-snug line-clamp-2 [word-break:normal] [overflow-wrap:normal]`}
        >
          {placeholder}
        </span>
      </button>

      <div className="flex items-center gap-2 flex-shrink-0 pt-1.5">
        <button
          onClick={() => onOpenComposer('video')}
          className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          aria-label="Add video"
        >
          <Video className="h-4 w-4 text-rose-500" />
        </button>
        <button
          onClick={() => onOpenComposer('image')}
          className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          aria-label="Add image"
        >
          <Image className="h-4 w-4 text-emerald-500" />
        </button>
        <button
          onClick={() => onOpenComposer('reel')}
          className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          aria-label="Add reel"
        >
          <Film className="h-4 w-4 text-pink-500" />
        </button>
      </div>
    </div>
  );
}
