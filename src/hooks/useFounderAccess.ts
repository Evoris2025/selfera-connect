import { useAuth } from '@/contexts/AuthContext';

// CRITICAL: Only this email address has founder/admin access
const FOUNDER_EMAIL = 'martinbell@nefera.com.au';

/**
 * Hook to check if the current user is the platform founder.
 * This is the ONLY way to grant access to internal admin features.
 * 
 * Access is determined SOLELY by email match - not by:
 * - Verification status
 * - ERA tier
 * - User role
 * - Account type
 */
export function useFounderAccess() {
  const { user, loading } = useAuth();
  
  const isFounder = user?.email === FOUNDER_EMAIL;
  
  return {
    isFounder,
    isLoading: loading,
    founderEmail: FOUNDER_EMAIL,
  };
}
