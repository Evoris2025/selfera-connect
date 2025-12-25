import { Video, Image, Film } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';

interface ComposerBarProps {
  onOpenComposer: (mode?: 'text' | 'video' | 'image' | 'reel') => void;
}

export function ComposerBar({ onOpenComposer }: ComposerBarProps) {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'there';
  const userInitial = displayName.charAt(0).toUpperCase();
  // TODO: Replace with actual profile photo from user metadata
  const profilePhotoUrl = user?.user_metadata?.avatar_url || '';

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl">
      <CinematicAvatar
        src={profilePhotoUrl}
        alt={displayName}
        fallback={userInitial}
        size="md"
        ring="muted"
      />

      <button
        onClick={() => onOpenComposer('text')}
        className="flex-1 text-left px-4 py-2.5 bg-secondary rounded-full text-muted-foreground text-sm hover:bg-secondary/80 transition-colors"
      >
        What's on your mind, {displayName}?
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onOpenComposer('video')}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Add video"
        >
          <Video className="h-5 w-5 text-rose-500" />
        </button>
        <button
          onClick={() => onOpenComposer('image')}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Add image"
        >
          <Image className="h-5 w-5 text-emerald-500" />
        </button>
        <button
          onClick={() => onOpenComposer('reel')}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Add reel"
        >
          <Film className="h-5 w-5 text-pink-500" />
        </button>
      </div>
    </div>
  );
}
