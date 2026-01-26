/**
 * SIMULATION MODE: Creator Score Hook
 * Re-exports simulated creator score for global simulation mode.
 */

// Re-export simulated version as the default
export { useSimulatedCreatorScore as useCreatorScore } from './useSimulatedCreatorScore';

// ============================================================================
// ORIGINAL HOOK (preserved for future real-data mode)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EraTier, ERA_TIER_CONFIG } from '@/lib/eraTiers';

// CCS weight configuration
const CCS_WEIGHTS = {
  interactions_completed: 10,
  interactions_declined: -5,
  reports_received: -15,
  reports_against_others: -3,
  account_age_days: 0.1, // 0.1 per day, max 365 points
  activity_score: 1,
  community_participation: 2,
};

// Tier multipliers for CCS
const TIER_MULTIPLIERS: Record<EraTier, number> = {
  pink: 1.0,
  green: 1.0,
  blue: 1.2,
  purple: 1.5,
  orange: 2.0,
};

// Eligibility thresholds
const ELIGIBILITY_REQUIREMENTS = {
  minCcsScore: 50,
  minInteractionsCompleted: 3,
  maxReportsReceived: 2,
  minAccountAgeDays: 30,
};

export interface CreatorScore {
  id: string;
  user_id: string;
  ccs_score: number;
  interactions_completed: number;
  interactions_declined: number;
  reports_received: number;
  reports_against_others: number;
  account_age_days: number;
  activity_score: number;
  community_participation: number;
  tier_multiplier: number;
  eligible_for_earnings: boolean;
  eligibility_reason: string | null;
  eligibility_updated_at: string | null;
  visibility_weight: number;
  estimated_reach: number;
  profile_views_30d: number;
  interaction_views_30d: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface VisibilityInsights {
  estimatedReach: number;
  profileViews: number;
  interactionViews: number;
  completionRate: number;
  visibilityTier: 'low' | 'standard' | 'boosted' | 'premium';
  ccsScore: number;
  eligibleForEarnings: boolean;
  eligibilityReason: string | null;
}

function calculateCcsScore(components: {
  interactions_completed: number;
  interactions_declined: number;
  reports_received: number;
  reports_against_others: number;
  account_age_days: number;
  activity_score: number;
  community_participation: number;
  tier_multiplier: number;
}): number {
  const baseScore =
    components.interactions_completed * CCS_WEIGHTS.interactions_completed +
    components.interactions_declined * CCS_WEIGHTS.interactions_declined +
    components.reports_received * CCS_WEIGHTS.reports_received +
    components.reports_against_others * CCS_WEIGHTS.reports_against_others +
    Math.min(components.account_age_days * CCS_WEIGHTS.account_age_days, 365) +
    components.activity_score * CCS_WEIGHTS.activity_score +
    components.community_participation * CCS_WEIGHTS.community_participation;

  // Apply tier multiplier and ensure non-negative
  return Math.max(0, Math.round(baseScore * components.tier_multiplier));
}

function calculateVisibilityWeight(ccsScore: number, tier: EraTier | null): number {
  // Base weight 1.0, range 0.5 to 2.0
  let weight = 1.0;

  // CCS contribution (±0.3)
  if (ccsScore >= 100) weight += 0.3;
  else if (ccsScore >= 50) weight += 0.15;
  else if (ccsScore < 20) weight -= 0.2;

  // Tier contribution (±0.2)
  if (tier === 'orange') weight += 0.2;
  else if (tier === 'purple') weight += 0.15;
  else if (tier === 'blue') weight += 0.1;

  // Clamp to valid range
  return Math.max(0.5, Math.min(2.0, weight));
}

function getVisibilityTier(weight: number): 'low' | 'standard' | 'boosted' | 'premium' {
  if (weight >= 1.5) return 'premium';
  if (weight >= 1.2) return 'boosted';
  if (weight >= 0.8) return 'standard';
  return 'low';
}

function checkEligibility(score: Partial<CreatorScore>): { eligible: boolean; reason: string } {
  if ((score.ccs_score || 0) < ELIGIBILITY_REQUIREMENTS.minCcsScore) {
    return { eligible: false, reason: `CCS score below minimum (${ELIGIBILITY_REQUIREMENTS.minCcsScore})` };
  }
  if ((score.interactions_completed || 0) < ELIGIBILITY_REQUIREMENTS.minInteractionsCompleted) {
    return { eligible: false, reason: `Minimum ${ELIGIBILITY_REQUIREMENTS.minInteractionsCompleted} completed interactions required` };
  }
  if ((score.reports_received || 0) > ELIGIBILITY_REQUIREMENTS.maxReportsReceived) {
    return { eligible: false, reason: 'Too many reports received' };
  }
  if ((score.account_age_days || 0) < ELIGIBILITY_REQUIREMENTS.minAccountAgeDays) {
    return { eligible: false, reason: `Account must be at least ${ELIGIBILITY_REQUIREMENTS.minAccountAgeDays} days old` };
  }
  return { eligible: true, reason: 'Meets all eligibility requirements' };
}

export function useCreatorScoreReal() {
  const { user } = useAuth();
  const [score, setScore] = useState<CreatorScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or initialize creator score
  const fetchScore = useCallback(async () => {
    if (!user) {
      setScore(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to fetch existing score
      const { data, error: fetchError } = await supabase
        .from('creator_contribution_scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setScore(data as CreatorScore);
      } else {
        // Initialize new score record
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single();

        const accountAgeDays = profile?.created_at
          ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const initialScore = {
          user_id: user.id,
          ccs_score: 0,
          interactions_completed: 0,
          interactions_declined: 0,
          reports_received: 0,
          reports_against_others: 0,
          account_age_days: accountAgeDays,
          activity_score: 0,
          community_participation: 0,
          tier_multiplier: 1.0,
          eligible_for_earnings: false,
          eligibility_reason: 'New account',
          visibility_weight: 1.0,
          estimated_reach: 0,
          profile_views_30d: 0,
          interaction_views_30d: 0,
          completion_rate: 0,
        };

        const { data: newScore, error: insertError } = await supabase
          .from('creator_contribution_scores')
          .insert(initialScore)
          .select()
          .single();

        if (insertError) throw insertError;
        setScore(newScore as CreatorScore);
      }
    } catch (err) {
      console.error('Error fetching creator score:', err);
      setError('Failed to load creator score');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  // Recalculate and update score
  const recalculateScore = useCallback(async (tier: EraTier | null = null) => {
    if (!user || !score) return;

    try {
      // Fetch latest interaction data
      const [{ count: completedCount }, { count: declinedCount }, { count: reportsAgainst }] = await Promise.all([
        supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('provider_user_id', user.id)
          .eq('status', 'completed'),
        supabase
          .from('interactions')
          .select('*', { count: 'exact', head: true })
          .eq('provider_user_id', user.id)
          .eq('status', 'declined'),
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', user.id)
          .eq('target_type', 'user'),
      ]);

      // Get account age
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      const accountAgeDays = profile?.created_at
        ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Get activity score from posts
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      // Get community participation
      const { count: communityCount } = await supabase
        .from('community_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const tierMultiplier = tier ? TIER_MULTIPLIERS[tier] : 1.0;

      const components = {
        interactions_completed: completedCount || 0,
        interactions_declined: declinedCount || 0,
        reports_received: reportsAgainst || 0,
        reports_against_others: score.reports_against_others,
        account_age_days: accountAgeDays,
        activity_score: Math.min(postCount || 0, 100), // Cap at 100
        community_participation: Math.min((communityCount || 0) * 5, 50), // Cap at 50
        tier_multiplier: tierMultiplier,
      };

      const newCcsScore = calculateCcsScore(components);
      const visibilityWeight = calculateVisibilityWeight(newCcsScore, tier);

      // Calculate completion rate
      const totalInteractions = (completedCount || 0) + (declinedCount || 0);
      const completionRate = totalInteractions > 0
        ? Math.round(((completedCount || 0) / totalInteractions) * 100)
        : 0;

      // Check eligibility
      const eligibilityCheck = checkEligibility({
        ccs_score: newCcsScore,
        interactions_completed: completedCount || 0,
        reports_received: reportsAgainst || 0,
        account_age_days: accountAgeDays,
      });

      // Update in database
      const updateData = {
        ccs_score: newCcsScore,
        interactions_completed: completedCount || 0,
        interactions_declined: declinedCount || 0,
        reports_received: reportsAgainst || 0,
        account_age_days: accountAgeDays,
        activity_score: components.activity_score,
        community_participation: components.community_participation,
        tier_multiplier: tierMultiplier,
        visibility_weight: visibilityWeight,
        completion_rate: completionRate,
        eligible_for_earnings: eligibilityCheck.eligible,
        eligibility_reason: eligibilityCheck.reason,
        eligibility_updated_at: new Date().toISOString(),
        // Simulated reach metrics (placeholder)
        estimated_reach: Math.round(newCcsScore * 10 * visibilityWeight),
      };

      const { data: updatedScore, error: updateError } = await supabase
        .from('creator_contribution_scores')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setScore(updatedScore as CreatorScore);

    } catch (err) {
      console.error('Error recalculating score:', err);
    }
  }, [user, score]);

  // Increment activity score (called when user posts, comments, etc.)
  const incrementActivity = useCallback(async (amount: number = 1) => {
    if (!user || !score) return;

    const newActivityScore = Math.min(score.activity_score + amount, 100);
    
    await supabase
      .from('creator_contribution_scores')
      .update({ activity_score: newActivityScore })
      .eq('user_id', user.id);

    setScore(prev => prev ? { ...prev, activity_score: newActivityScore } : null);
  }, [user, score]);

  // Get visibility insights for dashboard display
  const getVisibilityInsights = useCallback((): VisibilityInsights | null => {
    if (!score) return null;

    return {
      estimatedReach: score.estimated_reach,
      profileViews: score.profile_views_30d,
      interactionViews: score.interaction_views_30d,
      completionRate: score.completion_rate,
      visibilityTier: getVisibilityTier(score.visibility_weight),
      ccsScore: score.ccs_score,
      eligibleForEarnings: score.eligible_for_earnings,
      eligibilityReason: score.eligibility_reason,
    };
  }, [score]);

  return {
    score,
    loading,
    error,
    refresh: fetchScore,
    recalculateScore,
    incrementActivity,
    getVisibilityInsights,
    visibilityWeight: score?.visibility_weight || 1.0,
  };
}

// Export for feed weighting
export { calculateVisibilityWeight, TIER_MULTIPLIERS };
