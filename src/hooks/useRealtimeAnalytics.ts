/**
 * Realtime Analytics Hook
 * 
 * Subscribes to real-time database changes to update analytics
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeAnalytics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidateAnalytics = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['creator-analytics'] });
  }, [queryClient]);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to expression views
    const viewsChannel = supabase
      .channel('analytics-views')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expression_views',
        },
        (payload) => {
          // Check if this view is for one of the user's expressions
          // For now, we invalidate on any change - can optimize later
          invalidateAnalytics();
        }
      )
      .subscribe();

    // Subscribe to post views
    const postViewsChannel = supabase
      .channel('analytics-post-views')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_views',
        },
        (payload) => {
          invalidateAnalytics();
        }
      )
      .subscribe();

    // Subscribe to expression reactions
    const reactionsChannel = supabase
      .channel('analytics-reactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expression_reactions',
        },
        (payload) => {
          invalidateAnalytics();
        }
      )
      .subscribe();

    // Subscribe to post reactions
    const postReactionsChannel = supabase
      .channel('analytics-post-reactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
        },
        (payload) => {
          invalidateAnalytics();
        }
      )
      .subscribe();

    // Subscribe to expression replies
    const repliesChannel = supabase
      .channel('analytics-replies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expression_replies',
        },
        (payload) => {
          invalidateAnalytics();
        }
      )
      .subscribe();

    // Subscribe to comments
    const commentsChannel = supabase
      .channel('analytics-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          invalidateAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(viewsChannel);
      supabase.removeChannel(postViewsChannel);
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(postReactionsChannel);
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user?.id, invalidateAnalytics]);

  return { invalidateAnalytics };
}
