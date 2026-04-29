import { Video, Image, Film } from 'lucide-react';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';

interface ComposerBarProps {
  onOpenComposer: (mode?: 'text' | 'video' | 'image' | 'reel') => void;
}

export function ComposerBar({ onOpenComposer }: ComposerBarProps) {
  const { displayName } = useCurrentUserAvatar();

  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-xl">
      <button
        onClick={() => onOpenComposer('text')}
        className="flex-1 text-left px-4 py-1.5 bg-secondary rounded-full text-muted-foreground text-body hover:bg-secondary/80 transition-colors"
      >
        What's on your mind, {displayName}?
      </button>

      <div className="flex items-center gap-0.5">
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
