// Phase F - Interaction Lifecycle Management
// Handles the full lifecycle: Request → Accept/Decline → Confirm → Complete/Cancel

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateInteractionAmountDue, getTierPriceCap, EraTier, CLIENT_BASE_PRICE } from '@/lib/eraTiers';
import { toast } from 'sonner';

export type InteractionStatus = 
  | 'draft' 
  | 'requested' 
  | 'accepted' 
  | 'declined' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled';

export interface InteractionProfile {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface Interaction {
  id: string;
  client_user_id: string;
  provider_user_id: string;
  provider_tier_price: number;
  client_base_price: number;
  amount_due: number;
  status: InteractionStatus;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: InteractionProfile;
  provider?: InteractionProfile;
}

export interface CreateInteractionParams {
  providerUserId: string;
  providerTier: EraTier;
  notes?: string;
}

export function useInteractionLifecycle() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myInteractions, setMyInteractions] = useState<Interaction[]>([]);

  // Fetch interactions and enrich with profile data
  const fetchInteractions = useCallback(async (
    role: 'client' | 'provider' | 'both' = 'both'
  ) => {
    if (!user) return [];

    try {
      setLoading(true);
      let query = supabase
        .from('interactions')
        .select('*');

      if (role === 'client') {
        query = query.eq('client_user_id', user.id);
      } else if (role === 'provider') {
        query = query.eq('provider_user_id', user.id);
      } else {
        query = query.or(`client_user_id.eq.${user.id},provider_user_id.eq.${user.id}`);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Enrich with profile data
      const interactions = data || [];
      const userIds = new Set<string>();
      interactions.forEach(i => {
        userIds.add(i.client_user_id);
        userIds.add(i.provider_user_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url, is_verified')
        .in('id', Array.from(userIds));

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p as InteractionProfile])
      );

      const enrichedInteractions: Interaction[] = interactions.map(i => ({
        ...i,
        status: i.status as InteractionStatus,
        metadata: i.metadata as Record<string, unknown> | null,
        client: profileMap.get(i.client_user_id),
        provider: profileMap.get(i.provider_user_id),
      }));

      setMyInteractions(enrichedInteractions);
      return enrichedInteractions;
    } catch (err) {
      console.error('Error fetching interactions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`interactions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactions',
          filter: `client_user_id=eq.${user.id}`,
        },
        () => fetchInteractions()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactions',
          filter: `provider_user_id=eq.${user.id}`,
        },
        () => fetchInteractions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchInteractions]);

  // CLIENT: Create and submit an interaction request
  const requestInteraction = useCallback(async ({
    providerUserId,
    providerTier,
    notes,
  }: CreateInteractionParams): Promise<Interaction | null> => {
    if (!user) {
      toast.error('Must be logged in to request interactions');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const providerTierPrice = getTierPriceCap(providerTier);
      const amountDue = calculateInteractionAmountDue(providerTier);

      const { data, error: insertError } = await supabase
        .from('interactions')
        .insert({
          client_user_id: user.id,
          provider_user_id: providerUserId,
          provider_tier_price: providerTierPrice,
          client_base_price: CLIENT_BASE_PRICE,
          amount_due: amountDue,
          status: 'requested',
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      await fetchInteractions();
      return data as Interaction;
    } catch (err) {
      console.error('Error requesting interaction:', err);
      setError('Failed to request interaction');
      toast.error('Failed to request interaction');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchInteractions]);

  // PROVIDER: Accept an interaction request
  const acceptInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ status: 'accepted' })
        .eq('id', interactionId)
        .eq('provider_user_id', user.id)
        .eq('status', 'requested');

      if (updateError) throw updateError;
      await fetchInteractions();
      return true;
    } catch (err) {
      console.error('Error accepting interaction:', err);
      toast.error('Failed to accept interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchInteractions]);

  // PROVIDER: Decline an interaction request
  const declineInteraction = useCallback(async (
    interactionId: string, 
    reason?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const updateData: Record<string, unknown> = { 
        status: 'declined',
      };
      
      if (reason) {
        updateData.metadata = { decline_reason: reason };
      }

      const { error: updateError } = await supabase
        .from('interactions')
        .update(updateData)
        .eq('id', interactionId)
        .eq('provider_user_id', user.id)
        .eq('status', 'requested');

      if (updateError) throw updateError;
      await fetchInteractions();
      return true;
    } catch (err) {
      console.error('Error declining interaction:', err);
      toast.error('Failed to decline interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchInteractions]);

  // CLIENT: Confirm an accepted interaction
  const confirmInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ status: 'confirmed' })
        .eq('id', interactionId)
        .eq('client_user_id', user.id)
        .eq('status', 'accepted');

      if (updateError) throw updateError;
      await fetchInteractions();
      return true;
    } catch (err) {
      console.error('Error confirming interaction:', err);
      toast.error('Failed to confirm interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchInteractions]);

  // EITHER: Complete an interaction
  const completeInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ status: 'completed' })
        .eq('id', interactionId)
        .eq('status', 'confirmed')
        .or(`client_user_id.eq.${user.id},provider_user_id.eq.${user.id}`);

      if (updateError) throw updateError;
      await fetchInteractions();
      return true;
    } catch (err) {
      console.error('Error completing interaction:', err);
      toast.error('Failed to complete interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchInteractions]);

  // EITHER: Cancel an interaction
  const cancelInteraction = useCallback(async (
    interactionId: string,
    reason?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const updateData: Record<string, unknown> = { 
        status: 'cancelled',
        cancelled_by: user.id,
      };
      
      if (reason) {
        updateData.metadata = { cancel_reason: reason };
      }

      const { error: updateError } = await supabase
        .from('interactions')
        .update(updateData)
        .eq('id', interactionId)
        .or(`client_user_id.eq.${user.id},provider_user_id.eq.${user.id}`)
        .in('status', ['draft', 'requested', 'accepted', 'confirmed']);

      if (updateError) throw updateError;
      await fetchInteractions();
      return true;
    } catch (err) {
      console.error('Error cancelling interaction:', err);
      toast.error('Failed to cancel interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchInteractions]);

  // Helper: Get interactions grouped by status
  const getGroupedInteractions = useCallback((role: 'client' | 'provider') => {
    const roleFilter = role === 'client' 
      ? (i: Interaction) => i.client_user_id === user?.id
      : (i: Interaction) => i.provider_user_id === user?.id;

    const filtered = myInteractions.filter(roleFilter);

    return {
      pending: filtered.filter(i => 
        role === 'client' 
          ? ['requested', 'accepted'].includes(i.status)
          : i.status === 'requested'
      ),
      active: filtered.filter(i => 
        role === 'client'
          ? i.status === 'confirmed'
          : ['accepted', 'confirmed'].includes(i.status)
      ),
      completed: filtered.filter(i => i.status === 'completed'),
      cancelled: filtered.filter(i => ['cancelled', 'declined'].includes(i.status)),
    };
  }, [myInteractions, user?.id]);

  return {
    loading,
    error,
    myInteractions,
    fetchInteractions,
    requestInteraction,
    acceptInteraction,
    declineInteraction,
    confirmInteraction,
    completeInteraction,
    cancelInteraction,
    getGroupedInteractions,
  };
}
