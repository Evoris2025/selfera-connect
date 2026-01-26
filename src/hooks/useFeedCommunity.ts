/**
 * Feed Personal Community Hook
 * 
 * This hook provides personal community (valued people) functionality in simulation mode.
 * Community members are persisted to localStorage via FeedDataContext.
 */

import { useCallback } from 'react';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseFeedCommunityResult {
  isInCommunity: boolean;
  isLoading: boolean;
  communityCount: number;
  toggleCommunityMember: (targetUserId: string) => Promise<boolean>;
}

export function useFeedCommunity(memberUserId?: string): UseFeedCommunityResult {
  const { user } = useAuth();
  const feedData = useFeedData();
  
  const isInCommunity = memberUserId ? feedData.isInCommunity(memberUserId) : false;
  const communityCount = feedData.getCommunityCount();
  
  const toggleCommunityMember = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    const wasInCommunity = feedData.isInCommunity(targetUserId);
    feedData.toggleCommunity(targetUserId);
    
    return !wasInCommunity; // Returns true if added, false if removed
  }, [user?.id, feedData]);
  
  return {
    isInCommunity,
    isLoading: false,
    communityCount,
    toggleCommunityMember,
  };
}
