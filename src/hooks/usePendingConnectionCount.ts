/**
 * SIMULATION MODE: Pending Connection Count Hook
 * Re-exports simulated count for global simulation mode.
 */

// Re-export simulated version as the default
export { useSimulatedPendingConnectionCount as usePendingConnectionCount } from './useSimulatedPendingConnectionCount';

// ============================================================================
// ORIGINAL HOOK (preserved for future real-data mode)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to get the count of pending connection requests for a provider.
 * Subscribes to real-time updates for live badge counts.
 */
export function usePendingConnectionCountReal() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!user?.id) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const { count: pendingCount, error } = await supabase
        .from('user_support_links')
        .select('*', { count: 'exact', head: true })
        .eq('provider_user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setCount(pendingCount || 0);
    } catch (err) {
      console.error('Error fetching pending connection count:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCount();

    if (!user?.id) return;

    // Real-time subscription for pending connection updates
    const channel = supabase
      .channel(`pending-connections-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_support_links',
          filter: `provider_user_id=eq.${user.id}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCount]);

  return { count, loading, refresh: fetchCount };
}
