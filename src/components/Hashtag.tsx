import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HashtagProps {
  tag: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showHash?: boolean;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function Hashtag({ 
  tag, 
  className, 
  size = 'md', 
  showHash = true,
  animated = true 
}: HashtagProps) {
  const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
  
  return (
    <Link
      to={`/explore?tag=${encodeURIComponent(cleanTag)}`}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all',
        'bg-primary/10 text-primary hover:bg-primary/20',
        animated && 'hover:scale-105 active:scale-95',
        sizeClasses[size],
        className
      )}
    >
      {showHash && <span className="opacity-60">#</span>}
      {cleanTag}
    </Link>
  );
}

interface HashtagListProps {
  tags: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  limit?: number;
}

export function HashtagList({ tags, className, size = 'sm', limit }: HashtagListProps) {
  const displayTags = limit ? tags.slice(0, limit) : tags;
  const remaining = limit && tags.length > limit ? tags.length - limit : 0;
  
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayTags.map((tag) => (
        <Hashtag key={tag} tag={tag} size={size} />
      ))}
      {remaining > 0 && (
        <span className={cn(
          'inline-flex items-center rounded-full bg-muted text-muted-foreground',
          sizeClasses[size]
        )}>
          +{remaining}
        </span>
      )}
    </div>
  );
}