/**
 * Feed Library Hook
 * 
 * This hook provides save/bookmark functionality that works in simulation mode.
 * Saves are persisted to localStorage via FeedDataContext.
 */

import { useCallback } from 'react';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseFeedLibraryResult {
  inLibrary: boolean;
  toggleLibrary: () => Promise<void>;
  isLoading: boolean;
}

export function useFeedLibrary(postId: string): UseFeedLibraryResult {
  const { user } = useAuth();
  const feedData = useFeedData();
  
  const inLibrary = feedData.isSaved(postId);
  
  const toggleLibrary = useCallback(async () => {
    if (!user?.id) return;
    feedData.toggleSave(postId);
  }, [user?.id, postId, feedData]);
  
  return {
    inLibrary,
    toggleLibrary,
    isLoading: false,
  };
}
