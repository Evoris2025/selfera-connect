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

// Small deterministic pool for a plausible "Liked by …" name when we have
// no real liker data (mock feed). Keeps display stable per post.
const LIKER_POOL = [
  'lbmuc75',
  'ataste0fmatt',
  'jenny.wren',
  'kai_rivers',
  'sam.holloway',
  'noor.k',
  'devon.m',
  'ari.b',
];
function pickLiker(postId: string): string {
  let h = 0;
  for (let i = 0; i < postId.length; i++) h = (h * 31 + postId.charCodeAt(i)) | 0;
  return LIKER_POOL[Math.abs(h) % LIKER_POOL.length];
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
  const comments = feedData.getComments(postId);
  const topComment = comments.length > 0 ? comments[comments.length - 1] : null;
  const likerName = topLikerName || pickLiker(postId);

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
        <div className={cn('flex items-center gap-2 mt-1.5 text-label', mutedText)}>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${likerName}`}
            alt=""
            className="h-4 w-4 rounded-full flex-shrink-0"
          />
          <p className="truncate">
            Liked by{' '}
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={cn('font-semibold hover:underline', strongText)}
            >
              {likerName}
            </button>
            {reactionCount > 1 && (
              <>
                {' '}and <span className={cn('font-semibold', strongText)}>{formatCount(reactionCount - 1)}</span> others
              </>
            )}
          </p>
        </div>
      )}

      {/* Top comment preview — tap to open full thread; 'more' link below */}
      {topComment && canComment && (
        <div className="mt-0.5">
          <button
            type="button"
            onClick={onOpenComments}
            className={cn(
              'text-label block w-full text-left truncate',
              mutedText,
              'hover:text-foreground transition-colors'
            )}
          >
            <span className={cn('font-semibold mr-1.5', strongText)}>
              {topComment.author.handle || topComment.author.name}
            </span>
            {topComment.content}
          </button>
          {topComment.content.length > 60 && (
            <button
              type="button"
              onClick={onOpenComments}
              className={cn('text-label hover:underline', mutedText)}
            >
              more
            </button>
          )}
        </div>
      )}

    </div>
  );
}
