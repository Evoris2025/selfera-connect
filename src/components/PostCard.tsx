import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Flag, Ban, VolumeX, BookOpen, Share2, MessageCircle } from 'lucide-react';
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
import { ReactionButton } from './ReactionButton';
import { VerifiedBadge } from './VerifiedBadge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
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
  reactions: {
    heart: number;
  };
  commentCount: number;
  createdAt: string;
  hasContentWarning?: boolean;
  contentWarningType?: string;
}

export function PostCard({
  author,
  content,
  media,
  tags,
  reactions,
  commentCount,
  createdAt,
  hasContentWarning,
  contentWarningType,
}: PostCardProps) {
  const { t } = useTranslation();
  const [showContent, setShowContent] = useState(!hasContentWarning);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [inLibrary, setInLibrary] = useState(false);

  const handleReaction = (type: string) => {
    setActiveReaction(activeReaction === type ? null : type);
  };

  const handleLibraryToggle = () => {
    setInLibrary(!inLibrary);
    toast({
      title: inLibrary ? t('library.removed') : t('library.added'),
      description: inLibrary ? t('library.removedDesc') : t('library.addedDesc'),
    });
  };

  return (
    <Card className="overflow-hidden hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-border">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">{author.name}</span>
              {author.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-sm text-muted-foreground">@{author.handle}</p>
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

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="rounded-full text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-foreground leading-relaxed">{content}</p>
      </div>

      {/* Media */}
      {media && (
        <div className="relative">
          {hasContentWarning && !showContent ? (
            <div 
              className="aspect-video bg-secondary/50 backdrop-blur-xl flex items-center justify-center cursor-pointer"
              onClick={() => setShowContent(true)}
            >
              <div className="text-center">
                <Badge variant="outline" className="mb-2 border-warning/50 text-warning">
                  {contentWarningType}
                </Badge>
                <p className="text-muted-foreground text-sm">Tap to view</p>
              </div>
            </div>
          ) : media.type === 'image' ? (
            <img 
              src={media.url} 
              alt="" 
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="aspect-video bg-secondary flex items-center justify-center">
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

      {/* Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-4">
            <ReactionButton 
              type="heart" 
              count={reactions.heart} 
              active={activeReaction === 'heart'}
              onClick={() => handleReaction('heart')}
            />
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{commentCount}</span>
            </button>
            <button 
              onClick={handleLibraryToggle}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                inLibrary ? 'text-primary' : 'hover:text-foreground'
              )}
            >
              <BookOpen className={cn('h-4 w-4', inLibrary && 'fill-current')} />
            </button>
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs">{createdAt}</span>
        </div>
      </div>
    </Card>
  );
}
