import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { ReactionType } from '@/components/feed/ReactionPicker';

interface UseReactionsResult {
  reactionCount: number;
  currentReaction: ReactionType | null;
  setReaction: (type: ReactionType | null) => Promise<void>;
  isLoading: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

// Map frontend reaction types to database enum values
const reactionTypeToDb = (type: ReactionType): 'heart' | 'hug' => {
  // The database only supports 'heart' and 'hug', map all others to 'heart' for now
  if (type === 'support') return 'hug';
  return 'heart';
};

const dbToReactionType = (dbType: 'heart' | 'hug'): ReactionType => {
  if (dbType === 'hug') return 'support';
  return 'like';
};

export function useReactions(postId: string, initialCount = 0): UseReactionsResult {
  const { user } = useAuth();
  const [reactionCount, setReactionCount] = useState(() => initialCount);
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isUuidPostId = isUuid(postId);

  // Track desired state for debouncing
  const desiredReactionRef = useRef<ReactionType | null>(null);
  const commitTimerRef = useRef<number | null>(null);
  const reconcileTimerRef = useRef<number | null>(null);

  const fetchReactions = useCallback(async () => {
    if (!isUuidPostId) {
      setIsLoading(false);
      return;
    }

    try {
      // Get total reaction count for this post
      const { count, error: countError } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (countError) throw countError;
      setReactionCount(count || 0);

      // Check if current user has reacted
      if (user?.id) {
        const { data, error: userError } = await supabase
          .from('reactions')
          .select('id, type')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userError) throw userError;
        if (data) {
          const reactionType = dbToReactionType(data.type as 'heart' | 'hug');
          desiredReactionRef.current = reactionType;
          setCurrentReaction(reactionType);
        } else {
          desiredReactionRef.current = null;
          setCurrentReaction(null);
        }
      } else {
        desiredReactionRef.current = null;
        setCurrentReaction(null);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isUuidPostId, postId, user?.id]);

  useEffect(() => {
    // Reset per-post UI state
    setReactionCount(initialCount);
    setCurrentReaction(null);
    desiredReactionRef.current = null;
    setIsLoading(true);

    if (!isUuidPostId) {
      // Demo/mock posts (non-UUID) — keep UI functional without backend calls.
      setIsLoading(false);
      return;
    }

    fetchReactions();

    // Subscribe to updates for this post's reactions
    const channel = supabase
      .channel(`reactions-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          if (reconcileTimerRef.current) window.clearTimeout(reconcileTimerRef.current);
          reconcileTimerRef.current = window.setTimeout(() => {
            fetchReactions();
          }, 150);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
      if (reconcileTimerRef.current) window.clearTimeout(reconcileTimerRef.current);
    };
  }, [postId, initialCount, isUuidPostId, fetchReactions]);

  const commitDesired = useCallback(async () => {
    if (!user?.id || !isUuidPostId) return;

    const desired = desiredReactionRef.current;

    try {
      // First, remove any existing reaction
      await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      // Then insert the new reaction if there is one
      if (desired) {
        const { error } = await supabase.from('reactions').insert({
          post_id: postId,
          user_id: user.id,
          type: reactionTypeToDb(desired),
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Couldn't save reaction",
        description: 'Please try again.',
        variant: 'destructive',
      });
      fetchReactions();
    }
  }, [user?.id, isUuidPostId, postId, fetchReactions]);

  const setReaction = async (type: ReactionType | null) => {
    if (!user?.id) return;

    const previousReaction = desiredReactionRef.current;
    desiredReactionRef.current = type;

    // Optimistic UI (instant)
    setCurrentReaction(type);
    
    // Update count optimistically
    if (previousReaction === null && type !== null) {
      setReactionCount((prev) => prev + 1);
    } else if (previousReaction !== null && type === null) {
      setReactionCount((prev) => Math.max(0, prev - 1));
    }
    // If changing from one reaction to another, count stays the same

    // Demo/mock posts: stop here.
    if (!isUuidPostId) return;

    // Debounce backend write; only persist the latest state.
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(() => {
      commitDesired();
    }, 300);
  };

  return { reactionCount, currentReaction, setReaction, isLoading };
}
