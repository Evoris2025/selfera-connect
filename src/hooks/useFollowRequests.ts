import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface FollowRequest {
  id: string;
  follower: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
  createdAt: Date;
}

interface UseFollowRequestsResult {
  pendingRequests: FollowRequest[];
  pendingCount: number;
  isLoading: boolean;
  approveRequest: (followId: string) => Promise<boolean>;
  rejectRequest: (followId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useFollowRequests(): UseFollowRequestsResult {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user?.id) {
      setPendingRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          id,
          created_at,
          follower_id,
          profiles!follows_follower_id_fkey (
            id,
            display_name,
            handle,
            avatar_url
          )
        `)
        .eq('following_id', user.id)
        .eq('status', 'requested')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests: FollowRequest[] = (data || []).map(r => {
        const profile = r.profiles as any;
        return {
          id: r.id,
          follower: {
            id: r.follower_id,
            name: profile?.display_name || profile?.handle || 'Anonymous',
            handle: profile?.handle || 'anonymous',
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.follower_id}`,
          },
          createdAt: new Date(r.created_at || ''),
        };
      });

      setPendingRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching follow requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setIsLoading(true);
    fetchRequests();
  }, [fetchRequests]);

  const approveRequest = useCallback(async (followId: string): Promise<boolean> => {
    if (!user?.id) return false;

    // Optimistic update
    setPendingRequests(prev => prev.filter(r => r.id !== followId));

    try {
      const { error } = await supabase
        .from('follows')
        .update({ status: 'approved' })
        .eq('id', followId)
        .eq('following_id', user.id);

      if (error) throw error;

      toast({
        title: 'Request approved',
        description: 'They can now see your posts.',
      });

      return true;
    } catch (error) {
      console.error('Error approving follow request:', error);
      // Revert
      fetchRequests();
      toast({
        title: 'Failed to approve',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, fetchRequests]);

  const rejectRequest = useCallback(async (followId: string): Promise<boolean> => {
    if (!user?.id) return false;

    // Optimistic update
    setPendingRequests(prev => prev.filter(r => r.id !== followId));

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('id', followId)
        .eq('following_id', user.id);

      if (error) throw error;

      toast({
        title: 'Request declined',
      });

      return true;
    } catch (error) {
      console.error('Error rejecting follow request:', error);
      // Revert
      fetchRequests();
      toast({
        title: 'Failed to decline',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, fetchRequests]);

  return {
    pendingRequests,
    pendingCount: pendingRequests.length,
    isLoading,
    approveRequest,
    rejectRequest,
    refetch: fetchRequests,
  };
}

// Hook to check if current user has a pending request to follow someone
export function useFollowStatus(targetUserId: string) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'none' | 'requested' | 'approved'>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [targetIsPrivate, setTargetIsPrivate] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user?.id || !targetUserId || user.id === targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if target is private
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_private')
        .eq('id', targetUserId)
        .single();

      setTargetIsPrivate(profileData?.is_private || false);

      // Check follow status
      const { data, error } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStatus(data.status as 'requested' | 'approved');
      } else {
        setStatus('none');
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, targetUserId]);

  useEffect(() => {
    setIsLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  return { status, isLoading, targetIsPrivate, refetch: fetchStatus };
}
