import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseFollowResult {
  isFollowing: boolean;
  isPending: boolean;
  isLoading: boolean;
  toggleFollow: () => Promise<void>;
  followerCount: number;
  followingCount: number;
  refetch: () => Promise<void>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

export function useFollow(targetUserId: string): UseFollowResult {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [targetIsPrivate, setTargetIsPrivate] = useState(false);
  
  const isValidTarget = isUuid(targetUserId);
  const pendingRef = useRef(false);

  const fetchFollowState = useCallback(async () => {
    if (!isValidTarget) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if target is private
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_private')
        .eq('id', targetUserId)
        .single();

      setTargetIsPrivate(profileData?.is_private || false);

      // Fetch follower count for target user
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId)
        .eq('status', 'approved');

      // Fetch following count for target user
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId)
        .eq('status', 'approved');

      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);

      // Check if current user follows target
      if (user?.id && user.id !== targetUserId) {
        const { data } = await supabase
          .from('follows')
          .select('id, status')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();

        if (data) {
          setIsFollowing(data.status === 'approved');
          setIsPending(data.status === 'requested');
        } else {
          setIsFollowing(false);
          setIsPending(false);
        }
      }
    } catch (error) {
      console.error('Error fetching follow state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isValidTarget, targetUserId, user?.id]);

  useEffect(() => {
    setIsLoading(true);
    setIsFollowing(false);
    setIsPending(false);
    fetchFollowState();
  }, [fetchFollowState]);

  const toggleFollow = useCallback(async () => {
    if (!user?.id || !isValidTarget || user.id === targetUserId || pendingRef.current) {
      return;
    }

    pendingRef.current = true;
    const wasFollowing = isFollowing;
    const wasPending = isPending;

    // Optimistic update
    if (wasFollowing || wasPending) {
      // Unfollow or cancel request
      setIsFollowing(false);
      setIsPending(false);
      setFollowerCount(prev => wasFollowing ? Math.max(0, prev - 1) : prev);
    } else {
      // Follow - set to pending if private, approved if public
      if (targetIsPrivate) {
        setIsPending(true);
      } else {
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    try {
      if (wasFollowing || wasPending) {
        // Unfollow or cancel pending request
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
      } else {
        // Follow - check for existing first to prevent duplicates
        const { data: existing } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();

        if (!existing) {
          // Set status based on whether target is private
          const newStatus = targetIsPrivate ? 'requested' : 'approved';
          const { error } = await supabase
            .from('follows')
            .insert({
              follower_id: user.id,
              following_id: targetUserId,
              status: newStatus,
            });

          if (error) throw error;
          
          if (targetIsPrivate) {
            toast({
              title: 'Follow request sent',
              description: 'Waiting for approval.',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert optimistic update
      setIsFollowing(wasFollowing);
      setIsPending(wasPending);
      setFollowerCount(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
      toast({
        title: "Couldn't update follow",
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      pendingRef.current = false;
    }
  }, [user?.id, isValidTarget, targetUserId, isFollowing, isPending, targetIsPrivate]);

  return {
    isFollowing,
    isPending,
    isLoading,
    toggleFollow,
    followerCount,
    followingCount,
    refetch: fetchFollowState,
  };
}

// Hook to get current user's following list (for feed filtering)
export function useCurrentUserFollowing() {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setFollowingIds([]);
      setIsLoading(false);
      return;
    }

    const fetchFollowing = async () => {
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('status', 'approved');

        if (error) throw error;
        setFollowingIds(data?.map(f => f.following_id) || []);
      } catch (error) {
        console.error('Error fetching following list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, [user?.id]);

  return { followingIds, isLoading };
}
