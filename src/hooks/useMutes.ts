import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseMutesResult {
  mutedUserIds: Set<string>;
  isMuting: boolean;
  muteUser: (userId: string) => Promise<boolean>;
  unmuteUser: (userId: string) => Promise<boolean>;
  isMuted: (userId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useMutes(): UseMutesResult {
  const { user } = useAuth();
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());
  const [isMuting, setIsMuting] = useState(false);

  const fetchMutes = useCallback(async () => {
    if (!user?.id) {
      setMutedUserIds(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mutes')
        .select('target_user_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setMutedUserIds(new Set(data?.map(m => m.target_user_id) || []));
    } catch (error) {
      console.error('Error fetching mutes:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMutes();
  }, [fetchMutes]);

  const muteUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id || targetUserId === user.id) return false;

    setIsMuting(true);
    
    // Optimistic update
    setMutedUserIds(prev => new Set([...prev, targetUserId]));

    try {
      const { error } = await supabase
        .from('mutes')
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
        });

      if (error) throw error;

      toast({
        title: 'User muted',
        description: 'You won\'t see their posts in your feed.',
      });

      return true;
    } catch (error) {
      console.error('Error muting user:', error);
      // Revert
      setMutedUserIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
      toast({
        title: 'Failed to mute user',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsMuting(false);
    }
  }, [user?.id]);

  const unmuteUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id) return false;

    setIsMuting(true);
    
    // Optimistic update
    setMutedUserIds(prev => {
      const next = new Set(prev);
      next.delete(targetUserId);
      return next;
    });

    try {
      const { error } = await supabase
        .from('mutes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId);

      if (error) throw error;

      toast({
        title: 'User unmuted',
        description: 'You\'ll see their posts in your feed again.',
      });

      return true;
    } catch (error) {
      console.error('Error unmuting user:', error);
      // Revert
      setMutedUserIds(prev => new Set([...prev, targetUserId]));
      toast({
        title: 'Failed to unmute user',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsMuting(false);
    }
  }, [user?.id]);

  const isMuted = useCallback((userId: string) => mutedUserIds.has(userId), [mutedUserIds]);

  return {
    mutedUserIds,
    isMuting,
    muteUser,
    unmuteUser,
    isMuted,
    refetch: fetchMutes,
  };
}
