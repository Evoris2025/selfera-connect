/**
 * SIMULATION MODE: Creator Contribution Score Hook
 * 
 * Returns simulated CCS data for UI testing.
 * Falls back to real data if available.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_MOCK_CREATOR_SCORE, type MockCreatorScore } from '@/data/mockSimulationData';

const SIMULATION_MODE = true;

export interface CreatorScore {
  ccs_score: number;
  interactions_completed: number;
  interactions_declined: number;
  reports_received: number;
  account_age_days: number;
  activity_score: number;
  community_participation: number;
  tier_multiplier: number;
  eligible_for_earnings: boolean;
  eligibility_reason: string | null;
  visibility_weight: number;
  estimated_reach: number;
  profile_views_30d: number;
  interaction_views_30d: number;
  completion_rate: number;
}

export interface VisibilityInsights {
  estimatedReach: number;
  profileViews: number;
  interactionViews: number;
  completionRate: number;
  visibilityTier: 'emerging' | 'growing' | 'established' | 'prominent';
  eligibleForEarnings: boolean;
  ccsScore: number;
}

function getVisibilityTier(score: number): VisibilityInsights['visibilityTier'] {
  if (score >= 800) return 'prominent';
  if (score >= 500) return 'established';
  if (score >= 200) return 'growing';
  return 'emerging';
}

export function useSimulatedCreatorScore() {
  const { user } = useAuth();
  const [score, setScore] = useState<CreatorScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScore = useCallback(async () => {
    setIsLoading(true);

    try {
      // Try real data first
      if (user?.id && !SIMULATION_MODE) {
        const { data, error } = await supabase
          .from('creator_contribution_scores')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setScore(data as CreatorScore);
          setIsLoading(false);
          return;
        }
      }

      // Fall back to simulation data
      setScore(DEFAULT_MOCK_CREATOR_SCORE);
    } catch (error) {
      console.error('Error fetching creator score:', error);
      setScore(DEFAULT_MOCK_CREATOR_SCORE);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  // Visibility insights for dashboard display
  const visibilityInsights = useMemo<VisibilityInsights | null>(() => {
    if (!score) return null;

    return {
      estimatedReach: score.estimated_reach,
      profileViews: score.profile_views_30d,
      interactionViews: score.interaction_views_30d,
      completionRate: score.completion_rate,
      visibilityTier: getVisibilityTier(score.ccs_score),
      eligibleForEarnings: score.eligible_for_earnings,
      ccsScore: score.ccs_score,
    };
  }, [score]);

  // Increment activity (simulation)
  const incrementActivity = useCallback(() => {
    setScore(prev => {
      if (!prev) return prev;
      const newActivityScore = Math.min(100, prev.activity_score + 1);
      const newCcsScore = prev.ccs_score + 5;
      return {
        ...prev,
        activity_score: newActivityScore,
        ccs_score: newCcsScore,
      };
    });
  }, []);

  // Recalculate score (simulation)
  const recalculateScore = useCallback(() => {
    // In simulation mode, just refresh from mock data with slight variation
    setScore(prev => {
      if (!prev) return DEFAULT_MOCK_CREATOR_SCORE;
      return {
        ...prev,
        ccs_score: prev.ccs_score + Math.floor(Math.random() * 10) - 5,
        profile_views_30d: prev.profile_views_30d + Math.floor(Math.random() * 50),
      };
    });
  }, []);

  return {
    score,
    isLoading,
    visibilityInsights,
    incrementActivity,
    recalculateScore,
    refetch: fetchScore,
    isSimulated: SIMULATION_MODE || !user?.id,
  };
}
