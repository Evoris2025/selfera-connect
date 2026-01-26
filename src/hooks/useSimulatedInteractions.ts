/**
 * SIMULATION MODE: Interactions Hook
 * 
 * Returns simulated interaction data for UI testing.
 * Falls back to real data if available.
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_INTERACTIONS, type MockInteraction } from '@/data/mockSimulationData';
import { calculateInteractionAmountDue, getTierPriceCap, type EraTier, CLIENT_BASE_PRICE } from '@/lib/eraTiers';
import { toast } from 'sonner';

const SIMULATION_MODE = true;

export type InteractionStatus = 'draft' | 'requested' | 'accepted' | 'confirmed' | 'completed' | 'cancelled' | 'declined';

export interface Interaction {
  id: string;
  client_user_id: string;
  provider_user_id: string;
  provider_tier_price: number;
  client_base_price: number;
  amount_due: number;
  status: InteractionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Extended mock data
  client?: {
    id: string;
    display_name: string;
    handle: string;
    avatar_url: string;
  };
  provider?: {
    id: string;
    display_name: string;
    handle: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export interface CreateInteractionParams {
  providerUserId: string;
  providerTier: EraTier;
  notes?: string;
}

export function useSimulatedInteractions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localInteractions, setLocalInteractions] = useState<Interaction[]>(MOCK_INTERACTIONS);

  const createInteractionDraft = useCallback(async ({
    providerUserId,
    providerTier,
    notes,
  }: CreateInteractionParams): Promise<Interaction | null> => {
    if (!user) {
      setError('Must be logged in to create interactions');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const providerTierPrice = getTierPriceCap(providerTier);
      const amountDue = calculateInteractionAmountDue(providerTier);

      if (!SIMULATION_MODE) {
        const { data, error: insertError } = await supabase
          .from('interactions')
          .insert({
            client_user_id: user.id,
            provider_user_id: providerUserId,
            provider_tier_price: providerTierPrice,
            client_base_price: CLIENT_BASE_PRICE,
            amount_due: amountDue,
            status: 'draft',
            notes: notes || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return data as Interaction;
      }

      // Simulation mode: create local mock
      const newInteraction: Interaction = {
        id: `mock-int-${Date.now()}`,
        client_user_id: user.id,
        provider_user_id: providerUserId,
        provider_tier_price: providerTierPrice,
        client_base_price: CLIENT_BASE_PRICE,
        amount_due: amountDue,
        status: 'draft',
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setLocalInteractions(prev => [newInteraction, ...prev]);
      return newInteraction;
    } catch (err) {
      console.error('Error creating interaction:', err);
      setError('Failed to create interaction');
      toast.error('Failed to create interaction');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const submitInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      if (!SIMULATION_MODE) {
        const { error: updateError } = await supabase
          .from('interactions')
          .update({ status: 'requested' })
          .eq('id', interactionId)
          .eq('client_user_id', user.id)
          .eq('status', 'draft');

        if (updateError) throw updateError;
      }

      // Simulation update
      setLocalInteractions(prev =>
        prev.map(int =>
          int.id === interactionId ? { ...int, status: 'requested' as InteractionStatus } : int
        )
      );

      toast.success('Interaction request sent');
      return true;
    } catch (err) {
      console.error('Error submitting interaction:', err);
      toast.error('Failed to submit interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const cancelInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      if (!SIMULATION_MODE) {
        const { error: deleteError } = await supabase
          .from('interactions')
          .delete()
          .eq('id', interactionId)
          .eq('client_user_id', user.id);

        if (deleteError) throw deleteError;
      }

      // Simulation: remove from local
      setLocalInteractions(prev => prev.filter(int => int.id !== interactionId));
      toast.success('Interaction cancelled');
      return true;
    } catch (err) {
      console.error('Error cancelling interaction:', err);
      toast.error('Failed to cancel interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMyInteractions = useCallback(async (
    role: 'client' | 'provider' | 'both' = 'both'
  ): Promise<Interaction[]> => {
    if (!user) return localInteractions;

    setLoading(true);
    try {
      if (!SIMULATION_MODE) {
        let query = supabase.from('interactions').select('*');

        if (role === 'client') {
          query = query.eq('client_user_id', user.id);
        } else if (role === 'provider') {
          query = query.eq('provider_user_id', user.id);
        } else {
          query = query.or(`client_user_id.eq.${user.id},provider_user_id.eq.${user.id}`);
        }

        const { data, error: fetchError } = await query.order('created_at', { ascending: false });

        if (!fetchError && data && data.length > 0) {
          return data as Interaction[];
        }
      }

      // Return simulation data filtered by role
      return localInteractions.filter(int => {
        if (role === 'client') return int.client_user_id === user.id || int.client_user_id === 'mock-user';
        if (role === 'provider') return int.provider_user_id === user.id || int.provider_user_id === 'mock-user';
        return true;
      });
    } catch (err) {
      console.error('Error fetching interactions:', err);
      return localInteractions;
    } finally {
      setLoading(false);
    }
  }, [user, localInteractions]);

  const acceptInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      if (!SIMULATION_MODE) {
        const { error: updateError } = await supabase
          .from('interactions')
          .update({ status: 'confirmed' })
          .eq('id', interactionId)
          .eq('provider_user_id', user.id)
          .eq('status', 'requested');

        if (updateError) throw updateError;
      }

      setLocalInteractions(prev =>
        prev.map(int =>
          int.id === interactionId ? { ...int, status: 'confirmed' as InteractionStatus } : int
        )
      );

      toast.success('Interaction confirmed');
      return true;
    } catch (err) {
      console.error('Error accepting interaction:', err);
      toast.error('Failed to confirm interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const declineInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      if (!SIMULATION_MODE) {
        const { error: updateError } = await supabase
          .from('interactions')
          .update({ status: 'cancelled' })
          .eq('id', interactionId)
          .eq('provider_user_id', user.id)
          .eq('status', 'requested');

        if (updateError) throw updateError;
      }

      setLocalInteractions(prev =>
        prev.map(int =>
          int.id === interactionId ? { ...int, status: 'declined' as InteractionStatus } : int
        )
      );

      toast.success('Interaction declined');
      return true;
    } catch (err) {
      console.error('Error declining interaction:', err);
      toast.error('Failed to decline interaction');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get counts for dashboard display
  const interactionCounts = useMemo(() => {
    const pending = localInteractions.filter(i => i.status === 'requested').length;
    const active = localInteractions.filter(i => ['confirmed', 'accepted'].includes(i.status)).length;
    const completed = localInteractions.filter(i => i.status === 'completed').length;
    const total = localInteractions.length;

    return { pending, active, completed, total };
  }, [localInteractions]);

  return {
    loading,
    error,
    createInteractionDraft,
    submitInteraction,
    cancelInteraction,
    fetchMyInteractions,
    acceptInteraction,
    declineInteraction,
    interactions: localInteractions,
    interactionCounts,
    isSimulated: SIMULATION_MODE,
  };
}
