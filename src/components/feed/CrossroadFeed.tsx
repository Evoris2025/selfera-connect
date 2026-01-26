import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { useFeedReactions } from '@/hooks/useFeedReactions';
import { useAuth } from '@/contexts/AuthContext';
import type { ContentType } from '@/hooks/useCrossroadScroll';

export interface FeedPost {
  id: string;
  authorId?: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
    email?: string;
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
  likes: number;
  contentType: ContentType;
}

interface CrossroadFeedProps {
  posts: FeedPost[];
  loading?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onPostClick: (postId: string) => void;
  onLoadMore?: () => void;
}

// Haptic feedback utility
const triggerHaptic = (pattern: number | number[] = 10) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Double tap detection hook
function useDoubleTap(callback: () => void, delay = 300) {
  const lastTapRef = useRef<number>(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < delay) {
      callback();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [callback, delay]);

  return handleTap;
}

// Heart overlay component for double-tap feedback
function HeartOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.4, 1.2],
              opacity: [0, 1, 1]
            }}
            exit={{ 
              scale: 1.5,
              opacity: 0
            }}
            transition={{ 
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <Heart className="h-24 w-24 fill-red-500 text-red-500 drop-shadow-lg" />
          </motion.div>
          {/* Particle burst effect */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-red-500 rounded-full"
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 80,
                y: Math.sin((i * 60 * Math.PI) / 180) * 80,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CrossroadFeed({
  posts,
  loading,
  refreshing,
  loadingMore,
  hasMore,
  onPostClick,
  onLoadMore,
}: CrossroadFeedProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get current post's reaction handler
  const currentPost = posts[currentIndex];
  const { currentReaction, setReaction } = useFeedReactions(
    currentPost?.id || '', 
    currentPost?.likes || 0
  );

  // Reset index when posts change significantly
  useEffect(() => {
    if (posts.length > 0 && currentIndex >= posts.length) {
      setCurrentIndex(Math.max(0, posts.length - 1));
    }
  }, [posts.length, currentIndex]);

  // Load more when near end
  useEffect(() => {
    if (currentIndex >= posts.length - 2 && hasMore && onLoadMore && !loadingMore) {
      onLoadMore();
    }
  }, [currentIndex, posts.length, hasMore, onLoadMore, loadingMore]);

  const handleDoubleTapLike = useCallback(() => {
    if (!user || !currentPost) return;
    
    // Haptic feedback for double-tap like
    triggerHaptic([10, 30, 10]);
    
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 800);
    
    // Only like if not already liked
    if (!currentReaction) {
      setReaction('like');
    }
  }, [user, currentPost, currentReaction, setReaction]);

  const handleDoubleTap = useDoubleTap(handleDoubleTapLike);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const threshold = 50;
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      let newIndex = currentIndex;

      // Swipe up = next post
      if ((offset < -threshold || velocity < -500) && currentIndex < posts.length - 1) {
        newIndex = currentIndex + 1;
      }
      // Swipe down = previous post
      else if ((offset > threshold || velocity > 500) && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      if (newIndex !== currentIndex) {
        // Haptic feedback for successful swipe
        triggerHaptic(15);
        setCurrentIndex(newIndex);
      }
    },
    [currentIndex, posts.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const newIndex = Math.min(currentIndex + 1, posts.length - 1);
        if (newIndex !== currentIndex) {
          triggerHaptic(10);
          setCurrentIndex(newIndex);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const newIndex = Math.max(currentIndex - 1, 0);
        if (newIndex !== currentIndex) {
          triggerHaptic(10);
          setCurrentIndex(newIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts.length]);

  // Skeletons only on initial load
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4 px-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 overflow-hidden touch-none pb-20"
      style={{ height: 'calc(100dvh - 280px)' }}
    >
      {refreshing && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={currentIndex}
          className="absolute inset-0 flex flex-col"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTap={handleDoubleTap}
          initial={{ y: isDragging ? 0 : '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {posts[currentIndex] && (
            <div className="h-full overflow-y-auto scrollbar-hide">
              <PostCard
                {...posts[currentIndex]}
                onPostClick={onPostClick}
              />
            </div>
          )}
          
          {/* Double-tap heart overlay */}
          <HeartOverlay show={showHeartOverlay} />
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1">
        {posts.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((post, i) => {
          const actualIndex = Math.max(0, currentIndex - 2) + i;
          const isActive = actualIndex === currentIndex;
          return (
            <button
              key={post.id}
              onClick={() => {
                triggerHaptic(5);
                setCurrentIndex(actualIndex);
              }}
              className={`w-1 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'h-6 bg-primary' 
                  : 'h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to post ${actualIndex + 1}`}
            />
          );
        })}
      </div>

      {/* Post counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground">
          {currentIndex + 1} / {posts.length}
          {loadingMore && ' • Loading...'}
        </div>
      </div>

      {/* Swipe hints */}
      {currentIndex === 0 && posts.length > 1 && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 text-muted-foreground/50 text-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Swipe up for more
        </motion.div>
      )}
    </div>
  );
}
