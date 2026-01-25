import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { PlanType, EraTier } from '@/lib/eraTiers';

export type UserRole = 'client' | 'creator' | 'practitioner' | 'organisation';

export interface UserRoleInfo {
  role: UserRole;
  isVerified: boolean;
  isProvider: boolean;
  canRequestInteractions: boolean;
  canReceiveInteractions: boolean;
  canAccessProviderDashboard: boolean;
  canListInDirectory: boolean;
  tierColour: EraTier | null;
  planType: PlanType;
  displayLabel: string;
}

// Map user_type and verification intent to role
function determineRole(
  userType: string | null,
  verificationIntent: string | null,
  isVerified: boolean
): UserRole {
  // If verified, use user_type to determine role
  if (isVerified) {
    switch (userType) {
      case 'organization':
        return 'organisation';
      case 'professional':
        return 'practitioner';
      default:
        // Could be a verified creator or individual
        if (verificationIntent === 'creator') return 'creator';
        return 'client';
    }
  }

  // Not verified yet - check verification intent
  if (verificationIntent) {
    switch (verificationIntent) {
      case 'organization':
        return 'organisation';
      case 'professional':
        return 'practitioner';
      case 'creator':
        return 'creator';
      case 'individual':
      default:
        return 'client';
    }
  }

  // Check user_type even if not verified (for pending verifications)
  switch (userType) {
    case 'organization':
      return 'organisation';
    case 'professional':
      return 'practitioner';
    default:
      return 'client';
  }
}

// Get display label for role
function getRoleDisplayLabel(role: UserRole, isVerified: boolean): string {
  const labels: Record<UserRole, { verified: string; unverified: string }> = {
    client: { verified: 'Support Seeker', unverified: 'Support Seeker' },
    creator: { verified: 'ERA Creator', unverified: 'Creator' },
    practitioner: { verified: 'ERA Practitioner', unverified: 'Practitioner' },
    organisation: { verified: 'ERA Organisation', unverified: 'Organisation' },
  };
  return isVerified ? labels[role].verified : labels[role].unverified;
}

export function useUserRole() {
  const { user } = useAuth();
  const { myRequest, isLoading: verificationLoading } = useVerification();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [userType, setUserType] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type, is_verified')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserType(data?.user_type || null);
        setIsVerified(data?.is_verified || false);
      } catch (err) {
        console.error('Error fetching profile for role:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  // Extract subscription data with type safety
  const subscriptionData = subscription as any;
  const planType: PlanType = subscriptionData?.plan_type || 'free';
  const tierColour: EraTier | null = subscriptionData?.tier_colour || null;

  // Determine role based on all factors
  const verificationIntent = myRequest?.account_type_requested || null;

  const roleInfo = useMemo<UserRoleInfo>(() => {
    const role = determineRole(userType, verificationIntent, isVerified);
    const isProvider = role === 'creator' || role === 'practitioner' || role === 'organisation';

    return {
      role,
      isVerified,
      isProvider,
      // Clients can request interactions (if paid)
      canRequestInteractions: role === 'client' && planType === 'client',
      // Providers can receive interactions
      canReceiveInteractions: isProvider && isVerified,
      // Only verified providers can access dashboard
      canAccessProviderDashboard: isProvider && isVerified,
      // Only verified providers can list in directory
      canListInDirectory: isProvider && isVerified,
      tierColour,
      planType,
      displayLabel: getRoleDisplayLabel(role, isVerified),
    };
  }, [userType, verificationIntent, isVerified, planType, tierColour]);

  return {
    ...roleInfo,
    loading: loading || verificationLoading || subscriptionLoading,
  };
}
