import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
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

export function useVerification() {
  const { user } = useAuth();
  const [myRequest, setMyRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user's verification request
  const fetchMyRequest = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Type assertion for the data
      if (data) {
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
      } else {
        setMyRequest(null);
      }
    } catch (error) {
      console.error('Error fetching verification request:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyRequest();

    // Subscribe to real-time updates for this user's verification request
    if (!user?.id) return;

    const channel = supabase
      .channel('verification-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'verification_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update the local state when the verification request changes
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          if (newData) {
            // Show toast notification when status changes
            if (oldData?.status !== newData.status) {
              if (newData.status === 'approved') {
                toast({
                  title: '🎉 Verification Approved!',
                  description: 'Congratulations! Your ERA verification has been approved.',
                });
              } else if (newData.status === 'rejected') {
                toast({
                  title: 'Verification Update',
                  description: 'Your verification request was not approved. Check your request for details.',
                  variant: 'destructive',
                });
              }
            }
            
            setMyRequest({
              id: newData.id,
              user_id: newData.user_id,
              status: newData.status as VerificationStatus,
              account_type_requested: newData.account_type_requested || 'professional',
              submitted_fields: newData.submitted_fields,
              admin_notes: newData.admin_notes,
              reviewed_by: newData.reviewed_by || undefined,
              reviewed_at: newData.reviewed_at || undefined,
              created_at: newData.created_at || '',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMyRequest, user?.id]);

  // Submit a new verification request
  const submitRequest = useCallback(async (data: SubmitVerificationData) => {
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

      toast({
        title: 'Request submitted',
        description: 'Your verification request is now under review.',
      });

      await fetchMyRequest();
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
  }, [user?.id, fetchMyRequest]);

  return {
    myRequest,
    isLoading,
    isSubmitting,
    submitRequest,
    refreshRequest: fetchMyRequest,
  };
}

// Admin hook for managing verification requests
export function useAdminVerification() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [requests, setRequests] = useState<(VerificationRequest & { profile?: { display_name: string; handle: string; avatar_url: string } })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch all pending/recent requests (admin policy will filter)
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each request
      const userIds = data?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedRequests = (data || []).map(r => ({
        id: r.id,
        user_id: r.user_id,
        status: r.status as VerificationStatus,
        account_type_requested: (r as any).account_type_requested || 'professional',
        submitted_fields: r.submitted_fields as VerificationRequest['submitted_fields'],
        admin_notes: (r as any).admin_notes,
        reviewed_by: r.reviewed_by || undefined,
        reviewed_at: r.reviewed_at || undefined,
        created_at: r.created_at || '',
        profile: profileMap.get(r.user_id),
      }));

      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateRequest = useCallback(async (
    requestId: string, 
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    if (!user?.id) return false;

    try {
      // Update the verification request
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, update the user's profile
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const userType = request.account_type_requested === 'organization' 
            ? 'organization' 
            : 'professional';

          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              is_verified: true,
              user_type: userType,
            } as any)
            .eq('id', request.user_id);

          if (profileError) throw profileError;
        }
      }

      // Log the action for audit trail
      const request = requests.find(r => r.id === requestId);
      await logAction({
        actionType: status === 'approved' ? 'verification_approved' : 'verification_rejected',
        targetEntityId: requestId,
        targetEntityType: 'verification_requests',
        previousState: { status: request?.status },
        newState: { status, reviewed_by: user.id },
        notes: adminNotes,
      });

      toast({
        title: status === 'approved' ? 'Request approved' : 'Request rejected',
        description: status === 'approved' 
          ? 'User has been verified and will see the badge.'
          : 'User has been notified of the rejection.',
      });

      await fetchRequests();
      return true;
    } catch (error: any) {
      console.error('Error updating verification request:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, requests, fetchRequests, logAction]);

  return {
    requests,
    isLoading,
    updateRequest,
    refreshRequests: fetchRequests,
  };
}
