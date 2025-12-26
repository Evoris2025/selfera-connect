import { memo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import type { FeedPost } from './CrossroadFeed';

interface PostCardWithNavigationProps {
  post: FeedPost;
  sameTypePosts: FeedPost[];
  currentIndexInType: number;
  onPostClick: (postId: string) => void;
  onRequestHorizontalLane?: () => void;
}

function PostCardWithNavigationBase({
  post,
  sameTypePosts,
  currentIndexInType,
  onPostClick,
  onRequestHorizontalLane,
}: PostCardWithNavigationProps) {
  // Local state to track current position within sameTypePosts for this row
  const [localIndex, setLocalIndex] = useState(currentIndexInType);
  
  // The post to display is based on localIndex
  const displayedPost = sameTypePosts[localIndex] || post;
  
  const hasPrev = localIndex > 0;
  const hasNext = localIndex < sameTypePosts.length - 1;
  const showArrows = sameTypePosts.length > 1;

  const handlePrev = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasPrev) {
      setLocalIndex(localIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasNext) {
      setLocalIndex(localIndex + 1);
    }
  };

  return (
    <div className="relative group">
      <PostCard
        {...displayedPost}
        onPostClick={onPostClick}
        onRequestHorizontalLane={onRequestHorizontalLane}
      />

      {/* Navigation Arrows Overlay */}
      {showArrows && (
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none z-30">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={!hasPrev}
            className={`
              pointer-events-auto p-2 rounded-full 
              bg-background/80 backdrop-blur-sm 
              text-foreground/80 hover:bg-background hover:text-foreground
              transition-all duration-200
              opacity-0 group-hover:opacity-100 focus:opacity-100
              disabled:opacity-0 disabled:pointer-events-none
              shadow-lg
            `}
            aria-label="Previous same-type post"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={!hasNext}
            className={`
              pointer-events-auto p-2 rounded-full 
              bg-background/80 backdrop-blur-sm 
              text-foreground/80 hover:bg-background hover:text-foreground
              transition-all duration-200
              opacity-0 group-hover:opacity-100 focus:opacity-100
              disabled:opacity-0 disabled:pointer-events-none
              shadow-lg
            `}
            aria-label="Next same-type post"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Position indicator */}
      {showArrows && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          {sameTypePosts.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === localIndex
                  ? 'bg-primary w-3'
                  : 'bg-foreground/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const PostCardWithNavigation = memo(PostCardWithNavigationBase);
PostCardWithNavigation.displayName = 'PostCardWithNavigation';
