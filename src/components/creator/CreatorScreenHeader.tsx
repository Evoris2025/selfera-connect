import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { AudienceSelector } from './shared/AudienceSelector';
import type { StudioAudience } from '@/contexts/FeedDataContext';

export type CreatorType = 'expression' | 'video' | 'photo' | 'post';

const TITLES: Record<CreatorType, string> = {
  expression: 'EXPRESSION.',
  video: 'VIDEO.',
  photo: 'PHOTO.',
  post: 'POST.',
};

interface CreatorScreenHeaderProps {
  type: CreatorType;
  framingWord?: string; // defaults to "create"
  onBack?: () => void;
  onClose?: () => void;
  audience?: StudioAudience;
  onAudienceChange?: (a: StudioAudience) => void;
  showAudience?: boolean;
}

/**
 * Shared identity-forward header used across all creator routes.
 * - Top bar: back / "create [TYPE]." (SelfERA brand gradient on the type word) / close
 * - Gradient hairline
 * - Hero: theme-ringed avatar + display name + @handle + ghost audience chip
 *
 * The brand gradient on the type word is FIXED (never themed by the user).
 * The avatar ring uses the user's theme color via CSS vars.
 */
export function CreatorScreenHeader({
  type,
  framingWord = 'create',
  onBack,
  onClose,
  audience = 'public',
  onAudienceChange,
  showAudience = true,
}: CreatorScreenHeaderProps) {
  const navigate = useNavigate();
  const { avatarUrl, displayName: rawName } = useCurrentUserAvatar();

  const displayName = rawName || 'You';
  const handle = displayName.toLowerCase().replace(/\s+/g, '');
  const initial = displayName.charAt(0).toUpperCase();

  const handleBack = onBack ?? (() => navigate(-1));
  const handleClose = onClose ?? (() => navigate('/studio'));

  return (
    <div className="shrink-0 flex flex-col">
      {/* Header bar */}
      <div className="relative shrink-0">
        <div className="flex items-center justify-between h-14 px-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold tracking-tight">
            <span className="font-medium text-white">{framingWord} </span>
            <span className="text-gradient-brand">
              {TITLES[type]}
            </span>
          </h1>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent opacity-60" />
      </div>

      {/* Hero identity block */}
      <div className="shrink-0 flex flex-col items-center text-center gap-3 px-5 pt-6 pb-6">
        <div
          className="rounded-full p-1 shrink-0"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-muted)))',
          }}
        >
          <Avatar className="h-32 w-32 border-2 border-background">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-center min-w-0">
          <h2 className="text-4xl font-bold tracking-tight text-foreground leading-none truncate max-w-full">
            {displayName}
          </h2>
          <p className="text-base text-foreground/55 mt-1">@{handle}</p>
          {showAudience && (
            <div className="mt-2">
              <AudienceSelector
                value={audience}
                onChange={onAudienceChange ?? (() => {})}
                variant="ghost"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom hairline transition */}
      <div className="h-px w-full bg-gradient-to-r from-fuchsia-500/40 via-violet-500/40 to-teal-400/40 opacity-60 shrink-0" />
    </div>
  );
}
