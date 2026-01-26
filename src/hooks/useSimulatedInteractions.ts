/**
 * SIMULATION MODE: Interactions Hook
 * 
 * Returns simulated interaction data from MockSystemContext.
 * Manages interaction lifecycle for both client and provider views.
 */

import { useCallback, useMemo } from 'react';
import { useMockSystem, type InteractionRole, type MockInteractionRequest } from '@/contexts/MockSystemContext';
import { calculateInteractionAmountDue, getTierPriceCap, type EraTier, CLIENT_BASE_PRICE } from '@/lib/eraTiers';
import { toast } from 'sonner';

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
  const { 
    state, 
    getInteractions, 
    updateInteractionStatus, 
    addInteraction 
  } = useMockSystem();
  
  const { interactions } = state;

  const createInteractionDraft = useCallback(async ({
    providerUserId,
    providerTier,
    notes,
  }: CreateInteractionParams): Promise<Interaction | null> => {
    const providerTierPrice = getTierPriceCap(providerTier);
    const amountDue = calculateInteractionAmountDue(providerTier);

    const newInteraction: Omit<MockInteractionRequest, 'id' | 'created_at' | 'updated_at'> = {
      client_user_id: 'mock-user',
      provider_user_id: providerUserId,
      provider_tier_price: providerTierPrice,
      client_base_price: CLIENT_BASE_PRICE,
      amount_due: amountDue,
      status: 'draft',
      notes: notes || null,
    };

    addInteraction(newInteraction);
    toast.success('Interaction draft created');
    
    return {
      ...newInteraction,
      id: `mock-int-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [addInteraction]);

  const submitInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    updateInteractionStatus(interactionId, 'requested');
    toast.success('Interaction request sent');
    return true;
  }, [updateInteractionStatus]);

  const cancelInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    updateInteractionStatus(interactionId, 'cancelled');
    toast.success('Interaction cancelled');
    return true;
  }, [updateInteractionStatus]);

  const fetchMyInteractions = useCallback(async (
    role: InteractionRole = 'both'
  ): Promise<Interaction[]> => {
    return getInteractions(role) as Interaction[];
  }, [getInteractions]);

  const acceptInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    updateInteractionStatus(interactionId, 'accepted');
    toast.success('Interaction accepted');
    return true;
  }, [updateInteractionStatus]);

  const confirmInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    updateInteractionStatus(interactionId, 'confirmed');
    toast.success('Interaction confirmed');
    return true;
  }, [updateInteractionStatus]);

  const completeInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    updateInteractionStatus(interactionId, 'completed');
    toast.success('Interaction completed');
    return true;
  }, [updateInteractionStatus]);

  const declineInteraction = useCallback(async (interactionId: string): Promise<boolean> => {
    updateInteractionStatus(interactionId, 'declined');
    toast.success('Interaction declined');
    return true;
  }, [updateInteractionStatus]);

  // Get counts for dashboard display
  const interactionCounts = useMemo(() => {
    const pending = interactions.filter(i => i.status === 'requested').length;
    const active = interactions.filter(i => ['confirmed', 'accepted'].includes(i.status)).length;
    const completed = interactions.filter(i => i.status === 'completed').length;
    const total = interactions.length;

    return { pending, active, completed, total };
  }, [interactions]);

  // Get interactions by role
  const clientInteractions = useMemo(() => 
    interactions.filter(i => i.client_user_id === 'mock-user'),
    [interactions]
  );

  const providerInteractions = useMemo(() => 
    interactions.filter(i => i.provider_user_id === 'mock-user'),
    [interactions]
  );

  return {
    loading: false, // Always ready in simulation mode
    error: null,
    createInteractionDraft,
    submitInteraction,
    cancelInteraction,
    fetchMyInteractions,
    acceptInteraction,
    confirmInteraction,
    completeInteraction,
    declineInteraction,
    interactions: interactions as Interaction[],
    clientInteractions: clientInteractions as Interaction[],
    providerInteractions: providerInteractions as Interaction[],
    interactionCounts,
    isSimulated: true,
  };
}
