import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// UUID validation helper
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function usePersonalCommunity(memberUserId?: string) {
  const { user } = useAuth();
  const [isInCommunity, setIsInCommunity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [communityCount, setCommunityCount] = useState(0);

  // Check if a specific user is in the current user's community
  useEffect(() => {
    if (!user || !memberUserId || !isValidUUID(memberUserId)) return;

    const checkMembership = async () => {
      const { data, error } = await supabase
        .from('user_community_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('member_user_id', memberUserId)
        .maybeSingle();

      if (!error && data) {
        setIsInCommunity(true);
      } else {
        setIsInCommunity(false);
      }
    };

    checkMembership();
  }, [user, memberUserId]);

  // Get community count for the current user
  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('user_community_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!error && count !== null) {
        setCommunityCount(count);
      }
    };

    fetchCount();
  }, [user]);

  const toggleCommunityMember = async (targetUserId: string): Promise<boolean> => {
    if (!user || !isValidUUID(targetUserId)) return false;
    
    setIsLoading(true);

    try {
      // Check if already in community
      const { data: existing } = await supabase
        .from('user_community_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('member_user_id', targetUserId)
        .maybeSingle();

      if (existing) {
        // Remove from community
        const { error } = await supabase
          .from('user_community_members')
          .delete()
          .eq('user_id', user.id)
          .eq('member_user_id', targetUserId);

        if (error) throw error;
        setIsInCommunity(false);
        setCommunityCount(prev => Math.max(0, prev - 1));
        return false; // Removed
      } else {
        // Add to community
        const { error } = await supabase
          .from('user_community_members')
          .insert({
            user_id: user.id,
            member_user_id: targetUserId,
          });

        if (error) throw error;
        setIsInCommunity(true);
        setCommunityCount(prev => prev + 1);
        return true; // Added
      }
    } catch (error) {
      console.error('Error toggling community member:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isInCommunity,
    isLoading,
    communityCount,
    toggleCommunityMember,
  };
}
