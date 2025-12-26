import { memo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
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
  const [localIndex, setLocalIndex] = useState(currentIndexInType);
  
  // Motion values for drag
  const x = useMotionValue(0);
  const dragThreshold = 100;
  
  // The post to display is based on localIndex
  const displayedPost = sameTypePosts[localIndex] || post;
  const prevPost = localIndex > 0 ? sameTypePosts[localIndex - 1] : null;
  const nextPost = localIndex < sameTypePosts.length - 1 ? sameTypePosts[localIndex + 1] : null;
  
  const hasPrev = localIndex > 0;
  const hasNext = localIndex < sameTypePosts.length - 1;
  const showArrows = sameTypePosts.length > 1;

  // Transform for peek posts opacity based on drag
  const prevOpacity = useTransform(x, [0, 150], [0, 1]);
  const nextOpacity = useTransform(x, [-150, 0], [1, 0]);
  
  // Scale transforms for depth effect
  const currentScale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const peekScale = useTransform(x, [-150, 0, 150], [1, 0.9, 1]);

  const handlePrev = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (hasPrev) {
      setLocalIndex(prev => prev - 1);
    }
  }, [hasPrev]);

  const handleNext = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (hasNext) {
      setLocalIndex(prev => prev + 1);
    }
  }, [hasNext]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Determine if we should navigate based on offset or velocity
    const shouldGoNext = (offset < -dragThreshold || velocity < -500) && hasNext;
    const shouldGoPrev = (offset > dragThreshold || velocity > 500) && hasPrev;
    
    if (shouldGoNext) {
      setLocalIndex(prev => prev + 1);
    } else if (shouldGoPrev) {
      setLocalIndex(prev => prev - 1);
    }
    
    // Animate back to center
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
  }, [hasNext, hasPrev, x]);

  return (
    <div className="relative group overflow-hidden">
      {/* Previous post peek (behind, left side) */}
      {prevPost && (
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ opacity: prevOpacity, scale: peekScale }}
        >
          <PostCard
            {...prevPost}
            disableSwipeDetection
            onPostClick={() => {}}
            onRequestHorizontalLane={onRequestHorizontalLane}
          />
        </motion.div>
      )}
      
      {/* Next post peek (behind, right side) */}
      {nextPost && (
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ opacity: nextOpacity, scale: peekScale }}
        >
          <PostCard
            {...nextPost}
            disableSwipeDetection
            onPostClick={() => {}}
            onRequestHorizontalLane={onRequestHorizontalLane}
          />
        </motion.div>
      )}

      {/* Current post (draggable) */}
      <motion.div
        key={displayedPost.id}
        style={{ x, scale: currentScale }}
        drag="x"
        onDragEnd={handleDragEnd}
        className="relative z-10 cursor-grab active:cursor-grabbing"
      >
        <PostCard
          {...displayedPost}
          disableSwipeDetection
          onPostClick={onPostClick}
          onRequestHorizontalLane={onRequestHorizontalLane}
        />
      </motion.div>

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

    </div>
  );
}

export const PostCardWithNavigation = memo(PostCardWithNavigationBase);
PostCardWithNavigation.displayName = 'PostCardWithNavigation';
