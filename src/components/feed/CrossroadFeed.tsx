import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { useViewTracking } from '@/hooks/useViewTracking';
import type { ContentType } from '@/hooks/useCrossroadScroll';

// Audience union shared with FeedDataContext (duplicated here to avoid circular imports)
export type FeedAudience = 'public' | 'followers' | 'close_friends' | 'only_me' | 'custom';
export type FeedPostMode = 'post' | 'reel';

export interface FeedPostBackground {
  type: 'color' | 'gradient';
  value: string;
  textColor?: string;
}

// ---- Phase 4 additive types --------------------------------------------------
export interface FeedCheckIn {
  placeId: string;
  name: string;
  category?: string;
}

export interface FeedTaggedPerson {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
}

export interface FeedLinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export type FeedCommentPermission = 'everyone' | 'followers' | 'nobody';

export interface FeedLifeEvent {
  kind: string;          // e.g. 'new_job' | 'moved' | 'married' | 'graduated' | 'custom'
  label: string;
  icon?: string;
  date?: number;
}

export interface FeedFundraiser {
  title: string;
  goal: number;
  currency: string;
}

export interface FeedCustomAudience {
  include: string[];
  exclude: string[];
}

// ---- Poll (lives on FeedPost.poll) ------------------------------------------
export interface FeedPollOption {
  text: string;
  image?: string;
}

export interface FeedPoll {
  options: FeedPollOption[];
  multiSelect?: boolean;
  durationMs?: number;
  closesAt?: number;
}

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
  // Additive optional fields (default to legacy behavior)
  audience?: FeedAudience;
  scheduledAt?: number | null;
  mode?: FeedPostMode;
  background?: FeedPostBackground;
  remixOfId?: string;
  // Phase 4 additive fields — every one optional, defaults preserve old behavior
  checkIn?: FeedCheckIn;
  taggedPeople?: FeedTaggedPerson[];
  linkPreview?: FeedLinkPreview;
  commentPermission?: FeedCommentPermission;
  reactionsDisabled?: boolean;
  lifeEvent?: FeedLifeEvent;
  fundraiser?: FeedFundraiser;
  customAudience?: FeedCustomAudience;
  poll?: FeedPoll;
  thread?: Array<{ id: string; content: string; mediaUrl?: string; mediaType?: 'image' | 'video' | 'gif' }>;
}

interface CrossroadFeedProps {
  posts: FeedPost[];
  loading?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onPostClick: (postId: string) => void;
  onLoadMore?: () => void;
  onRefresh?: () => Promise<void>;
}

export function CrossroadFeed({
  posts,
  loading,
  refreshing,
  loadingMore,
  hasMore,
  onPostClick,
  onLoadMore,
  onRefresh,
}: CrossroadFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullThreshold = 80;
  
  // View tracking for analytics
  const { getPostRef } = useViewTracking({ threshold: 0.5, minVisibleTime: 1000 });

  // Track scroll position for back-to-top button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 400);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Pull-to-refresh touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || container.scrollTop > 0 || isRefreshing) return;
    
    startYRef.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    if (diff > 0) {
      // Apply resistance to pull
      const resistance = 0.4;
      setPullDistance(Math.min(diff * resistance, 120));
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= pullThreshold && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60); // Hold at indicator position
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    setIsPulling(false);
  }, [isPulling, pullDistance, onRefresh, isRefreshing]);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !onLoadMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, onLoadMore, loadingMore]);

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

  const pullProgress = Math.min(pullDistance / pullThreshold, 1);

  return (
    <div className="relative flex-1">
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: Math.min(pullDistance - 20, 40)
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="bg-background/90 backdrop-blur-md rounded-full p-3 shadow-lg border border-border/50">
              <motion.div
                className="relative w-6 h-6"
                animate={isRefreshing ? { rotate: 360 } : { rotate: pullProgress * 360 }}
                transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              >
                {/* Custom loading spinner */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <circle
                    className="text-muted-foreground/30"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  />
                  <motion.circle
                    className="text-primary"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeDasharray={62.83}
                    strokeDashoffset={isRefreshing ? 15 : 62.83 * (1 - pullProgress)}
                  />
                </svg>
                {pullProgress >= 1 && !isRefreshing && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <ArrowUp className="w-4 h-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable container */}
      <motion.div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-20 h-full"
        style={{ transform: `translateY(${pullDistance}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {refreshing && !isRefreshing && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              ref={getPostRef(post.id)}
            >
              <PostCard
                {...post}
                onPostClick={onPostClick}
              />
            </div>
          ))}
        </div>

        {/* Load more trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </motion.div>

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-transform"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
