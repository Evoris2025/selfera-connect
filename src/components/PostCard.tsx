import { useState, useRef } from 'react';
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
import { HeartButton, CommentButton, ShareButton, CommentSheet, CommunityButton } from './interactions';
import { CinematicAvatar } from './ui/CinematicAvatar';
import { ImmersiveMedia } from './ui/ImmersiveMedia';
import { FloatingActionBar } from './ui/FloatingActionBar';
import { useReactions } from '@/hooks/useReactions';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
}: PostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(!hasContentWarning);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const { heartCount, hasReacted, toggleReaction } = useReactions(id, likes);
  const { inLibrary, toggleLibrary } = useLibrary(id);

  const handleDoubleTap = async () => {
    if (!user) {
      toast({
        title: t('auth.required'),
        description: t('auth.loginToReact'),
        variant: 'destructive',
      });
      return;
    }
    
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 1000);
    
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
    
    if (!hasReacted) {
      await toggleReaction();
    }
  };

  const handleReaction = async () => {
    if (!user) {
      toast({
        title: t('auth.required'),
        description: t('auth.loginToReact'),
        variant: 'destructive',
      });
      return;
    }
    
    await toggleReaction();
  };

  const handleLibraryToggle = async () => {
    if (!user) {
      toast({
        title: t('auth.required'),
        description: t('auth.loginToSave'),
        variant: 'destructive',
      });
      return;
    }
    await toggleLibrary();
    toast({
      title: inLibrary ? t('library.removed') : t('library.added'),
      description: inLibrary ? t('library.removedDesc') : t('library.addedDesc'),
    });
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

  // Text-only post
  if (!media) {
    return (
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 py-5 border-b border-border/40"
      >
        <div className="flex gap-3">
          <CinematicAvatar
            src={author.avatar}
            alt={author.name}
            fallback={author.name.charAt(0)}
            size="md"
            ring="muted"
            interactive
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-[15px]">{author.name}</span>
                {author.isVerified && <VerifiedBadge size="sm" />}
                <span className="text-muted-foreground text-sm">· {createdAt}</span>
              </div>
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
            
            <p className="text-[15px] text-foreground leading-relaxed mb-3">
              {renderContent()}
            </p>

            {tags.length > 0 && !content.includes('#') && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map((tag) => (
                  <Hashtag key={tag} tag={tag} size="sm" />
                ))}
              </div>
            )}

            <div className="flex items-center gap-5 pt-1">
              <HeartButton 
                count={heartCount}
                active={hasReacted}
                onClick={handleReaction}
              />
              <CommentButton 
                count={commentCount}
                onClick={() => setShowCommentSheet(true)}
              />
              <ShareButton postId={id} />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleLibraryToggle}
                className={cn(
                  'transition-colors ml-auto',
                  inLibrary ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <BookOpen className={cn('h-5 w-5', inLibrary && 'fill-current')} />
              </motion.button>
            </div>
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

  // Media post - edge-to-edge immersive
  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Content Warning Overlay */}
      {hasContentWarning && !showContent ? (
        <div 
          className="aspect-[4/5] bg-card/80 backdrop-blur-xl flex items-center justify-center cursor-pointer"
          onClick={() => setShowContent(true)}
        >
          <div className="text-center px-8">
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <span className="text-base text-warning font-medium block mb-2">{contentWarningType || 'Sensitive Content'}</span>
            <p className="text-muted-foreground text-sm">Tap to view</p>
          </div>
        </div>
      ) : (
        <ImmersiveMedia
          src={media.url}
          type={media.type}
          poster={media.thumbnail}
          aspectRatio="portrait"
          overlay="full"
          onDoubleTap={handleDoubleTap}
          showHeartOnDoubleTap={true}
        >
          {/* Floating Header - Author Info */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-20"
          >
            <div className="flex items-center gap-3">
              <CinematicAvatar
                src={author.avatar}
                alt={author.name}
                fallback={author.name.charAt(0)}
                size="md"
                ring="gradient"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground text-[15px] drop-shadow-md">{author.name}</span>
                  {author.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-sm text-foreground/70 drop-shadow-sm">@{author.handle}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full glass-subtle">
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
          </motion.div>

          {/* Bottom Content - Caption & Tags */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-[15px] text-foreground leading-relaxed mb-2 drop-shadow-md">
                <span className="font-semibold mr-1.5">{author.handle}</span>
                {renderContent()}
              </p>

              {tags.length > 0 && !content.includes('#') && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.map((tag) => (
                    <span key={tag} className="text-sm text-foreground/80 font-medium">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-5">
                  <HeartButton 
                    count={heartCount}
                    active={hasReacted}
                    onClick={handleReaction}
                  />
                  <CommentButton 
                    count={commentCount}
                    onClick={() => setShowCommentSheet(true)}
                  />
                  <ShareButton postId={id} />
                  {authorId && (
                    <CommunityButton 
                      authorId={authorId}
                      authorName={author.name}
                    />
                  )}
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLibraryToggle}
                  className={cn(
                    'transition-colors p-2',
                    inLibrary ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                  )}
                >
                  <BookOpen className={cn('h-6 w-6', inLibrary && 'fill-current')} />
                </motion.button>
              </div>

              {commentCount > 0 && (
                <button 
                  onClick={() => setShowCommentSheet(true)}
                  className="text-sm text-muted-foreground mt-2 hover:text-foreground transition-colors"
                >
                  View all {formatCount(commentCount)} comments
                </button>
              )}
            </motion.div>
          </div>
        </ImmersiveMedia>
      )}

      <CommentSheet
        open={showCommentSheet}
        onOpenChange={setShowCommentSheet}
        postId={id}
        commentCount={commentCount}
      />
    </motion.article>
  );
}
