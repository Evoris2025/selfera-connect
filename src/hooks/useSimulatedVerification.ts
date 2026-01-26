/**
 * SIMULATION MODE: Verification Hook
 * 
 * Returns simulated verification request data for UI testing.
 * Falls back to real data if available.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  getCurrentMockVerification, 
  MOCK_VERIFICATION_REQUESTS,
  type MockVerificationRequest 
} from '@/data/mockSimulationData';
import { toast } from '@/hooks/use-toast';

const SIMULATION_MODE = true;

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: VerificationStatus;
  account_type_requested: string;
  submitted_fields: {
    display_name?: string;
    country?: string;
    credentials_summary?: string;
    registration_number?: string;
    website?: string;
    proof_url?: string;
    terms_accepted?: boolean;
  } | null;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface SubmitVerificationData {
  account_type_requested: 'professional' | 'organization';
  display_name: string;
  country: string;
  credentials_summary: string;
  registration_number?: string;
  website?: string;
  proof_url?: string;
  terms_accepted: boolean;
}

export function useSimulatedVerification() {
  const { user } = useAuth();
  const [myRequest, setMyRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyRequest = useCallback(async () => {
    setIsLoading(true);

    try {
      // Try real data first
      if (user?.id && !SIMULATION_MODE) {
        const { data, error } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setMyRequest({
            id: data.id,
            user_id: data.user_id,
            status: data.status as VerificationStatus,
            account_type_requested: (data as any).account_type_requested || 'professional',
            submitted_fields: data.submitted_fields as VerificationRequest['submitted_fields'],
            admin_notes: (data as any).admin_notes,
            reviewed_by: data.reviewed_by || undefined,
            reviewed_at: data.reviewed_at || undefined,
            created_at: data.created_at || '',
          });
          setIsLoading(false);
          return;
        }
      }

      // Fall back to simulation data
      const mockRequest = getCurrentMockVerification();
      if (mockRequest.id) {
        setMyRequest({
          ...mockRequest,
          user_id: user?.id || 'mock-user',
        });
      } else {
        setMyRequest(null);
      }
    } catch (error) {
      console.error('Error fetching verification request:', error);
      // On error, use simulation data
      const mockRequest = getCurrentMockVerification();
      if (mockRequest.id) {
        setMyRequest({
          ...mockRequest,
          user_id: user?.id || 'mock-user',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyRequest();
  }, [fetchMyRequest]);

  const submitRequest = useCallback(async (data: SubmitVerificationData): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to submit a verification request.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      if (!SIMULATION_MODE) {
        const { error } = await supabase
          .from('verification_requests')
          .insert({
            user_id: user.id,
            status: 'pending' as const,
            account_type_requested: data.account_type_requested,
            submitted_fields: {
              display_name: data.display_name,
              country: data.country,
              credentials_summary: data.credentials_summary,
              registration_number: data.registration_number,
              website: data.website,
              proof_url: data.proof_url,
              terms_accepted: data.terms_accepted,
            },
          } as any);

        if (error) throw error;
      }

      // Simulation: create local pending request
      const newRequest: VerificationRequest = {
        id: `mock-ver-${Date.now()}`,
        user_id: user.id,
        status: 'pending',
        account_type_requested: data.account_type_requested,
        submitted_fields: {
          display_name: data.display_name,
          country: data.country,
          credentials_summary: data.credentials_summary,
          registration_number: data.registration_number,
          website: data.website,
          proof_url: data.proof_url,
          terms_accepted: data.terms_accepted,
        },
        created_at: new Date().toISOString(),
      };

      setMyRequest(newRequest);

      toast({
        title: 'Request submitted',
        description: 'Your verification request is now under review.',
      });

      return true;
    } catch (error: any) {
      console.error('Error submitting verification request:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  // Simulation helper: manually set verification status for testing
  const setSimulatedStatus = useCallback((status: VerificationStatus) => {
    if (myRequest) {
      setMyRequest({
        ...myRequest,
        status,
        reviewed_at: status !== 'pending' ? new Date().toISOString() : undefined,
        reviewed_by: status !== 'pending' ? 'admin-user' : undefined,
      });

      if (status === 'approved') {
        toast({
          title: '🎉 Verification Approved!',
          description: 'Congratulations! Your ERA verification has been approved.',
        });
      } else if (status === 'rejected') {
        toast({
          title: 'Verification Update',
          description: 'Your verification request was not approved.',
          variant: 'destructive',
        });
      }
    }
  }, [myRequest]);

  return {
    myRequest,
    isLoading,
    isSubmitting,
    submitRequest,
    refreshRequest: fetchMyRequest,
    setSimulatedStatus, // For testing different states
    isSimulated: SIMULATION_MODE || !user?.id,
  };
}
