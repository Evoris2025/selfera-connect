/**
 * PHASE J — PLATFORM GOVERNANCE, TRUST & CONTROL
 * 
 * Internal governance types for trust assessment, escalation, and audit.
 * These are NOT visible to other users - strictly internal.
 * 
 * IMPORTANT: This is classification only. No punitive actions occur in Phase J.
 */

// =============================================================================
// TRUST FLAGS
// =============================================================================

export type TrustFlag =
  | 'clean_record'           // No issues, positive standing
  | 'frequent_reports'       // Multiple reports filed against user
  | 'interaction_abuse'      // Pattern of misuse in interactions
  | 'declined_interactions_pattern'  // Unusual pattern of declines
  | 'spam_activity'          // Detected spam or bot-like behavior
  | 'identity_mismatch';     // Verification concerns

export const TRUST_FLAG_LABELS: Record<TrustFlag, string> = {
  clean_record: 'Clean Record',
  frequent_reports: 'Frequent Reports',
  interaction_abuse: 'Interaction Concerns',
  declined_interactions_pattern: 'Decline Pattern',
  spam_activity: 'Spam Activity',
  identity_mismatch: 'Identity Mismatch',
};

export const TRUST_FLAG_DESCRIPTIONS: Record<TrustFlag, string> = {
  clean_record: 'User maintains positive standing with no concerns',
  frequent_reports: 'User has received multiple reports from the community',
  interaction_abuse: 'Pattern of concerning behavior in interactions',
  declined_interactions_pattern: 'Unusual rate of declined or cancelled interactions',
  spam_activity: 'Automated or spam-like posting detected',
  identity_mismatch: 'Verification information may require review',
};

// =============================================================================
// ESCALATION LEVELS
// =============================================================================

export type EscalationLevel = 0 | 1 | 2 | 3 | 4;

export const ESCALATION_LEVELS: Record<EscalationLevel, { label: string; description: string }> = {
  0: { label: 'Clean', description: 'No concerns, standard access' },
  1: { label: 'Observation', description: 'Minor flags, monitoring recommended' },
  2: { label: 'Review Suggested', description: 'Multiple flags, manual review advised' },
  3: { label: 'Restricted Actions', description: 'Future: Limited platform access' },
  4: { label: 'Suspension', description: 'Future: Account suspended' },
};

// Phase J only uses levels 0-2
export const ACTIVE_ESCALATION_LEVELS: EscalationLevel[] = [0, 1, 2];

// =============================================================================
// TRUST PROFILE
// =============================================================================

export interface TrustProfile {
  user_id: string;
  
  // Core trust score (0-100)
  trust_score: number;
  
  // Active flags
  trust_flags: TrustFlag[];
  
  // Internal notes (never shown to users)
  trust_notes: string[];
  
  // Escalation level
  escalation_level: EscalationLevel;
  
  // Aggregated factors
  factors: {
    account_age_days: number;
    verification_status: 'none' | 'pending' | 'approved' | 'rejected';
    era_tier: 'free' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | null;
    interaction_completion_rate: number; // 0-100
    reports_received: number;
    reports_upheld: number; // simulated
    blocks_received: number;
    positive_indicators: number; // helpful content, community participation, etc.
  };
  
  // Metadata
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// GOVERNANCE EVENTS
// =============================================================================

export type GovernanceEventType =
  | 'trust_score_changed'
  | 'verification_status_changed'
  | 'tier_changed'
  | 'interaction_flagged'
  | 'report_upheld'
  | 'trust_flag_added'
  | 'trust_flag_removed'
  | 'escalation_level_changed';

export interface GovernanceEvent {
  id: string;
  user_id: string;
  event_type: GovernanceEventType;
  
  // Change details
  previous_value: unknown;
  new_value: unknown;
  
  // Context
  reason: string;
  triggered_by: 'system' | 'behavior' | 'report' | 'admin_simulation';
  
