import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  communityCount: number;
}

interface Profile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  location: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  userType: 'individual' | 'organization' | 'professional';
}

interface UseProfileResult {
  profile: Profile | null;
  stats: ProfileStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

export function useProfileStats(userId: string): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    postCount: 0,
    followerCount: 0,
    followingCount: 0,
    communityCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidUser = isUuid(userId);

  const fetchProfile = useCallback(async () => {
    if (!isValidUser) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile({
          id: profileData.id,
          displayName: profileData.display_name || profileData.handle || 'Anonymous',
          handle: profileData.handle || 'anonymous',
          avatarUrl: profileData.avatar_url,
          coverUrl: profileData.cover_url,
          bio: profileData.bio,
          location: profileData.country,
          isVerified: false, // TODO: Add verification status to profiles table
          isPrivate: profileData.is_private || false,
          userType: (profileData.user_type as Profile['userType']) || 'individual',
        });
      }

      // Fetch post count
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
        .eq('moderation_status', 'published');

      // Fetch follower count
      const { count: followerCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)
        .eq('status', 'approved');

      // Fetch following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)
        .eq('status', 'approved');

      // Fetch community members count (personal community)
      const { count: communityCount } = await supabase
        .from('user_community_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setStats({
        postCount: postCount || 0,
        followerCount: followerCount || 0,
        followingCount: followingCount || 0,
        communityCount: communityCount || 0,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching profile stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [isValidUser, userId]);

  useEffect(() => {
    setIsLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    stats,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

// Hook to fetch user's posts for profile grid
export function useUserPosts(userId: string) {
  const [posts, setPosts] = useState<Array<{
    id: string;
    thumbnail: string;
    likes: number;
    comments: number;
    isVideo: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isValidUser = isUuid(userId);

  useEffect(() => {
    if (!isValidUser) {
      setIsLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, media_url, media_type, thumbnail_url')
          .eq('author_id', userId)
          .eq('moderation_status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get reaction and comment counts
        const postIds = data?.map(p => p.id) || [];
        
        const { data: reactions } = await supabase
          .from('reactions')
          .select('post_id')
          .in('post_id', postIds);

        const { data: comments } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds)
          .eq('is_removed', false);

        const reactionCounts = new Map<string, number>();
        const commentCounts = new Map<string, number>();

        reactions?.forEach(r => {
          reactionCounts.set(r.post_id, (reactionCounts.get(r.post_id) || 0) + 1);
        });

        comments?.forEach(c => {
          commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1);
        });

        setPosts(
          (data || []).map(p => ({
            id: p.id,
            thumbnail: p.thumbnail_url || p.media_url || '/placeholder.svg',
            likes: reactionCounts.get(p.id) || 0,
            comments: commentCounts.get(p.id) || 0,
            isVideo: p.media_type === 'video',
          }))
        );
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId, isValidUser]);

  return { posts, isLoading };
}
