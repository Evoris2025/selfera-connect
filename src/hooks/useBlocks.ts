import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseBlocksResult {
  blockedUserIds: Set<string>;
  blockedByUserIds: Set<string>;
  isBlocking: boolean;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  isBlockedByMe: (userId: string) => boolean;
  isBlockingMe: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useBlocks(): UseBlocksResult {
  const { user } = useAuth();
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [blockedByUserIds, setBlockedByUserIds] = useState<Set<string>>(new Set());
  const [isBlocking, setIsBlocking] = useState(false);

  const fetchBlocks = useCallback(async () => {
    if (!user?.id) {
      setBlockedUserIds(new Set());
      setBlockedByUserIds(new Set());
      return;
    }

    try {
      // Users I've blocked
      const { data: myBlocks, error: myBlocksError } = await supabase
        .from('blocks')
        .select('target_user_id')
        .eq('user_id', user.id);

      if (myBlocksError) throw myBlocksError;

      // Users who've blocked me
      const { data: blockedBy, error: blockedByError } = await supabase
        .from('blocks')
        .select('user_id')
        .eq('target_user_id', user.id);

      if (blockedByError) throw blockedByError;

      setBlockedUserIds(new Set(myBlocks?.map(b => b.target_user_id) || []));
      setBlockedByUserIds(new Set(blockedBy?.map(b => b.user_id) || []));
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const blockUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id || targetUserId === user.id) return false;

    setIsBlocking(true);
    
    // Optimistic update
    setBlockedUserIds(prev => new Set([...prev, targetUserId]));

    try {
      const { error } = await supabase
        .from('blocks')
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
        });

      if (error) throw error;

      // Also remove any follow relationships
      await supabase
        .from('follows')
        .delete()
        .or(`and(follower_id.eq.${user.id},following_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},following_id.eq.${user.id})`);

      toast({
        title: 'User blocked',
        description: 'They won\'t be able to see your content or interact with you.',
      });

      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      // Revert
      setBlockedUserIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
      toast({
        title: 'Failed to block user',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsBlocking(false);
    }
  }, [user?.id]);

  const unblockUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id) return false;

    setIsBlocking(true);
    
    // Optimistic update
    setBlockedUserIds(prev => {
      const next = new Set(prev);
      next.delete(targetUserId);
      return next;
    });

    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId);

      if (error) throw error;

      toast({
        title: 'User unblocked',
        description: 'You can now see their content again.',
      });

      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      // Revert
      setBlockedUserIds(prev => new Set([...prev, targetUserId]));
      toast({
        title: 'Failed to unblock user',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsBlocking(false);
    }
  }, [user?.id]);

  const isBlockedByMe = useCallback((userId: string) => blockedUserIds.has(userId), [blockedUserIds]);
  const isBlockingMe = useCallback((userId: string) => blockedByUserIds.has(userId), [blockedByUserIds]);
  const isBlocked = useCallback((userId: string) => blockedUserIds.has(userId) || blockedByUserIds.has(userId), [blockedUserIds, blockedByUserIds]);

  return {
    blockedUserIds,
    blockedByUserIds,
    isBlocking,
    blockUser,
    unblockUser,
    isBlockedByMe,
    isBlockingMe,
    isBlocked,
    refetch: fetchBlocks,
  };
}
