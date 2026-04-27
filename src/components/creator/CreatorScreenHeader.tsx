import { ArrowLeft, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { AudienceSelector, type StudioAudience } from './shared/AudienceSelector';

export type CreatorType = 'expression' | 'video' | 'photo' | 'post';

interface CreatorScreenHeaderProps {
  type: CreatorType;
  onBack?: () => void;
  onClose?: () => void;
  /** Override the lowercase prefix word ("create" by default — e.g. "schedule") */
  framingWord?: string;
  /** Optional audience chip below the handle. Omit to hide. */
  audience?: StudioAudience;
  onAudienceChange?: (a: StudioAudience) => void;
}

const TITLES: Record<CreatorType, string> = {
  expression: 'EXPRESSION.',
  video: 'VIDEO.',
  photo: 'PHOTO.',
  post: 'POST.',
};

/**
 * Shared identity-forward hero for all four creator routes.
 *
 *   ─ back · create [TYPE]. · close ──────────────
 *   ──────── SelfERA gradient hairline ──────────
 *
 *           [theme-ringed avatar]
 *
 *               Display Name
 *                @handle
 *               [Public ▾]
 *
 * The gradient on the title word is the FIXED SelfERA brand gradient — the
 * brand always wins on the wordmark, regardless of the user's color theme.
 * The avatar ring uses --primary (the user's theme color), with --primary-muted
 * as a subtle second stop for depth. Falls back to the SelfERA gradient when
 * --primary isn't set (it always is, given ThemeProvider's coral default).
 */
export function CreatorScreenHeader({
  type,
  onBack,
  onClose,
  framingWord = 'create',
  audience,
  onAudienceChange,
}: CreatorScreenHeaderProps) {
  const { user } = useAuth();
  const { avatarUrl, displayName: avatarDisplayName } = useCurrentUserAvatar();

  const displayName = avatarDisplayName || user?.email?.split('@')[0] || 'You';
  const userInitial = displayName.charAt(0).toUpperCase();
  const handle = displayName.toLowerCase().replace(/\s+/g, '');

  const handleBack = onBack ?? (() => window.history.back());
  const handleClose = onClose ?? handleBack;

  return (
    <div className="shrink-0">
      {/* Header bar */}
      <div className="relative">
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
            <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-teal-400 bg-clip-text text-transparent">
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
      <div className="flex flex-col items-center text-center gap-3 px-5 pt-6 pb-6">
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
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-center min-w-0">
          <h2 className="text-4xl font-bold tracking-tight text-foreground leading-none truncate max-w-full">
            {displayName}
          </h2>
          <p className="text-base text-foreground/55 mt-1">@{handle}</p>
          {audience && onAudienceChange && (
            <div className="mt-2">
              <AudienceSelector
                value={audience}
                onChange={onAudienceChange}
                variant="ghost"
              />
            </div>
          )}
        </div>
      </div>

      {/* Branded gradient hairline transition */}
      <div className="h-px w-full bg-gradient-to-r from-fuchsia-500/40 via-violet-500/40 to-teal-400/40 opacity-60" />
    </div>
  );
}
