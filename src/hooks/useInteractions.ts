import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateInteractionAmountDue, getTierPriceCap, EraTier, CLIENT_BASE_PRICE } from '@/lib/eraTiers';
import { toast } from 'sonner';

export type InteractionStatus = 'draft' | 'requested' | 'confirmed' | 'completed' | 'cancelled';

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
}

export interface CreateInteractionParams {
  providerUserId: string;
  providerTier: EraTier;
  notes?: string;
}

export function useInteractions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a draft interaction request
   * Calculates the amount due based on provider tier
   */
  const createInteractionDraft = useCallback(async ({
    providerUserId,
    providerTier,
    notes,
  }: CreateInteractionParams): Promise<Interaction | null> => {
    if (!user) {
      setError('Must be logged in to create interactions');
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
          status: 'draft',
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      return data as Interaction;
    } catch (err) {
      console.error('Error creating interaction:', err);
      setError('Failed to create interaction');
      toast.error('Failed to create interaction');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Submits a draft interaction as a request
   */
  const submitInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ status: 'requested' })
        .eq('id', interactionId)
        .eq('client_user_id', user.id)
        .eq('status', 'draft');

      if (updateError) throw updateError;
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

  /**
   * Cancels an interaction (client only, draft or requested status)
   */
  const cancelInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('interactions')
        .delete()
        .eq('id', interactionId)
        .eq('client_user_id', user.id);

      if (deleteError) throw deleteError;
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

  /**
   * Fetches interactions for the current user (as client or provider)
   */
  const fetchMyInteractions = useCallback(async (
    role: 'client' | 'provider' | 'both' = 'both'
  ): Promise<Interaction[]> => {
    if (!user) return [];

    try {
      setLoading(true);
      let query = supabase.from('interactions').select('*');

      if (role === 'client') {
        query = query.eq('client_user_id', user.id);
      } else if (role === 'provider') {
        query = query.eq('provider_user_id', user.id);
      } else {
        query = query.or(`client_user_id.eq.${user.id},provider_user_id.eq.${user.id}`);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return (data || []) as Interaction[];
    } catch (err) {
      console.error('Error fetching interactions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Provider accepts an interaction request
   */
  const acceptInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ status: 'confirmed' })
        .eq('id', interactionId)
        .eq('provider_user_id', user.id)
        .eq('status', 'requested');

      if (updateError) throw updateError;
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

  /**
   * Provider declines an interaction request
   */
  const declineInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('interactions')
        .update({ status: 'cancelled' })
        .eq('id', interactionId)
        .eq('provider_user_id', user.id)
        .eq('status', 'requested');

      if (updateError) throw updateError;
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

  return {
    loading,
    error,
    createInteractionDraft,
    submitInteraction,
    cancelInteraction,
    fetchMyInteractions,
    acceptInteraction,
    declineInteraction,
  };
}
