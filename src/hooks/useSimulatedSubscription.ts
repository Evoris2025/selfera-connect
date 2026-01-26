/**
 * SIMULATION MODE: Subscription Hook
 * 
 * Returns simulated subscription data from MockSystemContext.
 * Allows switching between different subscription scenarios for testing.
 */

import { useMockSystem, type SubscriptionScenario } from '@/contexts/MockSystemContext';
import { PLAN_DETAILS, type SubscriptionPlan, type UserSubscription } from '@/hooks/useSubscription';

export function useSimulatedSubscription() {
  const { state, setSubscriptionScenario } = useMockSystem();
  const { subscription, currentScenarios } = state;

  // Convert MockSubscriptionState to UserSubscription format
  const userSubscription: UserSubscription = {
    id: subscription.id,
    user_id: 'mock-user',
    plan: subscription.plan,
    status: subscription.status,
    billing_period: subscription.billing_period,
    current_period_start: null,
    current_period_end: subscription.current_period_end,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const currentPlan = subscription.plan;
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

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

  // Get extended mock data for billing UI
  const mockData = {
    tier_colour: subscription.tier_colour,
    amount_due: subscription.amount_due,
    subscriber_count: subscription.subscriber_count,
  };

  // Scenario switching for testing
  const switchScenario = (scenario: SubscriptionScenario) => {
    setSubscriptionScenario(scenario);
  };

  return {
    subscription: userSubscription,
    currentPlan,
    isActive,
    loading: false, // Always ready in simulation mode
    error: null,
    refresh: () => {}, // No-op in simulation mode
    getPlanDetails,
    canUpgradeTo,
    isPlanAvailable,
    allPlans: PLAN_DETAILS,
    // Simulation extras
    mockData,
    isSimulated: true,
    currentScenario: currentScenarios.subscription,
    switchScenario,
    availableScenarios: ['free', 'creator', 'professional', 'organization', 'past_due'] as SubscriptionScenario[],
  };
}
