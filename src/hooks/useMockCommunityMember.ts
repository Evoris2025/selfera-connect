import { useCallback } from 'react';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseMockCommunityMemberResult {
  isInCommunity: boolean;
  toggleCommunity: () => Promise<void>;
  communityCount: number;
  isLoading: boolean;
}

export function useMockCommunityMember(userId: string, userName?: string): UseMockCommunityMemberResult {
  const { user } = useAuth();
  const { 
    isInCommunity: checkIsInCommunity, 
    addToCommunity, 
    removeFromCommunity,
    getCommunityCount,
  } = useMockSystem();

  const isInCommunity = checkIsInCommunity(userId);
  const communityCount = getCommunityCount();

  const toggleCommunity = useCallback(async () => {
    if (!user?.id) return;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (isInCommunity) {
      removeFromCommunity(userId);
    } else {
      addToCommunity(userId, userName);
    }
  }, [user?.id, userId, userName, isInCommunity, addToCommunity, removeFromCommunity]);

  return {
    isInCommunity,
    toggleCommunity,
    communityCount,
    isLoading: false,
  };
}
