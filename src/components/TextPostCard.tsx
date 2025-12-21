import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Flag, Ban, VolumeX, BookOpen, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HeartButton, CommentButton, ShareButton, CommentSheet } from './interactions';
import { VerifiedBadge } from './VerifiedBadge';
import { useReactions } from '@/hooks/useReactions';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface TextPostCardProps {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
    isVerified?: boolean;
  };
  content: string;
  tags: string[];
  commentCount: number;
  createdAt: string;
  tone?: 'support' | 'steady' | 'inspiration' | 'progress';
}

const toneStyles = {
  support: 'border-l-rose-500/50',
  steady: 'border-l-sky-500/50',
  inspiration: 'border-l-amber-500/50',
  progress: 'border-l-emerald-500/50',
};

export function TextPostCard({
  id,
  author,
  content,
  tags,
  commentCount,
  createdAt,
  tone = 'steady',
}: TextPostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { heartCount, hasReacted, toggleReaction } = useReactions(id, 0);
  const { inLibrary, toggleLibrary } = useLibrary(id);
  const [showCommentSheet, setShowCommentSheet] = useState(false);

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
  };

  return (
    <Card className={cn(
      'overflow-hidden hover:border-primary/20 transition-colors border-l-4',
      toneStyles[tone]
    )}>
      {/* Elevated Text Content */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <Quote className="h-8 w-8 text-muted-foreground/30 flex-shrink-0 mt-1" />
          <p className="text-lg leading-relaxed text-foreground font-light">
            {content}
          </p>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Author & Actions */}
      <div className="px-6 py-4 border-t border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-border">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-foreground">{author.name}</span>
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

        {/* Actions Row */}
        <div className="flex items-center gap-4 mt-4 text-muted-foreground">
          <HeartButton 
            count={heartCount}
            active={hasReacted}
            onClick={handleReaction}
            size="sm"
          />
          <CommentButton 
            count={commentCount}
            onClick={() => setShowCommentSheet(true)}
            size="sm"
          />
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLibraryToggle}
            className={cn(
              'flex items-center gap-1.5 transition-colors',
              inLibrary ? 'text-primary' : 'hover:text-foreground'
            )}
          >
            <BookOpen className={cn('h-5 w-5', inLibrary && 'fill-current')} />
          </motion.button>
          <ShareButton postId={id} size="sm" />
        </div>
      </div>

      {/* Comment Sheet */}
      <CommentSheet
        open={showCommentSheet}
        onOpenChange={setShowCommentSheet}
        postId={id}
        commentCount={commentCount}
      />
    </Card>
  );
}