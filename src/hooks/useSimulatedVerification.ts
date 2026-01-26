/**
 * SIMULATION MODE: Verification Hook
 * 
 * Returns simulated verification request data from MockSystemContext.
 * Allows switching between different verification scenarios for testing.
 */

import { useCallback } from 'react';
import { useMockSystem, type VerificationScenario } from '@/contexts/MockSystemContext';
import { toast } from '@/hooks/use-toast';

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
  const { state, setVerificationScenario } = useMockSystem();
  const { verification, currentScenarios } = state;

  // Convert MockVerificationState to VerificationRequest format
  const myRequest: VerificationRequest | null = verification.id ? {
    id: verification.id,
    user_id: 'mock-user',
    status: verification.status === 'none' ? 'pending' : verification.status as VerificationStatus,
    account_type_requested: verification.account_type_requested,
    submitted_fields: {
      display_name: 'Dr. Sarah Chen',
      country: 'Australia',
      credentials_summary: 'Licensed Clinical Psychologist',
      terms_accepted: true,
    },
    admin_notes: verification.admin_notes,
    created_at: verification.created_at,
  } : null;

  const submitRequest = useCallback(async (data: SubmitVerificationData): Promise<boolean> => {
    // Simulate submission by switching to pending scenario
    setVerificationScenario('pending');
    
    toast({
      title: 'Request submitted',
      description: 'Your verification request is now under review.',
    });

    return true;
  }, [setVerificationScenario]);

  // Simulation helper: manually set verification status for testing
  const setSimulatedStatus = useCallback((status: VerificationStatus) => {
    const scenarioMap: Record<VerificationStatus, VerificationScenario> = {
      pending: 'pending',
      approved: 'approved',
      rejected: 'rejected',
    };
    
    setVerificationScenario(scenarioMap[status]);

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
  }, [setVerificationScenario]);

  // Scenario switching for testing
  const switchScenario = (scenario: VerificationScenario) => {
    setVerificationScenario(scenario);
  };

  return {
    myRequest: verification.status === 'none' ? null : myRequest,
    isLoading: false, // Always ready in simulation mode
    isSubmitting: false,
    submitRequest,
    refreshRequest: () => {}, // No-op in simulation mode
    setSimulatedStatus,
    isSimulated: true,
    currentScenario: currentScenarios.verification,
    switchScenario,
    availableScenarios: ['none', 'pending', 'approved', 'rejected'] as VerificationScenario[],
  };
}
