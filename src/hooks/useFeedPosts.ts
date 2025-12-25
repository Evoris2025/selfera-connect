import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FeedPost } from '@/components/feed/CrossroadFeed';
import { ContentType } from '@/hooks/useCrossroadScroll';

const PAGE_SIZE = 10;

interface UseFeedPostsResult {
  posts: FeedPost[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

function getContentType(mediaType?: string | null): ContentType {
  if (!mediaType) return 'text';
  if (mediaType === 'video') return 'video';
  return 'image';
}

export function useFeedPosts(): UseFeedPostsResult {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchPosts = useCallback(async (afterCursor?: string | null) => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          media_url,
          media_type,
          thumbnail_url,
          created_at,
          profiles!posts_author_id_fkey (
            id,
            display_name,
            handle,
            avatar_url
          )
        `)
        .eq('moderation_status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (afterCursor) {
        query = query.lt('created_at', afterCursor);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (!data || data.length === 0) {
        setHasMore(false);
        return [];
      }

      // Check if we got less than page size, meaning no more posts
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      // Update cursor to the last post's created_at
      const lastPost = data[data.length - 1];
      setCursor(lastPost.created_at);

      // Fetch reaction counts for these posts
      const postIds = data.map(p => p.id);
      const { data: reactionCounts } = await supabase
        .from('reactions')
        .select('post_id')
        .in('post_id', postIds);

      const { data: commentCounts } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds)
        .eq('is_removed', false);

      // Fetch tags for posts
      const { data: postTags } = await supabase
        .from('post_tag_map')
        .select(`
          post_id,
          topic_tags (
            name
          )
        `)
        .in('post_id', postIds);

      // Count reactions and comments per post
      const reactionsMap = new Map<string, number>();
      const commentsMap = new Map<string, number>();
      const tagsMap = new Map<string, string[]>();

      reactionCounts?.forEach(r => {
        reactionsMap.set(r.post_id, (reactionsMap.get(r.post_id) || 0) + 1);
      });

      commentCounts?.forEach(c => {
        commentsMap.set(c.post_id, (commentsMap.get(c.post_id) || 0) + 1);
      });

      postTags?.forEach(pt => {
        const tagName = (pt.topic_tags as any)?.name;
        if (tagName) {
          const existing = tagsMap.get(pt.post_id) || [];
          tagsMap.set(pt.post_id, [...existing, tagName]);
        }
      });

      // Transform to FeedPost format
      const feedPosts: FeedPost[] = data.map(post => {
        const profile = post.profiles as any;
        const createdAt = new Date(post.created_at || '');
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo = '';
        if (diffDays > 0) {
          timeAgo = `${diffDays}d`;
        } else if (diffHours > 0) {
          timeAgo = `${diffHours}h`;
        } else {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          timeAgo = diffMins > 0 ? `${diffMins}m` : 'now';
        }

        return {
          id: post.id,
          authorId: post.author_id,
          author: {
            name: profile?.display_name || profile?.handle || 'Anonymous',
            handle: profile?.handle || 'anonymous',
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`,
            isVerified: false, // TODO: Add verification check
          },
          content: post.content || '',
          media: post.media_url ? {
            type: (post.media_type as 'image' | 'video') || 'image',
            url: post.media_url,
            thumbnail: post.thumbnail_url || undefined,
          } : undefined,
          tags: tagsMap.get(post.id) || [],
          commentCount: commentsMap.get(post.id) || 0,
          createdAt: timeAgo,
          likes: reactionsMap.get(post.id) || 0,
          contentType: getContentType(post.media_type),
        };
      });

      return feedPosts;
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      const initialPosts = await fetchPosts(null);
      setPosts(initialPosts);
      setLoading(false);
    };

    loadInitial();
  }, [fetchPosts]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const morePosts = await fetchPosts(cursor);
    setPosts(prev => [...prev, ...morePosts]);
    setLoadingMore(false);
  }, [cursor, fetchPosts, hasMore, loadingMore]);

  // Refresh posts
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCursor(null);
    setHasMore(true);
    const freshPosts = await fetchPosts(null);
    setPosts(freshPosts);
    setLoading(false);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}
