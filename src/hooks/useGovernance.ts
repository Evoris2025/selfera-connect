/**
 * PHASE J — Governance Hook
 * 
 * Provides access to trust profiles and governance events in simulation mode.
 * This is for internal platform governance, NOT visible to other users.
 */

import { useState, useCallback, useMemo } from 'react';
import { useMockSystem } from '@/contexts/MockSystemContext';
import {
  type TrustProfile,
  type GovernanceEvent,
  type TrustFlag,
  type EscalationLevel,
  calculateTrustScore,
  determineEscalationLevel,
  determineFlags,
  TIER_TRUST_MULTIPLIERS,
} from '@/lib/governance';
import {
  MOCK_TRUST_PROFILES,
  MOCK_GOVERNANCE_EVENTS,
  createDefaultTrustProfile,
} from '@/lib/governance/mockData';

interface GovernanceState {
  trustProfiles: Map<string, TrustProfile>;
  governanceEvents: GovernanceEvent[];
}

const SIMULATION_MODE = true;

export function useGovernance() {
  const { state } = useMockSystem();
  
  // Local governance state
  const [governanceState, setGovernanceState] = useState<GovernanceState>(() => ({
    trustProfiles: new Map(Object.entries(MOCK_TRUST_PROFILES)),
    governanceEvents: [...MOCK_GOVERNANCE_EVENTS],
  }));

  // Get current user's trust profile
  const currentUserTrustProfile = useMemo(() => {
    return governanceState.trustProfiles.get('mock-current-user') || 
           createDefaultTrustProfile('mock-current-user');
  }, [governanceState.trustProfiles]);

  // Get trust profile for any user
  const getTrustProfile = useCallback((userId: string): TrustProfile => {
    return governanceState.trustProfiles.get(userId) || 
           createDefaultTrustProfile(userId);
  }, [governanceState.trustProfiles]);

  // Get governance events for a user
  const getGovernanceEvents = useCallback((userId?: string): GovernanceEvent[] => {
    if (!userId) return governanceState.governanceEvents;
    return governanceState.governanceEvents.filter(e => e.user_id === userId);
  }, [governanceState.governanceEvents]);

  // Log a governance event
  const logGovernanceEvent = useCallback((
    event: Omit<GovernanceEvent, 'id' | 'created_at'>
  ) => {
    const newEvent: GovernanceEvent = {
      ...event,
      id: `gov-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    setGovernanceState(prev => ({
      ...prev,
      governanceEvents: [newEvent, ...prev.governanceEvents],
    }));

    return newEvent;
  }, []);

  // Update trust profile
  const updateTrustProfile = useCallback((
    userId: string,
    updates: Partial<TrustProfile['factors']>
  ) => {
    setGovernanceState(prev => {
      const profiles = new Map(prev.trustProfiles);
      const existing = profiles.get(userId) || createDefaultTrustProfile(userId);
      
      const updatedFactors = { ...existing.factors, ...updates };
      const newScore = calculateTrustScore(updatedFactors);
      const newLevel = determineEscalationLevel(newScore);
      const newFlags = determineFlags(updatedFactors, existing.trust_flags);
      
      // Log score change if significant
      if (Math.abs(newScore - existing.trust_score) >= 5) {
        const scoreEvent: GovernanceEvent = {
          id: `gov-event-${Date.now()}`,
          user_id: userId,
          event_type: 'trust_score_changed',
          previous_value: existing.trust_score,
          new_value: newScore,
          reason: 'Trust factors updated',
          triggered_by: 'behavior',
          created_at: new Date().toISOString(),
        };
        prev.governanceEvents = [scoreEvent, ...prev.governanceEvents];
      }
      
      // Log escalation change
      if (newLevel !== existing.escalation_level) {
        const escalationEvent: GovernanceEvent = {
          id: `gov-event-${Date.now()}-esc`,
          user_id: userId,
          event_type: 'escalation_level_changed',
          previous_value: existing.escalation_level,
          new_value: newLevel,
          reason: 'Trust score change triggered level update',
          triggered_by: 'system',
          created_at: new Date().toISOString(),
        };
        prev.governanceEvents = [escalationEvent, ...prev.governanceEvents];
      }
      
      profiles.set(userId, {
        ...existing,
        factors: updatedFactors,
        trust_score: newScore,
        escalation_level: newLevel,
        trust_flags: newFlags,
        updated_at: new Date().toISOString(),
        last_calculated_at: new Date().toISOString(),
      });
      
      return { ...prev, trustProfiles: profiles };
    });
  }, []);

  // Add a trust flag
  const addTrustFlag = useCallback((userId: string, flag: TrustFlag, reason: string) => {
    setGovernanceState(prev => {
      const profiles = new Map(prev.trustProfiles);
      const existing = profiles.get(userId) || createDefaultTrustProfile(userId);
      
      if (existing.trust_flags.includes(flag)) return prev;
      
      const events = [...prev.governanceEvents];
      events.unshift({
        id: `gov-event-${Date.now()}`,
        user_id: userId,
        event_type: 'trust_flag_added',
        previous_value: null,
        new_value: flag,
        reason,
        triggered_by: 'system',
        created_at: new Date().toISOString(),
      });
      
      profiles.set(userId, {
        ...existing,
        trust_flags: [...existing.trust_flags, flag],
        updated_at: new Date().toISOString(),
      });
      
      return { trustProfiles: profiles, governanceEvents: events };
    });
  }, []);

  // Remove a trust flag
  const removeTrustFlag = useCallback((userId: string, flag: TrustFlag, reason: string) => {
    setGovernanceState(prev => {
      const profiles = new Map(prev.trustProfiles);
      const existing = profiles.get(userId) || createDefaultTrustProfile(userId);
      
      if (!existing.trust_flags.includes(flag)) return prev;
      
      const events = [...prev.governanceEvents];
      events.unshift({
        id: `gov-event-${Date.now()}`,
        user_id: userId,
        event_type: 'trust_flag_removed',
        previous_value: flag,
        new_value: null,
        reason,
        triggered_by: 'system',
        created_at: new Date().toISOString(),
      });
      
      profiles.set(userId, {
        ...existing,
        trust_flags: existing.trust_flags.filter(f => f !== flag),
        updated_at: new Date().toISOString(),
      });
      
      return { trustProfiles: profiles, governanceEvents: events };
    });
  }, []);

  // Add internal note
  const addTrustNote = useCallback((userId: string, note: string) => {
    setGovernanceState(prev => {
      const profiles = new Map(prev.trustProfiles);
      const existing = profiles.get(userId) || createDefaultTrustProfile(userId);
      
      profiles.set(userId, {
        ...existing,
        trust_notes: [...existing.trust_notes, `${new Date().toLocaleDateString()}: ${note}`],
        updated_at: new Date().toISOString(),
      });
      
      return { ...prev, trustProfiles: profiles };
    });
  }, []);

  // Simulate report being upheld (increases trust penalties)
  const simulateReportUpheld = useCallback((userId: string) => {
    setGovernanceState(prev => {
      const profiles = new Map(prev.trustProfiles);
      const existing = profiles.get(userId) || createDefaultTrustProfile(userId);
      
      const updatedFactors = {
        ...existing.factors,
        reports_upheld: existing.factors.reports_upheld + 1,
      };
      
      const newScore = calculateTrustScore(updatedFactors);
      const newLevel = determineEscalationLevel(newScore);
      
      const events = [...prev.governanceEvents];
      events.unshift({
        id: `gov-event-${Date.now()}`,
        user_id: userId,
        event_type: 'report_upheld',
        previous_value: existing.factors.reports_upheld,
        new_value: updatedFactors.reports_upheld,
        reason: 'Simulated: Report verified and upheld',
        triggered_by: 'admin_simulation',
        created_at: new Date().toISOString(),
      });
      
      profiles.set(userId, {
        ...existing,
        factors: updatedFactors,
        trust_score: newScore,
        escalation_level: newLevel,
        updated_at: new Date().toISOString(),
        last_calculated_at: new Date().toISOString(),
      });
      
      return { trustProfiles: profiles, governanceEvents: events };
    });
  }, []);

  // Get tier accountability multiplier
  const getTierMultiplier = useCallback((tier: string | null): number => {
    return TIER_TRUST_MULTIPLIERS[tier || 'free'] || 1.0;
  }, []);

  // Summary stats for admin dashboard
  const governanceStats = useMemo(() => {
    const profiles = Array.from(governanceState.trustProfiles.values());
    
    return {
      totalProfiles: profiles.length,
      byEscalationLevel: {
        clean: profiles.filter(p => p.escalation_level === 0).length,
        observation: profiles.filter(p => p.escalation_level === 1).length,
        review: profiles.filter(p => p.escalation_level === 2).length,
      },
      averageTrustScore: profiles.length > 0 
        ? Math.round(profiles.reduce((sum, p) => sum + p.trust_score, 0) / profiles.length)
        : 0,
      recentEvents: governanceState.governanceEvents.slice(0, 10),
    };
  }, [governanceState]);

  return {
    // Trust profile access
    currentUserTrustProfile,
    getTrustProfile,
    
    // Governance events
    getGovernanceEvents,
    logGovernanceEvent,
    
    // Trust profile management
    updateTrustProfile,
    addTrustFlag,
    removeTrustFlag,
    addTrustNote,
    
    // Simulations
    simulateReportUpheld,
    
    // Utilities
    getTierMultiplier,
    
    // Stats
    governanceStats,
    
    // State
    isSimulated: SIMULATION_MODE,
  };
}
