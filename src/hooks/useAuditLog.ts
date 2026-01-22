import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export type AuditActionType = 
  | 'verification_approved'
  | 'verification_rejected'
  | 'role_change'
  | 'account_upgrade'
  | 'account_downgrade'
  | 'user_blocked'
  | 'user_unblocked'
  | 'report_resolved'
  | 'report_dismissed'
  | 'connection_approved'
  | 'connection_rejected'
  | 'content_removed'
  | 'content_limited';

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action_type: string;
  target_entity_id: string;
  target_entity_type: string;
  previous_state: Json | null;
  new_state: Json | null;
  notes: string | null;
  created_at: string;
}

export function useAuditLog() {
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);

  const logAction = async ({
    actionType,
    targetEntityId,
    targetEntityType,
    previousState,
    newState,
    notes,
  }: {
    actionType: AuditActionType;
    targetEntityId: string;
    targetEntityType: string;
    previousState?: Record<string, unknown>;
    newState?: Record<string, unknown>;
    notes?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLogging(true);
    try {
      const { error } = await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action_type: actionType,
        target_entity_id: targetEntityId,
        target_entity_type: targetEntityType,
        previous_state: (previousState as Json) || null,
        new_state: (newState as Json) || null,
        notes: notes || null,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return { error };
    } finally {
      setIsLogging(false);
    }
  };

  return { logAction, isLogging };
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async (options?: {
    actionType?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (options?.actionType) {
        query = query.eq('action_type', options.actionType);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map to AuditLogEntry type
      const entries: AuditLogEntry[] = (data || []).map(item => ({
        id: item.id,
        actor_id: item.actor_id,
        action_type: item.action_type,
        target_entity_id: item.target_entity_id,
        target_entity_type: item.target_entity_type,
        previous_state: item.previous_state,
        new_state: item.new_state,
        notes: item.notes,
        created_at: item.created_at,
      }));
      
      setLogs(entries);
      return { data: entries };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  return { logs, isLoading, fetchLogs };
}
