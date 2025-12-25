import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCrossroadScroll, ContentType } from '@/hooks/useCrossroadScroll';
import { HorizontalLane } from './HorizontalLane';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { cn } from '@/lib/utils';

export interface FeedPost {
  id: string;
  authorId?: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
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
  likes: number;
  contentType: ContentType;
}

interface CrossroadFeedProps {
  posts: FeedPost[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onPostClick: (post: FeedPost) => void;
  onLoadMore?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

export function CrossroadFeed({ 
  posts, 
  loading,
  loadingMore,
  hasMore,
  onPostClick,
  onLoadMore,
}: CrossroadFeedProps) {
  const [laneIndices, setLaneIndices] = useState<Record<string, number>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { 
    activeIndex, 
    activeContentType, 
    registerPost,
    getSameTypePosts,
    getLaneIndex,
  } = useCrossroadScroll({ 
    posts: posts.map(p => ({ id: p.id, contentType: p.contentType })),
    threshold: 0.35,
  });

  // Handle horizontal lane index change
  const handleLaneIndexChange = useCallback((postId: string, newIndex: number) => {
    setLaneIndices(prev => ({ ...prev, [postId]: newIndex }));
  }, []);

  // Get current lane index for a post
  const getCurrentLaneIndex = useCallback((postId: string, type: ContentType) => {
    return laneIndices[postId] ?? getLaneIndex(postId, type);
  }, [laneIndices, getLaneIndex]);

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore]);

  // Group posts by type for horizontal lanes
  const getHorizontalLanePosts = useCallback((currentPost: FeedPost) => {
    return posts.filter(p => p.contentType === currentPost.contentType);
  }, [posts]);

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => {
          const sameTypePosts = getHorizontalLanePosts(post);
          const isActiveCard = index === activeIndex;
          const showHorizontalLane = sameTypePosts.length > 1;

          return (
            <motion.div
              key={post.id}
              ref={(el) => registerPost(post.id, el)}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'relative',
                post.media ? '' : 'px-0',
                isActiveCard && 'z-10'
              )}
            >
              {/* Horizontal lane for same-type content when active */}
              {isActiveCard && showHorizontalLane ? (
                <HorizontalLane
                  items={sameTypePosts}
                  activeIndex={getCurrentLaneIndex(post.id, post.contentType)}
                  onIndexChange={(idx) => handleLaneIndexChange(post.id, idx)}
                  renderItem={(lanePost) => (
                    <PostCard
                      key={lanePost.id}
                      {...lanePost}
                      onPostClick={() => onPostClick(lanePost)}
                    />
                  )}
                />
              ) : (
                <PostCard
                  {...post}
                  onPostClick={() => onPostClick(post)}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Infinite scroll trigger */}
      {onLoadMore && hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {loadingMore ? (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-muted-foreground"
            >
              Loading more...
            </motion.div>
          ) : (
            <div className="h-1" /> 
          )}
        </div>
      )}
      
      {/* End of feed message */}
      {!hasMore && posts.length > 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          You've reached the end
        </div>
      )}
    </motion.div>
  );
}
