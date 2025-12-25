import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Flag, Ban, VolumeX, BookOpen, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VerifiedBadge } from './VerifiedBadge';
import { Hashtag } from './Hashtag';
import { CommentButton, ShareButton, CommentSheet, CommunityButton } from './interactions';
import { CinematicAvatar } from './ui/CinematicAvatar';
import { ImmersiveMedia } from './ui/ImmersiveMedia';
import { ReactionButton, ReactionType } from './feed/ReactionPicker';
import { useReactions } from '@/hooks/useReactions';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';


interface PostCardProps {
  id: string;
  authorId?: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
    isVerified?: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  tags: string[];
  commentCount: number;
  createdAt: string;
  likes?: number;
  hasContentWarning?: boolean;
  contentWarningType?: string;
  onPostClick?: () => void;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function PostCard({
  id,
  authorId,
  author,
  content,
  media,
  tags,
  commentCount,
  createdAt,
  likes = 0,
  hasContentWarning,
  contentWarningType,
  onPostClick,
}: PostCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(!hasContentWarning);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(null);
  const { heartCount, hasReacted, toggleReaction } = useReactions(id, likes);
  const { inLibrary, toggleLibrary } = useLibrary(id);

  // Navigate to creator profile
  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  // Handle post content click - open modal
  const handlePostContentClick = () => {
    if (onPostClick) {
      onPostClick();
    }
  };

  const handleDoubleTap = async () => {
    if (!user) {
      return;
    }
    
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 1000);
    
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
    
    if (!hasReacted) {
      await toggleReaction();
      setCurrentReaction('like');
    }
  };

  const handleReaction = async (type: ReactionType | null) => {
    if (!user) {
      return;
    }
    
    setCurrentReaction(type);
    // If toggling off or changing reaction
    if (type === null && hasReacted) {
      await toggleReaction();
    } else if (type !== null && !hasReacted) {
      await toggleReaction();
    }
  };

  const handleLibraryToggle = async () => {
    if (!user) {
      return;
    }
    await toggleLibrary();
  };

  const renderContent = () => {
    const parts = content.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return <Hashtag key={i} tag={part} size="sm" className="inline mx-0.5" />;
      }
      return part;
    });
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-4 my-2"
    >
      <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <motion.button
            onClick={handleCreatorClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3"
          >
            <CinematicAvatar
              src={author.avatar}
              alt={author.name}
              fallback={author.name.charAt(0)}
              size="md"
              ring="muted"
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-sm">{author.name}</span>
                {author.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-xs text-muted-foreground">@{author.handle} · {createdAt}</p>
            </div>
          </motion.button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem className="gap-2">
                <Flag className="h-4 w-4" />
                {t('safety.report')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <VolumeX className="h-4 w-4" />
                {t('safety.mute')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive">
                <Ban className="h-4 w-4" />
                {t('safety.block')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <button 
          onClick={handlePostContentClick}
          className="text-left w-full"
        >
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {renderContent()}
          </p>
        </button>

        {/* Media */}
        {media && (
          <div className="mb-3 rounded-lg overflow-hidden">
            {hasContentWarning && !showContent ? (
              <div 
                className="aspect-video bg-card/80 backdrop-blur-xl flex items-center justify-center cursor-pointer"
                onClick={() => setShowContent(true)}
              >
                <div className="text-center px-8">
                  <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <span className="text-sm text-warning font-medium block mb-1">{contentWarningType || 'Sensitive Content'}</span>
                  <p className="text-muted-foreground text-xs">Tap to view</p>
                </div>
              </div>
            ) : (
              <ImmersiveMedia
                src={media.url}
                type={media.type}
                poster={media.thumbnail}
                aspectRatio="landscape"
                overlay="subtle"
                onDoubleTap={handleDoubleTap}
                showHeartOnDoubleTap={true}
                onClick={handlePostContentClick}
              />
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && !content.includes('#') && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <Hashtag key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            <ReactionButton 
              postId={id}
              currentReaction={currentReaction}
              count={heartCount}
              onReact={handleReaction}
            />
            <CommentButton 
              count={commentCount}
              onClick={() => setShowCommentSheet(true)}
            />
            <ShareButton postId={id} />
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLibraryToggle}
            className={cn(
              'transition-colors',
              inLibrary ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BookOpen className={cn('h-5 w-5', inLibrary && 'fill-current')} />
          </motion.button>
        </div>
      </div>

      <CommentSheet
        open={showCommentSheet}
        onOpenChange={setShowCommentSheet}
        postId={id}
        commentCount={commentCount}
      />
    </motion.article>
  );
}
