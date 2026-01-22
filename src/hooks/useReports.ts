import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';

export type ReportTargetType = 'post' | 'comment' | 'profile' | 'message';
export type ReportReason = 
  | 'harassment'
  | 'hate_speech'
  | 'spam'
  | 'self_harm'
  | 'misinformation'
  | 'inappropriate_content'
  | 'impersonation'
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  status: 'new' | 'reviewing' | 'actioned' | 'dismissed';
  createdAt: Date;
  reporterProfile?: {
    displayName: string;
    handle: string;
    avatarUrl?: string;
  };
}

interface UseReportsResult {
  reports: Report[];
  isLoading: boolean;
  isSubmitting: boolean;
  submitReport: (
    targetType: ReportTargetType,
    targetId: string,
    reason: ReportReason,
    details?: string
  ) => Promise<boolean>;
  // Admin functions
  fetchAllReports: () => Promise<void>;
  updateReportStatus: (reportId: string, status: Report['status'], internalNotes?: string) => Promise<boolean>;
}

export function useReports(): UseReportsResult {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = useCallback(async (
    targetType: ReportTargetType,
    targetId: string,
    reason: ReportReason,
    details?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to report content.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reason,
          details: details || null,
          status: 'new',
        });

      if (error) throw error;

      toast({
        title: 'Thanks for reporting',
        description: 'We\'ll review this content and take appropriate action.',
      });

      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Failed to submit report',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id]);

  const fetchAllReports = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          reporter_id,
          target_type,
          target_id,
          reason,
          details,
          status,
          created_at,
          profiles!reports_reporter_id_fkey (
            display_name,
            handle,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports: Report[] = (data || []).map(r => {
        const profile = r.profiles as any;
        return {
          id: r.id,
          reporterId: r.reporter_id,
          targetType: r.target_type as ReportTargetType,
          targetId: r.target_id,
          reason: r.reason as ReportReason,
          details: r.details || undefined,
          status: r.status as Report['status'],
          createdAt: new Date(r.created_at || ''),
          reporterProfile: profile ? {
            displayName: profile.display_name || profile.handle,
            handle: profile.handle,
            avatarUrl: profile.avatar_url,
          } : undefined,
        };
      });

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReportStatus = useCallback(async (
    reportId: string,
    status: Report['status'],
    internalNotes?: string
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    const currentReport = reports.find(r => r.id === reportId);
    const previousStatus = currentReport?.status;

    try {
      const updateData: Record<string, unknown> = { status };
      
      // If resolved or dismissed, set resolution fields
      if (status === 'actioned' || status === 'dismissed') {
        updateData.resolved_by = user.id;
        updateData.resolved_at = new Date().toISOString();
        if (internalNotes) {
          updateData.internal_notes = internalNotes;
        }
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status } : r
      ));

      // Log action for audit trail
      const actionType = status === 'actioned' ? 'report_resolved' : 
                         status === 'dismissed' ? 'report_dismissed' : null;
      
      if (actionType) {
        await logAction({
          actionType,
          targetEntityId: reportId,
          targetEntityType: 'reports',
          previousState: { status: previousStatus },
          newState: { status, resolved_by: user.id },
          notes: internalNotes,
        });
      }

      toast({
        title: 'Report updated',
        description: `Status changed to ${status}.`,
      });

      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: 'Failed to update report',
        description: 'Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, reports, logAction]);

  return {
    reports,
    isLoading,
    isSubmitting,
    submitReport,
    fetchAllReports,
    updateReportStatus,
  };
}
