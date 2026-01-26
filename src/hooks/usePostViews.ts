/**
 * Post Views Hook
 * 
 * Tracks and records views on posts, images, and videos
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useRef } from 'react';

export function usePostViews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const viewedPosts = useRef<Set<string>>(new Set());

  const recordView = useMutation({
    mutationFn: async ({ postId, duration = 0 }: { postId: string; duration?: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Use type assertion since the table was just created
      const { error } = await supabase
        .from('post_views' as any)
        .insert({
          post_id: postId,
          viewer_id: user.id,
          view_duration_seconds: duration,
        });

      // Ignore duplicate key errors (user already viewed this post at this time)
      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-analytics'] });
    },
  });

  const trackView = useCallback((postId: string) => {
    // Prevent duplicate tracking in the same session
    if (viewedPosts.current.has(postId)) return;
    
    viewedPosts.current.add(postId);
    
    if (user?.id) {
      recordView.mutate({ postId });
    }
  }, [user?.id, recordView]);

  const trackViewWithDuration = useCallback((postId: string, duration: number) => {
    if (user?.id) {
      recordView.mutate({ postId, duration });
    }
  }, [user?.id, recordView]);

  return {
    trackView,
    trackViewWithDuration,
    isTracking: recordView.isPending,
  };
}
