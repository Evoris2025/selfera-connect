import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { HorizontalLane } from './HorizontalLane';
import type { ContentType } from '@/hooks/useCrossroadScroll';

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

  // Horizontal lane opens only on explicit user intent (keeps vertical feed stable)
  const [openLanePostId, setOpenLanePostId] = useState<string | null>(null);

  const handleOpenLane = useCallback((postId: string) => {
    setOpenLanePostId(postId);
  }, []);

  const handleCloseLane = useCallback(() => {
    setOpenLanePostId(null);
  }, []);

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
        const sameTypePosts = postsByType.get(post.contentType) || [];
        const isLaneOpen = openLanePostId === post.id && sameTypePosts.length > 1;
        const laneIndex =
          laneIndices.get(post.contentType) ??
          Math.max(0, sameTypePosts.findIndex((p) => p.id === post.id));

        return (
          <div key={post.id} className="relative">
            <div className={isLaneOpen ? 'opacity-0 pointer-events-none' : ''}>
              <PostCard
                {...post}
                onPostClick={onPostClick}
                onRequestHorizontalLane={() => handleOpenLane(post.id)}
              />
            </div>

            {isLaneOpen && (
              <div className="absolute inset-0 z-20">
                <div className="absolute top-2 right-2 z-30">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseLane}
                    aria-label="Close horizontal lane"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <HorizontalLane
                  items={sameTypePosts}
                  activeIndex={laneIndex}
                  onIndexChange={(idx) => handleLaneIndexChange(post.contentType, idx)}
                  renderItem={(item) => <PostCard {...item} onPostClick={onPostClick} />}
                  renderWindow={1}
                />
              </div>
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
