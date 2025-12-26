import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { HorizontalLane } from './HorizontalLane';
import { useCrossroadScroll, ContentType } from '@/hooks/useCrossroadScroll';

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
  onPostClick: (postId: string) => void;
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
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Scroll detection for horizontal lane activation
  const { activePostId, registerPost, getLaneIndex } = useCrossroadScroll({
    posts,
  });

  // Memoize same-type posts lookup by contentType -> FeedPost[]
  const postsByType = useMemo(() => {
    const map = new Map<ContentType, FeedPost[]>();
    posts.forEach((p) => {
      const arr = map.get(p.contentType) || [];
      arr.push(p);
      map.set(p.contentType, arr);
    });
    return map;
  }, [posts]);

  // Track lane indices per content type for horizontal scrolling
  const [laneIndices, setLaneIndices] = useState<Map<ContentType, number>>(new Map());

  const handleLaneIndexChange = useCallback((type: ContentType, index: number) => {
    setLaneIndices((prev) => {
      const next = new Map(prev);
      next.set(type, index);
      return next;
    });
  }, []);

  // Infinite scroll: observe sentinel, but never while a request is in-flight
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    if (loadingMore) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore();
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

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
    <div className="flex flex-col">
      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {posts.map((post) => {
        const isActive = post.id === activePostId;
        const sameTypePosts = postsByType.get(post.contentType) || [];
        const showLane = isActive && sameTypePosts.length > 1;
        const laneIndex = laneIndices.get(post.contentType) ?? getLaneIndex(post.id, post.contentType);

        return (
          <div
            key={post.id}
            ref={(el) => registerPost(post.id, el)}
            className="relative"
          >
            {/* PostCard: always mounted; hidden via CSS when lane is shown */}
            <div className={showLane ? 'invisible h-0 overflow-hidden pointer-events-none' : ''}>
              <PostCard {...post} onPostClick={onPostClick} />
            </div>

            {/* HorizontalLane: only rendered for active post with multiple same-type */}
            {showLane && (
              <HorizontalLane
                items={sameTypePosts}
                activeIndex={laneIndex}
                onIndexChange={(idx) => handleLaneIndexChange(post.contentType, idx)}
                renderItem={(item) => <PostCard {...item} onPostClick={onPostClick} />}
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

      {!hasMore && posts.length > 0 && !loading && (
        <div className="py-8 text-center text-sm text-muted-foreground">You've reached the end</div>
      )}
    </div>
  );
}
