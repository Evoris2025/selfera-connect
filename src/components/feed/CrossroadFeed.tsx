import { useEffect, useRef } from 'react';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { ContentType } from '@/hooks/useCrossroadScroll';

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

  // Infinite scroll: observe sentinel, but never while a request is in-flight.
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    if (loadingMore) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore();
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

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

      {/* Critical: stable list (no scroll-driven subtree swap) + stable key (post.id) */}
      {posts.map((post) => (
        <div key={post.id} className="relative">
          <PostCard {...post} onPostClick={onPostClick} />
        </div>
      ))}

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