  // Metadata
  metadata?: Record<string, unknown>;
  created_at: string;
}

// =============================================================================
// TIER INFLUENCE ON TRUST
// =============================================================================

/**
 * Higher ERA tiers require higher behavioral standards.
 * Repeated issues affect trust faster at higher tiers.
 */
export const TIER_TRUST_MULTIPLIERS: Record<string, number> = {
  free: 1.0,      // Standard weight
  pink: 1.1,      // Slightly higher accountability
  green: 1.25,    // Verified professionals held to higher standard
  blue: 1.5,      // Large following = greater responsibility
  purple: 1.75,   // Major influence = major accountability
  orange: 2.0,    // Top tier = highest accountability
};

/**
 * Calculate trust impact based on tier
 * Negative events have more impact at higher tiers
 */
export function calculateTierWeightedImpact(
  baseImpact: number,
  tier: string | null
): number {
  const multiplier = TIER_TRUST_MULTIPLIERS[tier || 'free'] || 1.0;
  return Math.round(baseImpact * multiplier);
}

// =============================================================================
// TRUST SCORE CALCULATION
// =============================================================================

export interface TrustScoreWeights {
  account_age: number;       // +ve for older accounts
  verification: number;      // +ve for verified
  completion_rate: number;   // +ve for high completion
  reports_penalty: number;   // -ve per report
  upheld_penalty: number;    // Additional -ve for upheld reports
  blocks_penalty: number;    // -ve per block received
  positive_bonus: number;    // +ve for positive indicators
}

export const DEFAULT_TRUST_WEIGHTS: TrustScoreWeights = {
  account_age: 0.5,          // 0.5 points per day, max 50
  verification: 15,          // +15 for verified
  completion_rate: 0.3,      // 0.3 points per % (max 30)
  reports_penalty: -5,       // -5 per report
  upheld_penalty: -10,       // Additional -10 for upheld reports
  blocks_penalty: -3,        // -3 per block
  positive_bonus: 2,         // +2 per positive indicator
};

/**
 * Calculate trust score from factors
 * Returns score clamped to 0-100
 */
export function calculateTrustScore(
  factors: TrustProfile['factors'],
  weights: TrustScoreWeights = DEFAULT_TRUST_WEIGHTS
): number {
  let score = 50; // Start at neutral
  
  // Account age bonus (capped at 50 points)
  score += Math.min(50, factors.account_age_days * weights.account_age);
  
  // Verification bonus
  if (factors.verification_status === 'approved') {
    score += weights.verification;
  }
  
  // Completion rate bonus (capped at 30 points)
  score += factors.interaction_completion_rate * weights.completion_rate;
  
  // Reports penalty (tier-weighted)
  const tierMultiplier = TIER_TRUST_MULTIPLIERS[factors.era_tier || 'free'] || 1.0;
  score += factors.reports_received * weights.reports_penalty * tierMultiplier;
  score += factors.reports_upheld * weights.upheld_penalty * tierMultiplier;
  
  // Blocks penalty
  score += factors.blocks_received * weights.blocks_penalty;
  
  // Positive indicators bonus
  score += factors.positive_indicators * weights.positive_bonus;
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determine escalation level from trust score
 */
export function determineEscalationLevel(score: number): EscalationLevel {
  if (score >= 70) return 0; // Clean
  if (score >= 50) return 1; // Observation
  if (score >= 30) return 2; // Review Suggested
  // Levels 3-4 not used in Phase J
  return 2;
}

/**
 * Determine flags from factors
 */
export function determineFlags(
  factors: TrustProfile['factors'],
  currentFlags: TrustFlag[]
): TrustFlag[] {
  const flags: TrustFlag[] = [];
  
  // Check for frequent reports
  if (factors.reports_received >= 3) {
    flags.push('frequent_reports');
  }
  
  // Check for decline pattern
  if (factors.interaction_completion_rate < 50 && factors.interaction_completion_rate > 0) {
    flags.push('declined_interactions_pattern');
  }
  
  // If no negative flags and good standing, add clean record
  if (
    factors.reports_received === 0 &&
    factors.blocks_received === 0 &&
    factors.interaction_completion_rate >= 80
  ) {
    flags.push('clean_record');
  }
  
  return flags;
}
