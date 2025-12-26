import { memo, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  
  // Swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;
  
  // The post to display is based on localIndex
  const displayedPost = sameTypePosts[localIndex] || post;
  
  const hasPrev = localIndex > 0;
  const hasNext = localIndex < sameTypePosts.length - 1;
  const showArrows = sameTypePosts.length > 1;

  const handlePrev = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (hasPrev) {
      setDirection(-1);
      setLocalIndex(prev => prev - 1);
    }
  }, [hasPrev]);

  const handleNext = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (hasNext) {
      setDirection(1);
      setLocalIndex(prev => prev + 1);
    }
  }, [hasNext]);

  // Touch handlers for swipe gestures
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && hasNext) {
      handleNext();
    } else if (isRightSwipe && hasPrev) {
      handlePrev();
    }
    
    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  }, [hasNext, hasPrev, handleNext, handlePrev]);

  // Animation variants for slide effect
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div 
      className="relative group overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={displayedPost.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
        >
          <PostCard
            {...displayedPost}
            onPostClick={onPostClick}
            onRequestHorizontalLane={onRequestHorizontalLane}
          />
        </motion.div>
      </AnimatePresence>

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
