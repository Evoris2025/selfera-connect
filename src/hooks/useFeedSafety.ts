/**
 * Feed Safety Hook
 * 
 * This hook provides mute/block functionality in simulation mode.
 * Safety actions are persisted to localStorage via FeedDataContext.
 */

import { useCallback } from 'react';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseFeedSafetyResult {
  isMuted: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
}

export function useFeedSafety(): UseFeedSafetyResult {
  const { user } = useAuth();
  const feedData = useFeedData();
  
  const isMuted = useCallback((userId: string): boolean => {
    return feedData.isMuted(userId);
  }, [feedData]);
  
  const isBlocked = useCallback((userId: string): boolean => {
    return feedData.isBlocked(userId);
  }, [feedData]);
  
  const muteUser = useCallback((userId: string) => {
    if (!user?.id) return;
    feedData.muteUser(userId);
    toast({
      title: 'User muted',
      description: 'You will no longer see their posts in your feed.',
    });
  }, [user?.id, feedData]);
  
  const unmuteUser = useCallback((userId: string) => {
    if (!user?.id) return;
    feedData.unmuteUser(userId);
    toast({
      title: 'User unmuted',
      description: 'Their posts will now appear in your feed.',
    });
  }, [user?.id, feedData]);
  
  const blockUser = useCallback((userId: string) => {
    if (!user?.id) return;
    feedData.blockUser(userId);
    toast({
      title: 'User blocked',
      description: 'You will no longer see their content or be able to interact.',
      variant: 'destructive',
    });
  }, [user?.id, feedData]);
  
  const unblockUser = useCallback((userId: string) => {
    if (!user?.id) return;
    feedData.unblockUser(userId);
    toast({
      title: 'User unblocked',
      description: 'You can now see their content again.',
    });
  }, [user?.id, feedData]);
  
  return {
    isMuted,
    isBlocked,
    muteUser,
    unmuteUser,
    blockUser,
    unblockUser,
  };
}
