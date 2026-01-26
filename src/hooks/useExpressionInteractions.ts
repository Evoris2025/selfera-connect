/**
 * Expression Interactions Hook
 * 
 * Handles recording reactions, replies, and views for expressions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useExpressionInteractions(expressionId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addReaction = useMutation({
    mutationFn: async (emoji: string) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('expression_reactions')
        .upsert({
          expression_id: expressionId,
          user_id: user.id,
          emoji,
        }, {
          onConflict: 'expression_id,user_id,emoji',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expression-analytics', expressionId] });
    },
  });

  const removeReaction = useMutation({
    mutationFn: async (emoji: string) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('expression_reactions')
        .delete()
        .eq('expression_id', expressionId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expression-analytics', expressionId] });
    },
  });

  const addReply = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('expression_replies')
        .insert({
          expression_id: expressionId,
          user_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expression-analytics', expressionId] });
    },
  });

  const recordView = useMutation({
    mutationFn: async (data: { watchDuration?: number; completed?: boolean }) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('expression_views')
        .upsert({
          expression_id: expressionId,
          viewer_id: user.id,
          watch_duration_seconds: data.watchDuration || 0,
          completed: data.completed || false,
        }, {
          onConflict: 'expression_id,viewer_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expression-analytics', expressionId] });
    },
  });

  return {
    addReaction,
    removeReaction,
    addReply,
    recordView,
  };
}
