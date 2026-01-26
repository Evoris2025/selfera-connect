/**
 * Notification Preferences Hook
 * 
 * Manages user notification preferences for different event types
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  reactions_enabled: boolean;
  replies_enabled: boolean;
  follows_enabled: boolean;
  comments_enabled: boolean;
  mentions_enabled: boolean;
  interactions_enabled: boolean;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const defaultPreferences: Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  reactions_enabled: true,
  replies_enabled: true,
  follows_enabled: true,
  comments_enabled: true,
  mentions_enabled: true,
  interactions_enabled: true,
  push_enabled: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async (): Promise<NotificationPreferences> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Use type assertion since the table was just created
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no preferences exist, create default ones
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            ...defaultPreferences,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as unknown as NotificationPreferences;
      }

      return data as unknown as NotificationPreferences;
    },
    enabled: !!user?.id,
  });

  const updatePreference = useMutation({
    mutationFn: async ({ key, value }: { key: keyof typeof defaultPreferences; value: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .update({ [key]: value } as any)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async ({ key, value }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification-preferences', user?.id] });
      const previous = queryClient.getQueryData(['notification-preferences', user?.id]);
      
      queryClient.setQueryData(['notification-preferences', user?.id], (old: NotificationPreferences | undefined) => {
        if (!old) return old;
        return { ...old, [key]: value };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notification-preferences', user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    },
  });

  const updateAllPreferences = useMutation({
    mutationFn: async (preferences: Partial<typeof defaultPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences as any)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreference,
    updateAllPreferences,
  };
}
