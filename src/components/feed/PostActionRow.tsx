import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CommentButton,
  ShareButton,
  CommunityButton,
  RepostButton,
} from '@/components/interactions';
import { ReactionButton, ReactionType } from './ReactionPicker';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostActionRowProps {
  postId: string;
  authorId?: string;
  authorName: string;
  currentReaction?: ReactionType | null;
  reactionCount: number;
  onReact: (type: ReactionType | null) => void;
  showReactions?: boolean;
  commentCount: number;
  canComment?: boolean;
  commentPermission?: string;
  onOpenComments: () => void;
  inLibrary: boolean;
  onToggleLibrary: () => void;
  /** Optional: username of the top liker for social-proof line. */
  topLikerName?: string;
  /** Immersive (media) variant tweaks colors for overlay-on-image use. */
  variant?: 'default' | 'overlay';
}

type LikerProfile = {
  name: string;
  avatar?: string;
};

// Use real in-app mock profile photos instead of generated/random images.
const LIKER_POOL: LikerProfile[] = [
  {
    name: 'jenny.wren',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
  {
    name: 'devon.m',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  },
  {
    name: 'ari.b',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  },
  {
    name: 'sam.holloway',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  },
];
function pickLikers(postId: string, count = 3): LikerProfile[] {
  let h = 0;
  for (let i = 0; i < postId.length; i++) h = (h * 31 + postId.charCodeAt(i)) | 0;
  const start = Math.abs(h) % LIKER_POOL.length;
  return Array.from({ length: count }, (_, i) => LIKER_POOL[(start + i) % LIKER_POOL.length]);
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}


/**
 * Single source of truth for the post action row (Like, Comment, Repost,
 * Share, Community, ...Save) plus the social-proof lines below (Liked by …
 * and top comment preview). Used by every post type in the feed.
 */
export function PostActionRow({
  postId,
  authorId,
  authorName,
  currentReaction,
  reactionCount,
  onReact,
  showReactions = true,
  commentCount,
  canComment = true,
  commentPermission,
  onOpenComments,
  inLibrary,
  onToggleLibrary,
  topLikerName,
  variant = 'default',
}: PostActionRowProps) {
  const feedData = useFeedData();
  const mockSystem = useMockSystem();
  const mockComments = mockSystem.getComments(postId);
  const feedComments = feedData.getComments(postId);
  const comments = mockComments.length > 0 ? mockComments : feedComments;
  const topComment = comments.length > 0
    ? comments[comments.length - 1]
    : commentCount > 0
      ? {
          author: { handle: authorName.replace(/\s+/g, '').toLowerCase(), name: authorName },
          content: 'View the latest comment in this conversation.',
        }
      : null;
  const pickedLiker = pickLiker(postId);
  const likerName = topLikerName || pickedLiker.name;
  const likerAvatar = pickedLiker.avatar;

  const mutedText =
    variant === 'overlay'
      ? 'text-foreground/70'
      : 'text-muted-foreground';
  const strongText =
    variant === 'overlay' ? 'text-foreground' : 'text-foreground';

  return (
    <div className="w-full">
      <div className="flex items-center pt-1 w-full">
        {/* Left group: Like, Comment, Repost */}
        <div className="flex items-center gap-1">
          {showReactions && (
            <ReactionButton
              postId={postId}
              currentReaction={currentReaction}
              count={reactionCount}
              onReact={onReact}
              size="sm"
            />
          )}
          {canComment ? (
            <CommentButton count={commentCount} onClick={onOpenComments} size="sm" />
          ) : commentPermission === 'followers' ? (
            <span className="text-label text-muted-foreground" title="Only followers can comment">
              Comments limited
            </span>
          ) : null}
          <RepostButton size="sm" />
        </div>

        {/* Flexible space between left and right groups */}
        <div className="flex-1" />

        {/* Right group: Share, Community */}
        <div className="flex items-center gap-1">
          <ShareButton postId={postId} size="sm" />
          {authorId && <CommunityButton authorId={authorId} authorName={authorName} size="sm" />}
        </div>

        {/* Save — far right */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleLibrary}
          className={cn(
            'transition-colors p-1 ml-2',
            inLibrary
              ? 'text-primary'
              : variant === 'overlay'
                ? 'text-foreground/80 hover:text-foreground'
                : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={inLibrary ? 'Remove from library' : 'Save to library'}
        >
          <BookOpen className={cn('h-5 w-5', inLibrary && 'fill-current')} />
        </motion.button>
      </div>

      {/* Social-proof: liked by … with tiny avatar + count */}
      {reactionCount > 0 && (
        <div className={cn('flex items-center gap-1.5 mt-1.5 text-xs leading-tight', mutedText)}>
          <Avatar className="h-4 w-4 flex-shrink-0 border-0">
            <AvatarImage src={likerAvatar} alt="" />
            <AvatarFallback className="text-caption font-semibold">
              {likerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="truncate text-xs leading-tight">
            Liked by{' '}
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={cn('text-xs leading-tight font-semibold hover:underline', strongText)}
            >
              {likerName}
            </button>
            {reactionCount > 1 && (
              <>
                {' '}and <span className={cn('text-xs leading-tight font-semibold', strongText)}>{formatCount(reactionCount - 1)}</span> others
              </>
            )}
          </p>
        </div>
      )}

      {/* Top comment preview — tap to open full thread; 'more' link below */}
      {topComment && canComment && (
        <button
          type="button"
          onClick={onOpenComments}
          className={cn(
            'text-xs mt-1 block w-full text-left truncate leading-tight',
            mutedText,
            'hover:text-foreground transition-colors'
          )}
        >
          <span className={cn('text-xs leading-tight font-semibold mr-1.5', strongText)}>
            {topComment.author.handle || topComment.author.name}
          </span>
          {topComment.content}
        </button>
      )}

    </div>
  );
}
