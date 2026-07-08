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
  sm: 'text-label',
  md: 'text-body',
  lg: 'text-title',
};

export function Hashtag({
  tag,
  className,
  size = 'md',
  showHash = true,
  animated = true,
}: HashtagProps) {
  const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;

  return (
    <Link
      to={`/explore?tag=${encodeURIComponent(cleanTag)}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline text-primary hover:underline font-normal transition-colors',
        sizeClasses[size],
        className
      )}
    >
      {showHash && '#'}
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