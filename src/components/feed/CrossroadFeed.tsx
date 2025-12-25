import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  refreshing?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onPostClick: (post: FeedPost) => void;
  onLoadMore?: () => void;
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
  const [laneIndices, setLaneIndices] = useState<Record<string, number>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const { 
    activeIndex, 
    registerPost,
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

  // Group posts by type for horizontal lanes
  const getHorizontalLanePosts = useCallback((currentPost: FeedPost) => {
    return posts.filter(p => p.contentType === currentPost.contentType);
  }, [posts]);

  // Infinite scroll observer with guards
  useEffect(() => {
    if (!onLoadMore) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      // Guard: only trigger if intersecting and not already loading
      if (entry.isIntersecting && !isLoadingMoreRef.current && !loadingMore && hasMore) {
        isLoadingMoreRef.current = true;
        onLoadMore();
        
        // Reset after a small delay to allow state to update
        setTimeout(() => {
          isLoadingMoreRef.current = false;
        }, 500);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, { 
      threshold: 0.1,
      rootMargin: '100px',
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore, loadingMore, hasMore]);

  // Reset loading ref when loadingMore changes
  useEffect(() => {
    if (!loadingMore) {
      isLoadingMoreRef.current = false;
    }
  }, [loadingMore]);

  // Show skeletons only on initial load (not refresh)
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4 px-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Refresh indicator overlay */}
      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {posts.map((post, index) => {
        const sameTypePosts = getHorizontalLanePosts(post);
        const isActiveCard = index === activeIndex;
        const showHorizontalLane = sameTypePosts.length > 1;

        return (
          <div
            key={post.id}
            ref={(el) => registerPost(post.id, el)}
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
          </div>
        );
      })}

      {/* Infinite scroll trigger */}
      {onLoadMore && hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {loadingMore ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading more...</span>
            </div>
          ) : (
            <div className="h-1" /> 
          )}
        </div>
      )}
      
      {/* End of feed message */}
      {!hasMore && posts.length > 0 && !loading && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          You've reached the end
        </div>
      )}
    </div>
  );
}
