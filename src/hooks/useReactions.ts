import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseReactionsResult {
  heartCount: number;
  hasReacted: boolean;
  toggleReaction: () => Promise<void>;
  isLoading: boolean;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

export function useReactions(postId: string, initialCount = 0): UseReactionsResult {
  const { user } = useAuth();
  const [heartCount, setHeartCount] = useState(() => initialCount);
  const [hasReacted, setHasReacted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isUuidPostId = isUuid(postId);

  // UI should stay deterministic under rapid taps; only the last state is persisted.
  const desiredReactedRef = useRef(false);
  const commitTimerRef = useRef<number | null>(null);
  const reconcileTimerRef = useRef<number | null>(null);

  const fetchReactions = useCallback(async () => {
    if (!isUuidPostId) {
      setIsLoading(false);
      return;
    }

    try {
      // Get total heart count for this post
      const { count, error: countError } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('type', 'heart');

      if (countError) throw countError;
      setHeartCount(count || 0);

      // Check if current user has reacted
      if (user?.id) {
        const { data, error: userError } = await supabase
          .from('reactions')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('type', 'heart')
          .maybeSingle();

        if (userError) throw userError;
        const reacted = !!data;
        desiredReactedRef.current = reacted;
        setHasReacted(reacted);
      } else {
        desiredReactedRef.current = false;
        setHasReacted(false);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isUuidPostId, postId, user?.id]);

  useEffect(() => {
    // Reset per-post UI state
    setHeartCount(initialCount);
    setHasReacted(false);
    desiredReactedRef.current = false;
    setIsLoading(true);

    if (!isUuidPostId) {
      // Demo/mock posts (non-UUID) — keep UI functional without backend calls.
      setIsLoading(false);
      return;
    }

    fetchReactions();

    // Subscribe to updates for this post's reactions; reconcile by refetching (prevents double-count drift).
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

    const desired = desiredReactedRef.current;

    try {
      if (desired) {
        const { error } = await supabase.from('reactions').insert({
          post_id: postId,
          user_id: user.id,
          type: 'heart',
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('type', 'heart');
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Couldn't save like",
        description: 'Please try again.',
        variant: 'destructive',
      });
      fetchReactions();
    }
  }, [user?.id, isUuidPostId, postId, fetchReactions]);

  const toggleReaction = async () => {
    if (!user?.id) return;

    const next = !desiredReactedRef.current;
    desiredReactedRef.current = next;

    // Optimistic UI (instant)
    setHasReacted(next);
    setHeartCount((prev) => Math.max(0, prev + (next ? 1 : -1)));

    // Demo/mock posts: stop here.
    if (!isUuidPostId) return;

    // Debounce backend write; only persist the latest state.
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(() => {
      commitDesired();
    }, 300);
  };

  return { heartCount, hasReacted, toggleReaction, isLoading };
}
