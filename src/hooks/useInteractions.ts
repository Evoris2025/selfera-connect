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

// Re-export from simulated version for simulation mode
export { useSimulatedInteractions as useInteractions } from './useSimulatedInteractions';
