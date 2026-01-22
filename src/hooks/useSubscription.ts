import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionPlan = 'free' | 'creator' | 'professional' | 'organization';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_period: BillingPeriod | null;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
}

// Plan configuration - prices in USD
export const PLAN_DETAILS: PlanDetails[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Full social access, forever free',
    monthlyPrice: null,
    yearlyPrice: null,
    cta: 'Current plan',
    features: [
      { name: 'Post content & expressions', included: true },
      { name: 'Join communities', included: true },
      { name: 'Message peers', included: true },
      { name: 'Discover providers', included: true },
      { name: 'Access crisis resources', included: true },
      { name: 'Follow creators', included: true },
      { name: 'Full social participation', included: true },
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'For wellbeing content creators',
    monthlyPrice: 9,
    yearlyPrice: 79,
    cta: 'Coming soon',
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Creator profile label', included: true, highlight: true },
      { name: 'Advanced profile sections', included: true },
      { name: 'Creator analytics', included: true },
      { name: 'Featured creator eligibility', included: true },
      { name: 'Custom content links', included: true },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For individual practitioners',
    monthlyPrice: 29,
    yearlyPrice: 249,
    cta: 'Coming soon',
    popular: true,
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Verified badge', included: true, highlight: true },
      { name: 'Directory listing', included: true, highlight: true },
      { name: 'Receive connection requests', included: true },
      { name: 'Appear in provider search', included: true },
      { name: 'Professional profile layout', included: true },
      { name: 'Link services & offerings', included: true },
    ],
  },
  {
    id: 'organization',
    name: 'Organisation',
    description: 'For clinics & wellbeing services',
    monthlyPrice: 79,
    yearlyPrice: 699,
    cta: 'Coming soon',
    features: [
      { name: 'Everything in Professional', included: true },
      { name: 'Organisation profile', included: true, highlight: true },
      { name: 'Link multiple practitioners', included: true, highlight: true },
      { name: 'Enhanced directory presence', included: true },
      { name: 'Service listings', included: true },
      { name: 'Organisation analytics', included: true },
    ],
  },
];

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setSubscription(data as UserSubscription);
      } else {
        // Initialize free subscription if none exists
        const { data: newSub, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({ user_id: user.id, plan: 'free', status: 'active' })
          .select()
          .single();

        if (insertError) throw insertError;
        setSubscription(newSub as UserSubscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  const getPlanDetails = (planId: SubscriptionPlan): PlanDetails | undefined => {
    return PLAN_DETAILS.find(p => p.id === planId);
  };

  const canUpgradeTo = (planId: SubscriptionPlan): boolean => {
    const planOrder: SubscriptionPlan[] = ['free', 'creator', 'professional', 'organization'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);
    return targetIndex > currentIndex;
  };

  const isPlanAvailable = (planId: SubscriptionPlan): boolean => {
    // All paid plans show "Coming soon" until Stripe is integrated
    return planId === 'free';
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
  };
}
