/**
 * SIMULATION MODE: Subscription Hook
 * 
 * Returns simulated subscription data for UI testing.
 * Falls back to real data if available in production mode.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  getCurrentMockSubscription, 
  MOCK_SUBSCRIPTIONS,
  type MockSubscription 
} from '@/data/mockSimulationData';
import { PLAN_DETAILS, type SubscriptionPlan, type UserSubscription } from '@/hooks/useSubscription';

const SIMULATION_MODE = true; // Toggle for simulation vs real data

export function useSimulatedSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch real data first
      if (user?.id && !SIMULATION_MODE) {
        const { data, error: fetchError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!fetchError && data) {
          setSubscription(data as UserSubscription);
          setLoading(false);
          return;
        }
      }

      // Fall back to simulation data
      const mockSub = getCurrentMockSubscription();
      setSubscription({
        id: mockSub.id,
        user_id: user?.id || 'mock-user',
        plan: mockSub.plan,
        status: mockSub.status,
        billing_period: mockSub.billing_period,
        current_period_start: mockSub.current_period_start,
        current_period_end: mockSub.current_period_end,
        stripe_customer_id: mockSub.stripe_customer_id,
        stripe_subscription_id: mockSub.stripe_subscription_id,
        created_at: mockSub.created_at,
        updated_at: mockSub.updated_at,
      });
    } catch (err) {
      console.error('Error fetching subscription:', err);
      // On error, still provide simulation data
      const mockSub = getCurrentMockSubscription();
      setSubscription({
        id: mockSub.id,
        user_id: user?.id || 'mock-user',
        plan: mockSub.plan,
        status: mockSub.status,
        billing_period: mockSub.billing_period,
        current_period_start: mockSub.current_period_start,
        current_period_end: mockSub.current_period_end,
        stripe_customer_id: mockSub.stripe_customer_id,
        stripe_subscription_id: mockSub.stripe_subscription_id,
        created_at: mockSub.created_at,
        updated_at: mockSub.updated_at,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  const getPlanDetails = (planId: SubscriptionPlan) => {
    return PLAN_DETAILS.find(p => p.id === planId);
  };

  const canUpgradeTo = (planId: SubscriptionPlan): boolean => {
    const planOrder: SubscriptionPlan[] = ['free', 'creator', 'professional', 'organization'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);
    return targetIndex > currentIndex;
  };

  const isPlanAvailable = (planId: SubscriptionPlan): boolean => {
    return planId === 'free'; // Paid plans show "Coming soon"
  };

  // Simulation helpers - get extended mock data
  const getExtendedMockData = () => {
    const mock = getCurrentMockSubscription();
    return {
      tier_colour: mock.tier_colour,
      amount_due: mock.amount_due,
      subscriber_count: mock.subscriber_count,
    };
  };

  return {
    subscription,
    currentPlan,
    isActive,
    loading,
    error,
    refresh: fetchSubscription,
    getPlanDetails,
    canUpgradeTo,
    isPlanAvailable,
    allPlans: PLAN_DETAILS,
    // Simulation extras
    mockData: getExtendedMockData(),
    isSimulated: SIMULATION_MODE || !user?.id,
  };
}
