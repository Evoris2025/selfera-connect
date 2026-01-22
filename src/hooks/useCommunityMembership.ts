import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type CommunityRole = 'member' | 'moderator' | 'admin';

interface CommunityMembership {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface Community {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  member_count: number;
  follower_count: number;
  is_private: boolean;
  created_by: string | null;
  created_at: string;
}

interface CommunityWithStatus extends Community {
  isJoined: boolean;
  isFollowing: boolean;
  userRole?: CommunityRole;
}

export function useCommunityMembership() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<CommunityWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMemberships, setUserMemberships] = useState<CommunityMembership[]>([]);
  const [userFollows, setUserFollows] = useState<string[]>([]);

  // Fetch all communities with user's membership/follow status
  const fetchCommunities = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all communities
      const { data: communitiesData, error: commError } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (commError) throw commError;

      // Fetch user's memberships
      const { data: membershipsData, error: memError } = await supabase
        .from('community_memberships')
        .select('*')
        .eq('user_id', user.id);

      if (memError) throw memError;

      // Fetch user's follows
      const { data: followsData, error: folError } = await supabase
        .from('community_follows')
        .select('community_id')
        .eq('user_id', user.id);

      if (folError) throw folError;

      const membershipMap = new Map(
        (membershipsData || []).map(m => [m.community_id, m])
      );
      const followSet = new Set((followsData || []).map(f => f.community_id));

      const enrichedCommunities: CommunityWithStatus[] = (communitiesData || []).map(c => ({
        ...c,
        isJoined: membershipMap.has(c.id),
        isFollowing: followSet.has(c.id),
        userRole: membershipMap.get(c.id)?.role as CommunityRole | undefined,
      }));

      setCommunities(enrichedCommunities);
      setUserMemberships(membershipsData || []);
      setUserFollows((followsData || []).map(f => f.community_id));
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Join a community
  const joinCommunity = useCallback(async (communityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      // Update local state
      setCommunities(prev => prev.map(c => 
        c.id === communityId 
          ? { ...c, isJoined: true, member_count: c.member_count + 1, userRole: 'member' as CommunityRole }
          : c
      ));

      toast.success('Joined community!');
      return true;
    } catch (error: any) {
      console.error('Error joining community:', error);
      if (error.code === '23505') {
        toast.error('Already a member of this community');
      } else {
        toast.error('Failed to join community');
      }
      return false;
    }
  }, [user]);

  // Leave a community
  const leaveCommunity = useCallback(async (communityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setCommunities(prev => prev.map(c => 
        c.id === communityId 
          ? { ...c, isJoined: false, member_count: Math.max(0, c.member_count - 1), userRole: undefined }
          : c
      ));

      toast.success('Left community');
      return true;
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
      return false;
    }
  }, [user]);

  // Follow a community (without joining)
  const followCommunity = useCallback(async (communityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('community_follows')
        .insert({
          community_id: communityId,
          user_id: user.id,
        });

      if (error) throw error;

      setCommunities(prev => prev.map(c => 
        c.id === communityId 
          ? { ...c, isFollowing: true, follower_count: c.follower_count + 1 }
          : c
      ));

      toast.success('Following community!');
      return true;
    } catch (error: any) {
      console.error('Error following community:', error);
      if (error.code === '23505') {
        toast.error('Already following this community');
      } else {
        toast.error('Failed to follow community');
      }
      return false;
    }
  }, [user]);

  // Unfollow a community
  const unfollowCommunity = useCallback(async (communityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('community_follows')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCommunities(prev => prev.map(c => 
        c.id === communityId 
          ? { ...c, isFollowing: false, follower_count: Math.max(0, c.follower_count - 1) }
          : c
      ));

      toast.success('Unfollowed community');
      return true;
    } catch (error) {
      console.error('Error unfollowing community:', error);
      toast.error('Failed to unfollow community');
      return false;
    }
  }, [user]);

  // Get user's role in a community
  const getUserRole = useCallback((communityId: string): CommunityRole | null => {
    const community = communities.find(c => c.id === communityId);
    return community?.userRole || null;
  }, [communities]);

  // Check if user is owner of community
  const isOwner = useCallback((communityId: string): boolean => {
    const community = communities.find(c => c.id === communityId);
    return community?.created_by === user?.id;
  }, [communities, user]);

  return {
    communities,
    loading,
    joinCommunity,
    leaveCommunity,
    followCommunity,
    unfollowCommunity,
    getUserRole,
    isOwner,
    refresh: fetchCommunities,
    joinedCommunities: communities.filter(c => c.isJoined),
    followingCommunities: communities.filter(c => c.isFollowing && !c.isJoined),
    suggestedCommunities: communities.filter(c => !c.isJoined && !c.isFollowing),
  };
}
