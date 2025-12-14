import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseReactionsResult {
  heartCount: number;
  hasReacted: boolean;
  toggleReaction: () => Promise<void>;
  isLoading: boolean;
}

export function useReactions(postId: string): UseReactionsResult {
  const { user } = useAuth();
  const [heartCount, setHeartCount] = useState(0);
  const [hasReacted, setHasReacted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReactions();

    // Subscribe to real-time updates for this post's reactions
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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setHeartCount((prev) => prev + 1);
            // Check if current user added the reaction
            if (payload.new && (payload.new as { user_id: string }).user_id === user?.id) {
              setHasReacted(true);
            }
          } else if (payload.eventType === 'DELETE') {
            setHeartCount((prev) => Math.max(0, prev - 1));
            // Check if current user removed the reaction
            if (payload.old && (payload.old as { user_id: string }).user_id === user?.id) {
              setHasReacted(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, user?.id]);

  const fetchReactions = async () => {
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
        setHasReacted(!!data);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReaction = async () => {
    if (!user?.id) return;

    try {
      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('type', 'heart');

        if (error) throw error;
        // Optimistic update handled by realtime
      } else {
        // Add reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type: 'heart',
          });

        if (error) throw error;
        // Optimistic update handled by realtime
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      fetchReactions();
    }
  };

  return { heartCount, hasReacted, toggleReaction, isLoading };
}
