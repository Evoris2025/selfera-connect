import { useMemo, useCallback, useState } from 'react';
import { useMockSystem } from '@/contexts/MockSystemContext';
import type { FeedPost } from '@/components/feed/CrossroadFeed';

const PAGE_SIZE = 10;

interface UseMockFeedPostsResult {
  posts: FeedPost[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMockFeedPosts(): UseMockFeedPostsResult {
  const { state } = useMockSystem();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get visible posts based on current pagination
  const posts = useMemo(() => {
    return state.posts.slice(0, visibleCount);
  }, [state.posts, visibleCount]);

  const hasMore = useMemo(() => {
    return visibleCount < state.posts.length;
  }, [visibleCount, state.posts.length]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, state.posts.length));
    setLoadingMore(false);
  }, [loadingMore, hasMore, state.posts.length]);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setVisibleCount(PAGE_SIZE);
    setRefreshing(false);
  }, [refreshing]);

  return {
    posts,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error: null,
    loadMore,
    refresh,
  };
}
