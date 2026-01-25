import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlocks } from './useBlocks';
import { useMutes } from './useMutes';

interface CommunityPost {
  id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  author_id: string;
  community_id: string | null;
  author: {
    id: string;
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    is_private: boolean;
    email: string | null;
  };
}

export function useCommunityFeed(communityId: string | null) {
  const { user } = useAuth();
  const { blockedUserIds } = useBlocks();
  const { mutedUserIds } = useMutes();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!communityId || !user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      // First check if user is a member
      const { data: membership } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        // User is not a member, can't see feed
        setPosts([]);
        setLoading(false);
        return;
      }

      // Fetch posts for this community
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          media_url,
          media_type,
          thumbnail_url,
          created_at,
          author_id,
          community_id,
          profiles!posts_author_id_fkey (
            id,
            display_name,
            handle,
            avatar_url,
            is_verified,
            is_private,
            email
          )
        `)
        .eq('community_id', communityId)
        .eq('moderation_status', 'published')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter out blocked and muted users
      const filteredPosts = (data || [])
        .filter(post => !blockedUserIds.has(post.author_id) && !mutedUserIds.has(post.author_id))
        .map(post => ({
          ...post,
          author: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
        })) as CommunityPost[];

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    } finally {
      setLoading(false);
    }
  }, [communityId, user, blockedUserIds, mutedUserIds]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Post to community
  const postToCommunity = useCallback(async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!communityId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          community_id: communityId,
          content,
          media_url: mediaUrl || null,
          media_type: mediaType || null,
          visibility: 'public',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh posts
      await fetchPosts();
      return data;
    } catch (error) {
      console.error('Error posting to community:', error);
      return null;
    }
  }, [communityId, user, fetchPosts]);

  return {
    posts,
    loading,
    refresh: fetchPosts,
    postToCommunity,
  };
}
