/**
 * PHASE J — Mock Governance Data
 * 
 * Simulated trust profiles and governance events for testing.
 */

import type { TrustProfile, GovernanceEvent, EscalationLevel } from './types';

// =============================================================================
// MOCK TRUST PROFILES
// =============================================================================

export const MOCK_TRUST_PROFILES: Record<string, TrustProfile> = {
  // Current user - verified professional with good standing
  'mock-current-user': {
    user_id: 'mock-current-user',
    trust_score: 87,
    trust_flags: ['clean_record'],
    trust_notes: [
      'Account in good standing since creation',
      'Consistently positive community engagement',
    ],
    escalation_level: 0,
    factors: {
      account_age_days: 180,
      verification_status: 'approved',
      era_tier: 'green',
      interaction_completion_rate: 94,
      reports_received: 0,
      reports_upheld: 0,
      blocks_received: 0,
      positive_indicators: 12,
    },
    last_calculated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // User with observation level
  'mock-user-observation': {
    user_id: 'mock-user-observation',
    trust_score: 62,
    trust_flags: ['declined_interactions_pattern'],
    trust_notes: [
      'Pattern of declined interactions noted',
      'Under observation since 2024-01-15',
    ],
    escalation_level: 1,
    factors: {
      account_age_days: 90,
      verification_status: 'approved',
      era_tier: 'pink',
      interaction_completion_rate: 45,
      reports_received: 1,
      reports_upheld: 0,
      blocks_received: 0,
      positive_indicators: 5,
    },
    last_calculated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // User requiring review
  'mock-user-review': {
    user_id: 'mock-user-review',
    trust_score: 38,
    trust_flags: ['frequent_reports', 'interaction_abuse'],
    trust_notes: [
      'Multiple reports received from different users',
      'Interaction concerns flagged by 2 providers',
      'Review recommended before further provider access',
    ],
    escalation_level: 2,
    factors: {
      account_age_days: 45,
      verification_status: 'none',
      era_tier: 'free',
      interaction_completion_rate: 30,
      reports_received: 4,
      reports_upheld: 2,
      blocks_received: 2,
      positive_indicators: 1,
    },
    last_calculated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // New user with no history
  'mock-user-new': {
    user_id: 'mock-user-new',
    trust_score: 55,
    trust_flags: [],
    trust_notes: ['New account, insufficient data for full assessment'],
    escalation_level: 0,
    factors: {
      account_age_days: 7,
      verification_status: 'pending',
      era_tier: null,
      interaction_completion_rate: 0,
      reports_received: 0,
      reports_upheld: 0,
      blocks_received: 0,
      positive_indicators: 0,
    },
    last_calculated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  
  // High-tier user with higher accountability
  'mock-user-high-tier': {
    user_id: 'mock-user-high-tier',
    trust_score: 92,
    trust_flags: ['clean_record'],
    trust_notes: [
      'Exemplary community member',
      'High tier requires maintained standards',
      'No concerns noted',
    ],
    escalation_level: 0,
    factors: {
      account_age_days: 365,
      verification_status: 'approved',
      era_tier: 'purple',
      interaction_completion_rate: 98,
      reports_received: 0,
      reports_upheld: 0,
      blocks_received: 0,
      positive_indicators: 45,
    },
    last_calculated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// =============================================================================
// MOCK GOVERNANCE EVENTS
// =============================================================================

export const MOCK_GOVERNANCE_EVENTS: GovernanceEvent[] = [
  {
    id: 'gov-event-1',
    user_id: 'mock-current-user',
    event_type: 'verification_status_changed',
    previous_value: 'pending',
    new_value: 'approved',
    reason: 'Credentials verified by platform review',
    triggered_by: 'admin_simulation',
    metadata: { reviewed_by: 'admin-user' },
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-event-2',
    user_id: 'mock-current-user',
    event_type: 'tier_changed',
    previous_value: 'pink',
    new_value: 'green',
    reason: 'Subscriber milestone reached (250k)',
    triggered_by: 'system',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-event-3',
    user_id: 'mock-current-user',
    event_type: 'trust_score_changed',
    previous_value: 82,
    new_value: 87,
    reason: 'Positive engagement metrics over 30 days',
    triggered_by: 'behavior',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-event-4',
    user_id: 'mock-user-review',
    event_type: 'trust_flag_added',
    previous_value: null,
    new_value: 'frequent_reports',
    reason: 'User received 3+ reports in 30 days',
    triggered_by: 'report',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-event-5',
    user_id: 'mock-user-review',
    event_type: 'escalation_level_changed',
    previous_value: 1,
    new_value: 2,
    reason: 'Trust score fell below review threshold',
    triggered_by: 'system',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-event-6',
    user_id: 'mock-user-observation',
    event_type: 'interaction_flagged',
    previous_value: null,
    new_value: { interaction_id: 'mock-int-x', flag_type: 'client_concern' },
    reason: 'Client flagged interaction for review',
    triggered_by: 'report',
    metadata: { flagged_by: 'mock-client-x' },
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'gov-event-7',
    user_id: 'mock-user-high-tier',
    event_type: 'trust_flag_added',
    previous_value: null,
    new_value: 'clean_record',
    reason: '6-month review confirmed exemplary standing',
    triggered_by: 'system',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// =============================================================================
// DEFAULT TRUST PROFILE FACTORY
// =============================================================================

export function createDefaultTrustProfile(userId: string): TrustProfile {
  return {
    user_id: userId,
    trust_score: 55,
    trust_flags: [],
    trust_notes: [],
    escalation_level: 0,
    factors: {
      account_age_days: 0,
      verification_status: 'none',
      era_tier: null,
      interaction_completion_rate: 0,
      reports_received: 0,
      reports_upheld: 0,
      blocks_received: 0,
      positive_indicators: 0,
    },
    last_calculated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
