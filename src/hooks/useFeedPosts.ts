import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FeedPost } from '@/components/feed/CrossroadFeed';
import { ContentType } from '@/hooks/useCrossroadScroll';

const PAGE_SIZE = 10;

// Mock posts fallback when no real posts exist
const mockPosts: FeedPost[] = [
  {
    id: 'mock-1',
    authorId: 'mock-author-1',
    author: {
      name: 'Sarah Chen',
      handle: 'sarahc',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Taking time for self-care today. Remember: you can\'t pour from an empty cup. 🌸',
    tags: ['selfcare', 'mentalhealth'],
    commentCount: 12,
    createdAt: '2h',
    likes: 47,
    contentType: 'text',
  },
  {
    id: 'mock-2',
    authorId: 'mock-author-2',
    author: {
      name: 'Mind Matters',
      handle: 'mindmatters',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Morning meditation complete. Starting the day with intention and gratitude.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    },
    tags: ['meditation', 'morning'],
    commentCount: 8,
    createdAt: '4h',
    likes: 89,
    contentType: 'image',
  },
  {
    id: 'mock-3',
    authorId: 'mock-author-3',
    author: {
      name: 'James Wilson',
      handle: 'jwilson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      isVerified: false,
    },
    content: 'Therapy session today was a breakthrough. It\'s okay to ask for help. 💪',
    tags: ['therapy', 'growth'],
    commentCount: 23,
    createdAt: '6h',
    likes: 156,
    contentType: 'text',
  },
  {
    id: 'mock-4',
    authorId: 'mock-author-4',
    author: {
      name: 'Wellness Hub',
      handle: 'wellnesshub',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Nature walk therapy 🌿 Sometimes the best medicine is fresh air and green spaces.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    },
    tags: ['nature', 'wellness'],
    commentCount: 15,
    createdAt: '8h',
    likes: 234,
    contentType: 'image',
  },
  {
    id: 'mock-5',
    authorId: 'mock-author-5',
    author: {
      name: 'Emma Roberts',
      handle: 'emmar',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      isVerified: false,
    },
    content: 'Journaling prompt: What are three things you\'re grateful for today? Share below! ✨',
    tags: ['journaling', 'gratitude'],
    commentCount: 45,
    createdAt: '12h',
    likes: 312,
    contentType: 'text',
  },
  {
    id: 'mock-6',
    authorId: 'mock-author-6',
    author: {
      name: 'Alex Turner',
      handle: 'alext',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      isVerified: false,
    },
    content: 'Breathwork session done. 5 minutes of deep breathing can change your entire day.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
    },
    tags: ['breathwork', 'mindfulness'],
    commentCount: 7,
    createdAt: '1d',
    likes: 78,
    contentType: 'image',
  },
];

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
      // Use mock posts if no real posts exist
      if (initialPosts.length === 0) {
        setPosts(mockPosts);
        setHasMore(false);
      } else {
        setPosts(initialPosts);
      }
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
