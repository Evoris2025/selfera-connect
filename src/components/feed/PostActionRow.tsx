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
  /** Immersive (media) variant tweaks colors for overlay-on-image use. */
  variant?: 'default' | 'overlay';
}

/**
 * Single source of truth for the post action row (Like, Comment, Repost,
 * Share, Community, ...Save). Used by every post type in the feed — text,
 * image, video, and any future variant. Edit here to update every post.
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
  variant = 'default',
}: PostActionRowProps) {
  return (
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
  );
}
