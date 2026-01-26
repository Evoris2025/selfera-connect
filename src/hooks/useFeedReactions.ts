/**
 * Feed Reactions Hook
 * 
 * This hook provides reaction functionality that works in simulation mode.
 * All 5 reaction types (like, relatable, inspiring, support, curious) are fully functional.
 * State is persisted to localStorage via FeedDataContext.
 */

import { useCallback } from 'react';
import { useFeedData } from '@/contexts/FeedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactionType } from '@/components/feed/ReactionPicker';

interface UseFeedReactionsResult {
  reactionCount: number;
  currentReaction: ReactionType | null;
  setReaction: (type: ReactionType | null) => Promise<void>;
  isLoading: boolean;
}

export function useFeedReactions(postId: string, initialCount = 0): UseFeedReactionsResult {
  const { user } = useAuth();
  const feedData = useFeedData();
  
  const currentReaction = feedData.getReaction(postId);
  const reactionCount = feedData.getReactionCount(postId) || initialCount;
  
  const setReaction = useCallback(async (type: ReactionType | null) => {
    if (!user?.id) return;
    feedData.setReaction(postId, type);
  }, [user?.id, postId, feedData]);
  
  return {
    reactionCount,
    currentReaction,
    setReaction,
    isLoading: false,
  };
}
