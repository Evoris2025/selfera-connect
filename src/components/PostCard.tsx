import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Flag, Ban, VolumeX, BookOpen, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VerifiedBadge } from './VerifiedBadge';
import { Hashtag } from './Hashtag';
import { ShareToCommunityModal } from './ShareToCommunityModal';
import { HeartButton, CommentButton, ShareButton, CommentSheet } from './interactions';
import { useReactions } from '@/hooks/useReactions';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
  id: string;
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
  const [localLikes, setLocalLikes] = useState(likes);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const lastTapRef = useRef<number>(0);
  const { heartCount, hasReacted, toggleReaction } = useReactions(id);
  const { inLibrary, toggleLibrary } = useLibrary(id);

  const handleDoubleTap = async () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!user) {
        toast({
          title: t('auth.required'),
          description: t('auth.loginToReact'),
          variant: 'destructive',
        });
        return;
      }
      
      // Show heart overlay animation
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      // Only add reaction if not already reacted
      if (!hasReacted) {
        setLocalLikes(prev => prev + 1);
        await toggleReaction();
      }
    }
    lastTapRef.current = now;
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
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setLocalLikes(prev => hasReacted ? prev - 1 : prev + 1);
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

  // Parse content for hashtags
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
    <Card className="overflow-hidden border-0 border-b border-border rounded-none bg-transparent">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-sm">{author.name}</span>
              {author.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-muted-foreground">@{author.handle} · {createdAt}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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

      {/* Media */}
      {media && (
        <div className="relative">
          {hasContentWarning && !showContent ? (
            <div 
              className="aspect-square bg-secondary/50 backdrop-blur-xl flex items-center justify-center cursor-pointer"
              onClick={() => setShowContent(true)}
            >
              <div className="text-center">
                <span className="text-sm text-warning font-medium">{contentWarningType}</span>
                <p className="text-muted-foreground text-sm mt-1">Tap to view</p>
              </div>
            </div>
          ) : media.type === 'image' ? (
            <div 
              className="relative cursor-pointer select-none"
              onClick={handleDoubleTap}
            >
              <img 
                src={media.url} 
                alt="" 
                className="w-full aspect-square object-cover"
              />
              {showHeartOverlay && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Heart className="h-24 w-24 fill-white text-white drop-shadow-lg animate-heart-burst" />
                </motion.div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-secondary flex items-center justify-center">
              <video 
                src={media.url} 
                poster={media.thumbnail}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Actions - Instagram Style */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <HeartButton 
              count={localLikes + heartCount}
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
              onClick={() => setShowCommunityModal(true)}
              className="text-foreground hover:text-muted-foreground transition-colors"
            >
              <Users className="h-6 w-6" />
            </motion.button>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLibraryToggle}
            className={cn(
              'transition-colors',
              inLibrary ? 'text-foreground' : 'text-foreground hover:text-muted-foreground'
            )}
          >
            <BookOpen className={cn('h-6 w-6', inLibrary && 'fill-current')} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="mt-1">
          <p className="text-sm text-foreground">
            <span className="font-semibold mr-1">{author.handle}</span>
            {renderContent()}
          </p>
        </div>

        {/* Tags as hashtags */}
        {tags.length > 0 && !content.includes('#') && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <Hashtag key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {/* Comments link */}
        {commentCount > 0 && (
          <button 
            onClick={() => setShowCommentSheet(true)}
            className="text-sm text-muted-foreground mt-1 hover:text-foreground transition-colors"
          >
            View all {formatCount(commentCount)} comments
          </button>
        )}
      </div>

      {/* Comment Sheet */}
      <CommentSheet
        open={showCommentSheet}
        onOpenChange={setShowCommentSheet}
        postId={id}
        commentCount={commentCount}
      />

      {/* Share to Community Modal */}
      <ShareToCommunityModal
        open={showCommunityModal}
        onOpenChange={setShowCommunityModal}
        postId={id}
      />
    </Card>
  );
}