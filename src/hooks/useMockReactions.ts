import { useCallback, useMemo } from 'react';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactionType } from '@/components/feed/ReactionPicker';

interface UseMockReactionsResult {
  reactionCount: number;
  currentReaction: ReactionType | null;
  setReaction: (type: ReactionType | null) => Promise<void>;
  isLoading: boolean;
}

export function useMockReactions(postId: string, initialCount = 0): UseMockReactionsResult {
  const { user } = useAuth();
  const { state, setReaction: setMockReaction, getReaction } = useMockSystem();

  // Get the post from mock state to get current likes count
  const post = useMemo(() => {
    return state.posts.find(p => p.id === postId);
  }, [state.posts, postId]);

  const reactionCount = post?.likes ?? initialCount;
  const currentReaction = getReaction(postId) as ReactionType | null;

  const setReaction = useCallback(async (type: ReactionType | null) => {
    if (!user?.id) return;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setMockReaction(postId, type);
  }, [user?.id, postId, setMockReaction]);

  return {
    reactionCount,
    currentReaction,
    setReaction,
    isLoading: false,
  };
}
